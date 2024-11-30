'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { AuthChangeEvent, AuthError } from '@supabase/supabase-js'

interface AuthFormProps {
  isSignUp: boolean
}

export function AuthForm({ isSignUp }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

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
        })

      if (upsertError) throw upsertError
      console.log('User successfully added/updated in database')
    } catch (error) {
      console.error('Error in addUserToDatabase:', error)
      throw error
    }
  }
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      console.log('Auth state changed:', event, session)
      
      if (!session?.user) return

      try {
        // Handle initial sign in and email confirmation
        if (event === 'SIGNED_IN') {
          await addUserToDatabase(session.user.id, session.user.email)
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Error in auth state change:', error)
        setMessage('Error updating user information')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      if (isSignUp) {
        console.log('Starting sign up process...')
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })

        if (error) {
          setMessage(error.message)
          return
        }
        
        setMessage('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) {
          setMessage(error.message)
          return
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message)
      } else {
        setMessage('An unexpected error occurred')
      }
      console.error('Auth error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isSignUp ? 'Create Account' : 'Sign In'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
        {message && (
          <p className="text-center text-sm text-gray-600">{message}</p>
        )}
      </form>
    </div>
  )
}
// 'use client'
// import { useState } from 'react'
// import { supabase } from '@/lib/supabase'
// import { useRouter } from 'next/navigation'

// interface AuthFormProps {
//   isSignUp: boolean
// }

// export function AuthForm({ isSignUp }: AuthFormProps) {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [message, setMessage] = useState('')
//   const router = useRouter()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
    
//     if (isSignUp) {
//       const { error } = await supabase.auth.signUp({
//         email,
//         password,
//         options: {
//           emailRedirectTo: `${window.location.origin}/auth/callback`
//         }
//       })
//       if (error) {
//         setMessage(error.message)
//       } else {
//         setMessage('Check your email for the confirmation link!')
//       }
//     } else {
//       const { error } = await supabase.auth.signInWithPassword({
//         email,
//         password
//       })
//       if (error) {
//         setMessage(error.message)
//       } else {
//         router.push('/dashboard')
//       }
//     }
//     setLoading(false)
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