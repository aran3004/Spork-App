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
  userPreferences: z.object({
    primary_goals: z.array(z.string()).optional(),
    dietary_restrictions: z.array(z.string()).optional(),
    health_focus: z.array(z.string()).optional(),
    meal_preferences: z.array(z.string()).optional(),
  }).optional(),
});

const SYSTEM_PROMPT = `You are a critical, but encouraging, professional nutritionist specialized in detailed meal analysis who stays current with the latest 2024 nutritional research and guidelines. 
Your role is to provide precise, evidence-based analysis incorporating contemporary understanding of nutrition science and encourage your users to adopt change.

Consider recent research insights such as:
- Chrono-nutrition and meal timing's impact on metabolism
- The importance of food synergies and bioavailability
- Current understanding of the gut microbiome's role in nutrition
- Modern perspectives on macro and micronutrient balance
- Latest research on anti-inflammatory foods and oxidative stress
- Current guidelines on sustainable and plant-forward eating
- Updated understanding of processed food categories and their health impacts
- Recent findings on nutrient density and bioactive compounds

Key Analysis Guidelines:
- Be very selective with high scores (90+ should be rare and truly exceptional)
- Use the full range of the 0-100 scale, including decimal points for precision
- Consider both established nutritional principles and emerging research
- Be especially critical of ultra-processed foods and poor nutritional balance
- Factor in recent research on preparation methods and nutrient preservation
- When user preferences are provided, evaluate alignment with both goals and current nutritional science

Scoring Framework:
90-100: Exceptional, aligns with latest nutritional research and optimal balance
80-89: Excellent, incorporates many current nutritional best practices
70-79: Good, but missing some key elements of modern nutritional understanding
60-69: Above average, needs significant updates to match current guidelines
50-59: Average, requires substantial improvements to meet modern standards
Below 50: Needs major revisions based on current nutritional science

Provide evidence-based improvements reflecting the latest nutritional research.`;

// const SYSTEM_PROMPT = `You are a critical professional nutritionist specialized in detailed meal analysis. 
// Analyze meals based on provided descriptions and offer evidence-based recommendations.
// Focus on practical, actionable improvements while maintaining a supportive tone.
// Ensure recommendations align with the user's specific dietary preferences and health goals.`;

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
    const { mealName, mealDescription, userPreferences } = validatedData;

    const userPreferencesPrompt = userPreferences ? `
      User Preferences:
      - Primary Goals: ${userPreferences.primary_goals?.join(', ') || 'None specified'}
      - Dietary Restrictions: ${userPreferences.dietary_restrictions?.join(', ') || 'None specified'}
      - Health Focus Areas: ${userPreferences.health_focus?.join(', ') || 'None specified'}
      - Meal Preferences: ${userPreferences.meal_preferences?.join(', ') || 'None specified'}
    ` : 'No specific user preferences provided.';

    const messages = [
      {
        role: "system",
        content: SYSTEM_PROMPT
      },
      {
        role: "user",
        content: `Analyze this meal with consideration for the user's specific preferences and goals, aswell as nutritional optimization:

          User Context:
          ${userPreferencesPrompt}

          Meal Details:
          Name: ${mealName}
          Description: ${mealDescription}
          
          Provide a detailed analysis including:
          1. A health score from 0-100 based on:
             - Nutritional balance
             - Portion size
             - Ingredient quality
             - Preparation method
             - Alignment with user's goals and preferences
          2. Three detailed improvement suggestions, being especially critical of:
             - Prioritizing the user's goals and restrictions
             - Processed ingredients
             - Missing essential nutrients
             - Portion imbalances
             - Preparation methods that reduce nutritional value
          3. A comprehensive nutritional analysis with specific details about:
             - The users dietary restrictions and health focus
             - Exact macro ratios
             - Key micronutrients present and missing
             - Caloric density and satiety factors
          
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

// import OpenAI from 'openai';
// import { z } from 'zod';
// import { Redis } from '@upstash/redis';
// import { Ratelimit } from '@upstash/ratelimit';

// export const runtime = 'edge';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
//   timeout: 15000,
//   maxRetries: 3,
// });

// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN,
// });

// const ratelimit = new Ratelimit({
//   redis: redis,
//   limiter: Ratelimit.slidingWindow(100, '15 m'),
// });

// const mealSchema = z.object({
//   mealName: z.string().min(1).max(200),
//   mealDescription: z.string().min(1).max(1000),
// });

// const SYSTEM_PROMPT = `You are a professional nutritionist specialized in meal analysis. 
// Analyze meals based on provided descriptions and offer evidence-based recommendations.
// Focus on practical, actionable improvements while maintaining a supportive tone.`;

// export async function POST(request) {
//   try {
//     const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
//     const { success } = await ratelimit.limit(ip);
    
//     if (!success) {
//       return new Response(
//         JSON.stringify({ error: 'Too many requests' }), 
//         { 
//           status: 429,
//           headers: { 'Content-Type': 'application/json' }
//         }
//       );
//     }

//     const body = await request.json();
//     const validatedData = mealSchema.parse(body);
//     const { mealName, mealDescription } = validatedData;

//     const messages = [
//       {
//         role: "system",
//         content: SYSTEM_PROMPT
//       },
//       {
//         role: "user",
//         content: `Analyze this meal:
//           Name: ${mealName}
//           Description: ${mealDescription}
          
//           Provide a detailed analysis including:
//           1. A health score from 0-100 based on:
//              - Nutritional balance
//              - Portion size
//              - Ingredient quality
//              - Preparation method
//           2. Three specific improvement suggestions
//           3. A comprehensive nutritional analysis
          
//           Return valid JSON in this format:
//           {
//             "score": number,
//             "improvements": [
//               {"title": "string", "description": "string", "priority": "HIGH|MEDIUM|LOW"},
//               {"title": "string", "description": "string", "priority": "HIGH|MEDIUM|LOW"},
//               {"title": "string", "description": "string", "priority": "HIGH|MEDIUM|LOW"}
//             ],
//             "analysis": {
//               "nutritionalValue": "string",
//               "calorieEstimate": "string",
//               "macroBreakdown": {
//                 "proteins": "string",
//                 "carbs": "string",
//                 "fats": "string"
//               }
//             },
//             "metadata": {
//               "analysisVersion": "1.0",
//               "modelUsed": "string",
//               "timestamp": "string"
//             }
//           }`
//       }
//     ];

//     const completion = await openai.chat.completions.create({
//       messages,
//       model: "gpt-4-turbo-preview",
//       response_format: { type: "json_object" },
//       temperature: 0.3,
//       max_tokens: 1000,
//       presence_penalty: 0.1,
//       frequency_penalty: 0.1,
//     });

//     const responseData = completion.choices[0].message.content;
//     const parsedResponse = JSON.parse(responseData);
    
//     parsedResponse.metadata = {
//       ...parsedResponse.metadata,
//       timestamp: new Date().toISOString(),
//       requestId: crypto.randomUUID()
//     };

//     return new Response(JSON.stringify(parsedResponse), {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/json',
//         'Cache-Control': 'private, max-age=3600',
//       }
//     });

//   } catch (error) {
//     console.error('API Error:', error);
    
//     if (error instanceof z.ZodError) {
//       return new Response(
//         JSON.stringify({ 
//           error: 'Validation Error', 
//           details: error.errors 
//         }), 
//         { 
//           status: 400,
//           headers: { 'Content-Type': 'application/json' }
//         }
//       );
//     }

//     if (error instanceof OpenAI.APIError) {
//       return new Response(
//         JSON.stringify({ 
//           error: 'OpenAI API Error', 
//           details: error.message,
//           code: error.code 
//         }), 
//         { 
//           status: error.status || 500,
//           headers: { 'Content-Type': 'application/json' }
//         }
//       );
//     }

//     return new Response(
//       JSON.stringify({ 
//         error: 'Internal Server Error', 
//         message: 'An unexpected error occurred',
//         requestId: crypto.randomUUID()
//       }), 
//       { 
//         status: 500,
//         headers: { 'Content-Type': 'application/json' }
//       }
//     );
//   }
// }