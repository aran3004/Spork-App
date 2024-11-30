'use client'

import { Camera, Brain, ChefHat, Heart, TrendingUp, Scale, Users } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'

interface FeatureTab {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  benefits: string[];
  image: string;
}

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState<string>('analyze')

  const features: FeatureTab[] = [
    {
      id: 'analyze',
      title: 'Smart Meal Analysis',
      icon: Camera,
      description: 'Get instant insights about your meals with our advanced AI technology. Simply take a photo and receive detailed nutritional information and personalized recommendations.',
      benefits: [
        'Instant nutritional breakdown of any meal',
        'Accurate portion size estimation',
        'Ingredient identification and alternatives',
        'Calorie and macro calculation',
        'Food group analysis'
      ],
      image: '/api/placeholder/600/400'
    },
    {
      id: 'personalize',
      title: 'Personalized Learning',
      icon: Brain,
      description: 'Our AI learns your preferences and dietary needs to provide increasingly personalized recommendations that match your taste and health goals.',
      benefits: [
        'Adaptive meal suggestions',
        'Personal taste preference learning',
        'Dietary restriction consideration',
        'Progress-based recommendations',
        'Custom goal alignment'
      ],
      image: '/api/placeholder/600/400'
    },
    {
      id: 'improve',
      title: 'Meal Enhancement',
      icon: ChefHat,
      description: 'Transform your favorite meals into healthier versions while maintaining the flavors you love. Get smart suggestions for ingredient substitutions and cooking methods.',
      benefits: [
        'Healthy ingredient alternatives',
        'Cooking method optimization',
        'Portion size recommendations',
        'Nutritional enhancement tips',
        'Flavor profile preservation'
      ],
      image: '/api/placeholder/600/400'
    },
    {
      id: 'track',
      title: 'Smart Progress Tracking',
      icon: TrendingUp,
      description: 'Monitor your journey with intelligent tracking that focuses on sustainable progress rather than strict numbers.',
      benefits: [
        'Visual progress dashboard',
        'Trend analysis and insights',
        'Behavioral pattern recognition',
        'Achievement celebrations',
        'Custom milestone tracking'
      ],
      image: '/api/placeholder/600/400'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="pt-24 pb-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Powerful Features for Your Health Journey</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover how Nosh helps you make better food choices and build lasting healthy habits
        </p>
      </div>

      {/* Main Feature Section */}
      <div className="container mx-auto px-6 pb-24">
        {/* Feature Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <button
                key={feature.id}
                onClick={() => setActiveTab(feature.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300 ${
                  activeTab === feature.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {feature.title}
              </button>
            )
          })}
        </div>

        {/* Feature Content */}
        {features.map((feature) => (
          <div
            key={feature.id}
            className={`transition-all duration-300 ${
              activeTab === feature.id ? 'block' : 'hidden'
            }`}
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">{feature.title}</h2>
                <p className="text-gray-600 mb-8">{feature.description}</p>
                <ul className="space-y-4">
                  {feature.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
              <Image
                src={feature.image}
                alt={feature.title}
                width={600}
                height={400}
                className="rounded-xl shadow-lg"
              />
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500 rounded-2xl opacity-10 blur-2xl"></div>
              </div>
            </div>
          </div>
        ))}

        {/* Additional Benefits */}
        <div className="mt-32">
          <h2 className="text-3xl font-bold text-center mb-16">Additional Benefits</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Scale className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Balanced Approach</h3>
              <p className="text-gray-600">
                Focus on sustainable habits rather than restrictive dieting. Our approach helps you make lasting changes.
              </p>
            </div>
            
            <div className="p-8 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Heart className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Holistic Health</h3>
              <p className="text-gray-600">
                Consider your overall wellbeing, not just calories. We help you understand the full impact of your food choices.
              </p>
            </div>
            
            <div className="p-8 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Community Support</h3>
              <p className="text-gray-600">
                Join a community of like-minded individuals on their health journey. Share experiences and get motivated.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}