import React from 'react';
import { BottomNav } from './BottomNav';
import { Outlet } from 'react-router-dom';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 transition-colors duration-300">

      {/* Main Content Area - Strictly Mobile */}
      {/* pb-24 padding protects the content from being hidden by the fixed bottom nav */}
      <main className="pb-24 min-h-[100vh]">
        <div className="w-full px-2 sm:px-4 py-6 animate-in fade-in duration-300">
          <Outlet />
        </div>
      </main>

      {/* Thumb-Driven Bottom Nav (Mobile First) */}
      <BottomNav />
    </div>
  );
};