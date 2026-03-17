-- Insert new categories for the mobile phone store
INSERT INTO categories (name, name_ar, slug) VALUES
  ('Smartphones', 'هواتف ذكية', 'smartphones');

-- Insert sample mobile phone products
INSERT INTO products (name, name_ar, description, description_ar, price, category_id, images, featured)
VALUES
  (
    'iPhone 15 Pro',
    'آيفون 15 برو',
    'The latest iPhone with a powerful A17 Pro chip and a stunning ProMotion display.',
    'أحدث هاتف آيفون مع شريحة A17 Pro القوية وشاشة ProMotion مذهلة.',
    45000,
    (SELECT id FROM categories WHERE slug = 'smartphones'),
    ARRAY['/hero/hoodie.png'],
    true
  ),
  (
    'Samsung Galaxy S24 Ultra',
    'سامسونج جالاكسي S24 ألترا',
    'Experience the new era of mobile AI with Galaxy S24 Ultra.',
    'اختبر الحقبة الجديدة من الذكاء الاصطناعي مع جالاكسي S24 ألترا.',
    42000,
    (SELECT id FROM categories WHERE slug = 'smartphones'),
    ARRAY['/hero/streetwear.png'],
    true
  ),
  (
    'Google Pixel 8 Pro',
    'جوجل بكسل 8 برو',
    'The most powerful, personal, and secure Pixel phone yet.',
    'أقوى هاتف Pixel وأكثرها خصوصية وأمانًا حتى الآن.',
    38000,
    (SELECT id FROM categories WHERE slug = 'smartphones'),
    ARRAY['/hero/summer.png'],
    true
  );
