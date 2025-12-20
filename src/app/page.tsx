"use client";

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-sans transition-colors duration-200">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 pt-6 pb-8 bg-background-light dark:bg-background-dark">
          <div className="w-5xl min-w-5xl max-w-5xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">&nbsp;</h1>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
