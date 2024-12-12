import React from 'react';
import { Edit, Save, Lightbulb, X } from 'lucide-react';

interface MealActionsProps {
  onEdit: () => void;
  onSave: () => void;
  onSuggestions: () => void;
  isEditing: boolean;
  onCancelEdit?: () => void;
}

const MealActions: React.FC<MealActionsProps> = ({ 
  onEdit, 
  onSave, 
  onSuggestions, 
  isEditing,
  onCancelEdit 
}) => {
  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 border mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        <button 
          onClick={isEditing ? onCancelEdit : onEdit}
          className={`flex items-center justify-center w-full gap-2 px-3 sm:px-4 py-2.5 rounded-lg transition-all text-sm md:text-base font-medium ${
            isEditing 
              ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100' 
              : 'bg-white border border-gray-200 hover:bg-gray-50'
          }`}
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4 sm:mr-1" />
              <span className="sm:inline">Cancel Edit</span>
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 sm:mr-1" />
              <span className="sm:inline">Edit Meal</span>
            </>
          )}
        </button>

        <button 
          onClick={onSave}
          disabled={isEditing}
          className="flex items-center justify-center w-full gap-2 px-3 sm:px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all text-sm md:text-base font-medium"
        >
          <Save className="h-4 w-4 sm:mr-1" />
          <span className="sm:inline">Save Meal</span>
        </button>

        <button 
          onClick={onSuggestions}
          disabled={isEditing}
          className="flex items-center justify-center w-full gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-blue-150 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm md:text-base font-medium"
        >
          <Lightbulb className="h-4 w-4 sm:mr-1" />
          <span className="sm:inline">Get Suggestions</span>
        </button>
      </div>
    </div>
  );
};

export default MealActions;