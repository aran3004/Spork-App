'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar } from 'react-chartjs-2';
import { Utensils, Target, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface UserStats {
  avgCalories: string | null;
  mealsLogged: number | null;
  streakDays: number | null;
  lastMealTime: string | null;
  weeklyCalories: { day: string; calories: number }[];
}

const getTimeSince = (dateString: string | null): string => {
  if (!dateString) return '-';
  
  const mealDate = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - mealDate.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - mealDate.getTime()) / (1000 * 60));
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<UserStats>({
    avgCalories: null,
    mealsLogged: null,
    streakDays: null,
    lastMealTime: null,
    weeklyCalories: [
      { day: 'Mon', calories: 0 },
      { day: 'Tue', calories: 0 },
      { day: 'Wed', calories: 0 },
      { day: 'Thu', calories: 0 },
      { day: 'Fri', calories: 0 },
      { day: 'Sat', calories: 0 },
      { day: 'Sun', calories: 0 }
    ]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get meals from the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: mealsData, error: mealsError } = await supabase
          .from('meals')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', sevenDaysAgo.toISOString());

        if (mealsError) {
          console.error('Error fetching meals:', mealsError);
          return;
        }

        // Get last logged meal
        const { data: lastMeal } = await supabase
          .from('meals')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Calculate meals logged
        const totalMeals = mealsData?.length || 0;

        // Calculate average calories
        let totalCalories = 0;
        const weeklyData = new Array(7).fill(0);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        mealsData?.forEach(meal => {
          const mealCalories = meal.analysis?.calories || 0;
          totalCalories += mealCalories;

          const dayIndex = new Date(meal.created_at).getDay();
          weeklyData[dayIndex] += mealCalories;
        });

        const avgCalories = totalMeals > 0 ? (totalCalories / totalMeals).toFixed(0) : '0';

        const weeklyCalories = days.map((day, index) => ({
          day,
          calories: weeklyData[index]
        }));

        // Get streak (consecutive days with logged meals)
        let streakDays = 0;
        let currentDate = new Date();
        let consecutiveDays = 0;

        while (consecutiveDays < 7) {
          const dayMeals = mealsData?.filter(meal => {
            const mealDate = new Date(meal.created_at);
            return mealDate.toDateString() === currentDate.toDateString();
          });

          if (dayMeals?.length === 0) break;
          streakDays++;
          consecutiveDays++;
          currentDate.setDate(currentDate.getDate() - 1);
        }

        setStats({
          avgCalories,
          mealsLogged: totalMeals,
          streakDays,
          lastMealTime: lastMeal?.created_at || null,
          weeklyCalories
        });

      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  const calorieData = {
    labels: stats.weeklyCalories.map(d => d.day),
    datasets: [
      {
        label: 'Calories',
        data: stats.weeklyCalories.map(d => d.calories),
        backgroundColor: '#3b82f6',
        borderRadius: 6,
        maxBarThickness: 40
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card className="p-2 lg:p-4">
          <CardHeader className="flex flex-col space-y-4 p-2">
            <div className="flex justify-between items-center w-full">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">Avg. Daily Calories</CardTitle>
            </div>
            <Utensils className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="p-2">
            <div className="text-xl lg:text-2xl font-bold">{loading ? '...' : stats.avgCalories || '-'}</div>
          </CardContent>
        </Card>

        <Card className="p-2 lg:p-4">
          <CardHeader className="flex flex-col space-y-4 p-2">
            <div className="flex justify-between items-center w-full">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">Meals Logged</CardTitle>
            </div>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="p-2">
            <div className="text-xl lg:text-2xl font-bold">{loading ? '...' : stats.mealsLogged || '-'}</div>
          </CardContent>
        </Card>

        <Card className="p-2 lg:p-4">
          <CardHeader className="flex flex-col space-y-4 p-2">
            <div className="flex justify-between items-center w-full">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">Day Streak</CardTitle>
            </div>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="p-2">
          <div className="text-xl lg:text-2xl font-bold">
            {loading 
              ? '...' 
              : stats.streakDays 
                ? `${stats.streakDays} ${stats.streakDays === 1 ? 'day' : 'days'}`
                : '-'
            }
          </div>
          </CardContent>
        </Card>

        <Card className="p-2 lg:p-4">
          <CardHeader className="flex flex-col space-y-4 p-2">
            <div className="flex justify-between items-center w-full">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">Last Meal</CardTitle>
            </div>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="p-2">
            <div className="text-xl lg:text-2xl font-bold">
              {loading ? '...' : getTimeSince(stats.lastMealTime)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Calories Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Calorie Intake</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar data={calorieData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm text-gray-400">Loading...</span>
                  </div>
                ))
              ) : (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm text-gray-400">-</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-400">Loading...</span>
                  </div>
                ))
              ) : (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-400">-</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Target } from 'lucide-react';
// import { createClient } from '@supabase/supabase-js';
// import { useRouter } from 'next/navigation';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// export default function DashboardPage() {
//   const [mealsLogged, setMealsLogged] = useState<number | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();
//   const supabase = createClientComponentClient();

//   useEffect(() => {
//     const fetchMealsCount = async () => {
//       try {
//         // Get the current session
//         const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
//         if (sessionError || !session) {
//           console.log('No session found, redirecting to login');
//           router.push('/login'); // Adjust this to your login route
//           return;
//         }

//         console.log('Fetching meals for user:', session.user.id); // Debug log

//         // Get count of meals for the current user
//         const { count, error } = await supabase
//           .from('meals')
//           .select('*', { count: 'exact', head: true })
//           .eq('user_id', session.user.id);

//         if (error) {
//           console.error('Error fetching meals count:', error);
//           return;
//         }

//         console.log('Meals count:', count); // Debug log
//         setMealsLogged(count || 0);

//       } catch (error) {
//         console.error('Unexpected error:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     // Set up auth state listener
//     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
//       if (event === 'SIGNED_OUT') {
//         router.push('/login'); // Adjust this to your login route
//       }
//     });

//     fetchMealsCount();

//     // Cleanup subscription
//     return () => {
//       subscription.unsubscribe();
//     };
//   }, [router, supabase]);

//   // Show loading state if checking auth
//   if (loading) {
//     return (
//       <div className="p-6">
//         <h1 className="text-3xl font-bold mb-6">Overview</h1>
//         <Card className="p-2 lg:p-4">
//           <CardHeader className="flex flex-col space-y-4 p-2">
//             <div className="flex justify-between items-center w-full">
//               <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">Meals Logged</CardTitle>
//             </div>
//             <Target className="h-4 w-4 text-green-500" />
//           </CardHeader>
//           <CardContent className="p-2">
//             <div className="text-xl lg:text-2xl font-bold">...</div>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold mb-6">Overview</h1>
      
//       <Card className="p-2 lg:p-4">
//         <CardHeader className="flex flex-col space-y-4 p-2">
//           <div className="flex justify-between items-center w-full">
//             <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">Meals Logged</CardTitle>
//           </div>
//           <Target className="h-4 w-4 text-green-500" />
//         </CardHeader>
//         <CardContent className="p-2">
//           <div className="text-xl lg:text-2xl font-bold">
//             {mealsLogged ?? '-'}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
// ---------------------------------------------------------------------------------------------------------------------

// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Bar } from 'react-chartjs-2';
// import { Utensils, Target, TrendingUp, Calendar } from 'lucide-react';
// import { createClient } from '@supabase/supabase-js';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// } from 'chart.js';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// );

// interface UserStats {
//   avgCalories: string | null;
//   mealsLogged: number | null;
//   streakDays: number | null;
//   nextMealTime: string | null;
//   weeklyCalories: { day: string; calories: number }[];
// }

// interface Activity {
//   description: string;
//   created_at: string;
// }

// interface Recommendation {
//   description: string;
//   created_at: string;
// }

// export default function DashboardPage() {
//   const [stats, setStats] = useState<UserStats>({
//     avgCalories: null,
//     mealsLogged: null,
//     streakDays: null,
//     nextMealTime: null,
//     weeklyCalories: [
//       { day: 'Mon', calories: 0 },
//       { day: 'Tue', calories: 0 },
//       { day: 'Wed', calories: 0 },
//       { day: 'Thu', calories: 0 },
//       { day: 'Fri', calories: 0 },
//       { day: 'Sat', calories: 0 },
//       { day: 'Sun', calories: 0 }
//     ]
//   });
//   const [activities, setActivities] = useState<Activity[]>([]);
//   const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activitiesLoading, setActivitiesLoading] = useState(true);

//   useEffect(() => {
//     const supabase = createClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//     );

//     const fetchUserStats = async () => {
//       try {
//         const userId = (await supabase.auth.getUser()).data.user?.id;
//         if (!userId) return;

//         // Get average calories and weekly data
//         const { data: caloriesData, error: caloriesError } = await supabase
//           .from('meals')
//           .select('calories, created_at')
//           .eq('user_id', userId)
//           .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

//         // Get total meals logged
//         const { count: mealsCount, error: mealsError } = await supabase
//           .from('meals')
//           .select('*', { count: 'exact', head: true })
//           .eq('user_id', userId);

//         // Get streak data
//         const { data: streakData, error: streakError } = await supabase
//           .rpc('get_user_streak', { user_id: userId });

//         // Get next scheduled meal
//         const { data: nextMealData, error: nextMealError } = await supabase
//           .from('meal_schedule')
//           .select('meal_time')
//           .eq('user_id', userId)
//           .gt('meal_time', new Date().toISOString())
//           .order('meal_time', { ascending: true })
//           .limit(1)
//           .single();

//         // Process weekly calories data
//         const weeklyData = new Array(7).fill(0);
//         const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
//         if (caloriesData) {
//           caloriesData.forEach(meal => {
//             const dayIndex = new Date(meal.created_at).getDay();
//             weeklyData[dayIndex] += meal.calories || 0;
//           });
//         }

//         const weeklyCalories = days.map((day, index) => ({
//           day,
//           calories: weeklyData[index]
//         }));

//         // Calculate average calories
//         const avgCalories = caloriesData?.length 
//           ? (caloriesData.reduce((acc, meal) => acc + (meal.calories || 0), 0) / caloriesData.length).toFixed(0)
//           : null;

//         setStats({
//           avgCalories,
//           mealsLogged: mealsCount || null,
//           streakDays: streakData || null,
//           nextMealTime: nextMealData?.meal_time || null,
//           weeklyCalories
//         });

//         // Fetch activities and recommendations
//         const { data: activityData, error: activityError } = await supabase
//           .from('activities')
//           .select('description, created_at')
//           .eq('user_id', userId)
//           .order('created_at', { ascending: false })
//           .limit(3);

//         if (activityError) {
//           console.error('Error fetching activities:', activityError);
//         } else {
//           setActivities(activityData || []);
//         }

//         const { data: recommendationData, error: recommendationError } = await supabase
//           .from('recommendations')
//           .select('description, created_at')
//           .eq('user_id', userId)
//           .order('created_at', { ascending: false })
//           .limit(3);

//         if (recommendationError) {
//           console.error('Error fetching recommendations:', recommendationError);
//         } else {
//           setRecommendations(recommendationData || []);
//         }

//       } catch (error) {
//         console.error('Error fetching user stats:', error);
//       } finally {
//         setLoading(false);
//         setActivitiesLoading(false);
//       }
//     };

//     fetchUserStats();
//   }, []);

//   const calorieData = {
//     labels: stats.weeklyCalories.map(d => d.day),
//     datasets: [
//       {
//         label: 'Calories',
//         data: stats.weeklyCalories.map(d => d.calories),
//         backgroundColor: '#3b82f6',
//         borderRadius: 6,
//         maxBarThickness: 40
//       }
//     ]
//   };

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//       x: {
//         grid: {
//           display: false
//         }
//       },
//       y: {
//         beginAtZero: true,
//         grid: {
//           color: '#f3f4f6'
//         }
//       }
//     },
//     plugins: {
//       legend: {
//         display: false
//       }
//     }
//   };

//   return (
//     <div className="space-y-6 p-6">
//       <h1 className="text-3xl font-bold">Overview</h1>
      
//       {/* Stats Grid */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
//         <Card className="p-2 lg:p-4">
//           <CardHeader className="flex flex-col space-y-4 p-2">
//             <div className="flex justify-between items-center w-full">
//               <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">Avg. Daily Calories</CardTitle>
//             </div>
//             <Utensils className="h-4 w-4 text-blue-500" />
//           </CardHeader>
//           <CardContent className="p-2">
//             <div className="text-xl lg:text-2xl font-bold">{loading ? '...' : stats.avgCalories || '-'}</div>
//           </CardContent>
//         </Card>

//         <Card className="p-2 lg:p-4">
//           <CardHeader className="flex flex-col space-y-4 p-2">
//             <div className="flex justify-between items-center w-full">
//               <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">Meals Logged</CardTitle>
//             </div>
//             <Target className="h-4 w-4 text-green-500" />
//           </CardHeader>
//           <CardContent className="p-2">
//             <div className="text-xl lg:text-2xl font-bold">{loading ? '...' : stats.mealsLogged || '-'}</div>
//           </CardContent>
//         </Card>

//         <Card className="p-2 lg:p-4">
//           <CardHeader className="flex flex-col space-y-4 p-2">
//             <div className="flex justify-between items-center w-full">
//               <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">Day Streak</CardTitle>
//             </div>
//             <TrendingUp className="h-4 w-4 text-orange-500" />
//           </CardHeader>
//           <CardContent className="p-2">
//             <div className="text-xl lg:text-2xl font-bold">
//               {loading ? '...' : stats.streakDays ? `${stats.streakDays} days` : '-'}
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="p-2 lg:p-4">
//           <CardHeader className="flex flex-col space-y-4 p-2">
//             <div className="flex justify-between items-center w-full">
//               <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">Next Meal</CardTitle>
//             </div>
//             <Calendar className="h-4 w-4 text-purple-500" />
//           </CardHeader>
//           <CardContent className="p-2">
//             <div className="text-xl lg:text-2xl font-bold">
//               {loading ? '...' : stats.nextMealTime || '-'}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Weekly Calories Chart */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Weekly Calorie Intake</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="h-[300px]">
//             <Bar data={calorieData} options={chartOptions} />
//           </div>
//         </CardContent>
//       </Card>

//       {/* Recent Activity & Recommendations */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Activity</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {activitiesLoading ? (
//                 // Loading state
//                 Array(3).fill(0).map((_, i) => (
//                   <div key={i} className="flex items-center gap-3">
//                     <div className="w-2 h-2 rounded-full bg-blue-500" />
//                     <span className="text-sm text-gray-400">Loading...</span>
//                   </div>
//                 ))
//               ) : activities.length > 0 ? (
//                 // Show actual activities
//                 activities.map((activity, i) => (
//                   <div key={i} className="flex items-center gap-3">
//                     <div className="w-2 h-2 rounded-full bg-blue-500" />
//                     <span className="text-sm text-gray-600">{activity.description}</span>
//                   </div>
//                 ))
//               ) : (
//                 // Show dashes when no data
//                 Array(3).fill(0).map((_, i) => (
//                   <div key={i} className="flex items-center gap-3">
//                     <div className="w-2 h-2 rounded-full bg-blue-500" />
//                     <span className="text-sm text-gray-400">-</span>
//                   </div>
//                 ))
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Recommendations</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {activitiesLoading ? (
//                 // Loading state
//                 Array(3).fill(0).map((_, i) => (
//                   <div key={i} className="flex items-center gap-3">
//                     <div className="w-2 h-2 rounded-full bg-green-500" />
//                     <span className="text-sm text-gray-400">Loading...</span>
//                   </div>
//                 ))
//               ) : recommendations.length > 0 ? (
//                 // Show actual recommendations
//                 recommendations.map((rec, i) => (
//                   <div key={i} className="flex items-center gap-3">
//                     <div className="w-2 h-2 rounded-full bg-green-500" />
//                     <span className="text-sm text-gray-600">{rec.description}</span>
//                   </div>
//                 ))
//               ) : (
//                 // Show dashes when no data
//                 Array(3).fill(0).map((_, i) => (
//                   <div key={i} className="flex items-center gap-3">
//                     <div className="w-2 h-2 rounded-full bg-green-500" />
//                     <span className="text-sm text-gray-400">-</span>
//                   </div>
//                 ))
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }


// ---------------------------------------------------------------------------------------------------------------------


// 'use client';

// import React from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Bar } from 'react-chartjs-2';
// import { Utensils, Target, TrendingUp, Calendar } from 'lucide-react';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// } from 'chart.js';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// );

// const mockData = {
//   weeklyCalories: [
//     { day: 'Mon', calories: 2100 },
//     { day: 'Tue', calories: 2300 },
//     { day: 'Wed', calories: 1950 },
//     { day: 'Thu', calories: 2200 },
//     { day: 'Fri', calories: 2400 },
//     { day: 'Sat', calories: 2600 },
//     { day: 'Sun', calories: 2150 }
//   ],
//   stats: {
//     avgCalories: '2243',
//     mealsLogged: '21',
//     streakDays: '5',
//     nextMeal: 'Lunch in 2h'
//   }
// };

// const calorieData = {
//   labels: mockData.weeklyCalories.map(d => d.day),
//   datasets: [
//     {
//       label: 'Calories',
//       data: mockData.weeklyCalories.map(d => d.calories),
//       backgroundColor: '#3b82f6',
//       borderRadius: 6,
//       maxBarThickness: 40
//     }
//   ]
// };

// const chartOptions = {
//   responsive: true,
//   maintainAspectRatio: false,
//   scales: {
//     x: {
//       grid: {
//         display: false
//       }
//     },
//     y: {
//       beginAtZero: true,
//       grid: {
//         color: '#f3f4f6'
//       }
//     }
//   },
//   plugins: {
//     legend: {
//       display: false
//     }
//   }
// };

// export default function DashboardPage() {
//   return (
//     <div className="space-y-6 p-6">
//       <h1 className="text-3xl font-bold">Overview</h1>
      
//       {/* Stats Grid */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
//         <Card className="p-2 lg:p-4">
//           <CardHeader className="flex flex-col space-y-4 p-2">
//             <div className="flex justify-between items-center w-full">
//               <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">Avg. Daily Calories</CardTitle>
//             </div>
//             <Utensils className="h-4 w-4 text-blue-500" />
//           </CardHeader>
//           <CardContent className="p-2">
//             <div className="text-xl lg:text-2xl font-bold">{mockData.stats.avgCalories}</div>
//           </CardContent>
//         </Card>

//         <Card className="p-2 lg:p-4">
//           <CardHeader className="flex flex-col space-y-4 p-2">
//             <div className="flex justify-between items-center w-full">
//               <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">Meals Logged</CardTitle>
//             </div>
//             <Target className="h-4 w-4 text-green-500" />
//           </CardHeader>
//           <CardContent className="p-2">
//             <div className="text-xl lg:text-2xl font-bold">{mockData.stats.mealsLogged}</div>
//           </CardContent>
//         </Card>

//         <Card className="p-2 lg:p-4">
//           <CardHeader className="flex flex-col space-y-4 p-2">
//             <div className="flex justify-between items-center w-full">
//               <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">Day Streak</CardTitle>
//             </div>
//             <TrendingUp className="h-4 w-4 text-orange-500" />
//           </CardHeader>
//           <CardContent className="p-2">
//             <div className="text-xl lg:text-2xl font-bold">{mockData.stats.streakDays} days</div>
//           </CardContent>
//         </Card>

//         <Card className="p-2 lg:p-4">
//           <CardHeader className="flex flex-col space-y-4 p-2">
//             <div className="flex justify-between items-center w-full">
//               <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">Next Meal</CardTitle>
//             </div>
//             <Calendar className="h-4 w-4 text-purple-500" />
//           </CardHeader>
//           <CardContent className="p-2">
//             <div className="text-xl lg:text-2xl font-bold">{mockData.stats.nextMeal}</div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Weekly Calories Chart */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Weekly Calorie Intake</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="h-[300px]">
//             <Bar data={calorieData} options={chartOptions} />
//           </div>
//         </CardContent>
//       </Card>

//       {/* Recent Activity & Recommendations */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Activity</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {['Logged breakfast - Oatmeal Bowl', 'Completed daily goal', 'Added new recipe'].map((activity, i) => (
//                 <div key={i} className="flex items-center gap-3">
//                   <div className="w-2 h-2 rounded-full bg-blue-500" />
//                   <span className="text-sm text-gray-600">{activity}</span>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Recommendations</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {[
//                 'Try adding more protein to your breakfast',
//                 'Consider logging snacks for better tracking',
//                 'You\'re close to hitting your weekly goal!'
//               ].map((rec, i) => (
//                 <div key={i} className="flex items-center gap-3">
//                   <div className="w-2 h-2 rounded-full bg-green-500" />
//                   <span className="text-sm text-gray-600">{rec}</span>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
