// src/components/LandingPage/components/Benefits.tsx
import { Clock, Brain, Users } from 'lucide-react'

interface Benefit {
  icon: React.ElementType;
  title: string;
  description: string;
}

export function Benefits(): JSX.Element {
  const benefits: Benefit[] = [
    {
      icon: Clock,
      title: "Save Time",
      description: "Get instant meal insights without manual tracking or complicated calculations."
    },
    {
      icon: Brain,
      title: "Learn Smarter",
      description: "Understand nutrition through your own meals with AI-powered explanations."
    },
    {
      icon: Users,
      title: "Expert Guidance",
      description: "Get professional-level nutrition advice at a fraction of the cost."
    }
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16">
          Why Choose Nosh?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div key={index} className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <Icon className="h-7 w-7 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}