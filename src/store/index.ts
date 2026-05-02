import { create } from 'zustand'
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Room, Booking, Guest, Transaction, RestaurantTable, MenuItem, Order } from '../types'

// ── HOTEL STORE ─────────────────────────────────────────────

interface HotelStore {
  rooms: Room[]
  bookings: Booking[]
  guests: Guest[]
  transactions: Transaction[]
  loading: boolean
  
  fetchHotelData: (businessId: string) => Promise<void>
  addRoom: (room: Omit<Room, 'id' | 'created_at'>) => Promise<void>
  updateRoom: (id: string, updates: Partial<Room>) => Promise<void>
  deleteRoom: (id: string) => Promise<void>
  addGuest: (guest: Omit<Guest, 'id' | 'created_at'>) => Promise<void>
  addBooking: (booking: any) => Promise<void>
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>
  addTransaction: (tx: any) => Promise<void>
}

export const useHotelStore = create<HotelStore>((set, get) => ({
  rooms: [],
  bookings: [],
  guests: [],
  transactions: [],
  loading: false,

  fetchHotelData: async (businessId: string) => {
    set({ loading: true })
    try {
      // Fetch Rooms
      const roomsQ = query(collection(db, 'rooms'), where('business_id', '==', businessId))
      const roomsSnap = await getDocs(roomsQ)
      const rooms = roomsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Room)).sort((a, b) => a.number.localeCompare(b.number))

      // Fetch Guests
      const guestsQ = query(collection(db, 'guests'), where('business_id', '==', businessId))
      const guestsSnap = await getDocs(guestsQ)
      const guests = guestsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Guest)).sort((a, b) => a.name.localeCompare(b.name))

      // Fetch Bookings
      const bookingsQ = query(collection(db, 'bookings'), where('business_id', '==', businessId))
      const bookingsSnap = await getDocs(bookingsQ)
      const bookings = bookingsSnap.docs.map(d => {
        const data = d.data() as Booking
        // In-memory Join
        const room = rooms.find(r => r.id === data.room_id)
        const guest = guests.find(g => g.id === data.guest_id)
        return { ...data, id: d.id, room, guest }
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      // Fetch Transactions
      const txQ = query(collection(db, 'transactions'), where('business_id', '==', businessId))
      const txSnap = await getDocs(txQ)
      const transactions = txSnap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      set({ rooms, bookings, guests, transactions, loading: false })
    } catch (err) {
      console.error('Fetch hotel data failed:', err)
      set({ loading: false })
    }
  },

  addRoom: async (room) => {
    try {
      const data = { ...room, created_at: new Date().toISOString() }
      const docRef = await addDoc(collection(db, 'rooms'), data)
      set(s => ({ rooms: [...s.rooms, { ...data, id: docRef.id } as Room] }))
    } catch (err) {
      console.error(err)
    }
  },

  updateRoom: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'rooms', id), updates)
      set(s => ({ rooms: s.rooms.map(r => r.id === id ? { ...r, ...updates } : r) }))
    } catch (err) {
      console.error(err)
    }
  },

  deleteRoom: async (id) => {
    try {
      await deleteDoc(doc(db, 'rooms', id))
      set(s => ({ rooms: s.rooms.filter(r => r.id !== id) }))
    } catch (err) {
      console.error(err)
    }
  },

  addGuest: async (guest) => {
    try {
      const data = { ...guest, created_at: new Date().toISOString() }
      const docRef = await addDoc(collection(db, 'guests'), data)
      set(s => ({ guests: [...s.guests, { ...data, id: docRef.id } as Guest] }))
    } catch (err) {
      console.error(err)
    }
  },

  addBooking: async (booking) => {
    try {
      const data = { ...booking, created_at: new Date().toISOString() }
      const docRef = await addDoc(collection(db, 'bookings'), data)
      
      // Stitch for UI
      const { rooms, guests } = get()
      const room = rooms.find(r => r.id === booking.room_id)
      const guest = guests.find(g => g.id === booking.guest_id)
      
      const newBooking = { ...data, id: docRef.id, room, guest } as Booking
      set(s => ({ bookings: [newBooking, ...s.bookings] }))
    } catch (err) {
      console.error(err)
    }
  },

  updateBooking: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'bookings', id), updates)
      set(s => ({ bookings: s.bookings.map(b => b.id === id ? { ...b, ...updates } : b) }))
    } catch (err) {
      console.error(err)
    }
  },

  addTransaction: async (tx) => {
    try {
      const data = { ...tx, created_at: new Date().toISOString() }
      const docRef = await addDoc(collection(db, 'transactions'), data)
      set(s => ({ transactions: [{ ...data, id: docRef.id } as Transaction, ...s.transactions] }))
    } catch (err) {
      console.error(err)
    }
  },
}))

// ── RESTAURANT STORE ──────────────────────────────────────────

interface RestaurantStore {
  tables: RestaurantTable[]
  menu: MenuItem[]
  orders: Order[]
  loading: boolean

  fetchRestaurantData: (businessId: string) => Promise<void>
  addTable: (table: Omit<RestaurantTable, 'id' | 'created_at'>) => Promise<void>
  updateTable: (id: string, updates: Partial<RestaurantTable>) => Promise<void>
  addOrder: (order: any, items: any[]) => Promise<void>
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>
  addMenuItem: (item: Omit<MenuItem, 'id' | 'created_at'>) => Promise<void>
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>
}

export const useRestaurantStore = create<RestaurantStore>((set, get) => ({
  tables: [],
  menu: [],
  orders: [],
  loading: false,

  fetchRestaurantData: async (businessId: string) => {
    set({ loading: true })
    try {
      // Fetch Tables
      const tablesQ = query(collection(db, 'restaurant_tables'), where('business_id', '==', businessId))
      const tablesSnap = await getDocs(tablesQ)
      const tables = tablesSnap.docs.map(d => ({ id: d.id, ...d.data() } as RestaurantTable)).sort((a, b) => a.number.localeCompare(b.number))

      // Fetch Menu
      const menuQ = query(collection(db, 'menu_items'), where('business_id', '==', businessId))
      const menuSnap = await getDocs(menuQ)
      const menu = menuSnap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem)).sort((a, b) => a.category.localeCompare(b.category))

      // Fetch Orders (we assume items are stored directly inside order.items array in Firestore now to simplify NoSQL)
      const ordersQ = query(collection(db, 'orders'), where('business_id', '==', businessId))
      const ordersSnap = await getDocs(ordersQ)
      const orders = ordersSnap.docs.map(d => {
        const data = d.data() as Order
        const table = tables.find(t => t.id === data.table_id)
        return { ...data, id: d.id, table }
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      set({ tables, menu, orders, loading: false })
    } catch (err) {
      console.error('Fetch restaurant data failed:', err)
      set({ loading: false })
    }
  },

  addTable: async (table) => {
    try {
      const data = { ...table, created_at: new Date().toISOString() }
      const docRef = await addDoc(collection(db, 'restaurant_tables'), data)
      set(s => ({ tables: [...s.tables, { ...data, id: docRef.id } as RestaurantTable] }))
    } catch (err) {
      console.error(err)
    }
  },

  updateTable: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'restaurant_tables', id), updates)
      set(s => ({ tables: s.tables.map(t => t.id === id ? { ...t, ...updates } : t) }))
    } catch (err) {
      console.error(err)
    }
  },

  addMenuItem: async (item) => {
    try {
      const data = { ...item, created_at: new Date().toISOString() }
      const docRef = await addDoc(collection(db, 'menu_items'), data)
      set(s => ({ menu: [...s.menu, { ...data, id: docRef.id } as MenuItem] }))
    } catch (err) {
      console.error(err)
    }
  },

  updateMenuItem: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'menu_items', id), updates)
      set(s => ({ menu: s.menu.map(m => m.id === id ? { ...m, ...updates } : m) }))
    } catch (err) {
      console.error(err)
    }
  },

  addOrder: async (order, items) => {
    try {
      const data = { 
        ...order, 
        items, // Store items directly in the order document for NoSQL simplicity
        created_at: new Date().toISOString() 
      }
      const docRef = await addDoc(collection(db, 'orders'), data)
      
      const { tables } = get()
      const table = tables.find(t => t.id === order.table_id)
      
      const newOrder = { ...data, id: docRef.id, table } as Order
      set(s => ({ orders: [newOrder, ...s.orders] }))
    } catch (err) {
      console.error(err)
    }
  },

  updateOrder: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'orders', id), updates)
      set(s => ({ orders: s.orders.map(o => o.id === id ? { ...o, ...updates } : o) }))
    } catch (err) {
      console.error(err)
    }
  },
}))
