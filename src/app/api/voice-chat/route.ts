import OpenAI from 'openai';
export const runtime = 'edge';

// Types for nutrition data
interface Ingredient {
  ingredient: string;
  weight: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

interface NutritionAnalysis {
  carbohydrate_content: number;
  fat_content: number;
  fiber_content: number;
  protein_content: number;
  total_calories: number;
  health_score: number;  // Added health score
  health_notes: string[];  // Added health notes for feedback
  ingredients: Ingredient[];
}

// Utility functions for validation
const extractGrams = (weight: string): number => {
  const match = weight.match(/(\d+)g/);
  return match ? parseInt(match[1], 10) : 0;
};

const generateUserPreferencesPrompt = (userPreferences: any) => {
  if (!userPreferences) return 'No specific user preferences provided.';
  
  return `
User Preferences:
- Primary Goals: ${userPreferences.primary_goals?.join(', ') || 'None specified'}
- Dietary Restrictions: ${userPreferences.dietary_restrictions?.join(', ') || 'None specified'}
- Health Focus Areas: ${userPreferences.health_focus?.join(', ') || 'None specified'}
- Meal Preferences: ${userPreferences.meal_preferences?.join(', ') || 'None specified'}
`;
};

const validateIngredient = (ingredient: Ingredient): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const grams = extractGrams(ingredient.weight);

  // Check for negative or zero values
  if (ingredient.calories < 0) errors.push(`Negative calories for ${ingredient.ingredient}`);
  if (ingredient.protein < 0) errors.push(`Negative protein for ${ingredient.ingredient}`);
  if (ingredient.carbohydrates < 0) errors.push(`Negative carbs for ${ingredient.ingredient}`);
  if (ingredient.fat < 0) errors.push(`Negative fat for ${ingredient.ingredient}`);

  // Check if calories make sense based on macros
  const calculatedCalories = (
    ingredient.protein * 4 +
    ingredient.carbohydrates * 4 +
    ingredient.fat * 9
  );

  // Allow for some rounding differences (±5 calories)
  if (Math.abs(calculatedCalories - ingredient.calories) > 5) {
    errors.push(
      `Calorie mismatch for ${ingredient.ingredient}: ` +
      `reported ${ingredient.calories} vs calculated ${calculatedCalories.toFixed(1)}`
    );
  }

  // Check if weight makes sense
  if (grams > 0 && ingredient.calories > 0) {
    const caloriesPerGram = ingredient.calories / grams;
    if (caloriesPerGram > 9) { // Pure fat has 9 calories per gram, shouldn't exceed this
      errors.push(`Unrealistic calories per gram for ${ingredient.ingredient}: ${caloriesPerGram.toFixed(1)}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateAndRecalculateNutrition = (analysis: NutritionAnalysis): {
  isValid: boolean;
  errors: string[];
  correctedAnalysis: NutritionAnalysis;
} => {
  const errors: string[] = [];
  
  // Validate each ingredient
  analysis.ingredients.forEach(ingredient => {
    const validation = validateIngredient(ingredient);
    errors.push(...validation.errors);
  });

  // Recalculate totals from ingredients
  const calculatedTotals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };

  analysis.ingredients.forEach(ingredient => {
    calculatedTotals.calories += Math.max(0, ingredient.calories);
    calculatedTotals.protein += Math.max(0, ingredient.protein);
    calculatedTotals.carbs += Math.max(0, ingredient.carbohydrates);
    calculatedTotals.fat += Math.max(0, ingredient.fat);
  });

  // Create corrected analysis
  const correctedAnalysis: NutritionAnalysis = {
    ...analysis,
    total_calories: Math.round(calculatedTotals.calories),
    protein_content: Number(calculatedTotals.protein.toFixed(1)),
    carbohydrate_content: Number(calculatedTotals.carbs.toFixed(1)),
    fat_content: Number(calculatedTotals.fat.toFixed(1))
  };

  return {
    isValid: errors.length === 0,
    errors,
    correctedAnalysis
  };
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? '',
  timeout: 15000,
  maxRetries: 3,
});

const SYSTEM_PROMPT = `You are a critical, but encouraging, professional nutrition analysis assistant that can both analyze new meals and modify existing meal analyses based on user requests. 
You are also specialized in detailed yet concise meal analysis who stays current with the latest 2024/2025 nutritional research and guidelines. 
Your role is to provide precise, evidence-based analysis incorporating contemporary understanding of nutrition science and encourage your users to adopt change

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
  "health_score": 75,
  "potential_score": 85,
  "health_notes": [
    "Good protein content",
    "Could use more fiber",
    "Well-balanced fats"
  ],
  "improvements": [
    {
      "title": "Add More Fiber",
      "description": "Include whole grains or vegetables to boost fiber content",
      "priority": "HIGH",
      "impact": 5
    }
  ],
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

Consider these factors when analyzing and suggesting improvements:
1. Current health score (0-100) based on:
   - Nutritional balance
   - Portion size
   - Ingredient quality
   - Preparation method
   - Alignment with modern nutritional science

2. Improvement suggestions (only if current score < 80):
   - Prioritize evidence-based improvements
   - Focus on processed ingredients
   - Address missing essential nutrients
   - Consider portion imbalances
   - Evaluate preparation methods
   - Each improvement should include estimated score impact

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

Rules for JSON response:
1. Include exact measurements in grams
2. Use realistic nutritional values based on standard food databases
3. Include all macro nutrients for each ingredient
4. Ensure all numbers are realistic and properly calculated
5. Keep ingredient descriptions clear and concise and capitalise to make neater
6. When modifying meals, maintain consistency with unmodified ingredients
7. Calories or Macronutrients cannot be negative
8. Health score must be between 0-100 and can take any integer in this range`;


// 3. Potential score calculation:
//    - Calculate potential score by adding improvement impacts
//    - Cap total improvements at 3
//    - Ensure potential score doesn't exceed 95
//    - If current score >= 80, return empty improvements array
// 9. Only include improvements if current score < 80
// 10. Each improvement must include an "impact" number indicating score increase


export async function POST(request: Request) {
  try {
    const { mealDescription, isEditing, originalMeal , userPreferences} = await request.json();
    
    if (!mealDescription) {
      return new Response(
        JSON.stringify({ error: 'No meal description provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Clean up the descriptions
    const cleanDescription = mealDescription.trim().replace(/\n/g, ' ');

    // Generate the preferences prompt
    const preferencesPrompt = generateUserPreferencesPrompt(userPreferences);
    
    // Create different prompts based on whether we're editing or creating new
    const userPrompt = isEditing 
      ? `User Context:\n${preferencesPrompt}\n\nOriginal meal: ${originalMeal}\n\nRequested changes: ${cleanDescription}\n\nPlease modify the meal according to these changes and provide the updated nutritional analysis, taking into account the user's preferences and restrictions.`
      : `User Context:\n${preferencesPrompt}\n\nAnalyze this meal and provide a JSON response with nutritional information, considering the user's preferences and restrictions: ${cleanDescription}`;

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
      const nutritionData = JSON.parse(nutritionAnalysis) as NutritionAnalysis;
      const validation = validateAndRecalculateNutrition(nutritionData);
      
      if (!validation.isValid) {
        console.warn('Nutrition validation errors:', validation.errors);
      }
      
      return new Response(
        JSON.stringify({
          description: cleanDescription,
          nutrition: validation.correctedAnalysis,
          wasEdited: isEditing,
          validationErrors: validation.errors,
          userPreferencesApplied: !!userPreferences
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
// // /app/api/voice-chat/route.ts

// import OpenAI from 'openai';

// export const runtime = 'edge';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY ?? '',
//   timeout: 15000,
//   maxRetries: 3,
// });

// const SYSTEM_PROMPT = `You are a nutrition analysis assistant that can both analyze new meals and modify existing meal analyses based on user requests.

// When handling MODIFICATIONS to an existing meal:
// 1. Listen carefully to the requested changes (e.g., "change flour to 50g", "add mayo", "remove sugar")
// 2. Update the nutritional values accordingly
// 3. Keep all unchanged ingredients the same
// 4. Return the complete modified meal analysis

// Your response must always be a valid JSON object matching this exact structure:
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
// 5. Keep ingredient descriptions clear and concise and capitalise to make neater
// 6. When modifying meals, maintain consistency with unmodified ingredients`;

// export async function POST(request: Request) {
//   try {
//     const { mealDescription, isEditing, originalMeal } = await request.json();

//     if (!mealDescription) {
//       return new Response(
//         JSON.stringify({ error: 'No meal description provided' }),
//         { status: 400, headers: { 'Content-Type': 'application/json' } }
//       );
//     }

//     // Clean up the descriptions
//     const cleanDescription = mealDescription.trim().replace(/\n/g, ' ');
    
//     // Create different prompts based on whether we're editing or creating new
//     const userPrompt = isEditing 
//       ? `Original meal: ${originalMeal}\n\nRequested changes: ${cleanDescription}\n\nPlease modify the meal according to these changes and provide the updated nutritional analysis.`
//       : `Analyze this meal and provide a JSON response with nutritional information: ${cleanDescription}`;

//     const completion = await openai.chat.completions.create({
//       messages: [
//         { 
//           role: "system", 
//           content: SYSTEM_PROMPT
//         },
//         { 
//           role: "user", 
//           content: userPrompt
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
//           nutrition: nutritionData,
//           wasEdited: isEditing
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
