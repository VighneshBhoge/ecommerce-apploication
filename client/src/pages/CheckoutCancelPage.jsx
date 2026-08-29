import { Link } from "react-router-dom";

export default function CheckoutCancelPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-white border border-line rounded-2xl p-8 hard-shadow-sm">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="font-display text-2xl font-bold text-ink mb-2">Payment cancelled</h1>
        <p className="text-muted mb-6">No charge was made. Your cart is saved whenever you're ready.</p>
        <div className="flex justify-center gap-3">
          <Link to="/cart" className="px-6 py-2.5 rounded-full bg-accent text-ink border border-ink font-medium hover:bg-accent-dark">
            Back to Cart
          </Link>
          <Link to="/" className="px-6 py-2.5 rounded-full border border-line bg-white text-ink font-medium hover:bg-paper">
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
