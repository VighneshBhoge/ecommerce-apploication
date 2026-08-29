import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage.jsx";
import CheckoutCancelPage from "./pages/CheckoutCancelPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import AddressesPage from "./pages/AddressesPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import InvoicePage from "./pages/InvoicePage.jsx";

function Placeholder({ title }) {
  return (
    <main className="max-w-6xl mx-auto px-4 py-16 text-center">
      <div className="bg-white border border-line rounded-2xl p-10 hard-shadow-sm max-w-lg mx-auto">
        <p className="text-muted">{title} — coming soon.</p>
      </div>
    </main>
  );
}

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-paper grid-bg">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper grid-bg">
      <CartProvider>
        <WishlistProvider>
          <Header />
          <div className="pb-10">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id/invoice" element={<InvoicePage />} />
              <Route path="/addresses" element={<AddressesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
              <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<Placeholder title="404 — Page not found" />} />
            </Routes>
          </div>
        </WishlistProvider>
      </CartProvider>
    </div>
  );
}
