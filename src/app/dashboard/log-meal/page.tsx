'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Save, UtensilsCrossed, Loader2 } from 'lucide-react';

interface Ingredient {
  name: string;
  weight: string;
  unit: string;
}

interface MealAnalysis {
    score: number;
    improvements: Array<{
      title: string;
      description: string;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
    analysis: {
      nutritionalValue: string;
      calorieEstimate: string;
      macroBreakdown: {
        proteins: string;
        carbs: string;
        fats: string;
      };
      allergenWarnings: string[];
    };
    metadata: {
      analysisVersion: string;
      modelUsed: string;
      timestamp: string;
    };
  }

export default function LogMealPage() {
  const [mealName, setMealName] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', weight: '', unit: 'g' }]);
  const [instructions, setInstructions] = useState('');
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [error, setError] = useState('');

  const analyseMeal = async () => {
    setIsAnalysing(true);
    setError('');
    
    const ingredientsList = ingredients
      .map(i => `${i.name} (${i.weight}${i.unit})`)
      .join(', ');
    const mealDescription = `Ingredients: ${ingredientsList}\nInstructions: ${instructions}`;
    
    try {
      const response = await fetch('/api/analyse-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mealName,
          mealDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyse meal');
      }
      
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyse meal. Please try again.');
    } finally {
      setIsAnalysing(false);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', weight: '', unit: 'g' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Log a Meal</h1>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
          onClick={() => console.log({ mealName, ingredients, instructions })}
        >
          <Save className="h-5 w-5" />
          Save Meal
        </button>
      </div>

      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h2 className="text-xl font-semibold">Meal Details</h2>
            <UtensilsCrossed className="h-5 w-5 text-blue-500" />
          </div>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Meal Name"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-row items-center justify-between">
            <h2 className="text-xl font-semibold">Ingredients</h2>
            <button
              onClick={addIngredient}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
            >
              <Plus className="h-5 w-5" /> Add Ingredient
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-4 items-center">
                <input
                  type="text"
                  placeholder="Ingredient name"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Weight"
                  value={ingredient.weight}
                  onChange={(e) => updateIngredient(index, 'weight', e.target.value)}
                  className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <select
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="g">grams</option>
                  <option value="oz">ounces</option>
                  <option value="ml">milliliters</option>
                  <option value="cups">cups</option>
                </select>
                {ingredients.length > 1 && (
                  <button
                    onClick={() => removeIngredient(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold">Cooking Instructions</h2>
          <div className="mt-4">
            <textarea
              placeholder="Optional cooking instructions..."
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-row items-center justify-between pb-4">
            <h2 className="text-xl font-semibold">AI Analysis</h2>
            {!analysis && (
              <button 
                className={`bg-green-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600
                  ${isAnalysing || !mealName || ingredients[0].name === '' ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={analyseMeal}
                disabled={isAnalysing || !mealName || ingredients[0].name === ''}
              >
                {isAnalysing ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Analysing...</>
                ) : (
                  'Analyse Meal'
                )}
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}
            {analysis && (
                <div className="space-y-6">
                    {/* Health Score */}
                    <div className="flex items-center gap-4">
                    <div className="bg-blue-50 rounded-full p-6 h-24 w-24 flex items-center justify-center">
                        <span className="text-3xl font-bold text-blue-600">{analysis.score}</span>
                    </div>
                    <div>
                        <h3 className="font-medium text-lg">Health Score</h3>
                        <p className="text-gray-600 text-sm">Out of 100 possible points</p>
                    </div>
                    </div>

                    {/* Nutritional Overview */}
                    <div>
                    <h3 className="font-medium text-lg mb-2">Nutritional Overview</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <p className="text-gray-700">{analysis.analysis.nutritionalValue}</p>
                        <p className="text-gray-700">{analysis.analysis.calorieEstimate}</p>
                        
                        <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <h4 className="font-medium text-sm text-blue-800">Proteins</h4>
                            <p className="text-blue-600">{analysis.analysis.macroBreakdown.proteins}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <h4 className="font-medium text-sm text-green-800">Carbs</h4>
                            <p className="text-green-600">{analysis.analysis.macroBreakdown.carbs}</p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg">
                            <h4 className="font-medium text-sm text-yellow-800">Fats</h4>
                            <p className="text-yellow-600">{analysis.analysis.macroBreakdown.fats}</p>
                        </div>
                        </div>
                    </div>
                    </div>

                    {/* Allergen Warnings */}
                    {analysis.analysis.allergenWarnings.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg">
                        <h3 className="font-medium text-lg text-red-800 mb-2">Allergen Warnings</h3>
                        <ul className="list-disc list-inside space-y-1">
                        {analysis.analysis.allergenWarnings.map((warning, index) => (
                            <li key={index} className="text-red-600">{warning}</li>
                        ))}
                        </ul>
                    </div>
                    )}
                    
                    {/* Improvements */}
                    <div>
                    <h3 className="font-medium text-lg mb-4">Suggested Improvements</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {analysis.improvements.map((improvement, index) => (
                        <div 
                            key={index} 
                            className="bg-gray-50 rounded-lg p-4 flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-800">{improvement.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                                improvement.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                                improvement.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                                {improvement.priority}
                            </span>
                            </div>
                            <p className="text-gray-600 text-sm flex-grow">{improvement.description}</p>
                        </div>
                        ))}
                    </div>
                    </div>

                    {/* Metadata */}
                    <div className="text-xs text-gray-500 mt-4 space-y-1">
                    <p>Analysis Version: {analysis.metadata.analysisVersion}</p>
                    <p>Model: {analysis.metadata.modelUsed}</p>
                    <p>Generated: {new Date(analysis.metadata.timestamp).toLocaleString()}</p>
                    </div>

                    <button
                    onClick={() => setAnalysis(null)}
                    className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors mt-4"
                    >
                    Analyse Again
                    </button>
                </div>
                )}
            </div>
      </div>
    </div>
  );
}

