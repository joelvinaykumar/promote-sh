'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { WorkLog, UserStats } from '@/types/database';

interface MainContentProps {
  stats: UserStats;
  logs: WorkLog[];
  onPostLog: (content: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({ stats, logs, onPostLog }) => {
  const [newLog, setNewLog] = useState('');

  const handleSubmit = () => {
    if (newLog.trim()) {
      onPostLog(newLog);
      setNewLog('');
    }
  };

  // Mock heatmap dots (7 rows x 32 columns) - stable and hydration-safe
  const heatmapRows = React.useMemo(() => {
    // Generate deterministic mock data based on index to avoid hydration mismatch
    return Array.from({ length: 7 }, (_, rowIndex) =>
      Array.from({ length: 32 }, (_, colIndex) => {
        const seed = rowIndex * 32 + colIndex;
        // Deterministic "random" pattern
        return (seed * 13) % 5;
      })
    );
  }, []);

  const days = ['Mon', 'Wed', 'Fri'];

  return (
    <main className="w-[55%] flex flex-col overflow-y-auto bg-bg-main custom-scrollbar">
      <div className="p-8 max-w-4xl mx-auto w-full">
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Activity</h2>
            <div className="flex items-center text-sm font-medium">
              <span className="text-primary mr-1">{stats.streak}</span> day streak 🔥
            </div>
          </div>
          <div className="flex flex-col space-y-4">
            <div className="flex">
              <div className="text-[10px] text-slate-400 w-8 space-y-3 pt-4">
                {days.map(day => <div key={day}>{day}</div>)}
              </div>
              <div className="contribution-grid flex-1">
                {heatmapRows.flat().map((val, idx) => (
                  <div key={idx} className={`dot dot-${val}`}></div>
                ))}
              </div>
            </div>
            <div className="flex justify-end items-center space-x-1 text-[10px] text-slate-400">
              <span>Less</span>
              <div className="dot dot-0"></div>
              <div className="dot dot-1"></div>
              <div className="dot dot-2"></div>
              <div className="dot dot-3"></div>
              <div className="dot dot-4"></div>
              <span>More</span>
            </div>
          </div>
        </div>

        <div className="border-y border-border-main py-4 flex items-center justify-between mb-10 text-xs font-mono">
          <div>Today: <span className="font-bold text-sm">3 entries</span></div>
          <div>This week: <span className="font-bold text-sm">{stats.totalHours.toFixed(1)} hours</span></div>
          <div>Total: <span className="font-bold text-sm">{stats.totalLogs} entries</span></div>
        </div>

        <div className="mb-10">
          <div className="bg-card-main border border-border-main rounded-xl overflow-hidden shadow-sm">
            <textarea
              className="w-full p-6 border-none focus:ring-0 text-lg bg-transparent placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none h-24 outline-none"
              placeholder="What did you work on today?"
              value={newLog}
              onChange={(e) => setNewLog(e.target.value)}
            ></textarea>
            <div className="p-4 border-t border-border-main flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-primary hover:bg-emerald-600 text-white font-semibold py-2 px-8 rounded-lg transition-all shadow-lg shadow-primary/20"
              >
                Post Log
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-3 overflow-x-auto pb-2">
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                className="w-full pl-9 pr-4 py-2 text-sm rounded-full border border-border-main bg-bg-main focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Search entries..."
                type="text"
              />
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-medium whitespace-nowrap">All</button>
              <button className="px-4 py-1.5 rounded-full border border-border-main bg-card-main text-xs font-medium flex items-center whitespace-nowrap"><span className="mr-1">🪲</span> Bug</button>
              <button className="px-4 py-1.5 rounded-full border border-border-main bg-card-main text-xs font-medium flex items-center whitespace-nowrap"><span className="mr-1">✨</span> Feature</button>
              <button className="px-4 py-1.5 rounded-full border border-border-main bg-card-main text-xs font-medium flex items-center whitespace-nowrap"><span className="mr-1">👀</span> Review</button>
              <button className="px-4 py-1.5 rounded-full border border-border-main bg-card-main text-xs font-medium flex items-center whitespace-nowrap"><span className="mr-1">📅</span> Meeting</button>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Today</h3>
            {logs.map(log => (
              <div key={log.id} className="bg-card-main border border-border-main rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex flex-col items-center justify-center border border-blue-100 dark:border-blue-900/30">
                    <span className="text-[8px] uppercase font-bold text-blue-500">
                      {new Date(log.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                    </span>
                    <span className="text-lg font-bold text-blue-600 leading-none">
                      {new Date(log.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{log.category}</span>
                      <span>•</span>
                      <span>{log.created_at}</span>
                    </div>
                    <h4 className="font-bold text-lg mb-3">{log.content}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-green-50 dark:bg-green-900/20 text-green-600 text-xs font-medium">{log.duration}h</span>
                      {log.tags.map(tag => (
                        <span key={tag} className="text-xs text-slate-400">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainContent;
