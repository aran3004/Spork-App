import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

export function Testimonials(): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0)
  
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 5000) // Rotate every 5 seconds

    return () => clearInterval(timer)
  }, [testimonials.length])

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    )
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % testimonials.length
    )
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 md:mb-16">
          What Our Users Say
        </h2>
        
        {/* Mobile carousel view */}
        <div className="sm:hidden">
          <div className="relative">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex mb-3">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="h-4 w-4 text-yellow-400 fill-current" 
                  />
                ))}
              </div>
              
              <blockquote>
                <p className="text-sm text-gray-600 mb-4">
                  &ldquo;{testimonials[currentIndex].content}&rdquo;
                </p>
              </blockquote>
              
              <div className="flex items-center justify-between border-t pt-4">
                <div>
                  <div className="font-semibold text-sm">
                    {testimonials[currentIndex].name}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {testimonials[currentIndex].role}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <button 
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 bg-white rounded-full p-1 shadow-md"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 bg-white rounded-full p-1 shadow-md"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Progress indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'w-6 bg-blue-500' : 'w-2 bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* Desktop/tablet grid view */}
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="h-5 w-5 text-yellow-400 fill-current" 
                  />
                ))}
              </div>
              
              <blockquote>
                <p className="text-base text-gray-600 mb-6">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
              </blockquote>
              
              <div className="flex items-center justify-between border-t pt-4">
                <div>
                  <div className="font-semibold">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}