-- Run these queries in the Supabase SQL Editor

-- 1. Create Profiles Table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  is_pro BOOLEAN DEFAULT FALSE,
  pro_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Usage Tracking Table
CREATE TABLE usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT,
  month TEXT,
  count INTEGER DEFAULT 0,
  UNIQUE(user_id, month),
  UNIQUE(session_id, month)
);

-- 3. Create Reports Table
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT,
  original_prompt TEXT NOT NULL,
  score INTEGER,
  verdict TEXT,
  failures JSONB,
  rewritten_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Payment Requests Table
CREATE TABLE payment_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT,
  utr_number TEXT NOT NULL,
  amount INTEGER DEFAULT 199,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: We can create trigger to insert into profiles automatically when new user registers:
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger as $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ language plpgsql security definer;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

-- Service Role Bypass (Assuming API uses Service Role key for Server Side operations like decrementing usage and storing records)
-- Alternatively, if we use anon key on client, we need RLS policies.

-- RLS: Users can only read/write their own rows
-- We'll allow anon reads/writes for anonymous requests matching session_id, but usually these are handled server side with Service Role anyway.
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can read own usage" ON usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON usage FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own reports" ON reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read reports by ID" ON reports FOR SELECT USING (true); -- needed for shareable links!
CREATE POLICY "Users can insert own reports" ON reports FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own payment requests" ON payment_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payment requests" ON payment_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Create Projects Table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Prompt Templates Table
CREATE TABLE prompt_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Prompt Versions Table
CREATE TABLE prompt_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES prompt_templates(id) ON DELETE CASCADE NOT NULL,
  prompt_text TEXT NOT NULL,
  commit_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own projects" ON projects 
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage prompt templates for own projects" ON prompt_templates 
  FOR ALL USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  ) WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage prompt versions for own templates" ON prompt_versions 
  FOR ALL USING (
    template_id IN (SELECT id FROM prompt_templates WHERE project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
  ) WITH CHECK (
    template_id IN (SELECT id FROM prompt_templates WHERE project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
  );
