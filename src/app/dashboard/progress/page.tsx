'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Goal, Scale, Trophy } from 'lucide-react';

const mockData = {
  weeklyProgress: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    weight: [80, 79.2, 78.5, 77.8],
    calories: [2200, 2150, 2100, 2050]
  },
  achievements: [
    { title: '7 Day Streak', description: 'Logged meals for 7 days straight', date: '2024-11-25' },
    { title: 'Goal Reached', description: 'Hit daily protein target', date: '2024-11-24' },
    { title: 'Consistency King', description: 'Stayed within calorie range', date: '2024-11-23' }
  ]
};

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Progress Tracking</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Current Weight</CardTitle>
            <Scale className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">77.8 kg</div>
            <p className="text-sm text-green-500">-2.2kg this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Target Weight</CardTitle>
            <Goal className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75 kg</div>
            <p className="text-sm text-gray-500">2.8kg to go</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-sm text-blue-500">3 this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weight Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-end justify-between pt-8">
              {mockData.weeklyProgress.weight.map((weight, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-blue-500 w-12 rounded-t"
                    style={{ height: `${(weight - 75) * 30}px` }}
                  ></div>
                  <span className="text-sm mt-2">{mockData.weeklyProgress.labels[index]}</span>
                  <span className="text-xs text-gray-500">{weight}kg</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.achievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Trophy className="h-5 w-5 text-yellow-500 mt-1" />
                  <div>
                    <p className="font-medium">{achievement.title}</p>
                    <p className="text-sm text-gray-500">{achievement.description}</p>
                    <p className="text-xs text-gray-400">{achievement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Calorie Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-end justify-between pt-8">
              {mockData.weeklyProgress.calories.map((calories, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-green-500 w-12 rounded-t"
                    style={{ height: `${calories / 10}px` }}
                  ></div>
                  <span className="text-sm mt-2">{mockData.weeklyProgress.labels[index]}</span>
                  <span className="text-xs text-gray-500">{calories} cal</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}