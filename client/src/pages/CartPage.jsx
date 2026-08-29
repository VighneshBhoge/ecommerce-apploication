import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../utils/format.js";

export default function CartPage() {
  const { user } = useAuth();
  const { cart, updateItem, removeItem } = useCart();
  const [busyId, setBusyId] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponApplied, setCouponApplied] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      api("/addresses")
        .then((d) => {
          setAddresses(d.addresses);
          const def = d.addresses.find((a) => a.isDefault);
          if (def) setSelectedAddr(def.id);
        })
        .catch(() => {});
    }
  }, [user]);

  function loadRazorpayScript() {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve();
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
      document.body.appendChild(script);
    });
  }

  async function handleApplyCoupon() {
    setCouponMsg("");
    try {
      const data = await api("/coupons/validate", {
        method: "POST",
        body: { code: couponCode, total: cart.subtotal },
      });
      setDiscount(data.discount);
      setCouponApplied(data.coupon.code);
      setCouponMsg(`Applied ${data.coupon.code}: -${formatPrice(data.discount)}`);
    } catch (err) {
      setDiscount(0);
      setCouponApplied("");
      setCouponMsg(err.message);
    }
  }

  async function handleUpdate(itemId, quantity) {
    setBusyId(itemId);
    try {
      await updateItem(itemId, quantity);
      setDiscount(0);
      setCouponApplied("");
      setCouponMsg("");
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(itemId) {
    setBusyId(itemId);
    try {
      await removeItem(itemId);
      setDiscount(0);
      setCouponApplied("");
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleCheckout() {
    if (addresses.length > 0 && !selectedAddr) {
      alert("Please select a delivery address");
      return;
    }
    setCheckingOut(true);
    try {
      await loadRazorpayScript();
      const data = await api("/checkout", {
        method: "POST",
        body: { couponCode: couponApplied || undefined },
      });
      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "ShopLite",
        description: "Order payment",
        order_id: data.razorpayOrderId,
        prefill: { email: user.email, name: user.name },
        theme: { color: "#c9f14f" },
        handler: async (response) => {
          try {
            await api("/checkout/verify", { method: "POST", body: response });
            navigate(`/checkout/success?order_id=${data.dbOrderId}`);
          } catch (err) {
            alert(err.message);
            setCheckingOut(false);
          }
        },
        modal: {
          ondismiss: () => {
            setCheckingOut(false);
            navigate("/checkout/cancel");
          },
        },
      });
      razorpay.open();
    } catch (err) {
      alert(err.message);
      setCheckingOut(false);
    }
  }

  if (!user) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-line rounded-2xl p-10 hard-shadow-sm max-w-md mx-auto">
          <p className="text-muted mb-4">Log in to view your cart.</p>
          <Link
            to="/login"
            className="inline-block px-6 py-2.5 rounded-full bg-accent text-ink border border-ink font-medium hover:bg-accent-dark"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  if (cart.items.length === 0) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-line rounded-2xl p-10 hard-shadow-sm max-w-md mx-auto">
          <p className="text-4xl mb-4">🛒</p>
          <p className="text-muted mb-4">Your cart is empty.</p>
          <Link to="/" className="font-medium text-ink underline underline-offset-4">
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  const total = cart.subtotal - discount;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink mb-6">
        Your Cart ({cart.count} {cart.count === 1 ? "item" : "items"})
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white border border-line rounded-2xl p-4 hard-shadow-sm">
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-24 h-24 object-cover rounded-xl bg-paper border border-line"
              />
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product.id}`} className="font-display font-semibold text-ink hover:underline">
                  {item.product.name}
                </Link>
                <p className="text-sm text-muted mt-0.5">{formatPrice(item.product.price)} each</p>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => handleUpdate(item.id, item.quantity - 1)}
                    disabled={busyId === item.id}
                    className="w-8 h-8 rounded-full border border-line bg-white text-ink hover:bg-paper disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdate(item.id, item.quantity + 1)}
                    disabled={busyId === item.id || item.quantity >= item.product.stock}
                    className="w-8 h-8 rounded-full border border-line bg-white text-ink hover:bg-paper disabled:opacity-40"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={busyId === item.id}
                    className="ml-auto text-sm font-medium text-red-600 hover:underline disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right font-bold text-ink whitespace-nowrap">
                {formatPrice(item.product.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-line rounded-2xl p-6 h-fit sticky top-24 hard-shadow space-y-4">
          <h2 className="font-display font-bold text-ink">Order Summary</h2>

          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Coupon code"
              className="flex-1 px-3 py-2 rounded-full border border-line bg-paper text-sm focus:outline-none focus:ring-2 focus:ring-accent placeholder:text-muted"
            />
            <button
              onClick={handleApplyCoupon}
              className="px-4 py-2 rounded-full bg-ink text-white text-sm font-medium hover:bg-black"
            >
              Apply
            </button>
          </div>
          {couponMsg && (
            <p className={`text-xs ${discount > 0 ? "text-green-700" : "text-red-600"}`}>{couponMsg}</p>
          )}
          <p className="text-xs text-muted">Try: WELCOME10, FLAT500, SAVE20</p>

          {addresses.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Delivery address</label>
              <select
                value={selectedAddr}
                onChange={(e) => setSelectedAddr(e.target.value)}
                className="w-full px-3 py-2 rounded-full border border-line bg-paper text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Select address</option>
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}: {a.line1}, {a.city}
                  </option>
                ))}
              </select>
              <Link to="/addresses" className="text-xs text-ink underline mt-1 inline-block">
                Manage addresses
              </Link>
            </div>
          )}
          {addresses.length === 0 && (
            <Link to="/addresses" className="block text-xs text-ink underline">
              + Add delivery address
            </Link>
          )}

          <div className="space-y-2 text-sm text-muted pt-2 border-t border-line">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-ink font-medium">{formatPrice(cart.subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount ({couponApplied})</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-700 font-medium">Free</span>
            </div>
            <div className="border-t border-line pt-2 mt-2 flex justify-between font-bold text-ink text-base">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={checkingOut}
            className="w-full py-3 rounded-full bg-accent text-ink font-medium border border-ink hover:bg-accent-dark disabled:opacity-50"
          >
            {checkingOut ? "Opening checkout..." : "Checkout"}
          </button>
          <Link to="/" className="block text-center text-sm font-medium text-ink underline underline-offset-4">
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
