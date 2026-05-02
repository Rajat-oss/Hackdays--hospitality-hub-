import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { RoleGuard, GuestGuard } from '../features/auth/RoleGuard'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { useAuth } from '../features/auth/AuthContext'

// Lazy-loaded pages
const LandingPage = lazy(() => import('../pages/Landing'))
const LoginPage = lazy(() => import('../pages/Auth/Login'))
const SignupPage = lazy(() => import('../pages/Auth/Signup'))
const BusinessDirectory = lazy(() => import('../pages/BusinessDirectory'))
const PublicProfile = lazy(() => import('../pages/PublicProfile'))
const InquiriesPage = lazy(() => import('../pages/Inquiries'))

// Hotel
const HotelDashboard = lazy(() => import('../features/hotel/HotelDashboard'))
const RoomManagement = lazy(() => import('../features/hotel/RoomManagement'))
const BookingSystem = lazy(() => import('../features/hotel/BookingSystem'))
const GuestDirectory = lazy(() => import('../features/hotel/GuestDirectory'))
const FinanceTracker = lazy(() => import('../features/hotel/FinanceTracker'))

// Restaurant
const RestaurantDashboard = lazy(() => import('../features/restaurant/RestaurantDashboard'))
const TableManagement = lazy(() => import('../features/restaurant/TableManagement'))
const OrderManagement = lazy(() => import('../features/restaurant/OrderManagement'))
const KitchenView = lazy(() => import('../features/restaurant/KitchenView'))
const MenuManager = lazy(() => import('../features/restaurant/MenuManager'))
const Billing = lazy(() => import('../features/restaurant/Billing'))

// Shared
const HybridDashboard = lazy(() => import('../features/shared/HybridDashboard'))
const Analytics = lazy(() => import('../features/shared/Analytics'))
const StorefrontManager = lazy(() => import('../features/shared/StorefrontManager'))
const PricingPage = lazy(() => import('../pages/Pricing'))

const LoadingFallback = () => (
  <div className="page-loader">
    <div className="spinner spinner-lg" />
    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</span>
  </div>
)

function RoleRedirect() {
  const { profile, loading } = useAuth()
  if (loading) return <LoadingFallback />
  if (!profile) return <Navigate to="/login" replace />
  
  const roleRoutes: Record<string, string> = {
    hotel_admin: '/hotel',
    restaurant_admin: '/restaurant',
    hybrid_admin: '/hybrid',
  }
  
  return <Navigate to={roleRoutes[profile.role] ?? '/hotel'} replace />
}

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/businesses" element={<BusinessDirectory />} />
        <Route path="/business/:id" element={<PublicProfile />} />

        {/* Auth */}
        <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />
        <Route path="/signup" element={<GuestGuard><SignupPage /></GuestGuard>} />

        {/* Role redirect after login */}
        <Route path="/dashboard" element={<RoleGuard><RoleRedirect /></RoleGuard>} />

        {/* Hotel Dashboard */}
        <Route path="/hotel" element={
          <RoleGuard allowedRoles={['hotel_admin', 'hybrid_admin']}>
            <DashboardLayout />
          </RoleGuard>
        }>
          <Route index element={<HotelDashboard />} />
          <Route path="rooms" element={<RoomManagement />} />
          <Route path="bookings" element={<BookingSystem />} />
          <Route path="guests" element={<GuestDirectory />} />
          <Route path="finance" element={<FinanceTracker />} />
        </Route>

        {/* Restaurant Dashboard */}
        <Route path="/restaurant" element={
          <RoleGuard allowedRoles={['restaurant_admin', 'hybrid_admin']}>
            <DashboardLayout />
          </RoleGuard>
        }>
          <Route index element={<RestaurantDashboard />} />
          <Route path="tables" element={<TableManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="kitchen" element={<KitchenView />} />
          <Route path="menu" element={<MenuManager />} />
          <Route path="billing" element={<Billing />} />
        </Route>

        {/* Hybrid Dashboard */}
        <Route path="/hybrid" element={
          <RoleGuard allowedRoles={['hybrid_admin']}>
            <DashboardLayout />
          </RoleGuard>
        }>
          <Route index element={<HybridDashboard />} />
        </Route>

        {/* Shared (inside dashboard layout) */}
        <Route element={<RoleGuard><DashboardLayout /></RoleGuard>}>
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/storefront" element={<StorefrontManager />} />
          <Route path="/inquiries" element={<InquiriesPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
