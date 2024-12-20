'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PreferencesCollectionProps {
  onComplete: () => void;
}

interface FormData {
  primaryGoals: string[];
  dietaryRestrictions: string[];
  healthFocus: string[];
  mealPreferences: string[];
  customNotes: string;
}

type FormFields = keyof FormData;

export function PreferencesCollection({ onComplete }: PreferencesCollectionProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    primaryGoals: [],
    dietaryRestrictions: [],
    healthFocus: [],
    mealPreferences: [],
    customNotes: ''
  });

  const steps: Array<{
    title: string;
    field: FormFields;
    options?: string[];
    type?: 'options' | 'text';
    description?: string;
  }> = [
    {
      title: "What are your main goals?",
      field: "primaryGoals",
      type: 'options',
      options: [
        "Weight Loss",
        "Weight Gain",
        "Maintain Weight",
        "Build Muscle",
        "Improve Energy",
        "Better Sleep"
      ]
    },
    {
      title: "Any dietary restrictions?",
      field: "dietaryRestrictions",
      type: 'options',
      options: [
        "Vegetarian",
        "Vegan",
        "Gluten-Free",
        "Dairy-Free",
        "Halal",
        "Kosher",
        "Nut Allergies"
      ]
    },
    {
      title: "What's your health focus?",
      field: "healthFocus",
      type: 'options',
      options: [
        "Gut Health",
        "Heart Health",
        "Blood Sugar Control",
        "Reduce Inflammation",
        "Mental Clarity",
        "Athletic Performance"
      ]
    },
    {
      title: "Meal preferences",
      field: "mealPreferences",
      type: 'options',
      options: [
        "Quick & Easy",
        "Batch Cooking",
        "Low Budget",
        "High Protein",
        "Plant-Based",
        "Mediterranean"
      ]
    },
    {
      title: "Any additional health conditions or preferences?",
      field: "customNotes",
      type: 'text',
      description: "Please share any specific health conditions, allergies, or preferences that weren't covered above (e.g., diabetes, skin conditions, food sensitivities)"
    }
  ];

  const handleSelect = (field: FormFields, option: string) => {
    setFormData(prev => {
      const current = prev[field];
      if (Array.isArray(current)) {
        const updated = current.includes(option)
          ? current.filter(item => item !== option)
          : [...current, option];
        return { ...prev, [field]: updated };
      }
      return prev;
    });
  };

  const handleTextInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      customNotes: event.target.value
    }));
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: existingPreferences, error: fetchError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const preferencesData = {
        primary_goals: formData.primaryGoals,
        dietary_restrictions: formData.dietaryRestrictions,
        health_focus: formData.healthFocus,
        meal_preferences: formData.mealPreferences,
        custom_notes: formData.customNotes,
        profile_completion: 100
      };

      if (existingPreferences) {
        const { error: updateError } = await supabase
          .from('user_preferences')
          .update(preferencesData)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            ...preferencesData
          });

        if (insertError) throw insertError;
      }

      onComplete();
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = steps[step];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">{currentStep.title}</h2>
          <Progress value={((step + 1) / steps.length) * 100} className="mt-2" />
        </CardHeader>

        <CardContent>
          {currentStep.type === 'text' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">{currentStep.description}</p>
              <textarea
                placeholder="Type your additional health conditions or preferences here..."
                className="w-full min-h-[150px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.customNotes}
                onChange={handleTextInput}
              />
            </div>
          ) : (
            <div className="grid gap-3">
              {currentStep.options?.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={formData[currentStep.field].includes(option) ? "default" : "outline"}
                  className="w-full text-left justify-start h-12"
                  onClick={() => handleSelect(currentStep.field, option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => setStep(prev => prev - 1)}
            disabled={step === 0 || loading}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button
            type="button"
            onClick={() => {
              if (step === steps.length - 1) {
                handleSavePreferences();
              } else {
                setStep(prev => prev + 1);
              }
            }}
            disabled={loading}
          >
            {loading ? 'Saving...' : step === steps.length - 1 ? 'Complete' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// // components/PreferencesCollection.tsx
// 'use client';
// import { useState } from 'react';
// import { supabase } from '@/lib/supabase';
// import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Progress } from '@/components/ui/progress';
// import { ChevronLeft, ChevronRight } from 'lucide-react';

// interface PreferencesCollectionProps {
//   onComplete: () => void;
// }

// interface FormData {
//   primaryGoals: string[];
//   dietaryRestrictions: string[];
//   healthFocus: string[];
//   mealPreferences: string[];
// }

// type FormFields = keyof FormData;

// export function PreferencesCollection({ onComplete }: PreferencesCollectionProps) {
//   const [step, setStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState<FormData>({
//     primaryGoals: [],
//     dietaryRestrictions: [],
//     healthFocus: [],
//     mealPreferences: []
//   });

//   const steps: { title: string; field: FormFields; options: string[] }[] = [
//     {
//       title: "What are your main goals?",
//       field: "primaryGoals",
//       options: [
//         "Weight Loss",
//         "Weight Gain",
//         "Maintain Weight",
//         "Build Muscle",
//         "Improve Energy",
//         "Better Sleep"
//       ]
//     },
//     {
//       title: "Any dietary restrictions?",
//       field: "dietaryRestrictions",
//       options: [
//         "Vegetarian",
//         "Vegan",
//         "Gluten-Free",
//         "Dairy-Free",
//         "Halal",
//         "Kosher",
//         "Nut Allergies"
//       ]
//     },
//     {
//       title: "What's your health focus?",
//       field: "healthFocus",
//       options: [
//         "Gut Health",
//         "Heart Health",
//         "Blood Sugar Control",
//         "Reduce Inflammation",
//         "Mental Clarity",
//         "Athletic Performance"
//       ]
//     },
//     {
//       title: "Meal preferences",
//       field: "mealPreferences",
//       options: [
//         "Quick & Easy",
//         "Batch Cooking",
//         "Low Budget",
//         "High Protein",
//         "Plant-Based",
//         "Mediterranean"
//       ]
//     }
//   ];

//   const handleSelect = (field: FormFields, option: string) => {
//     setFormData(prev => {
//       const current = prev[field];
//       const updated = current.includes(option)
//         ? current.filter(item => item !== option)
//         : [...current, option];
//       return { ...prev, [field]: updated };
//     });
//   };

//   const handleSavePreferences = async () => {
//     setLoading(true);
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error('No user found');

//       // Check if preferences already exist to prevent duplicate entries
//       const { data: existingPreferences, error: fetchError } = await supabase
//         .from('user_preferences')
//         .select('*')
//         .eq('user_id', user.id)
//         .single();

//       if (fetchError && fetchError.code !== 'PGRST116') { // 'PGRST116' means no rows found
//         throw fetchError;
//       }

//       if (existingPreferences) {
//         // Update existing preferences
//         const { error: updateError } = await supabase
//           .from('user_preferences')
//           .update({
//             primary_goals: formData.primaryGoals,
//             dietary_restrictions: formData.dietaryRestrictions,
//             health_focus: formData.healthFocus,
//             meal_preferences: formData.mealPreferences,
//             profile_completion: 100
//           })
//           .eq('user_id', user.id);

//         if (updateError) throw updateError;
//       } else {
//         // Insert new preferences
//         const { error: insertError } = await supabase
//           .from('user_preferences')
//           .insert({
//             user_id: user.id,
//             primary_goals: formData.primaryGoals,
//             dietary_restrictions: formData.dietaryRestrictions,
//             health_focus: formData.healthFocus,
//             meal_preferences: formData.mealPreferences,
//             profile_completion: 100
//           });

//         if (insertError) throw insertError;
//       }

//       onComplete();
//     } catch (error) {
//       console.error('Error saving preferences:', error);
//       // Optionally, you can display an error message to the user here
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4">
//       <Card className="w-full max-w-lg">
//         <CardHeader>
//           <h2 className="text-2xl font-bold text-center">{steps[step].title}</h2>
//           <Progress value={((step + 1) / steps.length) * 100} className="mt-2" />
//         </CardHeader>

//         <CardContent>
//           <div className="grid gap-3">
//             {steps[step].options.map((option) => (
//               <Button
//                 key={option}
//                 type="button"
//                 variant={formData[steps[step].field].includes(option) ? "default" : "outline"}
//                 className="w-full text-left justify-start h-12"
//                 onClick={() => handleSelect(steps[step].field, option)}
//               >
//                 {option}
//               </Button>
//             ))}
//           </div>
//         </CardContent>

//         <CardFooter className="flex justify-between">
//           <Button 
//             type="button"
//             variant="outline" 
//             onClick={() => setStep(prev => prev - 1)}
//             disabled={step === 0 || loading}
//           >
//             <ChevronLeft className="w-4 h-4 mr-2" />
//             Back
//           </Button>
          
//           <Button
//             type="button"
//             onClick={() => {
//               if (step === steps.length - 1) {
//                 handleSavePreferences();
//               } else {
//                 setStep(prev => prev + 1);
//               }
//             }}
//             disabled={loading}
//           >
//             {loading ? 'Saving...' : step === steps.length - 1 ? 'Complete' : 'Next'}
//             <ChevronRight className="w-4 h-4 ml-2" />
//           </Button>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }
