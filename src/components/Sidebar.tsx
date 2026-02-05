import React from 'react';
import { ChevronLeft, Plus } from 'lucide-react';
import { Category, UserStats } from '@/types/database';

interface SidebarProps {
  stats: UserStats;
  categories: Category[];
}

const Sidebar: React.FC<SidebarProps> = ({ stats, categories }) => {
  return (
    <aside className="w-[20%] border-r border-border-main bg-card-main flex flex-col overflow-y-auto">
      <div className="p-6 border-b border-border-main flex justify-between items-center">
        <h1 className="text-xl font-bold">Profile</h1>
        <ChevronLeft className="text-gray-400 cursor-pointer w-4 h-4" />
      </div>
      <div className="p-6">
        <div className="bg-bg-main dark:bg-slate-800/50 rounded-xl p-6 border border-border-main mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">D</div>
            <div>
              <h2 className="font-bold text-lg">Developer</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Software Engineer</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card-main p-3 rounded-lg border border-border-main">
              <p className="text-2xl font-bold">{stats.totalLogs}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Total Logs</p>
            </div>
            <div className="bg-card-main p-3 rounded-lg border border-border-main">
              <p className="text-2xl font-bold">{stats.totalHours}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Hours Logged</p>
            </div>
            <div className="bg-card-main p-3 rounded-lg border border-border-main">
              <p className="text-2xl font-bold text-primary">{stats.thisWeekLogs}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">This Week</p>
            </div>
            <div className="bg-card-main p-3 rounded-lg border border-border-main">
              <p className="text-2xl font-bold text-emerald-500">{stats.categoriesCount}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Categories</p>
            </div>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Work Categories</h3>
            <Plus className="w-4 h-4 text-slate-400 cursor-pointer" />
          </div>
          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.id} className="p-3 bg-card-main border border-border-main rounded-lg flex flex-col cursor-pointer hover:border-primary transition-colors">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm">{cat.emoji}</span>
                  <span className="font-medium text-sm">{cat.name}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>{cat.entries} entries</span>
                  <span>{cat.hours.toFixed(1)}h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
