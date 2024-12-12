'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Loader2, PieChart } from 'lucide-react';
import MealActions from '@/components/ui/MealActions';

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

interface EditState {
  isEditing: boolean;
  originalTranscript: string;
  originalNutritionData: NutritionData | null;
}

export default function SimpleVoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [editState, setEditState] = useState<EditState>({
    isEditing: false,
    originalTranscript: '',
    originalNutritionData: null
  });

  // Key change: setupRecognition takes editState as a parameter
  const setupRecognition = (currentEditState: EditState) => {
    const windowWithSpeech = window as unknown as IWindow;
    const SpeechRecognition = windowWithSpeech.webkitSpeechRecognition || windowWithSpeech.SpeechRecognition;
    
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      
      recognitionInstance.onresult = (event: any) => {
        const current = event.resultIndex;
        const newTranscriptText = event.results[current][0].transcript;
        
        console.log('New speech detected:', newTranscriptText);
        // Now we pass the current editState
        processTranscript(newTranscriptText, currentEditState);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
        setError(event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        if (isListening) {
          recognitionInstance.start();
        }
      };

      return recognitionInstance;
    }
    
    setError('Speech recognition is not supported in this browser.');
    return null;
  };

  // Update recognition instance when edit state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const recognitionInstance = setupRecognition(editState);
      setRecognition(recognitionInstance);
    }
  }, [editState.isEditing]); // Now depends on editState.isEditing

  // Modified to take editState as a parameter
  const processTranscript = async (text: string, currentEditState: EditState) => {
    if (!text.trim()) {
      setError('Please provide a meal description');
      return;
    }
    
    setIsProcessing(true);
    console.log('Processing transcript:', text);
    console.log('Is editing:', currentEditState.isEditing);
    console.log('Original meal:', currentEditState.originalTranscript);
    
    try {
      const payload = {
        mealDescription: text,
        isEditing: currentEditState.isEditing,
        originalMeal: currentEditState.isEditing ? currentEditState.originalTranscript : undefined
      };

      console.log('Request payload:', payload);

      const response = await fetch('/api/voice-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process transcript');
      }
      
      if (data.nutrition) {
        setNutritionData(data.nutrition);
        if (currentEditState.isEditing) {
          // For edits, append the modification to the original transcript
          setTranscript(`${currentEditState.originalTranscript} (Modified: ${text})`);
        } else {
          // For new meals, just set the transcript
          setTranscript(text);
        }
      } else {
        throw new Error('No nutrition data received');
      }

    } catch (err) {
      console.error('Error processing transcript:', err);
      setError(err instanceof Error ? err.message : 'Failed to process transcript');
    } finally {
      setIsProcessing(false);
      if (currentEditState.isEditing) {
        // Reset edit state after processing
        setEditState({
          isEditing: false,
          originalTranscript: '',
          originalNutritionData: null
        });
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      if (!editState.isEditing) {
        setTranscript('');
        setNutritionData(null);
      }
      setError(null);
      recognition?.start();
      setIsListening(true);
    }
  };

  const handleEdit = () => {
    if (!transcript || !nutritionData) {
      setError('No meal data to edit');
      return;
    }
    
    console.log('Starting edit mode with transcript:', transcript);
    
    const newEditState = {
      isEditing: true,
      originalTranscript: transcript,
      originalNutritionData: nutritionData
    };
    
    // Set edit state first
    setEditState(newEditState);
    
    // Clear any existing error
    setError(null);
    
    // Start listening after setting edit state
    setTimeout(() => {
      if (recognition) {
        // Recreate recognition with new edit state
        const newRecognition = setupRecognition(newEditState);
        setRecognition(newRecognition);
        newRecognition?.start();
        setIsListening(true);
      }
    }, 0);
  };

  const handleCancelEdit = () => {
    if (isListening && recognition) {
      recognition.stop();
    }
    
    setIsListening(false);
    setError(null);
    
    // Restore original data
    setTranscript(editState.originalTranscript);
    setNutritionData(editState.originalNutritionData);
    
    // Reset edit state
    setEditState({
      isEditing: false,
      originalTranscript: '',
      originalNutritionData: null
    });
  };

  const handleSave = () => {
    console.log('Saving meal:', { transcript, nutritionData });
  };
  
  const handleSuggestions = () => {
    console.log('Getting suggestions for:', { transcript, nutritionData });
  };

  const calculateMacroPercentages = (data: NutritionData) => {
    const total = data.protein_content + data.carbohydrate_content + data.fat_content;
    return {
      protein: Math.round((data.protein_content / total) * 100),
      carbs: Math.round((data.carbohydrate_content / total) * 100),
      fat: Math.round((data.fat_content / total) * 100)
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-white shadow-lg max-w-4xl mx-auto">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-6">
            {/* Voice Input Section with added top padding */}
            <div className="flex flex-col items-center gap-4 pb-6 border-b pt-6">
              <Button
                onClick={toggleListening}
                size="lg"
                className={`rounded-full w-16 h-16 ${
                  isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                }`}
                disabled={isProcessing}
              >
                {isListening ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
              
              <p className="text-base md:text-lg font-medium flex items-center gap-2 text-center">
                {isListening ? 'Listening...' : 'Click to log meal'}
                {isProcessing && (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                )}
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 md:p-4 mx-2 md:mx-4">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Transcript Display */}
            {transcript && (
              <div className="bg-gray-50 rounded-lg p-3 md:p-4 mx-2 md:mx-4">
                <h3 className="font-medium text-gray-700 mb-2">Logged Meal</h3>
                <p className="text-gray-600 text-sm md:text-base">{transcript}</p>
              </div>
            )}

            {/* Nutrition Data Display */}
            {nutritionData && (
              <div className="space-y-4 md:space-y-6 mx-2 md:mx-4">
                {/* Calories and Macros Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Calories Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-800 mb-1">Total Calories</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-blue-900">
                          {nutritionData.total_calories}
                        </h2>
                      </div>
                      <PieChart className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
                    </div>
                  </div>

                  {/* Macros Distribution */}
                  <div className="bg-white rounded-xl p-4 md:p-6 border">
                    <p className="text-sm font-medium text-gray-600 mb-3">Macronutrients</p>
                    <div className="space-y-3">
                      {/* Protein Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs md:text-sm">
                          <span>Protein</span>
                          <span>{nutritionData.protein_content}g</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${(nutritionData.protein_content / (nutritionData.protein_content + nutritionData.carbohydrate_content + nutritionData.fat_content)) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Carbs Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs md:text-sm">
                          <span>Carbs</span>
                          <span>{nutritionData.carbohydrate_content}g</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${(nutritionData.carbohydrate_content / (nutritionData.protein_content + nutritionData.carbohydrate_content + nutritionData.fat_content)) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Fat Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs md:text-sm">
                          <span>Fat</span>
                          <span>{nutritionData.fat_content}g</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                            style={{ width: `${(nutritionData.fat_content / (nutritionData.protein_content + nutritionData.carbohydrate_content + nutritionData.fat_content)) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Fiber */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs md:text-sm">
                          <span>Fiber</span>
                          <span>{nutritionData.fiber_content}g</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${(nutritionData.fiber_content / 30) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ingredients Breakdown */}
                <div className="bg-white rounded-xl p-4 md:p-6 border">
                  <h3 className="text-base md:text-lg font-medium text-gray-800 mb-4">Ingredients</h3>
                  <div className="space-y-3">
                    {nutritionData.ingredients.map((ingredient, index) => (
                      <div 
                        key={index} 
                        className="flex flex-col md:flex-row md:justify-between md:items-center p-3 bg-gray-50 rounded-lg gap-2"
                      >
                        <div>
                          <p className="font-medium text-sm md:text-base">
                            {ingredient.ingredient} {ingredient.weight}
                          </p>
                          <p className="text-xs md:text-sm text-gray-500">
                            {ingredient.calories} calories
                          </p>
                        </div>
                        <div className="text-xs md:text-sm text-gray-600 flex gap-3">
                          <span>P: {ingredient.protein}g</span>
                          <span>C: {ingredient.carbohydrates}g</span>
                          <span>F: {ingredient.fat}g</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <MealActions 
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onSuggestions={handleSuggestions}
                  isEditing={editState.isEditing}
                  onCancelEdit={handleCancelEdit}
                />
                {editState.isEditing && (
                  <div className="mt-4 bg-blue-50 text-blue-800 p-4 rounded-lg">
                    <p className="text-sm">Listening for meal modifications...</p>
                    <p className="text-xs mt-2 text-blue-600">
                      Try saying things like "change the flour to 50g" or "add a serving of mayo"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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