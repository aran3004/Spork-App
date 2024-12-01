import { Utensils } from 'lucide-react'
import Link from 'next/link'

export function Footer(): JSX.Element {
  const currentYear = new Date().getFullYear()

  const navigationLinks = {
    product: [
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'FAQ', href: '/pricing#faq' }
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contact', href: '/contact' }
    ],
    legal: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' }
    ]
  }

  return (
    <footer className="bg-white py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Logo and Tagline */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500 w-12 h-12 rounded-2xl flex items-center justify-center transform -rotate-12">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">nosh</span>
          </div>
          <p className="text-gray-600 text-lg">
            Making healthy eating simple and intelligent.
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Product Section */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-xs font-bold tracking-wider uppercase text-gray-900 mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {navigationLinks.product.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Section */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-xs font-bold tracking-wider uppercase text-gray-900 mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {navigationLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Section */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-xs font-bold tracking-wider uppercase text-gray-900 mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {navigationLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            © {currentYear} Nosh. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}