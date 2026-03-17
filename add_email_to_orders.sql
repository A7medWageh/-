-- ===== DATABASE SCHEMA UPDATES =====

-- 1. Add email field to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- 2. Update the messages table to store replies
ALTER TABLE messages ADD COLUMN IF NOT EXISTS admin_reply TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS replied_by UUID REFERENCES admin_users(id);

-- 3. Update RLS policies for messages
DROP POLICY IF EXISTS "Public can create messages" ON messages;
DROP POLICY IF EXISTS "Admins can manage messages" ON messages;
DROP POLICY IF EXISTS "Admins can view messages" ON messages;
DROP POLICY IF EXISTS "Admins can update messages" ON messages;

-- 4. Recreate policies for messages
CREATE POLICY "Public can create messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view messages" ON messages FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
CREATE POLICY "Admins can update messages" ON messages FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- ===== NOTES =====
-- After running these SQL commands:
-- 1. Install nodemailer: npm install nodemailer @types/nodemailer
-- 2. Add Gmail credentials to .env.local:
--    - GMAIL_USER=your-email@gmail.com
--    - GMAIL_PASSWORD=your-app-specific-password
--    - NEXT_PUBLIC_BASE_URL=http://localhost:3000
-- 3. When admin changes order status to "confirmed", email is sent to customer
