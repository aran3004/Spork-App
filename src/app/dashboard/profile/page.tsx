'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User, Mail, Scale, Target } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 border-b pb-4">
              <User className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">John Doe</p>
              </div>
            </div>
            <div className="flex items-center gap-4 border-b pb-4">
              <Mail className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">john@example.com</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 border-b pb-4">
              <Scale className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Current Weight</p>
                <p className="font-medium">75 kg</p>
              </div>
            </div>
            <div className="flex items-center gap-4 border-b pb-4">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Target Weight</p>
                <p className="font-medium">70 kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}