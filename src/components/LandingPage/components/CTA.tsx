import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function CTA(): JSX.Element {
  return (
    <section className="py-8 sm:py-12 md:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Ready to Transform Your Eating Habits?
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">
            Join many others making better food choices every day with Nosh
          </p>
          
          <Link 
            href="/pricing" 
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 
                     bg-white text-blue-600 text-sm sm:text-base font-medium
                     rounded-lg hover:bg-gray-100 
                     transition-all duration-300 
                     hover:-translate-y-1 hover:shadow-lg
                     focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>

          {/* Added mobile note */}
          <p className="text-xs sm:text-sm mt-4 opacity-75">
            No credit card required
          </p>
        </div>
      </div>
    </section>
  )
}