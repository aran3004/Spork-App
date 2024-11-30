// src/components/LandingPage/components/Features.tsx
import { useState } from 'react'
import { Camera, Brain, Heart } from 'lucide-react'

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  details: string[];
}

export function Features(): JSX.Element {
  const [activeFeature, setActiveFeature] = useState<number>(0)

  const features: Feature[] = [
    {
      icon: Camera,
      title: "Snap & Analyze",
      description: "Take a photo of your meal and get instant AI-powered insights about nutrition and portion sizes.",
      details: [
        "Instant nutritional breakdown",
        "Smart portion analysis",
        "Ingredient identification",
        "Calorie estimation"
      ]
    },
    {
      icon: Brain,
      title: "Smart Recommendations",
      description: "Receive personalized suggestions to improve your meals while maintaining the flavors you love.",
      details: [
        "Personalized improvements",
        "Alternative ingredients",
        "Dietary matching",
        "Health optimization"
      ]
    },
    {
      icon: Heart,
      title: "Health Tracking",
      description: "Monitor your progress with intuitive health metrics and celebrate your journey towards better habits.",
      details: [
        "Progress visualization",
        "Habit tracking",
        "Goal monitoring",
        "Trend analysis"
      ]
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16">
          More Than Just Food Tracking
        </h2>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-5">
            <div className="md:col-span-2 bg-gray-50 p-8">
              <div className="space-y-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div
                      key={index}
                      className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                        activeFeature === index 
                          ? 'bg-blue-500 text-white shadow-lg' 
                          : 'bg-white hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveFeature(index)}
                    >
                      <div className="flex items-center gap-4">
                        <Icon className={`h-6 w-6 ${
                          activeFeature === index ? 'text-white' : 'text-blue-500'
                        }`} />
                        <h3 className="text-lg font-semibold">{feature.title}</h3>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="md:col-span-3 p-8">
              <div className="h-full flex flex-col">
                <h3 className="text-2xl font-bold mb-4">
                  {features[activeFeature].title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {features[activeFeature].description}
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {features[activeFeature].details.map((detail, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-gray-700">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}