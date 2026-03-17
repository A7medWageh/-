-- Check current RLS policies for messages table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'messages';

-- Test if admin can update messages
-- This should be run with authenticated user context