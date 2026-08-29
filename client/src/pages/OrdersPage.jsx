import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatPrice } from "../utils/format.js";
import TrackingTimeline from "../components/TrackingTimeline.jsx";

const STATUS_STYLES = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PAID: "bg-green-100 text-green-800 border-green-200",
  SHIPPED: "bg-blue-100 text-blue-800 border-blue-200",
  DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    api("/orders")
      .then((data) => setOrders(data.orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-line rounded-2xl p-10 hard-shadow-sm max-w-md mx-auto">
          <p className="text-muted mb-4">Log in to view your orders.</p>
          <Link to="/login" className="inline-block px-6 py-2.5 rounded-full bg-accent text-ink border border-ink font-medium hover:bg-accent-dark">
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return <main className="max-w-4xl mx-auto px-4 py-16 text-center text-muted">Loading orders...</main>;
  }

  if (error) {
    return <main className="max-w-4xl mx-auto px-4 py-16 text-center text-red-600">{error}</main>;
  }

  if (orders.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-line rounded-2xl p-10 hard-shadow-sm max-w-md mx-auto">
          <p className="text-muted mb-4">You haven't placed any orders yet.</p>
          <Link to="/" className="font-medium text-ink underline underline-offset-4">
            Start shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-line rounded-2xl p-5 hard-shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <span className="font-display font-semibold text-ink">Order #{order.id.slice(-8).toUpperCase()}</span>
                <span className="text-sm text-muted ml-3">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[order.status] || "bg-paper text-muted border-line"}`}>
                  {order.status}
                </span>
                <span className="font-bold text-ink">{formatPrice(order.total)}</span>
              </div>
            </div>

            <TrackingTimeline status={order.status} />

            <div className="border-t border-line pt-3 space-y-1.5 mt-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted">{item.product.name} × {item.quantity}</span>
                  <span className="text-ink font-medium">{formatPrice(item.priceAtPurchase * item.quantity)}</span>
                </div>
              ))}
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-700 pt-1 border-t border-line mt-2">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-ink pt-1">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              {["PENDING", "PAID"].includes(order.status) && (
                <button
                  onClick={async () => {
                    if (!confirm("Cancel this order?")) return;
                    try {
                      const data = await api(`/orders/${order.id}/cancel`, { method: "POST" });
                      setOrders((prev) => prev.map((o) => (o.id === order.id ? data.order : o)));
                    } catch (e) {
                      alert(e.message);
                    }
                  }}
                  className="px-4 py-1.5 rounded-full border border-red-200 bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100"
                >
                  Cancel order
                </button>
              )}
              <Link
                to={`/orders/${order.id}/invoice`}
                className="px-4 py-1.5 rounded-full border border-line bg-paper text-xs font-medium hover:bg-white"
              >
                View invoice
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
