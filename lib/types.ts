export interface Category {
  id: string
  name: string
  name_ar: string
  slug: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  name_ar: string
  description: string | null
  description_ar: string | null
  price: number
  discount_price: number | null
  images: string[]
  sizes: string[]
  colors: string[]
  category_id: string | null
  stock: number
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  category?: Category
}

export interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  customer_city: string
  notes: string | null
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  quantity: number
  size: string | null
  color: string | null
  price: number
  created_at: string
}

export interface Message {
  id: string
  name: string
  phone: string
  message: string
  is_read: boolean
  created_at: string
}

export interface AdminUser {
  id: string
  email: string
  role: 'owner' | 'admin' | 'support'
  created_at: string
}
