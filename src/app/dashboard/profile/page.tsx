
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Target, List, Utensils, Heart, Settings, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { PreferencesCollection } from '@/components/PreferencesCollection';

interface UserPreferences {
  primary_goals: string[];
  dietary_restrictions: string[];
  health_focus: string[];
  meal_preferences: string[];
  custom_notes: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPreferencesUpdate, setShowPreferencesUpdate] = useState(false);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: preferencesData, error } = await supabase
        .from('user_preferences')
        .select('primary_goals, dietary_restrictions, health_focus, meal_preferences, custom_notes')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setPreferences(preferencesData);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  useEffect(() => {
    const loadUserAndPreferences = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        setUser(user);

        if (user) {
          await loadPreferences();
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        loadPreferences();
      } else {
        setUser(null);
        setPreferences(null);
      }
    });

    loadUserAndPreferences();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (showPreferencesUpdate) {
    return (
      <PreferencesCollection 
        onComplete={() => {
          setShowPreferencesUpdate(false);
          loadPreferences(); // Reload preferences after update
        }} 
      />
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Profile Header */}
      <div className="flex items-center space-x-4 pb-6 border-b">
        <div className="bg-blue-500 rounded-full p-6 relative">
          <User className="h-8 w-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{user?.user_metadata?.full_name || 'Your Profile'}</h1>
          <p className="text-gray-500">{user?.email}</p>
        </div>
      </div>
      
      <div className="grid gap-6">
        {/* Preferences Section with Improved Styling */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl">Your Preferences</CardTitle>
                <p className="text-sm text-gray-500">
                  Customise your dietary and health preferences
                </p>
              </div>
              <Button
                onClick={() => setShowPreferencesUpdate(true)}
                variant="outline"
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 hover:border-blue-300 transition-all duration-200 group"
              >
                <Settings className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                Update
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Primary Goals Card */}
              <div className="rounded-xl border border-blue-100 bg-gradient-to-b from-blue-50 to-transparent p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-blue-500 rounded-full p-2 shadow-sm">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-medium text-blue-900">Primary Goals</h3>
                </div>
                <div className="space-y-2">
                  {preferences?.primary_goals?.map((goal, index) => (
                    <div 
                      key={index} 
                      className="bg-white border border-blue-100 rounded-lg py-2 px-3 text-sm shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      {goal}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dietary Restrictions Card */}
              <div className="rounded-xl border border-red-100 bg-gradient-to-b from-red-50 to-transparent p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-red-500 rounded-full p-2 shadow-sm">
                    <List className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-medium text-red-900">Dietary Restrictions</h3>
                </div>
                <div className="space-y-2">
                  {preferences?.dietary_restrictions?.map((restriction, index) => (
                    <div 
                      key={index} 
                      className="bg-white border border-red-100 rounded-lg py-2 px-3 text-sm shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      {restriction}
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Focus Card */}
              <div className="rounded-xl border border-green-100 bg-gradient-to-b from-green-50 to-transparent p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-green-500 rounded-full p-2 shadow-sm">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-medium text-green-900">Health Focus</h3>
                </div>
                <div className="space-y-2">
                  {preferences?.health_focus?.map((focus, index) => (
                    <div 
                      key={index} 
                      className="bg-white border border-green-100 rounded-lg py-2 px-3 text-sm shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      {focus}
                    </div>
                  ))}
                </div>
              </div>

              {/* Meal Preferences Card */}
              <div className="rounded-xl border border-purple-100 bg-gradient-to-b from-purple-50 to-transparent p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-purple-500 rounded-full p-2 shadow-sm">
                    <Utensils className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-medium text-purple-900">Meal Preferences</h3>
                </div>
                <div className="space-y-2">
                  {preferences?.meal_preferences?.map((pref, index) => (
                    <div 
                      key={index} 
                      className="bg-white border border-purple-100 rounded-lg py-2 px-3 text-sm shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      {pref}
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Notes Section */}
              {preferences?.custom_notes && (
                <div className="rounded-xl border border-amber-100 bg-gradient-to-b from-amber-50 to-transparent p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-amber-500 rounded-full p-2 shadow-sm">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-medium text-amber-900">Additional Information</h3>
                  </div>
                  <div className="bg-white border border-amber-100 rounded-lg p-4 text-sm shadow-sm">
                    {preferences.custom_notes}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


{/* Health Goals Card */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Scale className="h-5 w-5 text-green-500" />
              Health Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Current Weight</p>
              <p className="text-2xl font-semibold">
                {user?.user_metadata?.current_weight 
                  ? `${user.user_metadata.current_weight} kg` 
                  : 'Not set'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Target Weight</p>
              <p className="text-2xl font-semibold">
                {user?.user_metadata?.target_weight 
                  ? `${user.user_metadata.target_weight} kg` 
                  : 'Not set'}
              </p>
            </div>
          </CardContent>
        </Card> */}

// 'use client';

// import React from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { User, Mail, Scale, Target } from 'lucide-react';

// export default function ProfilePage() {
//   return (
//     <div className="space-y-6">
//       <h1 className="text-3xl font-bold">Profile</h1>
      
//       <div className="grid md:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Personal Information</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex items-center gap-4 border-b pb-4">
//               <User className="h-5 w-5 text-blue-500" />
//               <div>
//                 <p className="text-sm text-gray-500">Name</p>
//                 <p className="font-medium">John Doe</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-4 border-b pb-4">
//               <Mail className="h-5 w-5 text-blue-500" />
//               <div>
//                 <p className="text-sm text-gray-500">Email</p>
//                 <p className="font-medium">john@example.com</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Health Goals</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex items-center gap-4 border-b pb-4">
//               <Scale className="h-5 w-5 text-green-500" />
//               <div>
//                 <p className="text-sm text-gray-500">Current Weight</p>
//                 <p className="font-medium">75 kg</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-4 border-b pb-4">
//               <Target className="h-5 w-5 text-green-500" />
//               <div>
//                 <p className="text-sm text-gray-500">Target Weight</p>
//                 <p className="font-medium">70 kg</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }