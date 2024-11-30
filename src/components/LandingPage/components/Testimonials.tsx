// src/components/LandingPage/components/Testimonials.tsx
import { Star } from 'lucide-react'

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

export function Testimonials(): JSX.Element {
  const testimonials: Testimonial[] = [
    {
      name: "Sarah J.",
      role: "Fitness Enthusiast",
      content: "Nosh has completely changed how I think about food. The AI suggestions are spot-on!",
      rating: 5
    },
    {
      name: "Michael R.",
      role: "Busy Professional",
      content: "Finally, an app that helps me make better food choices without complicated tracking.",
      rating: 5
    },
    {
      name: "Lisa M.",
      role: "Health Coach",
      content: "I recommend Nosh to all my clients. It's like having a nutritionist in your pocket.",
      rating: 5
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16">
          What Our Users Say
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">"{testimonial.content}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-gray-500 text-sm">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}