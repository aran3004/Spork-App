'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Loader2, PieChart, ChevronDown, ChevronUp, Lightbulb, Save } from 'lucide-react';

interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

interface Ingredient {
  ingredient: string;
  weight: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

interface NutritionData {
  carbohydrate_content: number;
  fat_content: number;
  fiber_content: number;
  protein_content: number;
  total_calories: number;
  ingredients: Ingredient[];
}

export default function SimpleVoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [showIngredients, setShowIngredients] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [finalTranscripts, setFinalTranscripts] = useState<string[]>([]);
  const [micPermission, setMicPermission] = useState<PermissionState>('prompt');
  const [isInitializing, setIsInitializing] = useState(true);

  const initializeMicrophone = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setMicPermission(permission.state);
      setIsInitializing(false);
  
      permission.addEventListener('change', () => {
        setMicPermission(permission.state);
      });
  
      if (permission.state === 'granted') {
        setupRecognition();
      }
    } catch (err) {
      console.error('Error checking microphone permission:', err);
      setIsInitializing(false);
    }
  };

  const setupRecognition = useCallback(() => {
    const windowWithSpeech = window as unknown as IWindow;
    const SpeechRecognition = windowWithSpeech.webkitSpeechRecognition || windowWithSpeech.SpeechRecognition;
    
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      
      recognitionInstance.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        const isFinal = event.results[current].isFinal;
        
        if (isFinal) {
          setFinalTranscripts(prev => [...prev, transcript.trim()]);
          setCurrentTranscript('');
        } else {
          setCurrentTranscript(transcript);
        }
      };
  
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
        setError(event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        if (isListening) {
          try {
            recognitionInstance.start();
          } catch (err) {
            console.error('Error restarting recognition:', err);
          }
        }
      };
  
      setRecognition(recognitionInstance);
      return recognitionInstance;
    }
    
    setError('Speech recognition is not supported in this browser.');
    return null;
  }, [isListening]);

  useEffect(() => {
    initializeMicrophone();
  }, []);

  const startListening = () => {
    if (!recognition) return;
    
    setError(null);
    setIsListening(true);
    setCurrentTranscript('');
    setFinalTranscripts([]);
    
    try {
      recognition.start();
    } catch (err) {
      console.error('Recognition start error:', err);
    }
  };

  const stopListening = async () => {
    if (!recognition) return;
    
    recognition.stop();
    setIsListening(false);
    
    const fullTranscript = [...finalTranscripts, currentTranscript]
      .filter(Boolean)
      .join(' ')
      .trim();
    
    if (fullTranscript) {
      console.log('Processing full transcript:', fullTranscript);
      await processTranscript(fullTranscript);
    }
    
    setCurrentTranscript('');
    setFinalTranscripts([]);
  };

  const processTranscript = async (text: string) => {
    if (!text.trim()) {
      setError('Please provide a meal description');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const payload = {
        mealDescription: text,
        isEditing: nutritionData !== null,
        originalMeal: nutritionData !== null ? transcript : undefined
      };

      const response = await fetch('/api/voice-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process transcript');
      }
      
      if (data.nutrition) {
        setNutritionData(data.nutrition);
        setTranscript(text);
      } else {
        throw new Error('No nutrition data received');
      }

    } catch (err) {
      console.error('Error processing transcript:', err);
      setError(err instanceof Error ? err.message : 'Failed to process transcript');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    console.log('Saving meal:', { transcript, nutritionData });
    // After saving, you might want to reset the state to allow for a new meal
    setTranscript('');
    setNutritionData(null);
  };
  
  const handleSuggestions = () => {
    console.log('Getting suggestions for:', { transcript, nutritionData });
  };

  const MicrophonePermissionRequest = () => {
    const requestPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setupRecognition();
        setMicPermission('granted');
      } catch (err) {
        console.error('Error requesting microphone permission:', err);
        setMicPermission('denied');
      }
    };
  
    return (
      <div className="flex flex-col items-center gap-4">
        <Button
          onClick={requestPermission}
          size="lg"
          className="rounded-full w-16 h-16 bg-blue-500 active:bg-blue-600 transition-all duration-300"
        >
          <Mic className="h-6 w-6" />
        </Button>
        
        {micPermission === 'denied' ? (
          <p className="text-red-500 text-sm text-center max-w-xs">
            Microphone access is blocked. Please enable it in your browser settings to use voice input.
          </p>
        ) : (
          <p className="text-gray-700 text-sm text-center">
            Click to enable microphone
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-2 py-4">
      <Card className="bg-white shadow-lg">
        <CardContent className="p-3">
          <div className="flex flex-col gap-4">
            {/* Voice Input Section */}
            <div className="flex flex-col items-center gap-4 pb-6 border-b pt-6">
              {micPermission !== 'granted' ? (
                <MicrophonePermissionRequest />
              ) : (
                <>
                  <div className="relative">
                    {isListening && (
                      <>
                        <div className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-75" />
                        <div className="absolute -inset-4 rounded-full animate-pulse bg-red-200 opacity-30" />
                        <div className="absolute -inset-8 rounded-full animate-pulse bg-red-100 opacity-20" />
                      </>
                    )}
                    <Button
                      onPointerDown={startListening}
                      onPointerUp={stopListening}
                      onPointerLeave={stopListening}
                      onContextMenu={(e) => e.preventDefault()}
                      size="lg"
                      className={`relative rounded-full w-16 h-16 transition-all duration-300 touch-none select-none active:scale-95 ${
                        isListening 
                          ? 'bg-red-500 active:bg-red-600 scale-110' 
                          : 'bg-blue-500 active:bg-blue-600'
                      }`}
                      disabled={isProcessing}
                      style={{ 
                        touchAction: 'none',
                        WebkitTapHighlightColor: 'transparent',
                        WebkitTouchCallout: 'none',
                        userSelect: 'none'
                      }}
                    >
                      {isListening ? (
                        <MicOff className="h-6 w-6 animate-pulse" />
                      ) : (
                        <Mic className="h-6 w-6" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex flex-col items-center gap-1">
                    <p className={`text-base font-medium flex items-center gap-2 text-center transition-colors ${
                      isListening ? 'text-red-500' : 'text-gray-700'
                    }`}>
                      {isListening 
                        ? '🎙️ Recording...' 
                        : nutritionData 
                          ? 'Press and hold to modify meal'
                          : 'Press and hold to log meal'
                      }
                    </p>
                    {isListening && (
                      <p className="text-sm text-gray-600 max-w-md text-center">
                        {finalTranscripts.join(' ')} {currentTranscript}
                      </p>
                    )}
                    {isProcessing && (
                      <span className="flex items-center gap-1 text-blue-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
  
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-2 text-sm">
                {error}
              </div>
            )}
  
            {/* Nutrition Data Display */}
            {nutritionData && (
              <div className="space-y-4">
                {/* Calories Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Total Calories</p>
                      <h2 className="text-3xl font-bold text-blue-900">
                        {nutritionData.total_calories}
                      </h2>
                    </div>
                    <PieChart className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
  
                {/* Compact Macros Display */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Protein', value: nutritionData.protein_content, color: 'bg-green-100' },
                    { label: 'Carbs', value: nutritionData.carbohydrate_content, color: 'bg-blue-100' },
                    { label: 'Fat', value: nutritionData.fat_content, color: 'bg-yellow-100' },
                    { label: 'Fiber', value: nutritionData.fiber_content, color: 'bg-purple-100' }
                  ].map((macro, index) => (
                    <div key={index} className={`${macro.color} p-2 rounded-lg`}>
                      <p className="text-xs font-medium">{macro.label}</p>
                      <p className="text-sm font-bold">{macro.value}g</p>
                    </div>
                  ))}
                </div>
  
                {/* Collapsible Ingredients Table */}
                <div className="border rounded-lg">
                  <Button
                    variant="ghost"
                    className="w-full flex justify-between items-center p-3"
                    onClick={() => setShowIngredients(!showIngredients)}
                  >
                    <span className="font-medium">Ingredients</span>
                    {showIngredients ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  
                  {showIngredients && (
                    <div className="p-2">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="border-b">
                            <tr>
                              <th className="text-left p-2">Item</th>
                              <th className="text-right p-2">Cal</th>
                              <th className="text-right p-2">P</th>
                              <th className="text-right p-2">C</th>
                              <th className="text-right p-2">F</th>
                            </tr>
                          </thead>
                          <tbody>
                            {nutritionData.ingredients.map((ingredient, index) => (
                              <tr key={index} className="border-b last:border-0">
                                <td className="p-2">
                                  <span className="font-medium">{ingredient.ingredient}</span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    {ingredient.weight}
                                  </span>
                                </td>
                                <td className="text-right p-2">{ingredient.calories}</td>
                                <td className="text-right p-2">{ingredient.protein}</td>
                                <td className="text-right p-2">{ingredient.carbohydrates}</td>
                                <td className="text-right p-2">{ingredient.fat}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
  
                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button 
                    onClick={handleSuggestions}
                    className="flex items-center justify-center w-full gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-blue-150 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm md:text-base font-medium"
                  >
                    <Lightbulb className="h-4 w-4 sm:mr-1" />
                    <span className="sm:inline">Get Suggestions</span>
                  </button>
                  
                  <button 
                    onClick={handleSave}
                    className="flex items-center justify-center w-full gap-2 px-3 sm:px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all text-sm md:text-base font-medium"
                  >
                    <Save className="h-4 w-4 sm:mr-1" />
                    <span className="sm:inline">Save Meal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

//   return (
//     <div className="container mx-auto px-2 py-4">
//       <Card className="bg-white shadow-lg">
//         <CardContent className="p-3">
//           <div className="flex flex-col gap-4">
//             {/* Voice Input Section */}
//             <div className="flex flex-col items-center gap-4 pb-6 border-b pt-6">
//               <div className="relative">
//                 {isListening && (
//                   <>
//                     <div className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-75" />
//                     <div className="absolute -inset-4 rounded-full animate-pulse bg-red-200 opacity-30" />
//                     <div className="absolute -inset-8 rounded-full animate-pulse bg-red-100 opacity-20" />
//                   </>
//                 )}
//                 <Button
//                     onPointerDown={startListening}
//                     onPointerUp={stopListening}
//                     onPointerLeave={stopListening}
//                     onContextMenu={(e) => e.preventDefault()}
//                     size="lg"
//                     className={`relative rounded-full w-16 h-16 transition-all duration-300 touch-none select-none active:scale-95 ${
//                       isListening 
//                         ? 'bg-red-500 active:bg-red-600 scale-110' 
//                         : 'bg-blue-500 active:bg-blue-600'
//                     }`}
//                     disabled={isProcessing}
//                     style={{ 
//                       touchAction: 'none',
//                       WebkitTapHighlightColor: 'transparent', // This removes the tap highlight on iOS
//                       WebkitTouchCallout: 'none', // This prevents the callout menu
//                       userSelect: 'none' // Additional prevention of selection
//                     }}
//                   >
//                   {isListening ? (
//                     <MicOff className="h-6 w-6 animate-pulse" />
//                   ) : (
//                     <Mic className="h-6 w-6" />
//                   )}
//                 </Button>
//               </div>
              
//               <div className="flex flex-col items-center gap-1">
//                 <p className={`text-base font-medium flex items-center gap-2 text-center transition-colors ${
//                   isListening ? 'text-red-500' : 'text-gray-700'
//                 }`}>
//                   {isListening 
//                     ? '🎙️ Recording...' 
//                     : nutritionData 
//                       ? 'Press and hold to modify meal'
//                       : 'Press and hold to log meal'
//                   }
//                 </p>
//                 {isListening && currentTranscript && (
//                   <p className="text-sm text-gray-600 max-w-md text-center">
//                     {currentTranscript}
//                   </p>
//                 )}
//                 {isProcessing && (
//                   <span className="flex items-center gap-1 text-blue-500">
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                     Processing...
//                   </span>
//                 )}
//               </div>
//             </div>

//             {/* Error Display */}
//             {error && (
//               <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-2 text-sm">
//                 {error}
//               </div>
//             )}

//             {/* Nutrition Data Display */}
//             {nutritionData && (
//               <div className="space-y-4">
//                 {/* Calories Card */}
//                 <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-blue-800">Total Calories</p>
//                       <h2 className="text-3xl font-bold text-blue-900">
//                         {nutritionData.total_calories}
//                       </h2>
//                     </div>
//                     <PieChart className="h-6 w-6 text-blue-500" />
//                   </div>
//                 </div>

//                 {/* Compact Macros Display */}
//                 <div className="grid grid-cols-4 gap-2 text-center">
//                   {[
//                     { label: 'Protein', value: nutritionData.protein_content, color: 'bg-green-100' },
//                     { label: 'Carbs', value: nutritionData.carbohydrate_content, color: 'bg-blue-100' },
//                     { label: 'Fat', value: nutritionData.fat_content, color: 'bg-yellow-100' },
//                     { label: 'Fiber', value: nutritionData.fiber_content, color: 'bg-purple-100' }
//                   ].map((macro, index) => (
//                     <div key={index} className={`${macro.color} p-2 rounded-lg`}>
//                       <p className="text-xs font-medium">{macro.label}</p>
//                       <p className="text-sm font-bold">{macro.value}g</p>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Collapsible Ingredients Table */}
//                 <div className="border rounded-lg">
//                   <Button
//                     variant="ghost"
//                     className="w-full flex justify-between items-center p-3"
//                     onClick={() => setShowIngredients(!showIngredients)}
//                   >
//                     <span className="font-medium">Ingredients</span>
//                     {showIngredients ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
//                   </Button>
                  
//                   {showIngredients && (
//                     <div className="p-2">
//                       <div className="overflow-x-auto">
//                         <table className="w-full text-sm">
//                           <thead className="border-b">
//                             <tr>
//                               <th className="text-left p-2">Item</th>
//                               <th className="text-right p-2">Cal</th>
//                               <th className="text-right p-2">P</th>
//                               <th className="text-right p-2">C</th>
//                               <th className="text-right p-2">F</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {nutritionData.ingredients.map((ingredient, index) => (
//                               <tr key={index} className="border-b last:border-0">
//                                 <td className="p-2">
//                                   <span className="font-medium">{ingredient.ingredient}</span>
//                                   <span className="text-xs text-gray-500 ml-2">
//                                     {ingredient.weight}
//                                   </span>
//                                 </td>
//                                 <td className="text-right p-2">{ingredient.calories}</td>
//                                 <td className="text-right p-2">{ingredient.protein}</td>
//                                 <td className="text-right p-2">{ingredient.carbohydrates}</td>
//                                 <td className="text-right p-2">{ingredient.fat}</td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Simple action buttons */}
//                 {/* Action buttons */}
//                 <div className="flex flex-col sm:flex-row gap-2">
//                   <button 
//                     onClick={handleSuggestions}
//                     className="flex items-center justify-center w-full gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-blue-150 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm md:text-base font-medium"
//                   >
//                     <Lightbulb className="h-4 w-4 sm:mr-1" />
//                     <span className="sm:inline">Get Suggestions</span>
//                   </button>
                  
//                   <button 
//                     onClick={handleSave}
//                     className="flex items-center justify-center w-full gap-2 px-3 sm:px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all text-sm md:text-base font-medium"
//                   >
//                     <Save className="h-4 w-4 sm:mr-1" />
//                     <span className="sm:inline">Save Meal</span>
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// 'use client';

// import React, { useState, useEffect } from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Mic, MicOff, Settings, Info, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
// import { supabase } from '@/lib/supabase';

// interface SpeechRecognitionEvent extends Event {
//   resultIndex: number;
//   results: SpeechRecognitionResultList;
// }

// interface SpeechRecognitionError extends Event {
//   error: string;
//   message: string;
// }

// interface IWindow extends Window {
//   webkitSpeechRecognition: any;
//   SpeechRecognition: any;
// }

// interface Conversation {
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: Date;
//   analysis?: MealAnalysis;
// }

// interface MealAnalysis {
//   score: number;
//   improvements: Array<{
//     title: string;
//     description: string;
//     priority: 'HIGH' | 'MEDIUM' | 'LOW';
//   }>;
//   analysis: {
//     nutritionalValue: string;
//     calorieEstimate: string;
//     macroBreakdown: {
//       proteins: string;
//       carbs: string;
//       fats: string;
//     };
//   };
// }

// export default function VoiceAssistantPage() {
//   const [isListening, setIsListening] = useState(false);
//   const [conversations, setConversations] = useState<Conversation[]>([]);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [recognition, setRecognition] = useState<any>(null);
//   const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);
//   const [userPreferences, setUserPreferences] = useState<any>(null);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [voiceEnabled, setVoiceEnabled] = useState(true);
//   const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
//   const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

//   // Initialize speech synthesis and load voices
//   // Initialize speech synthesis and load voices
//   useEffect(() => {
//     const loadVoices = () => {
//       console.log('Loading voices...');
//       const voices = window.speechSynthesis.getVoices();
//       console.log('Available voices:', voices);
      
//       setAvailableVoices(voices);
  
//       // Don't automatically set a voice - let the browser use its default
//       setVoiceEnabled(true);
//     };
  
//     // Load voices immediately if available
//     loadVoices();
    
//     // Also handle the voiceschanged event
//     window.speechSynthesis.onvoiceschanged = loadVoices;
//     setTimeout(() => {
//         speak('Hello, I am the Nosh assistant');
//       }, 1000);
//     return () => {
//       window.speechSynthesis.onvoiceschanged = null;
//     };
//   }, []);

//   const speak = async (text: string) => {
//     console.log('Attempting to speak:', text);
//     console.log('Voice enabled:', voiceEnabled);
//     console.log('Selected voice:', selectedVoice);
  
//     if (!voiceEnabled) {
//       console.log('Voice is disabled');
//       return;
//     }
  
//     // Make sure speech synthesis is ready
//     if (window.speechSynthesis.speaking) {
//       window.speechSynthesis.cancel();
//     }
  
//     // Create a new utterance each time
//     const utterance = new SpeechSynthesisUtterance(text);
    
//     // Wait for voices to load if they haven't yet
//     if (window.speechSynthesis.getVoices().length === 0) {
//       await new Promise(resolve => {
//         window.speechSynthesis.onvoiceschanged = resolve;
//       });
//     }
  
//     // Use default voice if none selected
//     const voices = window.speechSynthesis.getVoices();
//     const defaultVoice = voices.find(voice => voice.default) || voices[0];
//     utterance.voice = defaultVoice;
  
//     utterance.rate = 1;
//     utterance.pitch = 1;
//     utterance.volume = 1;
  
//     utterance.onstart = () => {
//       console.log('Started speaking');
//       setIsSpeaking(true);
//     };
  
//     utterance.onend = () => {
//       console.log('Finished speaking');
//       setIsSpeaking(false);
//     };
  
//     utterance.onerror = (event) => {
//       console.error('Speech synthesis error:', event);
//       setIsSpeaking(false);
//     };
  
//     // Try to speak
//     try {
//       window.speechSynthesis.speak(utterance);
//     } catch (error) {
//       console.error('Error during speech synthesis:', error);
//     }
//   };

//   // Fetch user preferences
//   useEffect(() => {
//     const fetchUserPreferences = async () => {
//       try {
//         const { data: { user } } = await supabase.auth.getUser();
//         if (!user) return;

//         const { data: preferences } = await supabase
//           .from('user_preferences')
//           .select('*')
//           .eq('user_id', user.id)
//           .single();

//         if (preferences) {
//           setUserPreferences(preferences);
//         }
//       } catch (error) {
//         console.error('Error fetching preferences:', error);
//       }
//     };

//     fetchUserPreferences();
//   }, []);

//   const processMessage = async (text: string) => {
//     setIsProcessing(true);
    
//     const userMessage: Conversation = {
//       role: 'user',
//       content: text,
//       timestamp: new Date()
//     };
    
//     setConversations(prev => [...prev, userMessage]);

//     try {
//       const messages = conversations
//         .concat(userMessage)
//         .map(({ role, content }) => ({
//           role,
//           content
//         }));

//       const response = await fetch('/api/voice-chat', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 
//           messages,
//           userPreferences 
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to get response');
//       }

//       const data = await response.json();
      
//       // Add assistant's response to conversation
//       setConversations(prev => [...prev, {
//         role: 'assistant',
//         content: data.response,
//         timestamp: new Date(),
//         analysis: data.analysis
//       }]);

//       // Speak the response
//       speak(data.response);

//     } catch (err) {
//       console.error('Error processing message:', err);
//       setError('Failed to process message. Please try again.');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   useEffect(() => {
//     if (conversations.length === 0) {
//       setConversations([{
//         role: 'assistant',
//         content: "Hello! I'm your Nosh assistant. How can I help you track your nutrition today? Try saying 'log meal' followed by what you ate.",
//         timestamp: new Date()
//       }]);
//     }

//     if (typeof window !== 'undefined') {
//       const windowWithSpeech = window as unknown as IWindow;
//       const SpeechRecognition = windowWithSpeech.webkitSpeechRecognition || windowWithSpeech.SpeechRecognition;
      
//       if (SpeechRecognition) {
//         const recognitionInstance = new SpeechRecognition();
        
//         recognitionInstance.continuous = true;
//         recognitionInstance.interimResults = false;
        
//         recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
//           const current = event.resultIndex;
//           const transcriptText = event.results[current][0].transcript;
//           processMessage(transcriptText);
//         };

//         recognitionInstance.onerror = (event: SpeechRecognitionError) => {
//           setError(event.error);
//           setIsListening(false);
//         };

//         recognitionInstance.onend = () => {
//           setIsListening(false);
//         };

//         setRecognition(recognitionInstance);
//       } else {
//         setError('Speech recognition is not supported in this browser.');
//       }
//     }
//   }, []);

//   const toggleListening = () => {
//     if (isListening) {
//       recognition?.stop();
//       setIsListening(false);
//     } else {
//       recognition?.start();
//       setIsListening(true);
//       setError(null);
//     }
//   };

//   // Voice toggle component
//   const VoiceToggle = () => (
//     <Button
//       variant="outline"
//       size="sm"
//       onClick={() => setVoiceEnabled(!voiceEnabled)}
//       className={`${voiceEnabled ? 'bg-blue-50' : ''}`}
//     >
//       {voiceEnabled ? (
//         <span className="flex items-center gap-2">
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
//             <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
//             <line x1="12" y1="19" x2="12" y2="23"/>
//             <line x1="8" y1="23" x2="16" y2="23"/>
//           </svg>
//           Voice On
//         </span>
//       ) : (
//         <span className="flex items-center gap-2">
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <line x1="1" y1="1" x2="23" y2="23"/>
//             <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
//             <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2"/>
//             <line x1="12" y1="19" x2="12" y2="23"/>
//             <line x1="8" y1="23" x2="16" y2="23"/>
//           </svg>
//           Voice Off
//         </span>
//       )}
//     </Button>
//   );

//   const TestSpeechButton = () => (
//     <Button
//       variant="outline"
//       size="sm"
//       onClick={() => speak('Hello, I am the Nosh assistant')}
//     >
//       Test Speech
//     </Button>
//   );

//   return (
//     <div className="space-y-8">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold">Voice Assistant (Beta)</h1>
//         <div className="flex gap-2">
//           <TestSpeechButton />
//           <VoiceToggle />
//           <Button variant="outline" size="sm">
//             <Settings className="h-4 w-4 mr-2" />
//             Settings
//           </Button>
//         </div>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Info className="h-5 w-5 text-blue-500" />
//             Voice Commands
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className="text-gray-600">
//             Try these commands:
//             <br />• "Log meal" followed by what you ate
//             <br />• "What's healthy for breakfast?"
//             <br />• "Check my nutrition goals"
//           </p>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardContent className="p-6">
//           <div className="flex flex-col items-center gap-6">
//             <Button
//               onClick={toggleListening}
//               size="lg"
//               className={`rounded-full p-8 ${
//                 isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
//               }`}
//             >
//               {isListening ? (
//                 <MicOff className="h-8 w-8" />
//               ) : (
//                 <Mic className="h-8 w-8" />
//               )}
//             </Button>
            
//             <p className="text-lg font-medium">
//               {isListening ? 'Listening...' : 'Click to start'}
//               {isProcessing && (
//                 <span className="flex items-center gap-2 ml-2">
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                   Processing...
//                 </span>
//               )}
//             </p>

//             {error && (
//               <p className="text-red-500 text-sm">{error}</p>
//             )}

//             <div className="w-full max-w-2xl space-y-4 max-h-[500px] overflow-y-auto">
//               {conversations.map((conversation, index) => (
//                 <div key={index} className="space-y-2">
//                   <div
//                     className={`flex ${
//                       conversation.role === 'user' ? 'justify-end' : 'justify-start'
//                     }`}
//                   >
//                     <div
//                       className={`max-w-[80%] p-4 rounded-lg ${
//                         conversation.role === 'user'
//                           ? 'bg-blue-500 text-white'
//                           : 'bg-gray-100 text-gray-800'
//                       }`}
//                     >
//                       <p className="whitespace-pre-wrap">{conversation.content}</p>
//                       <p className="text-xs opacity-70 mt-1">
//                         {conversation.timestamp.toLocaleTimeString()}
//                       </p>
//                     </div>
//                   </div>

//                   {conversation.analysis && (
//                     <div className="ml-4">
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => setExpandedAnalysis(
//                           expandedAnalysis === `analysis-${index}` 
//                             ? null 
//                             : `analysis-${index}`
//                         )}
//                         className="text-sm text-blue-500 hover:text-blue-700"
//                       >
//                         {expandedAnalysis === `analysis-${index}` ? (
//                           <ChevronUp className="h-4 w-4 mr-2" />
//                         ) : (
//                           <ChevronDown className="h-4 w-4 mr-2" />
//                         )}
//                         {expandedAnalysis === `analysis-${index}` 
//                           ? 'Hide Analysis' 
//                           : 'Show Analysis'
//                         }
//                       </Button>

//                       {expandedAnalysis === `analysis-${index}` && (
//                         <div className="mt-2 p-4 bg-blue-50 rounded-lg space-y-4">
//                           <div className="flex items-center justify-between">
//                             <span className="font-medium">Health Score</span>
//                             <span className="text-lg font-bold text-blue-600">
//                               {conversation.analysis.score}
//                             </span>
//                           </div>

//                           <div>
//                             <h4 className="font-medium mb-2">Improvements</h4>
//                             {conversation.analysis.improvements.map((improvement, i) => (
//                               <div key={i} className="mb-2 p-2 bg-white rounded">
//                                 <div className="flex justify-between items-start mb-1">
//                                   <span className="font-medium">{improvement.title}</span>
//                                   <span className={`text-xs px-2 py-1 rounded-full ${
//                                     improvement.priority === 'HIGH' 
//                                       ? 'bg-red-100 text-red-800' 
//                                       : improvement.priority === 'MEDIUM'
//                                       ? 'bg-yellow-100 text-yellow-800'
//                                       : 'bg-green-100 text-green-800'
//                                   }`}>
//                                     {improvement.priority}
//                                   </span>
//                                 </div>
//                                 <p className="text-sm text-gray-600">
//                                   {improvement.description}
//                                 </p>
//                               </div>
//                             ))}
//                           </div>

//                           <div>
//                             <h4 className="font-medium mb-2">Nutritional Analysis</h4>
//                             <div className="space-y-2">
//                               <p className="text-sm">{conversation.analysis.analysis.nutritionalValue}</p>
//                               <p className="text-sm">{conversation.analysis.analysis.calorieEstimate}</p>
//                               <div className="grid grid-cols-3 gap-2 mt-2">
//                                 <div className="p-2 bg-white rounded">
//                                   <p className="text-xs font-medium">Proteins</p>
//                                   <p className="text-sm">{conversation.analysis.analysis.macroBreakdown.proteins}</p>
//                                 </div>
//                                 <div className="p-2 bg-white rounded">
//                                   <p className="text-xs font-medium">Carbs</p>
//                                   <p className="text-sm">{conversation.analysis.analysis.macroBreakdown.carbs}</p>
//                                 </div>
//                                 <div className="p-2 bg-white rounded">
//                                   <p className="text-xs font-medium">Fats</p>
//                                   <p className="text-sm">{conversation.analysis.analysis.macroBreakdown.fats}</p>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }