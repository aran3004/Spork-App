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
// import { Loader2 } from 'lucide-react';

// export function Hero(): JSX.Element {
//   const [userCount, setUserCount] = useState<number>(0);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     const supabase = createClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//     );

//     const fetchUserCount = async () => {
//       try {
//         // Try the RPC method first
//         console.log('Attempting to fetch user count via RPC...');
//         const { data: rpcData, error: rpcError } = await supabase
//           .rpc('get_user_count');

//         if (rpcError) {
//           console.error('RPC Error:', rpcError);
          
//           // Fallback to querying auth.users directly
//           console.log('Attempting to fetch from auth.users...');
//           const { count, error: authError } = await supabase
//             .from('users')  // Back to 'users' table
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

//     fetchUserCount();

//     // Subscribe to changes
//     const subscription = supabase
//       .channel('users_count')
//       .on('postgres_changes', 
//         { event: '*', schema: 'public', table: 'users' },
//         (payload) => {
//           console.log('Received database change:', payload);
//           fetchUserCount();
//         }
//       )
//       .subscribe();

//     return () => {
//       subscription.unsubscribe();
//     };
//   }, []);

//   const formatNumber = (num: number): string => {
//     if (num >= 1000) {
//       const formatted = (num / 1000).toFixed(1);
//       return `${formatted}K`;
//     }
//     return num.toString();
//   };

//   return (
//     <div className="pt-32 pb-20 relative overflow-hidden">
//       <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
//       <div className="container mx-auto px-6 relative">
//         <div className="max-w-4xl mx-auto text-center">
//           <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pb-2">
//             Your AI Food Intelligence
//           </h1>
//           <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
//             Make smarter food choices with AI-powered insights. Get personalised recommendations 
//             and build lasting healthy habits.
//           </p>
//           <div className="flex flex-col sm:flex-row justify-center gap-4">
//             <button className="px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition duration-300 transform hover:-translate-y-1">
//               Start Free Trial
//             </button>
//             <button className="px-8 py-4 bg-white text-gray-700 rounded-xl border border-gray-200 hover:border-blue-500 transition duration-300 transform hover:-translate-y-1">
//               Watch Demo
//             </button>
//           </div>
          
//           <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-20">
//             <div className="p-6 bg-white rounded-xl shadow-sm">
//               <div className="text-3xl font-bold text-blue-500 mb-2">
//                 {loading ? (
//                   <div className="flex items-center justify-center gap-2">
//                     <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
//                   </div>
//                 ) : (
//                   `${formatNumber(userCount)}+`
//                 )}
//               </div>
//               <div className="text-gray-600">Active Users</div>
//             </div>
//             <div className="p-6 bg-white rounded-xl shadow-sm">
//               <div className="text-3xl font-bold text-blue-500 mb-2">4.8/5</div>
//               <div className="text-gray-600">User Rating</div>
//             </div>
//             <div className="p-6 bg-white rounded-xl shadow-sm md:col-span-1 col-span-2">
//               <div className="text-3xl font-bold text-blue-500 mb-2">1M+</div>
//               <div className="text-gray-600">Meals Analysed</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
