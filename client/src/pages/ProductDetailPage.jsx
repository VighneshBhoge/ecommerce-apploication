import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { formatPrice } from "../utils/format.js";

function Stars({ value, size = "text-sm" }) {
  const full = Math.round(value);
  return (
    <span className={`${size} tracking-widest`}>
      <span className="text-amber-500">{"★★★★★".slice(0, full)}</span>
      <span className="text-line">{"★★★★★".slice(full)}</span>
    </span>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { ids, toggle } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avg, setAvg] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [related, setRelated] = useState([]);
  const [recent, setRecent] = useState([]);

  const wished = ids.has(id);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setLoading(true);
    api(`/products/${id}`)
      .then((data) => {
        setProduct(data.product);
        setActiveImg(0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    api(`/products/${id}/reviews`)
      .then((d) => {
        setReviews(d.reviews);
        setAvg(d.avg);
      })
      .catch(() => {});

    try {
      const rv = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
      const filtered = rv.filter((x) => x !== id);
      const next = [id, ...filtered].slice(0, 6);
      localStorage.setItem("recentlyViewed", JSON.stringify(next));
      if (next.length > 1) {
        const idsToFetch = next.slice(1, 5);
        Promise.all(idsToFetch.map((pid) => api(`/products/${pid}`).then((d) => d.product).catch(() => null))).then(
          (items) => setRecent(items.filter(Boolean))
        );
      }
    } catch {}
  }, [id]);

  useEffect(() => {
    if (!product?.category?.name) return;
    api(`/products?category=${encodeURIComponent(product.category.name)}&limit=4`)
      .then((d) => setRelated(d.products.filter((p) => p.id !== id).slice(0, 4)))
      .catch(() => {});
  }, [product, id]);

  async function handleAddToCart() {
    try {
      await addItem(id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    try {
      const data = await api(`/products/${id}/reviews`, {
        method: "POST",
        body: { rating, comment },
      });
      setReviews((prev) => {
        const exists = prev.find((r) => r.userId === data.review.userId);
        if (exists) return prev.map((r) => (r.userId === data.review.userId ? data.review : r));
        return [data.review, ...prev];
      });
      setComment("");
      const d = await api(`/products/${id}/reviews`);
      setReviews(d.reviews);
      setAvg(d.avg);
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return <p className="max-w-6xl mx-auto px-4 py-16 text-center text-muted">Loading...</p>;
  }

  if (error || !product) {
    return <p className="max-w-6xl mx-auto px-4 py-16 text-center text-red-600">{error || "Product not found"}</p>;
  }

  const gallery = product?.images?.length ? product.images : product ? [product.imageUrl] : [];

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="grid md:grid-cols-2 gap-0 bg-white border border-line rounded-2xl overflow-hidden hard-shadow">
        <div className="bg-paper border-b md:border-b-0 md:border-r border-line p-4 flex flex-col gap-3">
          <div className="aspect-[4/3] bg-white rounded-xl overflow-hidden border border-line">
            <img src={gallery[activeImg] || product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 ${activeImg === i ? "border-ink" : "border-line"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted">{product.category?.name}</p>
            {product.brand && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-paper border border-line font-medium text-ink">{product.brand}</span>
            )}
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">{product.name}</h1>

          <div className="flex items-center gap-2 mt-2">
            <Stars value={product.avgRating || avg} />
            <span className="text-sm text-muted">
              {(product.avgRating || avg).toFixed(1)} ({product.reviewCount ?? reviews.length} reviews)
            </span>
          </div>

          <p className="text-2xl font-bold text-ink mt-3">{formatPrice(product.price)}</p>
          <p className="text-muted mt-4 leading-relaxed flex-1">{product.description}</p>

          <div className="mt-6 space-y-3">
            <p className={`text-sm font-medium ${product.stock > 0 ? "text-green-700" : "text-red-600"}`}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>
            <div className="flex gap-3">
              {user ? (
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-3 rounded-full font-medium border border-ink transition-colors ${
                    added
                      ? "bg-ink text-white"
                      : "bg-accent text-ink hover:bg-accent-dark disabled:bg-paper disabled:text-muted disabled:border-line"
                  }`}
                >
                  {added ? "Added to cart ✓" : "Add to Cart"}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex-1 py-3 rounded-full font-medium bg-accent text-ink border border-ink hover:bg-accent-dark text-center"
                >
                  Log in to add to cart
                </Link>
              )}
              <button
                onClick={() => {
                  if (!user) return alert("Log in to use wishlist");
                  toggle(id).catch((e) => alert(e.message));
                }}
                className={`px-6 py-3 rounded-full border font-medium ${
                  wished ? "bg-accent border-ink text-ink" : "bg-white border-line text-ink hover:bg-paper"
                }`}
              >
                {wished ? "♥ Saved" : "♡ Save"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-line rounded-2xl p-6 hard-shadow-sm">
        <h2 className="font-display font-bold text-ink mb-4">Reviews</h2>

        {user ? (
          <form onSubmit={handleReviewSubmit} className="mb-6 p-4 bg-paper border border-line rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-ink">Your rating:</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`w-8 h-8 rounded-full border text-sm ${rating >= n ? "bg-amber-400 border-amber-500 text-white" : "bg-white border-line"}`}
                >
                  ★
                </button>
              ))}
              <span className="text-sm text-muted ml-2">{rating}/5</span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-line bg-white focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              required
            />
            <button type="submit" className="px-6 py-2 rounded-full bg-ink text-white text-sm font-medium hover:bg-black">
              Post review
            </button>
          </form>
        ) : (
          <p className="text-sm text-muted mb-6">
            <Link to="/login" className="underline text-ink">Log in</Link> to leave a review.
          </p>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-muted">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-line pb-3 last:border-0">
                <div className="flex items-center gap-2">
                  <Stars value={r.rating} />
                  <span className="text-sm font-medium text-ink">{r.user.name}</span>
                  <span className="text-xs text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-ink mt-1">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-ink mb-4">Related products</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="bg-white border border-line rounded-2xl overflow-hidden hover:hard-shadow transition-all">
                <img src={p.imageUrl} alt={p.name} className="aspect-[3/2] w-full object-cover border-b border-line" />
                <div className="p-3">
                  <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                  <p className="text-sm font-bold text-ink">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recent.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-ink mb-4">Recently viewed</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recent.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="shrink-0 w-40 bg-white border border-line rounded-2xl overflow-hidden">
                <img src={p.imageUrl} alt={p.name} className="aspect-square w-full object-cover border-b border-line" />
                <div className="p-2">
                  <p className="text-xs font-medium text-ink truncate">{p.name}</p>
                  <p className="text-xs font-bold text-ink">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
