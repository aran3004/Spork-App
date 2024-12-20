'use client'
import { useState } from 'react'
import { X, Menu } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    setIsOpen(false)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link 
      href={href}
      onClick={closeMenu} 
      className={`text-gray-600 hover:text-gray-900 transition ${
        pathname === href ? 'text-gray-900 font-medium' : ''
      }`}
    >
      {children}
    </Link>
  )

  // Define navigation items based on auth state
  const publicNavItems = [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
  ]

  const authenticatedNavItems = [
    { href: '/dashboard', label: 'Dashboard' },
    ...publicNavItems,
  ]

  const navItems = user ? authenticatedNavItems : publicNavItems

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 transition-all duration-300 border-b border-gray-100">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative w-20 h-12 -my-1">
              <Image
                src="/images/spork-logo.png"
                alt="Spork Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Rest of the navbar code remains the same */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
            
            {!user ? (
              <>
                <NavLink href="/auth/sign-in">Sign in</NavLink>
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

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute left-0 right-0 top-[73px] bg-white border-b border-gray-100 shadow-lg">
            <div className="container mx-auto py-4 px-4 flex flex-col space-y-4">
              {navItems.map((item) => (
                <NavLink key={item.href} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
              
              {!user ? (
                <div className="flex flex-col space-y-4 pt-4 border-t border-gray-100">
                  <Link 
                    href="/auth/sign-in" 
                    onClick={closeMenu}
                    className="text-gray-600 hover:text-gray-900 transition"
                  >
                    Sign in
                  </Link>
                  <Link 
                    href="/auth/sign-up" 
                    onClick={closeMenu}
                    className="w-full py-3 bg-blue-500 text-white text-center rounded-lg hover:bg-blue-600 transition duration-300"
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-100">
                  <button 
                    onClick={handleSignOut}
                    className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}