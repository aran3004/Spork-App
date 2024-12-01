import { useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { RecentMeals } from './components/RecentMeals'
import { Features } from './components/Features'
import { Benefits } from './components/Benefits'
import { Testimonials } from './components/Testimonials'
import { CTA } from './components/CTA'
import { Footer } from './components/Footer'

export default function LandingPage(): JSX.Element {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <RecentMeals />
      <Features />
      <Benefits />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  )
}

if (typeof window !== 'undefined') {
  window.history.scrollRestoration = 'manual'
}