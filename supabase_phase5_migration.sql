-- 11. Create Project Members Table (For Collaboration)
CREATE TABLE project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'editor',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);

-- Enable RLS
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Project Members RLS: 
-- 1. Project owners can see/manage members
-- 2. Members can see themselves
CREATE POLICY "Project owners can manage members" ON project_members 
  FOR ALL USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can view their memberships" ON project_members 
  FOR SELECT USING (user_id = auth.uid());

-- Update existing RLS policies to allow project members to access resources

-- Projects: Also visible/editable if you are a member
CREATE POLICY "Members can view shared projects" ON projects
  FOR SELECT USING (
    id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );
  
CREATE POLICY "Members can edit shared projects" ON projects
  FOR UPDATE USING (
    id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );

-- Prompt Templates: Visible/editable by project members
CREATE POLICY "Members can view shared templates" ON prompt_templates
  FOR SELECT USING (
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can insert shared templates" ON prompt_templates
  FOR INSERT WITH CHECK (
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can update shared templates" ON prompt_templates
  FOR UPDATE USING (
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );

-- Prompt Versions: Visible/editable by project members
CREATE POLICY "Members can view shared versions" ON prompt_versions
  FOR SELECT USING (
    template_id IN (SELECT id FROM prompt_templates WHERE project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "Members can insert shared versions" ON prompt_versions
  FOR INSERT WITH CHECK (
    template_id IN (SELECT id FROM prompt_templates WHERE project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid()))
  );

-- Add real-time publication for prompt editing
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
-- We need to enable realtime on the prompt_versions or we can just use Supabase Broadcast channels which don't require table replication.
-- For Yjs + Supabase, we usually use Supabase Broadcast channels, so no table replication needed.
