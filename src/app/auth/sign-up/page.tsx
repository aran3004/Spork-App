// app/auth/sign-up/page.tsx
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for the confirmation link!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
          {message && (
            <p className="text-center text-sm text-gray-600">{message}</p>
          )}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/sign-in" className="text-blue-500 hover:text-blue-600">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

// 'use client'
// import { useState } from 'react'
// import { supabase } from '@/lib/supabase'
// import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Progress } from '@/components/ui/progress'
// import Link from 'next/link'
// import { ChevronLeft, ChevronRight } from 'lucide-react'

// interface SignUpData {
//   email: string;
//   password: string;
//   primaryGoals: string[];
//   dietaryRestrictions: string[];
//   healthFocus: string[];
//   mealPreferences: string[];
// }

// interface CredentialsStep {
//   title: string;
//   type: "credentials";
//   fields: Array<"email" | "password">;
// }

// interface SelectionStep {
//   title: string;
//   type: "multiSelect";
//   field: keyof Omit<SignUpData, "email" | "password">;
//   options: string[];
// }

// type Step = CredentialsStep | SelectionStep;

// export default function SignUpPage() {
//   const [step, setStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');
//   const [isVerifying, setIsVerifying] = useState(false);
//   const [passwordError, setPasswordError] = useState('');
//   const [formData, setFormData] = useState<SignUpData>({
//     email: '',
//     password: '',
//     primaryGoals: [],
//     dietaryRestrictions: [],
//     healthFocus: [],
//     mealPreferences: []
//   });

//   const steps: Step[] = [
//     {
//       title: "Create your account",
//       type: "credentials",
//       fields: ["email", "password"]
//     },
//     {
//       title: "What are your main goals?",
//       type: "multiSelect",
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
//       type: "multiSelect",
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
//       type: "multiSelect",
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
//       type: "multiSelect",
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

//   const handleNextStep = async () => {
//     if (step === steps.length - 1) {
//       await handleSignUp();
//     } else {
//       setStep(prev => prev + 1);
//     }
//   };

//   const handlePrevStep = () => {
//     setStep(prev => Math.max(0, prev - 1));
//   };

//   const handleSelect = (field: keyof SignUpData, option: string) => {
//     setFormData(prev => {
//       const current = prev[field] as string[];
//       const updated = current.includes(option)
//         ? current.filter(item => item !== option)
//         : [...current, option];
//       return { ...prev, [field]: updated };
//     });
//   };

//   const handleCredentialsChange = (field: 'email' | 'password', value: string) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//     if (field === 'password') {
//       validatePassword(value);
//     }
//   };

//   const validatePassword = (password: string) => {
//     if (password.length < 6) {
//       setPasswordError('Password must be at least 6 characters long');
//       return false;
//     }
//     setPasswordError('');
//     return true;
//   };

//   const handleSignUp = async () => {
//     setLoading(true);
//     setMessage('');

//     try {
//       // Store preferences before signup
//       const preferences = {
//         primary_goals: formData.primaryGoals,
//         dietary_restrictions: formData.dietaryRestrictions,
//         health_focus: formData.healthFocus,
//         meal_preferences: formData.mealPreferences,
//         profile_completion: 100
//       };
//       localStorage.setItem('pendingPreferences', JSON.stringify(preferences));

//       // Sign up the user
//       const { error } = await supabase.auth.signUp({
//         email: formData.email,
//         password: formData.password,
//         options: {
//           emailRedirectTo: `${window.location.origin}/auth/callback`,
//           data: {
//             has_pending_preferences: true
//           }
//         }
//       });

//       if (error) throw error;
      
//       setIsVerifying(true);
//       setMessage('Please check your email for the confirmation link.');
//     } catch (error) {
//       if (error instanceof Error) {
//         setMessage(error.message);
//       } else {
//         setMessage('An unexpected error occurred');
//       }
//       console.error('Error during sign up:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const canProgress = () => {
//     if (steps[step].type === "credentials") {
//       return formData.email && formData.password && formData.password.length >= 6;
//     }
//     return true;
//   };

//   const renderStepContent = () => {
//     const currentStep = steps[step];

//     if (currentStep.type === "credentials") {
//       return (
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Email</label>
//             <input
//               type="email"
//               value={formData.email}
//               onChange={(e) => handleCredentialsChange('email', e.target.value)}
//               className="w-full p-2 border rounded border-gray-300"
//               placeholder="Enter your email"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Password</label>
//             <input
//               type="password"
//               value={formData.password}
//               onChange={(e) => handleCredentialsChange('password', e.target.value)}
//               className={`w-full p-2 border rounded ${
//                 passwordError ? 'border-red-500' : 'border-gray-300'
//               }`}
//               placeholder="Enter your password"
//               required
//             />
//             {passwordError && (
//               <p className="text-red-500 text-sm mt-1">{passwordError}</p>
//             )}
//             <p className="text-gray-500 text-sm mt-1">
//               Password must be at least 6 characters long
//             </p>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div className="grid gap-3">
//         {currentStep.options.map((option) => (
//           <Button
//             key={option}
//             type="button"
//             variant={formData[currentStep.field].includes(option) ? "default" : "outline"}
//             className="w-full text-left justify-start h-12"
//             onClick={() => handleSelect(currentStep.field, option)}
//           >
//             {option}
//           </Button>
//         ))}
//       </div>
//     );
//   };

//   if (isVerifying) {
//     return (
//       <div className="min-h-screen flex items-center justify-center p-4">
//         <Card className="w-full max-w-lg">
//           <CardHeader>
//             <h2 className="text-2xl font-bold text-center">Verify Your Email</h2>
//           </CardHeader>
//           <CardContent>
//             <div className="text-center space-y-4">
//               <p>Please check your email for the verification link.</p>
//               <p>Your preferences will be saved automatically after you verify your email and log in.</p>
//               <p className="text-sm text-gray-600">
//                 Didn't receive the email? Check your spam folder or{' '}
//                 <Button
//                   variant="outline"
//                   className="px-2 py-1 h-auto"
//                   onClick={() => {
//                     setIsVerifying(false);
//                     setStep(0);
//                   }}
//                 >
//                   try again
//                 </Button>
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4">
//       <Card className="w-full max-w-lg">
//         <CardHeader>
//           <h2 className="text-2xl font-bold text-center">{steps[step].title}</h2>
//           <Progress value={((step + 1) / steps.length) * 100} className="mt-2" />
//         </CardHeader>

//         <CardContent>
//           {renderStepContent()}
//           {message && (
//             <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
//           )}
//         </CardContent>

//         <CardFooter className="flex justify-between">
//           <Button 
//             type="button"
//             variant="outline" 
//             onClick={handlePrevStep}
//             disabled={step === 0}
//           >
//             <ChevronLeft className="w-4 h-4 mr-2" />
//             Back
//           </Button>
          
//           <Button
//             type="button"
//             onClick={handleNextStep}
//             disabled={!canProgress() || loading}
//           >
//             {loading ? 'Creating account...' : step === steps.length - 1 ? 'Complete Sign Up' : 'Next'}
//             <ChevronRight className="w-4 h-4 ml-2" />
//           </Button>
//         </CardFooter>

//         {step === 0 && (
//           <p className="text-center text-sm text-gray-600 pb-4">
//             Already have an account?{' '}
//             <Link href="/auth/sign-in" className="text-blue-500 hover:text-blue-600">
//               Sign in
//             </Link>
//           </p>
//         )}
//       </Card>
//     </div>
//   );
// }
//  -----------------------------------------------------------------------------------------------------------------------

// // app/auth/sign-up/page.tsx
// 'use client'
// import { useState } from 'react'
// import { supabase } from '@/lib/supabase'
// import Link from 'next/link'

// export default function SignUp() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [message, setMessage] = useState('')
// //   const router = useRouter()

//   const handleSignUp = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)

//     const { error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         emailRedirectTo: `${window.location.origin}/dashboard`,
//       },
//     })

//     if (error) {
//       setMessage(error.message)
//     } else {
//       setMessage('Check your email for the confirmation link!')
//     }
//     setLoading(false)
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md">
//         <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
//         <form onSubmit={handleSignUp} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Email</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Password</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
//           >
//             {loading ? 'Creating account...' : 'Sign Up'}
//           </button>
//           {message && (
//             <p className="text-center text-sm text-gray-600">{message}</p>
//           )}
//           <p className="text-center text-sm text-gray-600">
//             Already have an account?{' '}
//             <Link href="/auth/sign-in" className="text-blue-500 hover:text-blue-600">
//               Sign in
//             </Link>
//           </p>
//         </form>
//       </div>
//     </div>
//   )
// }