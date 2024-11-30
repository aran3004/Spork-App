import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Navbar } from '@/components/LandingPage/components/Navbar'
import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nosh - AI-Powered Food Intelligence',
  description: 'Make smarter food choices with AI-powered insights and personalized recommendations.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

// // src/app/layout.tsx
// import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
// import { Navbar } from '@/components/LandingPage/components/Navbar'
// import './globals.css'

// const inter = Inter({ subsets: ['latin'] })

// export const metadata: Metadata = {
//   title: 'Nosh - AI-Powered Food Intelligence',
//   description: 'Make smarter food choices with AI-powered insights and personalized recommendations.',
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en" className="scroll-smooth">
//       <body className={inter.className}>
//         <Navbar />
//         {children}
//       </body>
//     </html>
//   )
// }