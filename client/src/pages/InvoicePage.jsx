import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client.js";
import { formatPrice } from "../utils/format.js";
import TrackingTimeline from "../components/TrackingTimeline.jsx";

export default function InvoicePage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/orders/${id}/invoice`)
      .then((d) => setOrder(d.order))
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <main className="max-w-3xl mx-auto px-4 py-16 text-center text-red-600">{error}</main>;
  if (!order) return <main className="max-w-3xl mx-auto px-4 py-16 text-center text-muted">Loading invoice...</main>;

  const subtotal = order.items.reduce((s, i) => s + i.priceAtPurchase * i.quantity, 0);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white border border-line rounded-2xl p-8 hard-shadow">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-display text-xl font-bold text-ink">Invoice</h1>
            <p className="text-sm text-muted">#{order.id.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <button onClick={() => window.print()} className="px-4 py-2 rounded-full border border-line bg-paper text-sm hover:bg-white print:hidden">
            Print
          </button>
        </div>

        <div className="mt-6 text-sm">
          <p className="font-medium text-ink">Billed to</p>
          <p className="text-muted">{order.user.name} · {order.user.email}</p>
        </div>

        <table className="w-full mt-6 text-sm">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="py-2">Item</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="py-2 text-ink">{item.product.name}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{formatPrice(item.priceAtPurchase)}</td>
                <td className="py-2 text-right font-medium">{formatPrice(item.priceAtPurchase * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 space-y-1 text-sm border-t border-line pt-4 max-w-xs ml-auto">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-ink text-base pt-2 border-t border-line">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
          <p className="text-xs text-muted pt-2">Status: {order.status}</p>
        </div>

        <div className="mt-6 print:hidden">
          <Link to="/orders" className="text-sm text-ink underline">Back to orders</Link>
        </div>
      </div>
    </main>
  );
}
