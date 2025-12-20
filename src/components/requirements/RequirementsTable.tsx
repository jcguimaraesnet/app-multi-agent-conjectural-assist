import { Eye, Trash2 } from 'lucide-react';
import { Requirement } from '@/types';
import Badge from '@/components/ui/Badge';

interface RequirementsTableProps {
  requirements: Requirement[];
}

export default function RequirementsTable({ requirements }: RequirementsTableProps) {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden border border-border-light dark:border-border-dark transition-colors duration-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-700 text-white dark:bg-gray-800/80">
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider w-24 text-center">ID</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider w-1/3">Title</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider">Type</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider">Author</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {requirements.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                <td className="px-4 py-3 text-sm font-mono text-gray-500 dark:text-gray-400 text-center align-middle">
                  {req.id}
                </td>
                <td className="px-4 py-3 align-middle">
                  <div className="font-medium text-gray-900 dark:text-white">{req.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{req.description}</div>
                </td>
                <td className="px-4 py-3 align-middle">
                  <Badge type={req.type} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 align-middle">
                  {req.author}
                </td>
                <td className="px-4 py-3 text-center align-middle">
                  <div className="flex items-center justify-center gap-1">
                    <button className="p-1.5 text-gray-400 hover:text-primary transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="flex items-center justify-between p-3 border-t border-border-light dark:border-border-dark bg-white dark:bg-surface-dark">
        <button className="flex items-center px-3 py-1.5 border border-border-light dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Previous
        </button>
        <div className="flex items-center gap-1.5">
            <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-medium">1</button>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium">2</button>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium">3</button>
            <span className="text-gray-400 px-1.5">...</span>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium">8</button>
        </div>
        <button className="flex items-center px-3 py-1.5 border border-border-light dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Next
        </button>
      </div>
    </div>
  );
}
