export type UserRole = 'hotel_admin' | 'restaurant_admin' | 'hybrid_admin'
export type RoomStatus = 'available' | 'booked' | 'maintenance' | 'cleaning'
export type RoomType = 'single' | 'double' | 'suite' | 'deluxe'
export type BookingStatus = 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled'
export type BookingType = 'walk-in' | 'pre-booked'
export type PaymentMethod = 'cash' | 'upi' | 'card'
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'billed'
export type TableStatus = 'available' | 'occupied' | 'reserved'
export type PlanType = 'free' | 'pro' | 'premium'
export type BusinessType = 'hotel' | 'restaurant' | 'both'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  business_id: string
  business_name?: string
  plan: PlanType
  avatar_url?: string
  created_at: string
}

export interface Business {
  id: string
  name: string
  type: BusinessType
  owner_id: string
  address?: string
  phone?: string
  email?: string
  logo_url?: string
  gst_number?: string
  cover_image?: string
  description?: string
  amenities?: string[]
  is_published?: boolean
  base_price?: number
  discounted_price?: number
  rating?: number
  rating_count?: number
  membership_tag?: string
  created_at: string
}

export interface Room {
  id: string
  business_id: string
  number: string
  type: RoomType
  floor: number
  capacity: number
  price_per_night: number
  status: RoomStatus
  amenities: string[]
  description?: string
  created_at: string
}

export interface Guest {
  id: string
  business_id: string
  name: string
  email?: string
  phone: string
  id_type?: string
  id_number?: string
  address?: string
  notes?: string
  visit_count: number
  created_at: string
}

export interface Booking {
  id: string
  business_id: string
  room_id: string
  guest_id: string
  check_in: string
  check_out: string
  type: BookingType
  status: BookingStatus
  total_amount: number
  paid_amount: number
  payment_method: PaymentMethod
  special_requests?: string
  created_at: string
  // Joined
  room?: Room
  guest?: Guest
}

export interface Transaction {
  id: string
  business_id: string
  booking_id?: string
  order_id?: string
  amount: number
  type: 'income' | 'expense'
  payment_method: PaymentMethod
  description: string
  created_at: string
}

// Restaurant types
export interface RestaurantTable {
  id: string
  business_id: string
  number: string
  capacity: number
  status: TableStatus
  location?: string
  created_at: string
}

export interface MenuItem {
  id: string
  business_id: string
  name: string
  category: string
  price: number
  description?: string
  is_vegetarian: boolean
  is_available: boolean
  image_url?: string
  created_at: string
}

export interface Order {
  id: string
  business_id: string
  table_id: string
  status: OrderStatus
  total_amount: number
  gst_amount: number
  payment_method?: PaymentMethod
  notes?: string
  created_at: string
  updated_at: string
  // Joined
  table?: RestaurantTable
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  unit_price: number
  notes?: string
  // Joined
  menu_item?: MenuItem
}

export interface Bill {
  id: string
  business_id: string
  order_id: string
  subtotal: number
  gst_rate: number
  gst_amount: number
  total: number
  payment_method: PaymentMethod
  paid_at: string
}

// Dashboard types
export interface DashboardStats {
  totalRevenue: number
  todayRevenue: number
  occupancyRate?: number
  totalRooms?: number
  bookedRooms?: number
  pendingCheckouts?: number
  totalTables?: number
  occupiedTables?: number
  pendingOrders?: number
  todayOrders?: number
}
