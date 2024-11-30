'use client'

import { Check } from 'lucide-react'

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
}

export default function PricingPage() {
  const pricingTiers: PricingTier[] = [
    {
      name: "Basic",
      price: "$9",
      description: "Perfect for getting started with healthy eating",
      features: [
        "Meal analysis with photos",
        "Basic nutritional insights",
        "Weekly meal suggestions",
        "Basic health tracking",
        "Email support"
      ],
      buttonText: "Start Basic Plan"
    },
    {
      name: "Pro",
      price: "$19",
      description: "Ideal for health enthusiasts and fitness focused individuals",
      features: [
        "Everything in Basic",
        "Advanced nutritional analysis",
        "Personalized meal plans",
        "Custom goal setting",
        "Recipe modifications",
        "Priority support",
        "Progress analytics"
      ],
      buttonText: "Start Pro Plan",
      isPopular: true
    },
    {
      name: "Ultimate",
      price: "$29",
      description: "For those serious about their nutrition and health goals",
      features: [
        "Everything in Pro",
        "AI meal optimization",
        "Custom recipe creation",
        "Health coach consultation",
        "Family account sharing",
        "24/7 priority support",
        "Advanced health metrics"
      ],
      buttonText: "Start Ultimate Plan"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Updated Header Section - adjusted padding */}
      <div className="pt-24 pb-20 text-center"> {/* Changed from pt-32 to pt-24 */}
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose the perfect plan to help you achieve your health and nutrition goals
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl p-8 shadow-sm ${
                tier.isPopular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {tier.isPopular && (
                <span className="absolute top-0 -translate-y-1/2 bg-blue-500 text-white px-3 py-0.5 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              )}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">{tier.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  tier.isPopular
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tier.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-2">Can I switch plans later?</h3>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">Yes, all plans come with a 14-day free trial. No credit card required to start.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards, PayPal, and Apple Pay.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};