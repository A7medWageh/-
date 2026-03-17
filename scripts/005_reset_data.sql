-- This script resets the product data to be suitable for a mobile phone store.
-- It deletes the old clothing categories and their products, and inserts new
-- categories and products for mobile phones.

-- Step 1: Delete products from old categories ('men', 'women', 'kids')
DELETE FROM products WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('men', 'women', 'kids'));

-- Step 2: Delete old categories ('men', 'women', 'kids')
DELETE FROM categories WHERE slug IN ('men', 'women', 'kids');

-- Step 3: Insert new 'smartphones' category
-- Note: 'accessories' is already in the default schema, so we don't add it again.
INSERT INTO categories (name, name_ar, slug) VALUES
  ('Smartphones', 'هواتف ذكية', 'smartphones')
ON CONFLICT (slug) DO NOTHING;

-- Step 4: Insert sample mobile phone products
INSERT INTO products (name, name_ar, description, description_ar, price, category_id, images, featured)
VALUES
  (
    'iPhone 15 Pro',
    'آيفون 15 برو',
    'The latest iPhone with a powerful A17 Pro chip and a stunning ProMotion display.',
    'أحدث هاتف آيفون مع شريحة A17 Pro القوية وشاشة ProMotion مذهلة.',
    45000,
    (SELECT id FROM categories WHERE slug = 'smartphones'),
    ARRAY['/placeholder.svg'],
    true
  ),
  (
    'Samsung Galaxy S24 Ultra',
    'سامسونج جالاكسي S24 ألترا',
    'Experience the new era of mobile AI with Galaxy S24 Ultra.',
    'اختبر الحقبة الجديدة من الذكاء الاصطناعي مع جالاكسي S24 ألترا.',
    42000,
    (SELECT id FROM categories WHERE slug = 'smartphones'),
    ARRAY['/placeholder.svg'],
    true
  ),
  (
    'Google Pixel 8 Pro',
    'جوجل بكسل 8 برو',
    'The most powerful, personal, and secure Pixel phone yet.',
    'أقوى هاتف Pixel وأكثرها خصوصية وأمانًا حتى الآن.',
    38000,
    (SELECT id FROM categories WHERE slug = 'smartphones'),
    ARRAY['/placeholder.svg'],
    true
  )
ON CONFLICT (name) DO NOTHING;
