import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { formatPrice } from "../utils/format.js";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENT",
    discountValue: "",
    minOrderValue: "",
    maxUses: "",
    expiresAt: "",
  });
  const [error, setError] = useState("");

  async function load() {
    try {
      const d = await api("/coupons");
      setCoupons(d.coupons);
    } catch {}
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api("/coupons", {
        method: "POST",
        body: {
          code: form.code,
          discountType: form.discountType,
          discountValue: form.discountValue,
          minOrderValue: form.minOrderValue || 0,
          maxUses: form.maxUses || undefined,
          expiresAt: form.expiresAt || undefined,
        },
      });
      setForm({ code: "", discountType: "PERCENT", discountValue: "", minOrderValue: "", maxUses: "", expiresAt: "" });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2 className="font-display text-lg font-bold text-ink mb-4">Coupons ({coupons.length})</h2>

      <form
        onSubmit={handleCreate}
        className="bg-white border border-line rounded-2xl p-4 mb-6 hard-shadow-sm grid sm:grid-cols-3 gap-3"
      >
        {error && <p className="sm:col-span-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
        <input placeholder="Code e.g. SAVE15" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required className="px-3 py-2 rounded-full border border-line bg-paper text-sm" />
        <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="px-3 py-2 rounded-full border border-line bg-paper text-sm">
          <option value="PERCENT">Percent %</option>
          <option value="FLAT">Flat ₹</option>
        </select>
        <input placeholder={form.discountType === "PERCENT" ? "10 for 10%" : "50000 for ₹500"} value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} required type="number" className="px-3 py-2 rounded-full border border-line bg-paper text-sm" />
        <input placeholder="Min order paise (e.g. 10000)" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} type="number" className="px-3 py-2 rounded-full border border-line bg-paper text-sm" />
        <input placeholder="Max uses (blank = unlimited)" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} type="number" className="px-3 py-2 rounded-full border border-line bg-paper text-sm" />
        <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="px-3 py-2 rounded-full border border-line bg-paper text-sm" />
        <button type="submit" className="sm:col-span-3 py-2 rounded-full bg-accent border border-ink text-sm font-medium hover:bg-accent-dark">
          Create coupon
        </button>
      </form>

      <div className="bg-white border border-line rounded-2xl overflow-hidden hard-shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-line bg-paper/50">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Min</th>
              <th className="px-4 py-3">Used</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-paper/50">
                <td className="px-4 py-3 font-mono font-medium text-ink">{c.code}</td>
                <td className="px-4 py-3">{c.discountType}</td>
                <td className="px-4 py-3">{c.discountType === "PERCENT" ? `${c.discountValue}%` : formatPrice(c.discountValue)}</td>
                <td className="px-4 py-3">{formatPrice(c.minOrderValue)}</td>
                <td className="px-4 py-3">
                  {c.usedCount}
                  {c.maxUses ? ` / ${c.maxUses}` : ""}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={async () => {
                      if (!confirm(`Delete ${c.code}?`)) return;
                      await api(`/coupons/${c.id}`, { method: "DELETE" });
                      load();
                    }}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
