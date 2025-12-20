import { X } from 'lucide-react';

interface ActiveFiltersProps {
  filterType: string;
  searchQuery: string;
  onClearFilterType: () => void;
}

export default function ActiveFilters({
  filterType,
  searchQuery,
  onClearFilterType,
}: ActiveFiltersProps) {
  if (!filterType && !searchQuery) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filterType && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
          Type: {filterType} 
          <button onClick={onClearFilterType} className="ml-2 hover:text-red-500">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
        Sort: Newest First 
        <button className="ml-2 hover:text-red-500">
          <X className="w-3 h-3" />
        </button>
      </span>
    </div>
  );
}
