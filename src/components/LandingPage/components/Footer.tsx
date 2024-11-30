// src/components/LandingPage/components/Footer.tsx
import { Utensils } from 'lucide-react'
import Link from 'next/link'

export function Footer(): JSX.Element {
  return (
    <footer className="bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center transform -rotate-12">
                <Utensils className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">nosh</span>
            </div>
            <p className="text-gray-600">
              Making healthy eating simple and intelligent.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="text-gray-600 hover:text-gray-900">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                  Pricing
                </Link>
              </li>
              <li><button className="text-gray-600 hover:text-gray-900">FAQ</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><button className="text-gray-600 hover:text-gray-900">About</button></li>
              <li><button className="text-gray-600 hover:text-gray-900">Blog</button></li>
              <li><button className="text-gray-600 hover:text-gray-900">Contact</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><button className="text-gray-600 hover:text-gray-900">Privacy</button></li>
              <li><button className="text-gray-600 hover:text-gray-900">Terms</button></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-600">
          <p>&copy; 2024 Nosh. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}