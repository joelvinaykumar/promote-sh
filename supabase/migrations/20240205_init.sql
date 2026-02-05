-- Create work_logs table
CREATE TABLE work_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID DEFAULT auth.uid(),
  content TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  duration DECIMAL DEFAULT 1.0,
  date DATE DEFAULT CURRENT_DATE,
  tags TEXT[] DEFAULT '{}'
);

-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT,
  color TEXT,
  user_id UUID DEFAULT auth.uid()
);

-- Enable RLS
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own work logs" ON work_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own work logs" ON work_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);
