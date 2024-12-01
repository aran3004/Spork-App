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
    <section className="py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 md:mb-16">
          Why Choose Nosh?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div 
                key={index} 
                className="p-6 sm:p-8 bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">{benefit.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{benefit.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}