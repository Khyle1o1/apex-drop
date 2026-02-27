import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import About from "./pages/About";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import AdminOrders from "./pages/AdminOrders";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminCategories from "./pages/AdminCategories";
import AdminInventory from "./pages/AdminInventory";
import AdminPromotions from "./pages/AdminPromotions";
import AdminUsers from "./pages/AdminUsers";
import AdminReports from "./pages/AdminReports";
import AdminSettings from "./pages/AdminSettings";
import { useEffect } from "react";
import { useAuthStore } from "./lib/auth-store";
import { getAccessToken, getRefreshToken } from "./lib/api";
import { useToast } from "./components/ui/use-toast";

function AuthInit() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  useEffect(() => {
    const access = getAccessToken();
    const refresh = getRefreshToken();

    // If there are no tokens at all but a persisted user from a previous session,
    // treat the user as logged out to avoid protected calls with stale tokens.
    if (!access && !refresh) {
      useAuthStore.setState({ user: null });
      return;
    }

    if (access) fetchMe();
  }, [fetchMe]);
  return null;
}

function AdminRoute({ children }: { children: JSX.Element }) {
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const { toast } = useToast();
  const location = useLocation();

  if (!user) {
    const from = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?from=${from}&reason=admin`} replace />;
  }

  if (!isAdmin) {
    toast({
      title: "Unauthorized",
      description: "You are not allowed to access the admin console.",
      variant: "destructive",
    });
    return <Navigate to="/shop" replace />;
  }

  return children;
}

function ShopRoute({ children }: { children: JSX.Element }) {
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const location = useLocation();

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" state={{ from: location.pathname + location.search }} replace />;
  }

  return children;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        const message =
          typeof error === "object" && error !== null && "message" in error && typeof (error as any).message === "string"
            ? (error as any).message.toLowerCase()
            : "";

        if (
          message.includes("unauthorized") ||
          message.includes("invalid or expired token") ||
          message.includes("missing or invalid authorization")
        ) {
          return false;
        }

        return failureCount < 2;
      },
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthInit />
        <Routes>
          <Route
            path="/"
            element={
              <ShopRoute>
                <Index />
              </ShopRoute>
            }
          />
          <Route
            path="/shop"
            element={
              <ShopRoute>
                <Shop />
              </ShopRoute>
            }
          />
          <Route
            path="/product/:slug"
            element={
              <ShopRoute>
                <ProductDetail />
              </ShopRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ShopRoute>
                <Cart />
              </ShopRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ShopRoute>
                <Checkout />
              </ShopRoute>
            }
          />
          <Route path="/order/success" element={<OrderSuccess />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              <ShopRoute>
                <Profile />
              </ShopRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ShopRoute>
                <Orders />
              </ShopRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ShopRoute>
                <About />
              </ShopRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ShopRoute>
                <Support />
              </ShopRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminProducts />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminRoute>
                <AdminCategories />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <AdminRoute>
                <AdminInventory />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/promotions"
            element={
              <AdminRoute>
                <AdminPromotions />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminRoute>
                <AdminReports />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <AdminSettings />
              </AdminRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
