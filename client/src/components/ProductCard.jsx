import { Link } from "react-router-dom";
import { formatPrice } from "../utils/format.js";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Stars({ value }) {
  const full = Math.round(value);
  return (
    <span className="text-amber-500 text-xs tracking-widest">
      {"★★★★★".slice(0, full)}
      <span className="text-line">{"★★★★★".slice(full)}</span>
    </span>
  );
}

export default function ProductCard({ product }) {
  const { ids, toggle } = useWishlist();
  const { user } = useAuth();
  const wished = ids.has(product.id);

  async function handleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert("Log in to use wishlist");
      return;
    }
    try {
      await toggle(product.id);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white border border-line rounded-2xl overflow-hidden hover:hard-shadow hover:-translate-y-0.5 transition-all relative"
    >
      <button
        onClick={handleWishlist}
        className={`absolute top-3 right-3 z-10 w-8 h-8 grid place-items-center rounded-full border text-sm transition-colors ${
          wished
            ? "bg-accent border-ink text-ink"
            : "bg-white/90 backdrop-blur border-line text-muted hover:text-ink"
        }`}
        title={wished ? "Remove from wishlist" : "Add to wishlist"}
      >
        {wished ? "♥" : "♡"}
      </button>

      <div className="aspect-[3/2] bg-paper overflow-hidden border-b border-line">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-muted mb-1">
          {product.category?.name}
        </p>
        <h3 className="font-display font-semibold text-ink truncate">{product.name}</h3>

        <div className="flex items-center gap-1 mt-1">
          <Stars value={product.avgRating || 0} />
          <span className="text-xs text-muted">
            {product.reviewCount > 0 ? `(${product.reviewCount})` : "No reviews"}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="font-bold text-ink">{formatPrice(product.price)}</span>
          {product.stock === 0 ? (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">
              Out of stock
            </span>
          ) : (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-accent text-ink border border-ink">
              In stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
