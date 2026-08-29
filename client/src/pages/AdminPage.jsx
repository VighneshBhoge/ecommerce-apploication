import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatPrice } from "../utils/format.js";
import AdminProducts from "../components/AdminProducts.jsx";
import AdminOrders from "../components/AdminOrders.jsx";
import AdminCoupons from "../components/AdminCoupons.jsx";
import AdminCustomers from "../components/AdminCustomers.jsx";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);

  async function loadStats() {
    try {
      const data = await api("/admin/stats");
      setStats(data.stats);
    } catch {}
  }

  useEffect(() => {
    if (user?.role === "ADMIN") {
      loadStats();
      api("/categories").then((data) => setCategories(data.categories)).catch(() => {});
    }
  }, [user]);

  if (authLoading) {
    return <main className="max-w-6xl mx-auto px-4 py-16 text-center text-muted">Loading...</main>;
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <main className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-line rounded-2xl p-10 hard-shadow-sm max-w-lg mx-auto">
          <p className="text-red-600 font-medium">Admin access required.</p>
          <p className="text-muted text-sm mt-2">Log in with an admin account (demo: admin@shop.com / admin123).</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink mb-6">Admin Dashboard</h1>

      <div className="flex gap-2 mb-6 border-b border-line overflow-x-auto">
        {["overview", "products", "orders", "coupons", "customers"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors whitespace-nowrap ${
              tab === t ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Revenue", value: formatPrice(stats.revenue) },
            { label: "Orders", value: stats.orders },
            { label: "Products", value: stats.products },
            { label: "Users", value: stats.users },
          ].map((card) => (
            <div key={card.label} className="bg-white border border-line rounded-2xl p-6 hard-shadow-sm">
              <p className="text-sm text-muted">{card.label}</p>
              <p className="font-display text-2xl font-bold text-ink mt-1">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "products" && <AdminProducts categories={categories} onChanged={loadStats} />}

      {tab === "orders" && <AdminOrders />}

      {tab === "coupons" && <AdminCoupons />}

      {tab === "customers" && <AdminCustomers />}
    </main>
  );
}
