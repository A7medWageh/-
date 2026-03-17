-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table (for role management)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin', 'support')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public read access for categories and products
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read active products" ON products FOR SELECT USING (active = true);

-- Public can create orders and messages
CREATE POLICY "Public can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create messages" ON messages FOR INSERT WITH CHECK (true);

-- Authenticated users can manage based on role
CREATE POLICY "Authenticated can read all products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert products" ON products FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role IN ('owner', 'admin'))
);
CREATE POLICY "Authenticated can update products" ON products FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role IN ('owner', 'admin'))
);
CREATE POLICY "Authenticated can delete products" ON products FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Categories management (owner only)
CREATE POLICY "Authenticated can insert categories" ON categories FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'owner')
);
CREATE POLICY "Authenticated can update categories" ON categories FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'owner')
);
CREATE POLICY "Authenticated can delete categories" ON categories FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'owner')
);

-- Orders management
CREATE POLICY "Authenticated can read orders" ON orders FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role IN ('owner', 'admin'))
);
CREATE POLICY "Authenticated can update orders" ON orders FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Messages management
CREATE POLICY "Authenticated can read messages" ON messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role IN ('owner', 'support'))
);
CREATE POLICY "Authenticated can update messages" ON messages FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role IN ('owner', 'support'))
);

-- Admin users management (owner only)
CREATE POLICY "Authenticated can read admin_users" ON admin_users FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);
CREATE POLICY "Owner can manage admin_users" ON admin_users FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'owner')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Insert default categories
INSERT INTO categories (name, name_ar, slug) VALUES
  ('Accessories', 'اكسسوارات', 'accessories')
ON CONFLICT (slug) DO NOTHING;
