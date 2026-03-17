-- Add customer_email column to orders table
ALTER TABLE orders 
ADD COLUMN customer_email TEXT;

-- Add index for faster lookups
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
