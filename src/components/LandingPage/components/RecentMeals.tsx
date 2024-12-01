'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface RecentMeal {
  id: string;
  name: string;
  ingredients: Array<{
    name: string;
    weight: number;
    unit: string;
  }>;
  analysis: {
    score: number;
    improvements: Array<{
      title: string;
      description: string;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
    analysis: {
      calorieEstimate: string;
    };
  };
  created_at: string;
}

export function RecentMeals() {
  const [meals, setMeals] = useState<RecentMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMealIndex, setCurrentMealIndex] = useState(0);

  useEffect(() => {
    async function fetchRecentMeals() {
      try {
        const { data, error } = await supabase
          .rpc('get_recent_public_meals', { limit_count: 5 });

        if (error) {
          console.error('Error fetching meals:', error);
          return;
        }

        if (data) {
          setMeals(data as RecentMeal[]);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentMeals();

    const mealSubscription = supabase
      .channel('public_meals')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'meals' },
        () => {
          fetchRecentMeals();
        }
      )
      .subscribe();

    return () => {
      mealSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (meals.length > 1) {
      const timer = setInterval(() => {
        setCurrentMealIndex((prev) => (prev + 1) % meals.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [meals.length]);

  if (loading) {
    return (
      <div className="w-full py-8 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (meals.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-6 sm:py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-6">
          Recently Logged Meals
        </h2>
        
        <div className="relative h-[500px] sm:h-[440px] overflow-hidden">
          {meals.map((meal, index) => (
            <div
              key={meal.id}
              className={`absolute w-full transform transition-all duration-500 ease-in-out ${
                index === currentMealIndex 
                  ? 'translate-x-0 opacity-100'
                  : index < currentMealIndex 
                  ? '-translate-x-full opacity-0'
                  : 'translate-x-full opacity-0'
              }`}
            >
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 max-w-4xl mx-auto">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
                  {meal.name}
                </h3>
                
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-6 sm:gap-8">
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700 mb-3">
                      Ingredients
                    </h4>
                    <ul className="space-y-2 text-gray-600">
                      {meal.ingredients.slice(0, 4).map((ingredient, i) => (
                        <li key={i} className="text-xs sm:text-sm">
                          {ingredient.name} ({ingredient.weight}{ingredient.unit})
                        </li>
                      ))}
                      {meal.ingredients.length > 4 && (
                        <li className="text-xs sm:text-sm text-gray-400">
                          +{meal.ingredients.length - 4} more...
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm sm:text-base font-medium text-gray-700">
                          Health Score
                        </span>
                        <span className="text-2xl sm:text-3xl font-bold text-blue-600">
                          {meal.analysis.score}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {meal.analysis.analysis.calorieEstimate}
                      </p>
                    </div>
                    
                    {meal.analysis.improvements.length > 0 && (
                      <div>
                        <h4 className="text-sm sm:text-base font-medium text-gray-700 mb-2">
                          Top Suggestion
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-gray-800 text-xs sm:text-sm">
                              {meal.analysis.improvements[0].title}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              meal.analysis.improvements[0].priority === 'HIGH' 
                                ? 'bg-red-100 text-red-800' 
                                : meal.analysis.improvements[0].priority === 'MEDIUM' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {meal.analysis.improvements[0].priority}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {meal.analysis.improvements[0].description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-4 gap-2">
          {meals.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                index === currentMealIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => setCurrentMealIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
// 'use client';

// import { useEffect, useState } from 'react';
// import { supabase } from '@/lib/supabase';
// import { Loader2 } from 'lucide-react';

// interface RecentMeal {
//   id: string;
//   name: string;
//   ingredients: Array<{
//     name: string;
//     weight: number;
//     unit: string;
//   }>;
//   analysis: {
//     score: number;
//     improvements: Array<{
//       title: string;
//       description: string;
//       priority: 'HIGH' | 'MEDIUM' | 'LOW';
//     }>;
//     analysis: {
//       calorieEstimate: string;
//     };
//   };
//   created_at: string;
// }

// export function RecentMeals() {
//   const [meals, setMeals] = useState<RecentMeal[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentMealIndex, setCurrentMealIndex] = useState(0);

//   useEffect(() => {
//     async function fetchRecentMeals() {
//       try {
//         const { data, error } = await supabase
//           .rpc('get_recent_public_meals', { limit_count: 5 });

//         if (error) {
//           console.error('Error fetching meals:', error);
//           return;
//         }

//         if (data) {
//           setMeals(data as RecentMeal[]);
//         }
//       } catch (error) {
//         console.error('Unexpected error:', error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchRecentMeals();

//     // Subscribe to changes in meals table
//     const mealSubscription = supabase
//       .channel('public_meals')
//       .on('postgres_changes', 
//         { event: '*', schema: 'public', table: 'meals' },
//         () => {
//           fetchRecentMeals();
//         }
//       )
//       .subscribe();

//     return () => {
//       mealSubscription.unsubscribe();
//     };
//   }, []);

//   useEffect(() => {
//     if (meals.length > 1) {
//       const timer = setInterval(() => {
//         setCurrentMealIndex((prev) => (prev + 1) % meals.length);
//       }, 5000);

//       return () => clearInterval(timer);
//     }
//   }, [meals.length]);

//   if (loading) {
//     return (
//       <div className="w-full py-12 flex justify-center">
//         <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
//       </div>
//     );
//   }

//   if (meals.length === 0) {
//     return null;
//   }

//   return (
//     <section className="bg-gradient-to-b from-gray-50 to-white py-12">
//       <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
//         <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
//           Recently Logged Meals
//         </h2>
        
//         <div className="relative h-[440px] overflow-hidden">
//           {meals.map((meal, index) => (
//             <div
//               key={meal.id}
//               className={`absolute w-full transform transition-all duration-500 ease-in-out ${
//                 index === currentMealIndex 
//                   ? 'translate-x-0 opacity-100'
//                   : index < currentMealIndex 
//                   ? '-translate-x-full opacity-0'
//                   : 'translate-x-full opacity-0'
//               }`}
//             >
//               <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
//                 <h3 className="text-2xl font-semibold text-gray-900 mb-4">
//                   {meal.name}
//                 </h3>
                
//                 <div className="grid grid-cols-2 gap-8">
//                   <div>
//                     <h4 className="text-base font-medium text-gray-700 mb-3">Ingredients</h4>
//                     <ul className="space-y-2 text-gray-600">
//                       {meal.ingredients.slice(0, 4).map((ingredient, i) => (
//                         <li key={i} className="text-sm">
//                           {ingredient.name} ({ingredient.weight}{ingredient.unit})
//                         </li>
//                       ))}
//                       {meal.ingredients.length > 4 && (
//                         <li className="text-sm text-gray-400">
//                           +{meal.ingredients.length - 4} more...
//                         </li>
//                       )}
//                     </ul>
//                   </div>
                  
//                   <div className="space-y-6">
//                     <div>
//                       <div className="flex items-center justify-between mb-2">
//                         <span className="text-base font-medium text-gray-700">Health Score</span>
//                         <span className="text-3xl font-bold text-blue-600">
//                           {meal.analysis.score}
//                         </span>
//                       </div>
//                       <p className="text-sm text-gray-600">{meal.analysis.analysis.calorieEstimate}</p>
//                     </div>
                    
//                     {meal.analysis.improvements.length > 0 && (
//                       <div>
//                         <h4 className="text-base font-medium text-gray-700 mb-2">Top Suggestion</h4>
//                         <div className="bg-gray-50 rounded-lg p-4">
//                           <div className="flex justify-between items-start mb-2">
//                             <span className="font-medium text-gray-800 text-sm">
//                               {meal.analysis.improvements[0].title}
//                             </span>
//                             <span className={`text-xs px-2 py-1 rounded-full ${
//                               meal.analysis.improvements[0].priority === 'HIGH' 
//                                 ? 'bg-red-100 text-red-800' 
//                                 : meal.analysis.improvements[0].priority === 'MEDIUM' 
//                                 ? 'bg-yellow-100 text-yellow-800' 
//                                 : 'bg-green-100 text-green-800'
//                             }`}>
//                               {meal.analysis.improvements[0].priority}
//                             </span>
//                           </div>
//                           <p className="text-sm text-gray-600">
//                             {meal.analysis.improvements[0].description}
//                           </p>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
        
//         <div className="flex justify-center mt-4 gap-2">
//           {meals.map((_, index) => (
//             <button
//               key={index}
//               className={`h-2 w-2 rounded-full transition-colors duration-200 ${
//                 index === currentMealIndex ? 'bg-blue-500' : 'bg-gray-300'
//               }`}
//               onClick={() => setCurrentMealIndex(index)}
//             />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

