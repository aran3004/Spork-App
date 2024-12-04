// app/auth/sign-in/page.tsx
'use client';

import React, { Suspense } from 'react';
import { AuthForm } from '@/app/auth/AuthForm';

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <AuthForm isSignUp={false} />
      </Suspense>
    </div>
  );
}
