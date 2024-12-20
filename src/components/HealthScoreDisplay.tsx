import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { InfoIcon } from 'lucide-react';

interface HealthScoreProps {
  score: number;
  notes: string[];
}

const HealthScoreDisplay: React.FC<HealthScoreProps> = ({ score, notes }) => {
  const getScoreColor = () => {
    if (score >= 80) return 'from-green-200 to-green-500';
    if (score >= 60) return 'from-yellow-200 to-yellow-500';
    return 'from-red-200 to-red-500';
  };

  const getTextColor = () => {
    if (score >= 80) return 'text-green-700';
    if (score >= 60) return 'text-yellow-700';
    return 'text-red-700';
  };

  const getRatingText = () => {
    if (score >= 90) return 'Exceptional';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Above Average';
    if (score >= 50) return 'Average';
    return 'Needs Improvement';
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-6 pt-6">
        <div className="flex items-start gap-6">
          {/* Score Circle */}
          <div className="relative flex-shrink-0">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getScoreColor()} flex items-center justify-center shadow-inner`}>
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                <div className="text-center">
                  <span className={`text-3xl font-bold ${getTextColor()}`}>
                    {score}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Health Notes */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg text-gray-900">Health Score</h3>
              <span className={`text-sm font-medium ${getTextColor()}`}>
                ({getRatingText()})
              </span>
            </div>
            
            <div className="space-y-2">
              {notes.map((note, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthScoreDisplay;