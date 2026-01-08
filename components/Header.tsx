import React from 'react';
import { Activity, Pill } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-teal-600 p-2 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Pharma<span className="text-teal-600">Sync</span></span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Pill className="w-4 h-4" />
          <span className="hidden sm:inline">Drug Interaction Intelligence</span>
        </div>
      </div>
    </header>
  );
};
