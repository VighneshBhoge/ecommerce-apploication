import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";

export default function Header() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="sticky top-4 z-50 px-4">
      <header className="max-w-6xl mx-auto bg-white border border-line rounded-2xl flex items-center justify-between gap-3 px-4 py-3 hard-shadow-sm">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center">
            <span className="w-3 h-3 rounded-sm bg-accent" />
          </span>
          <span className="font-display font-bold text-ink tracking-tight">ShopLite</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link to="/" className="px-3 py-1.5 rounded-full hover:bg-paper transition-colors">
            Products
          </Link>
          <Link to="/wishlist" className="relative px-3 py-1.5 rounded-full hover:bg-paper transition-colors">
            Wishlist
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-ink text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border border-ink">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative px-3 py-1.5 rounded-full hover:bg-paper transition-colors">
            Cart
            {cart.count > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-ink text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border border-ink">
                {cart.count}
              </span>
            )}
          </Link>
          {user?.role === "ADMIN" && (
            <Link to="/admin" className="px-3 py-1.5 rounded-full bg-paper border border-line font-medium">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/wishlist"
            className="md:hidden relative w-9 h-9 grid place-items-center rounded-full border border-line bg-white"
          >
            <span className="text-sm">♡</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-ink text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 border border-ink">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="md:hidden relative w-9 h-9 grid place-items-center rounded-full border border-line bg-white"
          >
            <span className="text-sm">🛒</span>
            {cart.count > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-ink text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 border border-ink">
                {cart.count}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link
                to="/profile"
                className="hidden sm:inline text-sm font-medium text-ink hover:underline max-w-[120px] truncate"
              >
                {user.name}
              </Link>
              <Link to="/profile" className="hidden sm:inline px-3 py-1.5 rounded-full border border-line bg-paper text-xs hover:bg-white">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full border border-line text-sm font-medium hover:bg-paper transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-full border border-line text-sm font-medium hover:bg-paper transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-full bg-accent text-ink text-sm font-medium border border-ink hover:bg-accent-dark transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>
    </div>
  );
}
