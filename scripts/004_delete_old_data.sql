-- Delete products from old categories
DELETE FROM products WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('men', 'women', 'kids'));

-- Delete old categories
DELETE FROM categories WHERE slug IN ('men', 'women', 'kids');
