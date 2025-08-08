import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getUIText } from '../../utils/hebrewUtils';

interface CustomerFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  scoreFilter: string;
  onScoreFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
}

const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  searchTerm,
  onSearchChange,
  scoreFilter,
  onScoreFilterChange,
  sortBy,
  onSortByChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4 rtl-card">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="חיפוש לקוחות..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pr-10 pl-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 rtl-input"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={scoreFilter}
            onChange={(e) => onScoreFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 rtl-select"
          >
            <option value="all">כל הציונים</option>
            <option value="high">גבוה (80+)</option>
            <option value="good">טוב (60-79)</option>
            <option value="medium">בינוני (40-59)</option>
            <option value="low">נמוך (0-39)</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 rtl-select"
          >
            <option value="name">מיון לפי שם</option>
            <option value="createdAt">מיון לפי תאריך</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CustomerFilters; 