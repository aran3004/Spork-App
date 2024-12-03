'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Loader2, ChevronRight, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DateGroups {
  [key: string]: MealEntry[];
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

interface MealEntry extends RecentMeal {
  date: string;
  user_id: string;
}

export default function DiaryPage() {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMeal, setSelectedMeal] = useState<MealEntry | null>(null);
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  const handleDateClick = () => {
    dateInputRef.current?.showPicker();
  };

  const getLast7Days = (): DateGroups => {
    const dates: DateGroups = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      dates[formattedDate] = [];
    }
    return dates;
  };

  useEffect(() => {
    async function fetchMeals() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('meals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedMeals = (data || []).map(meal => ({
          ...meal,
          date: new Date(meal.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        })) as MealEntry[];

        setMeals(formattedMeals);
      } catch (error) {
        console.error('Error fetching meals:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMeals();
  }, []);

  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase());
    const mealDate = new Date(meal.created_at);
    const selectedDateTime = selectedDate ? new Date(selectedDate) : null;
    
    const matchesDate = !selectedDate || (
      mealDate.getFullYear() === selectedDateTime?.getFullYear() &&
      mealDate.getMonth() === selectedDateTime?.getMonth() &&
      mealDate.getDate() === selectedDateTime?.getDate()
    );
    
    return matchesSearch && matchesDate;
  });

  const getDatesToShow = (): DateGroups => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      return { [formattedDate]: [] };
    }
    return getLast7Days();
  };

  const groupedMeals = filteredMeals.reduce((groups, meal) => {
    if (!groups[meal.date]) {
      groups[meal.date] = [];
    }
    groups[meal.date].push(meal);
    return groups;
  }, {} as DateGroups);

  const allDatesWithMeals = {
    ...getDatesToShow(),
    ...groupedMeals
  };

  const handleMealClick = (meal: MealEntry) => {
    setSelectedMeal(meal);
  };

  return (
    <>
      <div className="space-y-6 p-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Meal Diary</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search meals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          
          {/* Custom Date Input */}
          <div 
            className="relative w-full sm:w-52 cursor-pointer" 
            onClick={handleDateClick}
          >
            <div className="relative">
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <div className="w-full h-10 pl-8 pr-3 flex items-center border rounded-md bg-background">
                <span className="text-sm text-gray-500">
                  {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Select date'}
                </span>
              </div>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(allDatesWithMeals)
              .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
              .map(([date, dayMeals]) => (
                <div key={date} className="space-y-4">
                  <h2 className="text-xl font-semibold">{date}</h2>
                  {dayMeals.length > 0 ? (
                    <div className="grid gap-4">
                      {dayMeals.map((meal) => (
                        <Card 
                          key={meal.id} 
                          className="group cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01] border-2 hover:border-blue-200 relative overflow-hidden"
                          onClick={() => handleMealClick(meal)}
                        >
                          <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                  {meal.name}
                                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 duration-200" />
                                </CardTitle>
                                <p className="text-sm text-gray-500">
                                  {new Date(meal.created_at).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  meal.analysis.score >= 80 ? 'bg-green-100 text-green-800' :
                                  meal.analysis.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  Score: {meal.analysis.score}
                                </span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium mb-2">Ingredients</h4>
                                <ul className="space-y-1 text-sm text-gray-600">
                                  {meal.ingredients.slice(0, 3).map((ingredient, i) => (
                                    <li key={i}>{ingredient.name} ({ingredient.weight}{ingredient.unit})</li>
                                  ))}
                                  {meal.ingredients.length > 3 && (
                                    <li className="text-blue-500 group-hover:underline">
                                      +{meal.ingredients.length - 3} more...
                                    </li>
                                  )}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Analysis</h4>
                                <p className="text-sm text-gray-600">
                                  {meal.analysis.analysis.calorieEstimate}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-blue-500 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to view full details →
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="h-16 flex items-center justify-center !p-0">
                        <p className="text-gray-400 text-lg font-medium">No meals logged for this day</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>



      {selectedMeal && (
        <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
            <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
                <DialogTitle className="text-xl">{selectedMeal.name}</DialogTitle>
                <p className="text-sm text-gray-500">
                {new Date(selectedMeal.created_at).toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                })}
                </p>
            </DialogHeader>

            <div className="space-y-6 mt-4">
                {/* Health Score */}
                <div className="flex items-center">
                <h4 className="font-medium mr-3">Health Score:</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedMeal.analysis.score >= 80 ? 'bg-green-100 text-green-800' :
                    selectedMeal.analysis.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                    {selectedMeal.analysis.score}
                </span>
                </div>

                {/* Ingredients */}
                <div>
                <h4 className="font-medium mb-3">Ingredients</h4>
                <div className="grid grid-cols-2 gap-2">
                    {selectedMeal.ingredients.map((ingredient, i) => (
                    <div key={i} className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                        <span className="font-medium">{ingredient.name}</span>{' '}
                        <span>({ingredient.weight}{ingredient.unit})</span>
                    </div>
                    ))}
                </div>
                </div>

                {/* Calorie Estimate */}
                <div>
                <h4 className="font-medium mb-2">Calorie Estimate</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {selectedMeal.analysis.analysis.calorieEstimate}
                </p>
                </div>

                {/* Improvements */}
                <div>
                <h4 className="font-medium mb-3">Suggested Improvements</h4>
                <div className="space-y-3">
                    {selectedMeal.analysis.improvements.map((improvement, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-800">
                            {improvement.title}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                            improvement.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                            improvement.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
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
                </div>
            </div>
            </DialogContent>
        </Dialog>
        )}
    </>
  );
}