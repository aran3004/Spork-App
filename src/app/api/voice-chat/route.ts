// /app/api/voice-chat/route.ts

import OpenAI from 'openai';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? '',
  timeout: 15000,
  maxRetries: 3,
});

const SYSTEM_PROMPT = `You are a nutrition analysis assistant that can both analyze new meals and modify existing meal analyses based on user requests.

When handling MODIFICATIONS to an existing meal:
1. Listen carefully to the requested changes (e.g., "change flour to 50g", "add mayo", "remove sugar")
2. Update the nutritional values accordingly
3. Keep all unchanged ingredients the same
4. Return the complete modified meal analysis

Your response must always be a valid JSON object matching this exact structure:
{
  "carbohydrate_content": 45,
  "fat_content": 12,
  "fiber_content": 3,
  "protein_content": 25,
  "total_calories": 350,
  "ingredients": [
    {
      "ingredient": "Plain Flour",
      "weight": "100g",
      "calories": 120,
      "protein": 4,
      "carbohydrates": 20,
      "fat": 1
    }
  ]
}

Rules for JSON response:
1. Include exact measurements in grams
2. Use realistic nutritional values based on standard food databases
3. Include all macro nutrients for each ingredient
4. Ensure all numbers are realistic and properly calculated
5. Keep ingredient descriptions clear and concise and capitalise to make neater
6. When modifying meals, maintain consistency with unmodified ingredients`;

export async function POST(request: Request) {
  try {
    const { mealDescription, isEditing, originalMeal } = await request.json();

    if (!mealDescription) {
      return new Response(
        JSON.stringify({ error: 'No meal description provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Clean up the descriptions
    const cleanDescription = mealDescription.trim().replace(/\n/g, ' ');
    
    // Create different prompts based on whether we're editing or creating new
    const userPrompt = isEditing 
      ? `Original meal: ${originalMeal}\n\nRequested changes: ${cleanDescription}\n\nPlease modify the meal according to these changes and provide the updated nutritional analysis.`
      : `Analyze this meal and provide a JSON response with nutritional information: ${cleanDescription}`;

    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: SYSTEM_PROMPT
        },
        { 
          role: "user", 
          content: userPrompt
        }
      ],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000,
    });

    const nutritionAnalysis = completion.choices[0]?.message?.content;
    
    if (!nutritionAnalysis) {
      throw new Error('No analysis generated');
    }

    try {
      const nutritionData = JSON.parse(nutritionAnalysis);
      
      return new Response(
        JSON.stringify({
          description: cleanDescription,
          nutrition: nutritionData,
          wasEdited: isEditing
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      throw new Error('Failed to parse nutrition data');
    }

  } catch (error) {
    console.error('API Error:', error);
    
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error', 
        message: errorMessage,
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

// export const runtime = 'edge';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY ?? '',
//   timeout: 15000,
//   maxRetries: 3,
// });

// const SYSTEM_PROMPT = `You are a nutrition analysis assistant. Analyze the meal description and respond with a JSON object containing ingredients and nutritional information.

// Your response must be a valid JSON object matching this exact structure:
// {
//   "carbohydrate_content": 45,
//   "fat_content": 12,
//   "fiber_content": 3,
//   "protein_content": 25,
//   "total_calories": 350,
//   "ingredients": [
//     {
//       "ingredient": "Plain Flour",
//       "weight": "100g",
//       "calories": 120,
//       "protein": 4,
//       "carbohydrates": 20,
//       "fat": 1
//     }
//   ]
// }

// Rules for JSON response:
// 1. Include exact measurements in grams
// 2. Use realistic nutritional values based on standard food databases
// 3. Include all macro nutrients for each ingredient
// 4. Ensure all numbers are realistic and properly calculated
// 5. Keep ingredient descriptions clear and concise and capitalise to make`;

// export async function POST(request: Request) {
//   try {
//     const { mealDescription } = await request.json();

//     if (!mealDescription) {
//       return new Response(
//         JSON.stringify({ error: 'No meal description provided' }),
//         { status: 400, headers: { 'Content-Type': 'application/json' } }
//       );
//     }

//     // Clean up the meal description
//     const cleanDescription = mealDescription.trim().replace(/\n/g, ' ');

//     const completion = await openai.chat.completions.create({
//       messages: [
//         { 
//           role: "system", 
//           content: SYSTEM_PROMPT
//         },
//         { 
//           role: "user", 
//           content: `Analyze this meal and provide a JSON response with nutritional information: ${cleanDescription}`
//         }
//       ],
//       model: "gpt-4-turbo-preview",
//       response_format: { type: "json_object" },
//       temperature: 0.3,
//       max_tokens: 1000,
//     });

//     const nutritionAnalysis = completion.choices[0]?.message?.content;
    
//     if (!nutritionAnalysis) {
//       throw new Error('No analysis generated');
//     }

//     try {
//       const nutritionData = JSON.parse(nutritionAnalysis);
      
//       return new Response(
//         JSON.stringify({
//           description: cleanDescription,
//           nutrition: nutritionData
//         }),
//         { 
//           status: 200, 
//           headers: { 'Content-Type': 'application/json' } 
//         }
//       );
//     } catch (parseError) {
//       console.error('JSON Parse Error:', parseError);
//       throw new Error('Failed to parse nutrition data');
//     }

//   } catch (error) {
//     console.error('API Error:', error);
    
//     let errorMessage = 'An unexpected error occurred';
//     if (error instanceof Error) {
//       errorMessage = error.message;
//     }
    
//     return new Response(
//       JSON.stringify({ 
//         error: 'Internal Server Error', 
//         message: errorMessage,
//         requestId: crypto.randomUUID()
//       }), 
//       { 
//         status: 500, 
//         headers: { 'Content-Type': 'application/json' } 
//       }
//     );
//   }
// }








// import OpenAI from 'openai';

// export const runtime = 'edge';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY ?? '',
//   timeout: 15000,
//   maxRetries: 3,
// });

// const VOICE_SYSTEM_PROMPT = `You are a helpful voice assistant called Spork, a nutrition and meal tracking app. Your responses should be concise and conversational while maintaining nutritional expertise.

// Key Capabilities:
// 1. Meal Logging:
//    - When a user wants to log a meal, gather necessary details and format them for analysis
//    - Extract meal name and description from natural conversation
//    - Ask for clarification if details are unclear

// 2. Nutritional Information:
//    - Provide quick, accurate nutritional insights
//    - Use the latest 2024 nutritional research when giving advice
//    - Consider user's dietary preferences and restrictions

// 3. Conversation Flow:
//    - Keep responses brief and natural (max 2-3 sentences)
//    - Ask follow-up questions when needed
//    - Confirm actions before processing

// If a user wants to log a meal, format their input for the meal analysis system. For other queries, provide direct, conversational responses.

// Remember user context and preferences throughout the conversation. If you don't have specific user preferences, you can ask for them.`;

// interface Message {
//   role: 'user' | 'system' | 'assistant';
//   content: string;
// }

// interface RequestBody {
//   messages: Message[];
//   userPreferences?: {
//     primary_goals?: string[];
//     dietary_restrictions?: string[];
//     health_focus?: string[];
//     meal_preferences?: string[];
//   };
// }

// export async function POST(request: Request) {
//   try {
//     const body = await request.json() as RequestBody;
//     const { messages, userPreferences } = body;

//     if (!messages || messages.length === 0) {
//       return new Response(
//         JSON.stringify({ error: 'No messages provided' }),
//         { status: 400, headers: { 'Content-Type': 'application/json' } }
//       );
//     }

//     const lastMessage = messages[messages.length - 1].content.toLowerCase();
//     const isLoggingMeal = lastMessage.includes('log meal') || 
//                          lastMessage.includes('track meal') ||
//                          lastMessage.includes('record meal');

//     if (isLoggingMeal) {
//       const completion = await openai.chat.completions.create({
//         messages: [
//           { role: "system", content: "Extract meal name and description from the user's input. Respond in JSON format: {\"mealName\": \"string\", \"mealDescription\": \"string\"}" },
//           { role: "user", content: lastMessage }
//         ],
//         model: "gpt-4-turbo-preview",
//         response_format: { type: "json_object" },
//         temperature: 0.3,
//         max_tokens: 500,
//       });

//       const mealContent = completion.choices[0]?.message?.content;
      
//       if (!mealContent) {
//         throw new Error('No meal content generated');
//       }

//       const mealData = JSON.parse(mealContent);
      
//       // Call the meal analysis endpoint
//       const analysisResponse = await fetch(new URL('/api/analyse-meal', request.url), {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           ...mealData,
//           userPreferences
//         }),
//       });

//       if (!analysisResponse.ok) {
//         throw new Error('Meal analysis failed');
//       }

//       const analysis = await analysisResponse.json();
      
//       return new Response(
//         JSON.stringify({
//           response: `I've analyzed your meal. Health score: ${analysis.score}. ${analysis.improvements[0].description}. Would you like to hear more details?`,
//           analysis
//         }),
//         { status: 200, headers: { 'Content-Type': 'application/json' } }
//       );
//     }

//     // Regular conversational response
//     const completion = await openai.chat.completions.create({
//       messages: [
//         { role: "system", content: VOICE_SYSTEM_PROMPT },
//         ...messages
//       ],
//       model: "gpt-4-turbo-preview",
//       temperature: 0.7,
//       max_tokens: 200,
//     });

//     const responseContent = completion.choices[0]?.message?.content;

//     if (!responseContent) {
//       throw new Error('No response generated');
//     }

//     return new Response(
//       JSON.stringify({ response: responseContent }),
//       { status: 200, headers: { 'Content-Type': 'application/json' } }
//     );

//   } catch (error) {
//     console.error('API Error:', error);
    
//     const errorResponse = {
//       error: 'Internal Server Error',
//       message: error instanceof Error ? error.message : 'An unexpected error occurred',
//       requestId: crypto.randomUUID()
//     };

//     return new Response(
//       JSON.stringify(errorResponse), 
//       { status: 500, headers: { 'Content-Type': 'application/json' } }
//     );
//   }
// }