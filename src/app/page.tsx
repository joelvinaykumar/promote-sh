'use client';

import React, { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import RightSidebar from '@/components/RightSidebar';
import ThemeToggle from '@/components/ThemeToggle';
import { Category, UserStats, WorkLog } from '@/types/database';
import { useWorkLogs } from '@/hooks/useWorkLogs';

export default function Home() {
  const { logs, addLog } = useWorkLogs();

  const [stats] = useState<UserStats>({
    totalLogs: 119,
    totalHours: 217,
    thisWeekLogs: 18,
    categoriesCount: 6,
    streak: 8
  });

  const [categories] = useState<Category[]>([
    { id: '1', name: 'Bug', emoji: '🪲', entries: 22, hours: 32.0 },
    { id: '2', name: 'Feature', emoji: '✨', entries: 18, hours: 30.0 },
    { id: '3', name: 'Review', emoji: '👀', entries: 21, hours: 37.0 },
    { id: '4', name: 'Meeting', emoji: '📅', entries: 13, hours: 18.0 }
  ]);

  // Use useMemo to handle mock logs fallback without cascading renders
  const displayLogs = useMemo(() => {
    if (logs.length > 0) {
      return logs;
    }
    // Mock logs for visualization if supabase returns empty
    return [
      {
        id: '1',
        created_at: '5h ago',
        user_id: 'user1',
        content: 'Client demo and feedback',
        category: 'Meeting',
        duration: 1,
        date: '2025-07-17',
        tags: ['planning']
      } as WorkLog,
      {
        id: '2',
        created_at: '7h ago',
        user_id: 'user1',
        content: 'Fix authentication token refresh race condition',
        category: 'Bug',
        duration: 2.5,
        date: '2025-07-17',
        tags: ['security', 'urgent']
      } as WorkLog
    ];
  }, [logs]);

  const handlePostLog = (content: string) => {
    addLog(content);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar stats={stats} categories={categories} />
      <MainContent stats={stats} logs={displayLogs} onPostLog={handlePostLog} />
      <RightSidebar />
      <ThemeToggle />
    </div>
  );
}
