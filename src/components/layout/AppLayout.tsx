"use client";

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

interface AppLayoutProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
}

const maxWidthClasses = {
  'sm': 'w-sm min-w-sm max-w-sm',
  'md': 'w-md min-w-md max-w-md',
  'lg': 'w-lg min-w-lg max-w-lg',
  'xl': 'w-xl min-w-xl max-w-xl',
  '2xl': 'w-2xl min-w-2xl max-w-2xl',
  '3xl': 'w-3xl min-w-3xl max-w-3xl',
  '4xl': 'w-4xl min-w-4xl max-w-4xl',
  '5xl': 'w-5xl min-w-5xl max-w-5xl',
  '6xl': 'w-6xl min-w-6xl max-w-6xl',
  '7xl': 'w-7xl min-w-7xl max-w-7xl',
};

export default function AppLayout({ children, maxWidth = '5xl' }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-sans transition-colors duration-200">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header />
        
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 pt-6 pb-8 bg-background-light dark:bg-background-dark">
          <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
