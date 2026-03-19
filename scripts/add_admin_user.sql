-- Add new admin user
INSERT INTO admin_users (id, email, role) 
VALUES (
  '855412ab-ea64-4196-8956-dbeec6fc2b46'::uuid,
  'emil578jvcvn@gmail.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET 
  email = 'emil578jvcvn@gmail.com',
  role = 'admin';
