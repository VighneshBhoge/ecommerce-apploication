import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { formatPrice } from "../utils/format.js";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  stock: "",
  imageUrl: "",
  categoryId: "",
};

export default function AdminProducts({ categories, onChanged }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadProducts() {
    try {
      const data = await api("/products?limit=48");
      setProducts(data.products);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  function openCreate() {
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id || "" });
    setEditingId(null);
    setShowForm(true);
    setError("");
  }

  function openEdit(product) {
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
    });
    setEditingId(product.id);
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await api(`/admin/products/${editingId}`, { method: "PUT", body: form });
      } else {
        await api("/admin/products", { method: "POST", body: form });
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      await loadProducts();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    try {
      await api(`/admin/products/${product.id}`, { method: "DELETE" });
      await loadProducts();
      onChanged?.();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold text-ink">Products ({products.length})</h2>
        <button onClick={openCreate} className="px-4 py-2 rounded-full bg-accent text-ink text-sm font-medium border border-ink hover:bg-accent-dark">
          + Add Product
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-line rounded-2xl p-5 mb-6 grid sm:grid-cols-2 gap-4 hard-shadow-sm">
          {error && <p className="sm:col-span-2 px-3 py-2 rounded-xl bg-red-50 text-red-700 border border-red-100 text-sm">{error}</p>}
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Name *</label>
            <input required value={form.name} onChange={update("name")} className="w-full px-3 py-2 rounded-full border border-line bg-paper focus:outline-none focus:ring-2 focus:ring-accent text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Category *</label>
            <select required value={form.categoryId} onChange={update("categoryId")} className="w-full px-3 py-2 rounded-full border border-line bg-paper text-sm focus:outline-none focus:ring-2 focus:ring-accent">
              <option value="" disabled>Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Price (in paise) *</label>
            <input required type="number" min="1" value={form.price} onChange={update("price")} className="w-full px-3 py-2 rounded-full border border-line bg-paper text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Stock</label>
            <input type="number" min="0" value={form.stock} onChange={update("stock")} className="w-full px-3 py-2 rounded-full border border-line bg-paper text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-muted mb-1">Image URL</label>
            <input value={form.imageUrl} onChange={update("imageUrl")} placeholder="https://..." className="w-full px-3 py-2 rounded-full border border-line bg-paper text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-muted mb-1">Description</label>
            <textarea rows="2" value={form.description} onChange={update("description")} className="w-full px-3 py-2 rounded-2xl border border-line bg-paper text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-full bg-accent text-ink text-sm font-medium border border-ink hover:bg-accent-dark disabled:opacity-50">
              {saving ? "Saving..." : editingId ? "Update Product" : "Create Product"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-full border border-line bg-white text-sm font-medium hover:bg-paper">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-line rounded-2xl overflow-hidden hard-shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-line bg-paper/50">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-paper/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover bg-paper border border-line" />
                    <span className="font-medium text-ink">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{p.category?.name}</td>
                <td className="px-4 py-3 text-ink font-medium">{formatPrice(p.price)}</td>
                <td className="px-4 py-3"><span className={p.stock === 0 ? "text-red-600" : "text-muted"}>{p.stock}</span></td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => openEdit(p)} className="font-medium text-ink underline underline-offset-2 mr-4">Edit</button>
                  <button onClick={() => handleDelete(p)} className="font-medium text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
