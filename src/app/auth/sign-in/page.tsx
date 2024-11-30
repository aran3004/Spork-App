'use client'
import { AuthForm } from '@/app/auth/AuthForm'

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <AuthForm isSignUp={false} />
    </div>
  )
}