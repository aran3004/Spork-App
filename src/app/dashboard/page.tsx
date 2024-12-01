'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar } from 'react-chartjs-2';
import { Utensils, Target, TrendingUp, Calendar } from 'lucide-react';
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

const mockData = {
  weeklyCalories: [
    { day: 'Mon', calories: 2100 },
    { day: 'Tue', calories: 2300 },
    { day: 'Wed', calories: 1950 },
    { day: 'Thu', calories: 2200 },
    { day: 'Fri', calories: 2400 },
    { day: 'Sat', calories: 2600 },
    { day: 'Sun', calories: 2150 }
  ],
  stats: {
    avgCalories: '2243',
    mealsLogged: '21',
    streakDays: '5',
    nextMeal: 'Lunch in 2h'
  }
};

const calorieData = {
  labels: mockData.weeklyCalories.map(d => d.day),
  datasets: [
    {
      label: 'Calories',
      data: mockData.weeklyCalories.map(d => d.calories),
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

export default function DashboardPage() {
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
            <div className="text-xl lg:text-2xl font-bold">{mockData.stats.avgCalories}</div>
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
            <div className="text-xl lg:text-2xl font-bold">{mockData.stats.mealsLogged}</div>
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
            <div className="text-xl lg:text-2xl font-bold">{mockData.stats.streakDays} days</div>
          </CardContent>
        </Card>

        <Card className="p-2 lg:p-4">
          <CardHeader className="flex flex-col space-y-4 p-2">
            <div className="flex justify-between items-center w-full">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">Next Meal</CardTitle>
            </div>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="p-2">
            <div className="text-xl lg:text-2xl font-bold">{mockData.stats.nextMeal}</div>
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
              {['Logged breakfast - Oatmeal Bowl', 'Completed daily goal', 'Added new recipe'].map((activity, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600">{activity}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                'Try adding more protein to your breakfast',
                'Consider logging snacks for better tracking',
                'You\'re close to hitting your weekly goal!'
              ].map((rec, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-600">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 'use client';

// import React from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Line } from 'react-chartjs-2';
// import { Utensils, Target, TrendingUp, Calendar } from 'lucide-react';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// } from 'chart.js';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
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
//       borderColor: '#3b82f6',
//       backgroundColor: '#3b82f6',
//       tension: 0.1
//     }
//   ]
// };

// const chartOptions = {
//   responsive: true,
//   maintainAspectRatio: false,
//   plugins: {
//     legend: {
//       display: false
//     }
//   }
// };

// export default function DashboardPage() {
//   return (
//     <div className="space-y-6">
//       <h1 className="text-3xl font-bold">Overview</h1>
      
//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium text-gray-500">Avg. Daily Calories</CardTitle>
//             <Utensils className="h-4 w-4 text-blue-500" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{mockData.stats.avgCalories}</div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium text-gray-500">Meals Logged</CardTitle>
//             <Target className="h-4 w-4 text-green-500" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{mockData.stats.mealsLogged}</div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium text-gray-500">Day Streak</CardTitle>
//             <TrendingUp className="h-4 w-4 text-orange-500" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{mockData.stats.streakDays} days</div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium text-gray-500">Next Meal</CardTitle>
//             <Calendar className="h-4 w-4 text-purple-500" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{mockData.stats.nextMeal}</div>
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
//             <Line data={calorieData} options={chartOptions} />
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