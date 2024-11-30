import OpenAI from 'openai';
import { z } from 'zod';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 15000,
  maxRetries: 3,
});

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, '15 m'),
});

const mealSchema = z.object({
  mealName: z.string().min(1).max(200),
  mealDescription: z.string().min(1).max(1000),
});

const SYSTEM_PROMPT = `You are a professional nutritionist specialized in meal analysis. 
Analyze meals based on provided descriptions and offer evidence-based recommendations.
Focus on practical, actionable improvements while maintaining a supportive tone.`;

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);
    
    if (!success) {
      return new Response(
        JSON.stringify({ error: 'Too many requests' }), 
        { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const body = await request.json();
    const validatedData = mealSchema.parse(body);
    const { mealName, mealDescription } = validatedData;

    const messages = [
      {
        role: "system",
        content: SYSTEM_PROMPT
      },
      {
        role: "user",
        content: `Analyze this meal:
          Name: ${mealName}
          Description: ${mealDescription}
          
          Provide a detailed analysis including:
          1. A health score from 0-100 based on:
             - Nutritional balance
             - Portion size
             - Ingredient quality
             - Preparation method
          2. Three specific improvement suggestions
          3. A comprehensive nutritional analysis
          
          Return valid JSON in this format:
          {
            "score": number,
            "improvements": [
              {"title": "string", "description": "string", "priority": "HIGH|MEDIUM|LOW"},
              {"title": "string", "description": "string", "priority": "HIGH|MEDIUM|LOW"},
              {"title": "string", "description": "string", "priority": "HIGH|MEDIUM|LOW"}
            ],
            "analysis": {
              "nutritionalValue": "string",
              "calorieEstimate": "string",
              "macroBreakdown": {
                "proteins": "string",
                "carbs": "string",
                "fats": "string"
              }
            },
            "metadata": {
              "analysisVersion": "1.0",
              "modelUsed": "string",
              "timestamp": "string"
            }
          }`
      }
    ];

    const completion = await openai.chat.completions.create({
      messages,
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const responseData = completion.choices[0].message.content;
    const parsedResponse = JSON.parse(responseData);
    
    parsedResponse.metadata = {
      ...parsedResponse.metadata,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID()
    };

    return new Response(JSON.stringify(parsedResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=3600',
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation Error', 
          details: error.errors 
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (error instanceof OpenAI.APIError) {
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API Error', 
          details: error.message,
          code: error.code 
        }), 
        { 
          status: error.status || 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error', 
        message: 'An unexpected error occurred',
        requestId: crypto.randomUUID()
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}