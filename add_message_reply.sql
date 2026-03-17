-- Add reply column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS admin_reply TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS replied_by UUID REFERENCES admin_users(id);

-- Update RLS policies for messages
DROP POLICY IF EXISTS "Public can create messages" ON messages;
DROP POLICY IF EXISTS "Admins can manage messages" ON messages;
DROP POLICY IF EXISTS "Admins can view messages" ON messages;
DROP POLICY IF EXISTS "Admins can update messages" ON messages;

-- Recreate policies
CREATE POLICY "Public can create messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view messages" ON messages FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
CREATE POLICY "Admins can update messages" ON messages FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));