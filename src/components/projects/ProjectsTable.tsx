import { Download, FileText, ArrowRight } from 'lucide-react';
import { Project } from '@/types';

interface ProjectsTableProps {
  projects: Project[];
}

export default function ProjectsTable({ projects }: ProjectsTableProps) {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden border border-border-light dark:border-border-dark transition-colors duration-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-700 text-white dark:bg-gray-800/80">
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider w-24 text-center">ID</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider w-1/2">Title</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider">Author</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                <td className="px-4 py-3 text-sm font-mono text-gray-500 dark:text-gray-400 text-center align-middle">
                  {project.id}
                </td>
                <td className="px-4 py-3 align-middle">
                  <div className="font-medium text-gray-900 dark:text-white">{project.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{project.description}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 align-middle">
                  {project.author}
                </td>
                <td className="px-4 py-3 text-center align-middle">
                  <div className="flex items-center justify-center gap-1">
                    <button 
                      className="p-1.5 text-gray-400 hover:text-primary transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      title="Download Project Document"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-1.5 text-gray-400 hover:text-primary transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      title="Requirements Document"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-1.5 text-gray-400 hover:text-primary transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      title="Go to Requirements"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="flex items-center justify-center p-3 border-t border-border-light dark:border-border-dark bg-white dark:bg-surface-dark">
        <div className="flex items-center gap-1.5">
            <button className="flex items-center px-3 py-2.5 mr-[10px] border border-border-light dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Previous
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-medium">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium">2</button>
            <button className="flex items-center px-3 py-2.5 ml-[10px] border border-border-light dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Next
            </button>
        </div>
      </div>
    </div>
  );
}
