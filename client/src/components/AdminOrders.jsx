import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { formatPrice } from "../utils/format.js";

const STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
const STATUS_STYLES = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PAID: "bg-green-100 text-green-800 border-green-200",
  SHIPPED: "bg-blue-100 text-blue-800 border-blue-200",
  DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    try {
      const data = await api("/admin/orders");
      setOrders(data.orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatusChange(orderId, status) {
    try {
      const data = await api(`/admin/orders/${orderId}/status`, { method: "PATCH", body: { status } });
      setOrders(orders.map((o) => (o.id === orderId ? data.order : o)));
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <p className="text-muted py-8">Loading orders...</p>;
  if (error) return <p className="text-red-600 py-8">{error}</p>;
  if (orders.length === 0) return <p className="text-muted py-8">No orders yet.</p>;

  return (
    <div>
      <h2 className="font-display text-lg font-bold text-ink mb-4">All Orders ({orders.length})</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-line rounded-2xl p-5 hard-shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <span className="font-display font-semibold text-ink">#{order.id.slice(-8).toUpperCase()}</span>
                <span className="text-sm text-muted ml-3">{order.user?.name} ({order.user?.email})</span>
                <span className="text-sm text-muted ml-3">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent ${STATUS_STYLES[order.status]}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <span className="font-bold text-ink">{formatPrice(order.total)}</span>
              </div>
            </div>
            <div className="border-t border-line pt-2 space-y-1">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted">{item.product.name} × {item.quantity}</span>
                  <span className="text-ink font-medium">{formatPrice(item.priceAtPurchase * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
