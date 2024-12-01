import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

export function Hero(): JSX.Element {
  const [userCount, setUserCount] = useState<number>(0);
  const [mealCount, setMealCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchMealCount = async () => {
      try {
        // Use a database function to get total meal count
        const { data, error } = await supabase
          .rpc('get_total_meal_count');

        if (error) {
          console.error('Meal Count Error:', error);
          return;
        }
        
        setMealCount(data || 0);
      } catch (error) {
        console.error('Unexpected error fetching meal count:', error);
      }
    };

    const fetchUserCount = async () => {
      try {
        console.log('Attempting to fetch user count via RPC...');
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_user_count');

        if (rpcError) {
          console.error('RPC Error:', rpcError);
          
          console.log('Attempting to fetch from auth.users...');
          const { count, error: authError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });
            
          if (authError) {
            console.error('Auth Query Error:', authError);
            return;
          }
          
          console.log('Count from users table:', count);
          setUserCount(count || 0);
          return;
        }

        console.log('RPC Data received:', rpcData);
        setUserCount(rpcData || 0);
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch both counts
    fetchUserCount();
    fetchMealCount();

    // Subscribe to changes
    const userSubscription = supabase
      .channel('users_count')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log('Received database change:', payload);
          fetchUserCount();
        }
      )
      .subscribe();

    const mealSubscription = supabase
      .channel('meals_count')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'meals' },
        () => fetchMealCount()
      )
      .subscribe();

    return () => {
      userSubscription.unsubscribe();
      mealSubscription.unsubscribe();
    };
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      const formatted = (num / 1000000).toFixed(1);
      return `${formatted}M+`;
    }
    if (num >= 1000) {
      const formatted = (num / 1000).toFixed(1);
      return `${formatted}K+`;
    }
    return `${num}+`;
  };

  return (
    <div className="pt-32 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
      <div className="container mx-auto px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pb-2">
            Your AI Food Intelligence
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Make smarter food choices with AI-powered insights. Get personalised recommendations 
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
              <div className="text-3xl font-bold text-blue-500 mb-2">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  </div>
                ) : (
                  formatNumber(userCount)
                )}
              </div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-blue-500 mb-2">4.8/5</div>
              <div className="text-gray-600">User Rating</div>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm md:col-span-1 col-span-2">
              <div className="text-3xl font-bold text-blue-500 mb-2">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  </div>
                ) : (
                  formatNumber(mealCount)
                )}
              </div>
              <div className="text-gray-600">Meals Analysed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// import { useState, useEffect } from 'react';
// import { createClient } from '@supabase/supabase-js';
// import { Loader2, X , Utensils} from 'lucide-react';
// import Link from 'next/link';

// export function Hero(): JSX.Element {
//   const [userCount, setUserCount] = useState<number>(0);
//   const [mealCount, setMealCount] = useState<number>(0);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   useEffect(() => {
//     const supabase = createClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//     );

//     const fetchMealCount = async () => {
//       try {
//         // Use a database function to get total meal count
//         const { data, error } = await supabase
//           .rpc('get_total_meal_count');

//         if (error) {
//           console.error('Meal Count Error:', error);
//           return;
//         }
        
//         setMealCount(data || 0);
//       } catch (error) {
//         console.error('Unexpected error fetching meal count:', error);
//       }
//     };

//     const fetchUserCount = async () => {
//       try {
//         console.log('Attempting to fetch user count via RPC...');
//         const { data: rpcData, error: rpcError } = await supabase
//           .rpc('get_user_count');

//         if (rpcError) {
//           console.error('RPC Error:', rpcError);
          
//           console.log('Attempting to fetch from auth.users...');
//           const { count, error: authError } = await supabase
//             .from('users')
//             .select('*', { count: 'exact', head: true });
            
//           if (authError) {
//             console.error('Auth Query Error:', authError);
//             return;
//           }
          
//           console.log('Count from users table:', count);
//           setUserCount(count || 0);
//           return;
//         }

//         console.log('RPC Data received:', rpcData);
//         setUserCount(rpcData || 0);
//       } catch (error) {
//         console.error('Unexpected error:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     // Fetch both counts
//     fetchUserCount();
//     fetchMealCount();

//     // Subscribe to changes
//     const userSubscription = supabase
//       .channel('users_count')
//       .on('postgres_changes', 
//         { event: '*', schema: 'public', table: 'users' },
//         (payload) => {
//           console.log('Received database change:', payload);
//           fetchUserCount();
//         }
//       )
//       .subscribe();

//     const mealSubscription = supabase
//       .channel('meals_count')
//       .on('postgres_changes', 
//         { event: '*', schema: 'public', table: 'meals' },
//         () => fetchMealCount()
//       )
//       .subscribe();

//     return () => {
//       userSubscription.unsubscribe();
//       mealSubscription.unsubscribe();
//     };
//   }, []);

//   const formatNumber = (num: number): string => {
//     if (num >= 1000000) {
//       const formatted = (num / 1000000).toFixed(1);
//       return `${formatted}M+`;
//     }
//     if (num >= 1000) {
//       const formatted = (num / 1000).toFixed(1);
//       return `${formatted}K+`;
//     }
//     return `${num}+`;
//   };

//   return (
//     <>
//       {/* Navigation with subtle border */}
//       <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
//         <div className="container mx-auto px-4">
//           <div className="flex items-center justify-between h-16">
//             {/* Logo */}
//             <Link href="/" className="flex items-center gap-3">
//               <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center transform -rotate-12">
//                 <Utensils className="h-6 w-6 text-white" />
//               </div>
//               <span className="text-2xl font-bold">nosh</span>
//             </Link>

//             {/* Mobile menu button - custom hamburger */}
//             <button 
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               className="md:hidden p-2"
//               aria-label="Toggle menu"
//             >
//               {mobileMenuOpen ? (
//                 <X className="h-6 w-6 text-gray-900" />
//               ) : (
//                 <div className="space-y-1.5 w-6">
//                   <div className="w-6 h-0.5 bg-gray-900"></div>
//                   <div className="w-6 h-0.5 bg-gray-900"></div>
//                   <div className="w-6 h-0.5 bg-gray-900"></div>
//                 </div>
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Navigation Menu */}
//         {mobileMenuOpen && (
//           <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-sm">
//             <div className="container mx-auto px-4 py-6 space-y-6">
//               <Link 
//                 href="/features" 
//                 className="block text-xl text-gray-900 hover:text-blue-500"
//                 onClick={() => setMobileMenuOpen(false)}
//               >
//                 Features
//               </Link>
//               <Link 
//                 href="/pricing" 
//                 className="block text-xl text-gray-900 hover:text-blue-500"
//                 onClick={() => setMobileMenuOpen(false)}
//               >
//                 Pricing
//               </Link>
//               <Link 
//                 href="/about" 
//                 className="block text-xl text-gray-900 hover:text-blue-500"
//                 onClick={() => setMobileMenuOpen(false)}
//               >
//                 About
//               </Link>
//               <button className="w-full py-4 bg-blue-500 text-white text-lg font-medium rounded-xl hover:bg-blue-600 transition">
//                 Get Started
//               </button>
//             </div>
//           </div>
//         )}
//       </nav>

//       {/* Hero Section with distinct background */}
//       <div className="pt-24 pb-20 bg-gray-50">
//         <div className="container mx-auto px-4">
//           <div className="max-w-3xl mx-auto text-center">
//             <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 text-blue-500">
//               Your AI Food<br />Intelligence
//             </h1>
//             <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
//               Make smarter food choices with AI-powered insights. Get personalised recommendations 
//               and build lasting healthy habits.
//             </p>
//             <div className="flex flex-col gap-4 mb-16 max-w-md mx-auto">
//               <button className="w-full py-4 bg-blue-500 text-white text-lg rounded-xl hover:bg-blue-600 transition">
//                 Start Free Trial
//               </button>
//               <button className="w-full py-4 bg-white text-gray-900 text-lg rounded-xl border border-gray-200 hover:border-blue-500 transition">
//                 Watch Demo
//               </button>
//             </div>
            
//             <div className="space-y-4">
//               <div className="p-6 bg-white rounded-xl shadow-sm">
//                 <div className="text-3xl font-bold text-blue-500 mb-2">
//                   {loading ? (
//                     <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto" />
//                   ) : (
//                     formatNumber(userCount)
//                   )}
//                 </div>
//                 <div className="text-gray-600 text-lg">Active Users</div>
//               </div>
//               <div className="p-6 bg-white rounded-xl shadow-sm">
//                 <div className="text-3xl font-bold text-blue-500 mb-2">4.8/5</div>
//                 <div className="text-gray-600 text-lg">User Rating</div>
//               </div>
//               <div className="p-6 bg-white rounded-xl shadow-sm">
//                 <div className="text-3xl font-bold text-blue-500 mb-2">
//                   {loading ? (
//                     <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto" />
//                   ) : (
//                     formatNumber(mealCount)
//                   )}
//                 </div>
//                 <div className="text-gray-600 text-lg">Meals Analysed</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
