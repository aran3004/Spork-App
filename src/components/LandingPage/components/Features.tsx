'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Brain, Heart, ChevronLeft, ChevronRight } from 'lucide-react'

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
      icon: BookOpen,
      title: "Learn & Grow",
      description: "Build sustainable habits through bite-sized learning and gentle guidance, making lasting improvements to your diet one step at a time.",
      details: [
        "Daily micro-learning moments",
        "Progressive habit building",
        "Personalised educational content",
        "Science-backed nutrition tips"
      ]
    },
    {
      icon: Brain,
      title: "Intelligent Recommendations",
      description: "Receive personalised suggestions to improve your meals while maintaining the flavours you love.",
      details: [
        "Personalised improvements",
        "Alternative ingredients",
        "Dietary optimisation",
        "Health customisation"
      ]
    },
    {
      icon: Heart,
      title: "Health Monitoring",
      description: "Monitor your progress with intuitive health metrics and celebrate your journey towards better habits.",
      details: [
        "Progress visualisation",
        "Habit monitoring",
        "Goal tracking",
        "Trend analysis"
      ]
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((current) => (current + 1) % features.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [features.length]);

  const handlePrevious = () => {
    setActiveFeature((current) => 
      current === 0 ? features.length - 1 : current - 1
    );
  };

  const handleNext = () => {
    setActiveFeature((current) => 
      (current + 1) % features.length
    );
  };

  return (
    <section className="py-12 sm:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-4xl font-bold text-center mb-8 sm:mb-16">
          More Than Just Food Monitoring
        </h2>

        {/* Mobile Carousel View */}
        <div className="md:hidden">
          <div className="relative">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                {(() => {
                  const Icon = features[activeFeature].icon;
                  return <Icon className="h-6 w-6 text-blue-500" />;
                })()}
                <h3 className="text-lg font-semibold">
                  {features[activeFeature].title}
                </h3>
              </div>
              
              <p className="text-gray-600 text-sm mb-6">
                {features[activeFeature].description}
              </p>
              
              <div className="space-y-3">
                {features[activeFeature].details.map((detail, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span className="text-gray-700 text-sm">{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <button 
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 bg-white rounded-full p-1 shadow-md"
              aria-label="Previous feature"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 bg-white rounded-full p-1 shadow-md"
              aria-label="Next feature"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveFeature(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeFeature ? 'w-6 bg-blue-500' : 'w-2 bg-gray-300'
                }`}
                aria-label={`Go to feature ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="grid md:grid-cols-5">
              {/* Desktop Feature Selection */}
              <div className="md:col-span-2 bg-gray-50 p-8">
                <div className="space-y-4">
                  {features.map((feature, index) => {
                    const Icon = feature.icon
                    return (
                      <div
                        key={index}
                        className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                          activeFeature === index 
                            ? 'bg-blue-500 text-white shadow-lg scale-100' 
                            : 'bg-white hover:bg-gray-100 scale-95'
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

              {/* Feature Content */}
              <div className="md:col-span-3 p-6 sm:p-8">
                <div className="h-full flex flex-col">
                  <div className="transition-all duration-300 transform">
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                      {features[activeFeature].title}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                      {features[activeFeature].description}
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {features[activeFeature].details.map((detail, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-3 transition-all duration-300"
                        >
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500"></div>
                          <span className="text-gray-700 text-sm sm:text-base">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
