'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar } from 'react-chartjs-2';
import { Target, TrendingUp, Calendar, Loader2, ChevronLeft, ChevronRight , Activity} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MealData {
  created_at: string;
  name: string;
  analysis: {
    score: number;
    macroBreakdown?: any;
  };
}

interface UserStats {
  avgHealthScore: number | null;
  mealsLogged: number | null;
  streakDays: number | null;
  lastMealTime: string | null;
  recentMealScores: {
    timestamp: string;
    score: number;
    mealName: string;
  }[];
}

interface RecentMeal {
  id: string;
  name: string;
  ingredients: Array<{
    name: string;
    weight: number;
    unit: string;
  }>;
  analysis: {
    score: number;
    improvements: Array<{
      title: string;
      description: string;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
    analysis: {
      calorieEstimate: string;
    };
  };
  created_at: string;
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

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#22c55e'; // green-500
  if (score >= 60) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
};


export default function DashboardPage() {
  const [stats, setStats] = useState<UserStats>({
    avgHealthScore: null,
    mealsLogged: null,
    streakDays: null,
    lastMealTime: null,
    recentMealScores: []
  });
  const [loading, setLoading] = useState(true);
  const [recentMeals, setRecentMeals] = useState<RecentMeal[]>([]);
  const [recentMealsLoading, setRecentMealsLoading] = useState(true);
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);
  const [currentMealIndex, setCurrentMealIndex] = useState(0);

  const goToNextMeal = () => {
    if (currentMealIndex < recentMeals.length - 1) {
      setCurrentMealIndex(currentMealIndex + 1);
    }
  };

  const goToPreviousMeal = () => {
    if (currentMealIndex > 0) {
      setCurrentMealIndex(currentMealIndex - 1);
    }
  };

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: mealsData, error: mealsError } = await supabase
          .from('meals')
          .select('created_at, analysis, name')
          .eq('user_id', user.id)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false });

        if (mealsError) {
          console.error('Error fetching meals:', mealsError);
          return;
        }

        const lastMeal = mealsData?.[0]?.created_at || null;
        const totalMeals = mealsData?.length || 0;

        // Calculate streak days (keep existing streak calculation logic)
        let streakDays = 0;
        let consecutiveDays = 0;

        const startDate = new Date();
        while (consecutiveDays < 7) {
          const currentDate = new Date(startDate);
          currentDate.setDate(currentDate.getDate() - consecutiveDays);
          
          const dayMeals = mealsData?.filter(meal => {
            const mealDate = new Date(meal.created_at);
            return mealDate.toDateString() === currentDate.toDateString();
          });
        
          if (dayMeals?.length === 0) break;
          streakDays++;
          consecutiveDays++;
        }

        // Process recent meal scores and calculate average
        const recentMealScores = (mealsData as MealData[] || [])
          .slice(0, 10)
          .map(meal => ({
            timestamp: meal.created_at,
            score: meal.analysis?.score || 0,
            mealName: meal.name || 'Unnamed Meal'
          }))
          .reverse();

        // Calculate average health score
        const avgHealthScore = recentMealScores.length > 0
          ? Number((recentMealScores.reduce((acc, meal) => acc + meal.score, 0) / recentMealScores.length).toFixed(1))
          : null;

        setStats({
          avgHealthScore,
          mealsLogged: totalMeals,
          streakDays,
          lastMealTime: lastMeal,
          recentMealScores
        });

      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  useEffect(() => {
    async function fetchRecentMeals() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
  
        const { data, error } = await supabase
          .from('meals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3); // Limit to 3 most recent meals
  
        if (error) {
          console.error('Error fetching meals:', error);
          return;
        }
  
        if (data) {
          setRecentMeals(data as RecentMeal[]);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setRecentMealsLoading(false);
      }
    }
  
    // Create subscription only after getting the user
    async function setupSubscription() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
  
      const mealSubscription = supabase
        .channel('user_meals')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'meals',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchRecentMeals();
          }
        )
        .subscribe();
  
      return () => {
        mealSubscription.unsubscribe();
      };
    }
  
    fetchRecentMeals();
    const unsubscribe = setupSubscription();
  
    return () => {
      // Cleanup subscription
      unsubscribe.then(unsub => unsub?.());
    };
  }, []);

  const scoreData: ChartData<'bar'> = {
    labels: stats.recentMealScores.map(m => formatDateTime(m.timestamp)),
    datasets: [
      {
        label: 'Health Score',
        data: stats.recentMealScores.map(m => m.score),
        backgroundColor: stats.recentMealScores.map(m => getScoreColor(m.score)),
        borderRadius: 6,
        maxBarThickness: 40
      }
    ]
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: '#f3f4f6'
        },
        ticks: {
          callback: function(value) {
            return value;
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            const index = context[0].dataIndex;
            return stats.recentMealScores[index].mealName;
          },
          label: function(context) {
            return `Health Score: ${context.raw}`;
          },
          afterTitle: function(context) {
            const index = context[0].dataIndex;
            return formatDateTime(stats.recentMealScores[index].timestamp);
          }
        }
      }
    }
  };

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold">Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-2 lg:p-4">
          <CardHeader className="flex flex-col space-y-4 p-2">
            <div className="flex justify-between items-center w-full">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">
                Avg. Health Score
              </CardTitle>
            </div>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="p-2">
            <div className="text-xl lg:text-2xl font-bold">
              {loading ? '...' : stats.avgHealthScore !== null ? `${stats.avgHealthScore}` : '-'}
            </div>
          </CardContent>
        </Card>

        <Card className="p-2 lg:p-4">
          <CardHeader className="flex flex-col space-y-4 p-2">
            <div className="flex justify-between items-center w-full">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">
                Meals Logged
              </CardTitle>
            </div>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="p-2">
            <div className="text-xl lg:text-2xl font-bold">
              {loading ? '...' : stats.mealsLogged || '-'}
            </div>
          </CardContent>
        </Card>

        <Card className="p-2 lg:p-4">
          <CardHeader className="flex flex-col space-y-4 p-2">
            <div className="flex justify-between items-center w-full">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">
                Day Streak
              </CardTitle>
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
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">
                Last Meal
              </CardTitle>
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

      {/* Health Scores Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Meal Health Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar data={scoreData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Recent Meals Section with Navigation */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Recent Meals</h2>
          <button className="text-blue-600 hover:text-blue-800">
            View All
          </button>
        </div>

        {recentMealsLoading ? (
          <div className="w-full py-8 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : recentMeals.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No recent meals found
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {/* Navigation Buttons */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10">
              <button
                onClick={() => setCurrentMealIndex(Math.max(0, currentMealIndex - 1))}
                disabled={currentMealIndex === 0}
                className={`p-2 rounded-full bg-white shadow-lg ${
                  currentMealIndex === 0 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            </div>
            
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10">
              <button
                onClick={() => setCurrentMealIndex(Math.min(recentMeals.length - 1, currentMealIndex + 1))}
                disabled={currentMealIndex === recentMeals.length - 1}
                className={`p-2 rounded-full bg-white shadow-lg ${
                  currentMealIndex === recentMeals.length - 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Current Meal Card */}
            <Card key={recentMeals[currentMealIndex].id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{recentMeals[currentMealIndex].name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDateTime(recentMeals[currentMealIndex].created_at)}
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {recentMeals[currentMealIndex].analysis.score}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Ingredients */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Ingredients</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {recentMeals[currentMealIndex].ingredients.map((ingredient, i) => (
                        <li key={i}>
                          {ingredient.name} ({ingredient.weight}{ingredient.unit})
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Analysis and Improvements */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Analysis</h4>
                      <p className="text-sm text-gray-600">
                        {recentMeals[currentMealIndex].analysis.analysis.calorieEstimate}
                      </p>
                    </div>

                    {recentMeals[currentMealIndex].analysis.improvements.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Improvements</h4>
                        <div className="space-y-3">
                          {/* First improvement */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-gray-800">
                                {recentMeals[currentMealIndex].analysis.improvements[0].title}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                recentMeals[currentMealIndex].analysis.improvements[0].priority === 'HIGH' 
                                  ? 'bg-red-100 text-red-800' 
                                  : recentMeals[currentMealIndex].analysis.improvements[0].priority === 'MEDIUM' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {recentMeals[currentMealIndex].analysis.improvements[0].priority}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {recentMeals[currentMealIndex].analysis.improvements[0].description}
                            </p>
                          </div>

                          {/* Additional improvements when expanded */}
                          {recentMeals[currentMealIndex].analysis.improvements.length > 1 && (
                            <>
                              {expandedMealId === recentMeals[currentMealIndex].id && (
                                <div className="space-y-3">
                                  {recentMeals[currentMealIndex].analysis.improvements.slice(1).map((improvement, i) => (
                                    <div key={i} className="bg-gray-50 rounded-lg p-4">
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium text-gray-800">
                                          {improvement.title}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                          improvement.priority === 'HIGH' 
                                            ? 'bg-red-100 text-red-800' 
                                            : improvement.priority === 'MEDIUM' 
                                            ? 'bg-yellow-100 text-yellow-800' 
                                            : 'bg-green-100 text-green-800'
                                        }`}>
                                          {improvement.priority}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600">
                                        {improvement.description}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              <button
                                onClick={() => setExpandedMealId(
                                  expandedMealId === recentMeals[currentMealIndex].id 
                                    ? null 
                                    : recentMeals[currentMealIndex].id
                                )}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                {expandedMealId === recentMeals[currentMealIndex].id 
                                  ? 'Show Less' 
                                  : 'Show More Improvements'
                                }
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Page Indicator Dots */}
            <div className="flex justify-center mt-4 gap-2">
              {recentMeals.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMealIndex(index)}
                  className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                    index === currentMealIndex ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
