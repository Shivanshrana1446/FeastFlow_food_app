import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { useAppDispatch } from '@/app/hooks';
import { bootstrapAuth } from '@/features/auth/authSlice';
import ToastContainer from '@/components/ui/ToastContainer';
import Spinner from '@/components/ui/Spinner';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import ProtectedRoute from '@/routes/ProtectedRoute';
import RoleRoute from '@/routes/RoleRoute';
import PublicLayout from '@/components/layout/PublicLayout';
import OwnerLayout from '@/components/layout/OwnerLayout';
import DeliveryLayout from '@/components/layout/DeliveryLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import { ROLES } from '@/utils/constants';

const Landing = lazy(() => import('@/pages/public/Landing'));
const Login = lazy(() => import('@/pages/public/Login'));
const Signup = lazy(() => import('@/pages/public/Signup'));
const NotFound = lazy(() => import('@/pages/public/NotFound'));
const Unauthorized = lazy(() => import('@/pages/public/Unauthorized'));

const RestaurantListing = lazy(() => import('@/pages/customer/RestaurantListing'));
const RestaurantDetails = lazy(() => import('@/pages/customer/RestaurantDetails'));
const FoodSearch = lazy(() => import('@/pages/customer/FoodSearch'));
const FoodDetails = lazy(() => import('@/pages/customer/FoodDetails'));
const Cart = lazy(() => import('@/pages/customer/Cart'));
const Checkout = lazy(() => import('@/pages/customer/Checkout'));
const Payment = lazy(() => import('@/pages/customer/Payment'));
const OrderTracking = lazy(() => import('@/pages/customer/OrderTracking'));
const OrderHistory = lazy(() => import('@/pages/customer/OrderHistory'));
const Profile = lazy(() => import('@/pages/customer/Profile'));

const OwnerDashboard = lazy(() => import('@/pages/restaurantOwner/Dashboard'));
const ManageRestaurant = lazy(() => import('@/pages/restaurantOwner/ManageRestaurant'));
const ManageMenu = lazy(() => import('@/pages/restaurantOwner/ManageMenu'));
const OwnerOrders = lazy(() => import('@/pages/restaurantOwner/Orders'));
const OwnerAnalytics = lazy(() => import('@/pages/restaurantOwner/Analytics'));

const AssignedOrders = lazy(() => import('@/pages/delivery/AssignedOrders'));
const DeliveryTracking = lazy(() => import('@/pages/delivery/DeliveryTracking'));
const DeliveryHistory = lazy(() => import('@/pages/delivery/History'));

const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminCustomers = lazy(() => import('@/pages/admin/Customers'));
const AdminUsers = lazy(() => import('@/pages/admin/Users'));
const AdminRestaurants = lazy(() => import('@/pages/admin/Restaurants'));
const AdminOrders = lazy(() => import('@/pages/admin/Orders'));
const AdminDeliveryPartners = lazy(() => import('@/pages/admin/DeliveryPartners'));
const AdminAnalytics = lazy(() => import('@/pages/admin/Analytics'));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner label="Loading..." />
    </div>
  );
}

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  return (
    <MotionConfig reducedMotion="user">
      <ToastContainer />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/restaurants" element={<RestaurantListing />} />
              <Route path="/restaurants/:id" element={<RestaurantDetails />} />
              <Route path="/food" element={<FoodSearch />} />
              <Route path="/food/:id" element={<FoodDetails />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<RoleRoute roles={[ROLES.CUSTOMER]} />}>
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/payment/:orderId" element={<Payment />} />
                  <Route path="/orders" element={<OrderHistory />} />
                  <Route path="/orders/:id" element={<OrderTracking />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<RoleRoute roles={[ROLES.RESTAURANT_OWNER]} />}>
                <Route path="/owner" element={<OwnerLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<OwnerDashboard />} />
                  <Route path="restaurant" element={<ManageRestaurant />} />
                  <Route path="menu" element={<ManageMenu />} />
                  <Route path="orders" element={<OwnerOrders />} />
                  <Route path="analytics" element={<OwnerAnalytics />} />
                </Route>
              </Route>

              <Route element={<RoleRoute roles={[ROLES.DELIVERY_PARTNER]} />}>
                <Route path="/delivery" element={<DeliveryLayout />}>
                  <Route index element={<Navigate to="assigned" replace />} />
                  <Route path="assigned" element={<AssignedOrders />} />
                  <Route path="tracking" element={<DeliveryTracking />} />
                  <Route path="history" element={<DeliveryHistory />} />
                </Route>
              </Route>

              <Route element={<RoleRoute roles={[ROLES.ADMIN]} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="restaurants" element={<AdminRestaurants />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="delivery-partners" element={<AdminDeliveryPartners />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </MotionConfig>
  );
}
