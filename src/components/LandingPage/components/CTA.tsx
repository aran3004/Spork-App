// src/components/LandingPage/components/CTA.tsx
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function CTA(): JSX.Element {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Eating Habits?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands making better food choices every day with Nosh
          </p>
          <Link 
            href="/pricing" 
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition duration-300 transform hover:-translate-y-1"
          >
            Start Free Trial
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}