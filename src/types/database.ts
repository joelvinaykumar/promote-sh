export interface Category {
  id: string;
  name: string;
  emoji: string;
  entries: number;
  hours: number;
  color?: string;
}

export interface WorkLog {
  id: string;
  created_at: string;
  user_id: string;
  content: string;
  category: string;
  duration: number; // in hours
  date: string; // ISO date string
  tags: string[];
}

export interface UserStats {
  totalLogs: number;
  totalHours: number;
  thisWeekLogs: number;
  categoriesCount: number;
  streak: number;
}
