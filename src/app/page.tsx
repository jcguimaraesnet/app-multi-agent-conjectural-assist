"use client";

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import PageTitle from '@/components/ui/PageTitle';

export default function HomePage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-sans transition-colors duration-200">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header />
        
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 pt-6 pb-8 bg-background-light dark:bg-background-dark">
          <div className="w-5xl min-w-5xl max-w-5xl mx-auto">
            <PageTitle title="Home" />
          </div>
        </div>
      </main>
    </div>
  );
}
