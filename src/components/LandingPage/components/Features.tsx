import { useState, useEffect } from 'react'
import { BookOpen, Brain, Heart } from 'lucide-react'

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

  // Auto-transition effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((current) => (current + 1) % features.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(timer);
  }, [features.length]);

  // Reset the timer when user manually selects a feature
  const handleFeatureClick = (index: number) => {
    setActiveFeature(index);
  };

  return (
    <section className="py-12 sm:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-4xl font-bold text-center mb-8 sm:mb-16">
          More Than Just Food Monitoring
        </h2>
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
          <div className="flex flex-col md:grid md:grid-cols-5">
            <div className="md:col-span-2 bg-gray-50 p-4 sm:p-8">
              <div className="space-y-2 sm:space-y-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div
                      key={index}
                      className={`p-4 sm:p-6 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 ${
                        activeFeature === index 
                          ? 'bg-blue-500 text-white shadow-lg scale-100' 
                          : 'bg-white hover:bg-gray-100 scale-95'
                      }`}
                      onClick={() => handleFeatureClick(index)}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${
                          activeFeature === index ? 'text-white' : 'text-blue-500'
                        }`} />
                        <h3 className="text-base sm:text-lg font-semibold">{feature.title}</h3>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="md:col-span-3 p-4 sm:p-8">
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

        {/* Added progress indicators */}
        <div className="flex justify-center mt-6 gap-2">
          {features.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                index === activeFeature ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => handleFeatureClick(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
// // src/components/LandingPage/components/Features.tsx
// import { useState } from 'react'
// import { Camera, Brain, Heart } from 'lucide-react'

// interface Feature {
//   icon: React.ElementType;
//   title: string;
//   description: string;
//   details: string[];
// }

// export function Features(): JSX.Element {
//   const [activeFeature, setActiveFeature] = useState<number>(0)

//   const features: Feature[] = [
//     {
//       icon: Camera,
//       title: "Snap & Analyze",
//       description: "Take a photo of your meal and get instant AI-powered insights about nutrition and portion sizes.",
//       details: [
//         "Instant nutritional breakdown",
//         "Smart portion analysis",
//         "Ingredient identification",
//         "Calorie estimation"
//       ]
//     },
//     {
//       icon: Brain,
//       title: "Smart Recommendations",
//       description: "Receive personalized suggestions to improve your meals while maintaining the flavors you love.",
//       details: [
//         "Personalized improvements",
//         "Alternative ingredients",
//         "Dietary matching",
//         "Health optimization"
//       ]
//     },
//     {
//       icon: Heart,
//       title: "Health Tracking",
//       description: "Monitor your progress with intuitive health metrics and celebrate your journey towards better habits.",
//       details: [
//         "Progress visualization",
//         "Habit tracking",
//         "Goal monitoring",
//         "Trend analysis"
//       ]
//     }
//   ]

//   return (
//     <section className="py-20 bg-gray-50">
//       <div className="container mx-auto px-6">
//         <h2 className="text-4xl font-bold text-center mb-16">
//           More Than Just Food Tracking
//         </h2>
//         <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
//           <div className="grid md:grid-cols-5">
//             <div className="md:col-span-2 bg-gray-50 p-8">
//               <div className="space-y-4">
//                 {features.map((feature, index) => {
//                   const Icon = feature.icon
//                   return (
//                     <div
//                       key={index}
//                       className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
//                         activeFeature === index 
//                           ? 'bg-blue-500 text-white shadow-lg' 
//                           : 'bg-white hover:bg-gray-100'
//                       }`}
//                       onClick={() => setActiveFeature(index)}
//                     >
//                       <div className="flex items-center gap-4">
//                         <Icon className={`h-6 w-6 ${
//                           activeFeature === index ? 'text-white' : 'text-blue-500'
//                         }`} />
//                         <h3 className="text-lg font-semibold">{feature.title}</h3>
//                       </div>
//                     </div>
//                   )
//                 })}
//               </div>
//             </div>

//             <div className="md:col-span-3 p-8">
//               <div className="h-full flex flex-col">
//                 <h3 className="text-2xl font-bold mb-4">
//                   {features[activeFeature].title}
//                 </h3>
//                 <p className="text-gray-600 mb-6">
//                   {features[activeFeature].description}
//                 </p>
//                 <div className="grid grid-cols-1 gap-4">
//                   {features[activeFeature].details.map((detail, index) => (
//                     <div key={index} className="flex items-center gap-3">
//                       <div className="w-2 h-2 rounded-full bg-blue-500"></div>
//                       <span className="text-gray-700">{detail}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }