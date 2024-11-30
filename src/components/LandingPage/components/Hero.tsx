// src/components/LandingPage/components/Hero.tsx

export function Hero(): JSX.Element {
  return (
    <div className="pt-32 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
      <div className="container mx-auto px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your AI Food Intelligence
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Make smarter food choices with AI-powered insights. Get personalized recommendations 
            and build lasting healthy habits.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition duration-300 transform hover:-translate-y-1">
              Start Free Trial
            </button>
            <button className="px-8 py-4 bg-white text-gray-700 rounded-xl border border-gray-200 hover:border-blue-500 transition duration-300 transform hover:-translate-y-1">
              Watch Demo
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-20">
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-blue-500 mb-2">50K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-blue-500 mb-2">4.8/5</div>
              <div className="text-gray-600">User Rating</div>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm md:col-span-1 col-span-2">
              <div className="text-3xl font-bold text-blue-500 mb-2">1M+</div>
              <div className="text-gray-600">Meals Analyzed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}