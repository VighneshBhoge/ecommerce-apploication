import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../utils/format.js";

export default function WishlistPage() {
  const { items, remove } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-line rounded-2xl p-10 hard-shadow-sm max-w-md mx-auto">
          <p className="text-4xl mb-3">♡</p>
          <p className="text-muted mb-4">Your wishlist is empty.</p>
          <Link to="/" className="font-medium text-ink underline underline-offset-4">
            Browse products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink mb-6">Wishlist ({items.length})</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((entry) => (
          <div
            key={entry.id}
            className="bg-white border border-line rounded-2xl overflow-hidden hard-shadow-sm flex flex-col"
          >
            <Link to={`/product/${entry.product.id}`} className="aspect-[3/2] bg-paper overflow-hidden border-b border-line">
              <img src={entry.product.imageUrl} alt={entry.product.name} className="w-full h-full object-cover" />
            </Link>
            <div className="p-4 flex-1 flex flex-col">
              <Link to={`/product/${entry.product.id}`} className="font-medium text-ink hover:underline line-clamp-2">
                {entry.product.name}
              </Link>
              <p className="font-bold text-ink mt-1">{formatPrice(entry.product.price)}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => addItem(entry.productId, 1).catch((e) => alert(e.message))}
                  className="flex-1 py-2 rounded-full bg-accent text-ink text-sm font-medium border border-ink hover:bg-accent-dark"
                >
                  Add to cart
                </button>
                <button
                  onClick={() => remove(entry.productId)}
                  className="px-4 py-2 rounded-full border border-line bg-white text-sm hover:bg-paper"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
