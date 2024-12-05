'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, UtensilsCrossed, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface Ingredient {
  name: string;
  weight: string;
  unit: string;
}

interface UserPreferences {
  primary_goals: string[];
  dietary_restrictions: string[];
  health_focus: string[];
  meal_preferences: string[];
}

interface MealAnalysis {
  score: number;
  improvements: Array<{
    title: string;
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  analysis: {
    nutritionalValue: string;
    calorieEstimate: string;
    macroBreakdown: {
      proteins: string;
      carbs: string;
      fats: string;
    };
  };
  metadata: {
    analysisVersion: string;
    modelUsed: string;
    timestamp: string;
  };
}

export default function LogMealPage() {
  const [mealName, setMealName] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', weight: '', unit: 'g' }]);
  const [instructions, setInstructions] = useState('');
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const checkUserAndPreferences = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/auth/signin');
        return;
      }
      setUser(user);

      const { data: preferencesData, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('primary_goals, dietary_restrictions, health_focus, meal_preferences')
        .eq('user_id', user.id)
        .single();

      if (!preferencesError && preferencesData) {
        setUserPreferences(preferencesData);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/auth/signin');
      }
      setUser(session?.user || null);
      if (session?.user) {
        checkUserAndPreferences();
      }
    });

    checkUserAndPreferences();

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const saveMeal = async () => {
    if (!user) {
      setError('Please sign in to save meals');
      router.push('/auth/signin');
      return;
    }

    if (!mealName || ingredients[0].name === '') {
      setError('Please provide a meal name and at least one ingredient');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const { error: mealError } = await supabase
        .from('meals')
        .insert({
          user_id: user.id,
          name: mealName,
          ingredients: ingredients.map(i => ({
            name: i.name,
            weight: parseFloat(i.weight),
            unit: i.unit
          })),
          instructions,
          analysis: analysis || null,
          created_at: new Date().toISOString()
        });

      if (mealError) throw mealError;

      setMealName('');
      setIngredients([{ name: '', weight: '', unit: 'g' }]);
      setInstructions('');
      setAnalysis(null);
      
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save meal');
    } finally {
      setIsSaving(false);
    }
  };

  const analyseMeal = async () => {
    setIsAnalysing(true);
    setError('');
    
    const ingredientsList = ingredients
      .map(i => `${i.name} (${i.weight}${i.unit})`)
      .join(', ');
    const mealDescription = `Ingredients: ${ingredientsList}\nInstructions: ${instructions}`;
    
    try {
      const response = await fetch('/api/analyse-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mealName,
          mealDescription,
          userPreferences: userPreferences ? {
            primary_goals: userPreferences.primary_goals,
            dietary_restrictions: userPreferences.dietary_restrictions,
            health_focus: userPreferences.health_focus,
            meal_preferences: userPreferences.meal_preferences,
          } : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyse meal');
      }
      
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyse meal. Please try again.');
    } finally {
      setIsAnalysing(false);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', weight: '', unit: 'g' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };
  
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Log a Meal</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 sm:p-4 rounded-lg text-sm sm:text-base">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:gap-6">
        {/* Meal Details Section */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h2 className="text-lg sm:text-xl font-semibold">Meal Details</h2>
            <UtensilsCrossed className="h-5 w-5 text-blue-500" />
          </div>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Meal Name"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-lg"
            />
          </div>
        </div>

        {/* Ingredients Section */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <h2 className="text-lg sm:text-xl font-semibold">Ingredients</h2>
            <button
              onClick={addIngredient}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" /> Add Ingredient
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
                <input
                  type="text"
                  placeholder="Ingredient name"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  className="w-full sm:flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                />
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="number"
                    placeholder="Weight"
                    value={ingredient.weight}
                    onChange={(e) => updateIngredient(index, 'weight', e.target.value)}
                    className="flex-1 sm:w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                  />
                  <select
                    value={ingredient.unit}
                    onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                    className="flex-1 sm:w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    <option value="g">grams</option>
                    <option value="oz">ounces</option>
                    <option value="ml">milliliters</option>
                    <option value="cups">cups</option>
                  </select>
                  {ingredients.length > 1 && (
                    <button
                      onClick={() => removeIngredient(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions Section */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold">Cooking Instructions</h2>
          <div className="mt-4">
            <textarea
              placeholder="Optional cooking instructions..."
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Analysis Section */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-3 sm:gap-0">
            <h2 className="text-lg sm:text-xl font-semibold">AI Analysis</h2>
            {!analysis && (
              <button 
                className={`w-full sm:w-auto bg-green-500 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 text-sm sm:text-base
                  ${isAnalysing || !mealName || ingredients[0].name === '' ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={analyseMeal}
                disabled={isAnalysing || !mealName || ingredients[0].name === ''}
              >
                {isAnalysing ? (
                  <><Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> Analysing...</>
                ) : (
                  'Analyse Meal'
                )}
              </button>
            )}
          </div>

          {analysis && (
            <div className="space-y-4 sm:space-y-6">
              {/* Health Score */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-blue-50 rounded-full p-4 sm:p-6 h-20 w-20 sm:h-24 sm:w-24 flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-bold text-blue-600">{analysis.score}</span>
                </div>
                <div>
                  <h3 className="font-medium text-base sm:text-lg">Health Score</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">Out of 100 possible points</p>
                </div>
              </div>

              {/* Nutritional Overview */}
              <div>
                <h3 className="font-medium text-base sm:text-lg mb-2">Nutritional Overview</h3>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <p className="text-gray-700 text-sm sm:text-base">{analysis.analysis.nutritionalValue}</p>
                  <p className="text-gray-700 text-sm sm:text-base">{analysis.analysis.calorieEstimate}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-xs sm:text-sm text-blue-800">Proteins</h4>
                      <p className="text-blue-600 text-sm sm:text-base">{analysis.analysis.macroBreakdown.proteins}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h4 className="font-medium text-xs sm:text-sm text-green-800">Carbs</h4>
                      <p className="text-green-600 text-sm sm:text-base">{analysis.analysis.macroBreakdown.carbs}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <h4 className="font-medium text-xs sm:text-sm text-yellow-800">Fats</h4>
                      <p className="text-yellow-600 text-sm sm:text-base">{analysis.analysis.macroBreakdown.fats}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Improvements */}
              <div>
                <h3 className="font-medium text-base sm:text-lg mb-4">Suggested Improvements</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysis.improvements.map((improvement, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-50 rounded-lg p-3 sm:p-4 flex flex-col h-full"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm sm:text-base text-gray-800">{improvement.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          improvement.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                          improvement.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {improvement.priority}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 flex-grow">{improvement.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="text-xs text-gray-500 mt-4 space-y-1">
                <p>Analysis Version: {analysis.metadata.analysisVersion}</p>
                <p>Model: {analysis.metadata.modelUsed}</p>
                <p>Generated: {new Date(analysis.metadata.timestamp).toLocaleString()}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
                <button 
                  className={`flex-1 bg-blue-500 text-white py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 text-sm sm:text-base
                    ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={saveMeal}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <><Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="h-4 w-4 sm:h-5 sm:w-5" /> Save Meal</>
                  )}
                </button>
                <button
                  onClick={() => setAnalysis(null)}
                  className="flex-1 bg-green-500 text-white py-2 sm:py-3 rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base"
                >
                  Analyse Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { Plus, Trash2, Save, UtensilsCrossed, Loader2 } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { supabase } from '@/lib/supabase';
// import { User } from '@supabase/supabase-js';

// interface Ingredient {
//   name: string;
//   weight: string;
//   unit: string;
// }

// interface MealAnalysis {
//   score: number;
//   improvements: Array<{
//     title: string;
//     description: string;
//     priority: 'HIGH' | 'MEDIUM' | 'LOW';
//   }>;
//   analysis: {
//     nutritionalValue: string;
//     calorieEstimate: string;
//     macroBreakdown: {
//       proteins: string;
//       carbs: string;
//       fats: string;
//     };
//   };
//   metadata: {
//     analysisVersion: string;
//     modelUsed: string;
//     timestamp: string;
//   };
// }

// export default function LogMealPage() {
//   const [mealName, setMealName] = useState('');
//   const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', weight: '', unit: 'g' }]);
//   const [instructions, setInstructions] = useState('');
//   const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
//   const [isAnalysing, setIsAnalysing] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [error, setError] = useState('');
//   const [user, setUser] = useState<User | null>(null);
// //   const [isLoading, setIsLoading] = useState(true);
  
//   const router = useRouter();

//   useEffect(() => {
//     const checkUser = async () => {
//       const { data: { user }, error } = await supabase.auth.getUser();
//       if (error || !user) {
//         router.push('/auth/signin');
//         return;
//       }
//       setUser(user);
//     //   setIsLoading(false);
//     };

//     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
//       if (event === 'SIGNED_OUT') {
//         router.push('/auth/signin');
//       }
//       setUser(session?.user || null);
//     });

//     checkUser();

//     return () => {
//       subscription.unsubscribe();
//     };
//   }, [router]);

//   const saveMeal = async () => {
//     if (!user) {
//       setError('Please sign in to save meals');
//       router.push('/auth/signin');
//       return;
//     }

//     if (!mealName || ingredients[0].name === '') {
//       setError('Please provide a meal name and at least one ingredient');
//       return;
//     }

//     setIsSaving(true);
//     setError('');

//     try {
//       const { error: mealError } = await supabase
//         .from('meals')
//         .insert({
//           user_id: user.id,
//           name: mealName,
//           ingredients: ingredients.map(i => ({
//             name: i.name,
//             weight: parseFloat(i.weight),
//             unit: i.unit
//           })),
//           instructions,
//           analysis: analysis || null,
//           created_at: new Date().toISOString()
//         });

//       if (mealError) throw mealError;

//       // Clear form after successful save
//       setMealName('');
//       setIngredients([{ name: '', weight: '', unit: 'g' }]);
//       setInstructions('');
//       setAnalysis(null);
      
//       router.refresh();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to save meal');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const analyseMeal = async () => {
//     setIsAnalysing(true);
//     setError('');
    
//     const ingredientsList = ingredients
//       .map(i => `${i.name} (${i.weight}${i.unit})`)
//       .join(', ');
//     const mealDescription = `Ingredients: ${ingredientsList}\nInstructions: ${instructions}`;
    
//     try {
//       const response = await fetch('/api/analyse-meal', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           mealName,
//           mealDescription,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to analyse meal');
//       }
      
//       const data = await response.json();
//       setAnalysis(data);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to analyse meal. Please try again.');
//     } finally {
//       setIsAnalysing(false);
//     }
//   };

//   const addIngredient = () => {
//     setIngredients([...ingredients, { name: '', weight: '', unit: 'g' }]);
//   };

//   const removeIngredient = (index: number) => {
//     setIngredients(ingredients.filter((_, i) => i !== index));
//   };

//   const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
//     const newIngredients = [...ingredients];
//     newIngredients[index] = { ...newIngredients[index], [field]: value };
//     setIngredients(newIngredients);
//   };
  
//   return (
//     <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl sm:text-3xl font-bold">Log a Meal</h1>
//       </div>

//       {error && (
//         <div className="bg-red-50 text-red-600 p-3 sm:p-4 rounded-lg text-sm sm:text-base">
//           {error}
//         </div>
//       )}

//       <div className="grid gap-4 sm:gap-6">
//         {/* Meal Details Section */}
//         <div className="bg-white rounded-lg shadow p-4 sm:p-6">
//           <div className="flex flex-row items-center justify-between pb-2">
//             <h2 className="text-lg sm:text-xl font-semibold">Meal Details</h2>
//             <UtensilsCrossed className="h-5 w-5 text-blue-500" />
//           </div>
//           <div className="mt-4">
//             <input
//               type="text"
//               placeholder="Meal Name"
//               value={mealName}
//               onChange={(e) => setMealName(e.target.value)}
//               className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-lg"
//             />
//           </div>
//         </div>

//         {/* Ingredients Section */}
//         <div className="bg-white rounded-lg shadow p-4 sm:p-6">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
//             <h2 className="text-lg sm:text-xl font-semibold">Ingredients</h2>
//             <button
//               onClick={addIngredient}
//               className="flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm sm:text-base"
//             >
//               <Plus className="h-4 w-4 sm:h-5 sm:w-5" /> Add Ingredient
//             </button>
//           </div>
//           <div className="mt-4 space-y-4">
//             {ingredients.map((ingredient, index) => (
//               <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
//                 <input
//                   type="text"
//                   placeholder="Ingredient name"
//                   value={ingredient.name}
//                   onChange={(e) => updateIngredient(index, 'name', e.target.value)}
//                   className="w-full sm:flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
//                 />
//                 <div className="flex items-center gap-2 w-full sm:w-auto">
//                   <input
//                     type="number"
//                     placeholder="Weight"
//                     value={ingredient.weight}
//                     onChange={(e) => updateIngredient(index, 'weight', e.target.value)}
//                     className="flex-1 sm:w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
//                   />
//                   <select
//                     value={ingredient.unit}
//                     onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
//                     className="flex-1 sm:w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
//                   >
//                     <option value="g">grams</option>
//                     <option value="oz">ounces</option>
//                     <option value="ml">milliliters</option>
//                     <option value="cups">cups</option>
//                   </select>
//                   {ingredients.length > 1 && (
//                     <button
//                       onClick={() => removeIngredient(index)}
//                       className="text-red-500 hover:text-red-700"
//                     >
//                       <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Instructions Section */}
//         <div className="bg-white rounded-lg shadow p-4 sm:p-6">
//           <h2 className="text-lg sm:text-xl font-semibold">Cooking Instructions</h2>
//           <div className="mt-4">
//             <textarea
//               placeholder="Optional cooking instructions..."
//               rows={4}
//               value={instructions}
//               onChange={(e) => setInstructions(e.target.value)}
//               className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
//             />
//           </div>
//         </div>

//         {/* Analysis Section */}
//         <div className="bg-white rounded-lg shadow p-4 sm:p-6">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-3 sm:gap-0">
//             <h2 className="text-lg sm:text-xl font-semibold">AI Analysis</h2>
//             {!analysis && (
//               <button 
//                 className={`w-full sm:w-auto bg-green-500 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 text-sm sm:text-base
//                   ${isAnalysing || !mealName || ingredients[0].name === '' ? 'opacity-50 cursor-not-allowed' : ''}`}
//                 onClick={analyseMeal}
//                 disabled={isAnalysing || !mealName || ingredients[0].name === ''}
//               >
//                 {isAnalysing ? (
//                   <><Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> Analysing...</>
//                 ) : (
//                   'Analyse Meal'
//                 )}
//               </button>
//             )}
//           </div>

//           {analysis && (
//             <div className="space-y-4 sm:space-y-6">
//               {/* Health Score */}
//               <div className="flex items-center gap-3 sm:gap-4">
//                 <div className="bg-blue-50 rounded-full p-4 sm:p-6 h-20 w-20 sm:h-24 sm:w-24 flex items-center justify-center">
//                   <span className="text-2xl sm:text-3xl font-bold text-blue-600">{analysis.score}</span>
//                 </div>
//                 <div>
//                   <h3 className="font-medium text-base sm:text-lg">Health Score</h3>
//                   <p className="text-gray-600 text-xs sm:text-sm">Out of 100 possible points</p>
//                 </div>
//               </div>

//               {/* Nutritional Overview */}
//               <div>
//                 <h3 className="font-medium text-base sm:text-lg mb-2">Nutritional Overview</h3>
//                 <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
//                   <p className="text-gray-700 text-sm sm:text-base">{analysis.analysis.nutritionalValue}</p>
//                   <p className="text-gray-700 text-sm sm:text-base">{analysis.analysis.calorieEstimate}</p>
                  
//                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
//                     <div className="bg-blue-50 p-3 rounded-lg">
//                       <h4 className="font-medium text-xs sm:text-sm text-blue-800">Proteins</h4>
//                       <p className="text-blue-600 text-sm sm:text-base">{analysis.analysis.macroBreakdown.proteins}</p>
//                     </div>
//                     <div className="bg-green-50 p-3 rounded-lg">
//                       <h4 className="font-medium text-xs sm:text-sm text-green-800">Carbs</h4>
//                       <p className="text-green-600 text-sm sm:text-base">{analysis.analysis.macroBreakdown.carbs}</p>
//                     </div>
//                     <div className="bg-yellow-50 p-3 rounded-lg">
//                       <h4 className="font-medium text-xs sm:text-sm text-yellow-800">Fats</h4>
//                       <p className="text-yellow-600 text-sm sm:text-base">{analysis.analysis.macroBreakdown.fats}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               {/* Improvements */}
//               <div>
//                 <h3 className="font-medium text-base sm:text-lg mb-4">Suggested Improvements</h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {analysis.improvements.map((improvement, index) => (
//                     <div 
//                       key={index} 
//                       className="bg-gray-50 rounded-lg p-3 sm:p-4 flex flex-col h-full"
//                     >
//                       <div className="flex justify-between items-start mb-2">
//                         <h4 className="font-medium text-sm sm:text-base text-gray-800">{improvement.title}</h4>
//                         <span className={`text-xs px-2 py-1 rounded-full ${
//                           improvement.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
//                           improvement.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
//                           'bg-green-100 text-green-800'
//                         }`}>
//                           {improvement.priority}
//                         </span>
//                       </div>
//                       <p className="text-xs sm:text-sm text-gray-600 flex-grow">{improvement.description}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Metadata */}
//               <div className="text-xs text-gray-500 mt-4 space-y-1">
//                 <p>Analysis Version: {analysis.metadata.analysisVersion}</p>
//                 <p>Model: {analysis.metadata.modelUsed}</p>
//                 <p>Generated: {new Date(analysis.metadata.timestamp).toLocaleString()}</p>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
//                 <button 
//                   className={`flex-1 bg-blue-500 text-white py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 text-sm sm:text-base
//                     ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
//                   onClick={saveMeal}
//                   disabled={isSaving}
//                 >
//                   {isSaving ? (
//                     <><Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> Saving...</>
//                   ) : (
//                     <><Save className="h-4 w-4 sm:h-5 sm:w-5" /> Save Meal</>
//                   )}
//                 </button>
//                 <button
//                   onClick={() => setAnalysis(null)}
//                   className="flex-1 bg-green-500 text-white py-2 sm:py-3 rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base"
//                 >
//                   Analyse Again
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
