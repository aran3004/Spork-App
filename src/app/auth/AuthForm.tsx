// app/auth/AuthForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthChangeEvent } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function AuthForm({ isSignUp }: { isSignUp: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      console.log('Auth state changed:', event, session);
      
      if (session?.user && event === 'SIGNED_IN') {
        try {
          await addUserToDatabase(session.user.id, session.user.email);
          router.push(redirectTo);
          router.refresh();
        } catch (error) {
          console.error('Error in auth state change:', error);
          setMessage('Error updating user information');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, redirectTo]);

  const addUserToDatabase = async (userId: string, userEmail: string | undefined) => {
    try {
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: userEmail,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (upsertError) throw upsertError;
      console.log('User successfully added/updated in database');
    } catch (error) {
      console.error('Error in addUserToDatabase:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        });
        
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        // No need to redirect here as the onAuthStateChange handler will do it
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage('An unexpected error occurred');
      }
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border">
      <h2 className="text-2xl font-bold text-center mb-6">
        {isSignUp ? 'Create your account' : 'Sign in'}
      </h2>
      
      {isSignUp && (
        <div className="mb-6">
          <div className="h-2 rounded-full bg-gray-100">
            <div className="h-full w-1/4 bg-blue-500 rounded-full"/>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            placeholder="Enter your password"
            required
          />
          {isSignUp && (
            <p className="mt-1.5 text-sm text-gray-500">
              Password must be at least 6 characters long
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => history.back()}
            className="text-gray-600"
          >
            Back
          </Button>
          
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? 'Loading...' : isSignUp ? 'Next' : 'Sign in'}
          </Button>
        </div>

        {message && (
          <p className="text-center text-sm text-gray-600 mt-4">{message}</p>
        )}
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        {isSignUp ? (
          <>
            Already have an account?{' '}
            <Link 
              href="/auth/sign-in"
              className="text-blue-500 hover:text-blue-600 hover:underline"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            Don&apos;t have an account?{' '}
            <Link 
              href="/auth/sign-up"
              className="text-blue-500 hover:text-blue-600 hover:underline"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}


// 'use client'
// import { useState, useEffect } from 'react'
// import { supabase } from '@/lib/supabase'
// import { useRouter } from 'next/navigation'
// import { AuthChangeEvent } from '@supabase/supabase-js'

// interface AuthFormProps {
//   isSignUp: boolean
// }

// export function AuthForm({ isSignUp }: AuthFormProps) {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [message, setMessage] = useState('')
//   const router = useRouter()

//   const addUserToDatabase = async (userId: string, userEmail: string | undefined) => {
//     try {
//       const { error: upsertError } = await supabase
//         .from('users')
//         .upsert({
//           id: userId,
//           email: userEmail,
//           created_at: new Date().toISOString()
//         }, {
//           onConflict: 'id'
//         })

//       if (upsertError) throw upsertError
//       console.log('User successfully added/updated in database')
//     } catch (error) {
//       console.error('Error in addUserToDatabase:', error)
//       throw error
//     }
//   }
  
//   useEffect(() => {
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
//       console.log('Auth state changed:', event, session)
      
//       if (!session?.user) return

//       try {
//         // Handle initial sign in and email confirmation
//         if (event === 'SIGNED_IN') {
//           await addUserToDatabase(session.user.id, session.user.email)
//           router.push('/dashboard')
//         }
//       } catch (error) {
//         console.error('Error in auth state change:', error)
//         setMessage('Error updating user information')
//       }
//     })

//     return () => {
//       subscription.unsubscribe()
//     }
//   }, [router])

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
//     setMessage('')
    
//     try {
//       if (isSignUp) {
//         console.log('Starting sign up process...')
//         const { error } = await supabase.auth.signUp({  // removed data from destructuring
//           email,
//           password,
//           options: {
//             emailRedirectTo: `${window.location.origin}/auth/callback`
//           }
//         })
      
//         if (error) {
//           setMessage(error.message)
//           return
//         }
        
        
//         setMessage('Check your email for the confirmation link!')
//       } else {
//         const { error } = await supabase.auth.signInWithPassword({
//           email,
//           password
//         })
        
//         if (error) {
//           setMessage(error.message)
//           return
//         }
//       }
//     } catch (error) {
//       if (error instanceof Error) {
//         setMessage(error.message)
//       } else {
//         setMessage('An unexpected error occurred')
//       }
//       console.error('Auth error:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-6 text-center">
//         {isSignUp ? 'Create Account' : 'Sign In'}
//       </h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Email</label>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Password</label>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
//             required
//           />
//         </div>
//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
//         >
//           {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
//         </button>
//         {message && (
//           <p className="text-center text-sm text-gray-600">{message}</p>
//         )}
//       </form>
//     </div>
//   )
// }
