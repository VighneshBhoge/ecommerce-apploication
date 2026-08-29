import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../utils/format.js";

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const { refreshCart } = useCart();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get("order_id");
    if (!orderId) {
      setError("Missing order id");
      setLoading(false);
      return;
    }
    api(`/orders/${orderId}`)
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message))
      .finally(() => {
        setLoading(false);
        refreshCart();
      });
  }, [searchParams, refreshCart]);

  if (loading) {
    return <main className="max-w-2xl mx-auto px-4 py-16 text-center text-muted">Confirming your payment...</main>;
  }

  if (error || !order) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-line rounded-2xl p-8 hard-shadow-sm">
          <p className="text-red-600 mb-4">{error || "Order not found"}</p>
          <Link to="/orders" className="font-medium text-ink underline underline-offset-4">View your orders</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white border border-line rounded-2xl p-8 text-center hard-shadow">
        <p className="text-5xl mb-4">🎉</p>
        <h1 className="font-display text-2xl font-bold text-ink mb-2">Payment successful!</h1>
        <p className="text-muted mb-6">Order #{order.id.slice(-8).toUpperCase()} is confirmed.</p>
        <div className="text-left border border-line rounded-xl divide-y divide-line mb-6 overflow-hidden">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between px-4 py-3 text-sm bg-paper/50">
              <span className="text-muted">{item.product.name} × {item.quantity}</span>
              <span className="font-medium text-ink">{formatPrice(item.priceAtPurchase * item.quantity)}</span>
            </div>
          ))}
          {order.discount > 0 && (
            <div className="flex justify-between px-4 py-3 text-sm bg-green-50 text-green-700">
              <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between px-4 py-3 font-bold text-ink bg-white">
            <span>Total paid</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
        <Link to="/orders" className="inline-block px-6 py-2.5 rounded-full bg-accent text-ink border border-ink font-medium hover:bg-accent-dark">
          View All Orders
        </Link>
      </div>
    </main>
  );
}
