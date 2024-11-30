'use client'
import { Utensils } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 transition-all duration-300">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center transform -rotate-12">
            <Utensils className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">nosh</span>
        </Link>

        <div className="hidden md:flex space-x-8">
          <Link 
            href="/features" 
            className={`text-gray-600 hover:text-gray-900 transition ${
              pathname === '/features' ? 'text-gray-900' : ''
            }`}
          >
            Features
          </Link>
          <Link 
            href="/pricing" 
            className={`text-gray-600 hover:text-gray-900 transition ${
              pathname === '/pricing' ? 'text-gray-900' : ''
            }`}
          >
            Pricing
          </Link>
          <Link 
            href="/about" 
            className={`text-gray-600 hover:text-gray-900 transition ${
              pathname === '/about' ? 'text-gray-900' : ''
            }`}
          >
            About
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {!user ? (
            <>
              <Link 
                href="/auth/sign-in" 
                className="hidden md:block px-4 py-2 text-gray-600 hover:text-gray-900 transition"
              >
                Sign in
              </Link>
              <Link 
                href="/auth/sign-up" 
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Get Started
              </Link>
            </>
          ) : (
            <button 
              onClick={handleSignOut}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

// 'use client'

// import { Utensils } from 'lucide-react'
// import Link from 'next/link'
// import { usePathname } from 'next/navigation'

// export function Navbar(): JSX.Element {
//   const pathname = usePathname()

//   return (
//     <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 transition-all duration-300">
//       <div className="container mx-auto p-4 flex justify-between items-center">
//         <Link href="/" className="flex items-center space-x-2">
//           <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center transform -rotate-12">
//             <Utensils className="h-6 w-6 text-white" />
//           </div>
//           <span className="text-2xl font-bold text-gray-900">nosh</span>
//         </Link>

//         <div className="hidden md:flex space-x-8">
//           <Link 
//             href="/features" 
//             className={`text-gray-600 hover:text-gray-900 transition ${
//               pathname === '/features' ? 'text-gray-900' : ''
//             }`}
//           >
//             Features
//           </Link>
//           <Link 
//             href="/pricing" 
//             className={`text-gray-600 hover:text-gray-900 transition ${
//               pathname === '/pricing' ? 'text-gray-900' : ''
//             }`}
//           >
//             Pricing
//           </Link>
//           <Link 
//             href="/about" 
//             className={`text-gray-600 hover:text-gray-900 transition ${
//               pathname === '/about' ? 'text-gray-900' : ''
//             }`}
//           >
//             About
//           </Link>
//         </div>

//         <div className="flex items-center space-x-4">
//           <Link 
//             href="/dashboard" 
//             className="hidden md:block px-4 py-2 text-gray-600 hover:text-gray-900 transition"
//           >
//             Sign in
//           </Link>
//           <Link 
//             href="/signup" 
//             className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
//           >
//             Get Started
//           </Link>
//         </div>
//       </div>
//     </nav>
//   )
// }