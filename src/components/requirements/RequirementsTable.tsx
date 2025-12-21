'use client';

import { useState } from 'react';
import { Eye, Trash2, AlertCircle } from 'lucide-react';
import { Requirement } from '@/types';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import RequirementDetailsModal from './RequirementDetailsModal';

interface RequirementsTableProps {
  requirements: Requirement[];
  isLoading?: boolean;
  error?: string | null;
  onDelete?: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function RequirementsTable({ 
  requirements, 
  isLoading = false,
  error = null,
  onDelete,
  currentPage,
  totalPages,
  onPageChange
}: RequirementsTableProps) {
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewRequirement = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequirement(null);
  };
  
  if (error) {
    return (
      <Card className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-300 text-center">{error}</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">Loading requirements...</span>
      </Card>
    );
  }

  if (requirements.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          No requirements found. Select a project to view its requirements.
        </p>
      </Card>
    );
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage, '...', totalPages);
      }
    }
    return pages;
  };

  const truncateDescription = (text: string) => {
    if (!text) return '';
    return text.length > 80 ? `${text.slice(0, 80)}...` : text;
  };

  return (
    <Card noPadding className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-700 text-white dark:bg-gray-800/80">
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider w-32 text-center">ID</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider">Description</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-center w-38">Type</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-center w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {requirements.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                <td className="px-4 py-3 text-sm font-mono text-gray-500 dark:text-gray-400 text-center align-middle">
                  {req.requirement_id}
                </td>
                <td className="px-4 py-3 align-middle">
                  <div className="text-sm text-gray-900 dark:text-white">{truncateDescription(req.description)}</div>
                </td>
                <td className="px-4 py-3 align-middle text-center">
                  <Badge type={req.type} />
                </td>
                <td className="px-4 py-3 text-center align-middle">
                  <div className="flex items-center justify-center gap-1">
                    <button 
                      className="p-1.5 text-gray-400 hover:text-primary transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      onClick={() => handleViewRequirement(req)}
                      aria-label="View requirement details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                      onClick={() => onDelete?.(req.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Requirement Details Modal */}
      <RequirementDetailsModal
        open={isModalOpen}
        requirement={selectedRequirement}
        onClose={handleCloseModal}
      />
      
      {/* Pagination Footer */}
      <div className="flex items-center justify-center p-3 border-t border-border-light dark:border-border-dark bg-white dark:bg-surface-dark">
        <div className="flex items-center gap-1.5">
            <button 
              className="flex items-center px-3 py-2.5 mr-[10px] border border-border-light dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
                Previous
            </button>
            {getPageNumbers().map((page, idx) => (
              typeof page === 'number' ? (
                <button 
                  key={idx}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium ${
                    page === currentPage 
                      ? 'bg-black dark:bg-white text-white dark:text-black' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              ) : (
                <span key={idx} className="w-8 h-8 flex items-center justify-center text-gray-400">...</span>
              )
            ))}
            <button 
              className="flex items-center px-3 py-2.5 ml-[10px] border border-border-light dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
                Next
            </button>
        </div>
      </div>
    </Card>
  );
}
