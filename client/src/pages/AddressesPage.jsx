import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const EMPTY = { label: "Home", line1: "", line2: "", city: "", state: "", zip: "", country: "India", phone: "", isDefault: false };

export default function AddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const d = await api("/addresses");
      setAddresses(d.addresses);
    } catch {}
  }

  useEffect(() => {
    if (user) load();
  }, [user]);

  function upd(k) {
    return (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await api(`/addresses/${editing}`, { method: "PUT", body: form });
      } else {
        await api("/addresses", { method: "POST", body: form });
      }
      setShow(false);
      setEditing(null);
      setForm(EMPTY);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!user) return <main className="max-w-3xl mx-auto px-4 py-16 text-center text-muted">Log in to manage addresses.</main>;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Addresses</h1>
        <button
          onClick={() => {
            setForm(EMPTY);
            setEditing(null);
            setShow(true);
            setError("");
          }}
          className="px-4 py-2 rounded-full bg-accent text-ink border border-ink text-sm font-medium hover:bg-accent-dark"
        >
          + Add address
        </button>
      </div>

      {show && (
        <form onSubmit={submit} className="bg-white border border-line rounded-2xl p-5 mb-6 hard-shadow-sm grid sm:grid-cols-2 gap-3">
          {error && <p className="sm:col-span-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
          <input placeholder="Label (Home, Office)" value={form.label} onChange={upd("label")} className="px-3 py-2 rounded-full border border-line bg-paper text-sm" />
          <input placeholder="Phone *" value={form.phone} onChange={upd("phone")} required className="px-3 py-2 rounded-full border border-line bg-paper text-sm" />
          <input placeholder="Line 1 *" value={form.line1} onChange={upd("line1")} required className="sm:col-span-2 px-3 py-2 rounded-full border border-line bg-paper text-sm" />
          <input placeholder="Line 2" value={form.line2} onChange={upd("line2")} className="sm:col-span-2 px-3 py-2 rounded-full border border-line bg-paper text-sm" />
          <input placeholder="City *" value={form.city} onChange={upd("city")} required className="px-3 py-2 rounded-full border border-line bg-paper text-sm" />
          <input placeholder="State *" value={form.state} onChange={upd("state")} required className="px-3 py-2 rounded-full border border-line bg-paper text-sm" />
          <input placeholder="ZIP *" value={form.zip} onChange={upd("zip")} required className="px-3 py-2 rounded-full border border-line bg-paper text-sm" />
          <input placeholder="Country" value={form.country} onChange={upd("country")} className="px-3 py-2 rounded-full border border-line bg-paper text-sm" />
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={form.isDefault} onChange={upd("isDefault")} /> Set as default
          </label>
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" className="px-5 py-2 rounded-full bg-accent border border-ink text-sm font-medium">
              {editing ? "Update" : "Save"}
            </button>
            <button type="button" onClick={() => setShow(false)} className="px-5 py-2 rounded-full border border-line bg-white text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {addresses.map((a) => (
          <div key={a.id} className="bg-white border border-line rounded-2xl p-4 hard-shadow-sm flex justify-between">
            <div className="text-sm">
              <p className="font-bold text-ink">
                {a.label} {a.isDefault && <span className="ml-2 text-xs bg-accent border border-ink px-2 py-0.5 rounded-full">Default</span>}
              </p>
              <p className="text-muted mt-1">
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.zip}, {a.country}
              </p>
              <p className="text-muted">Phone: {a.phone}</p>
            </div>
            <div className="flex flex-col gap-2 text-sm shrink-0 ml-4">
              <button
                onClick={() => {
                  setForm({ ...a });
                  setEditing(a.id);
                  setShow(true);
                }}
                className="text-ink underline"
              >
                Edit
              </button>
              <button
                onClick={async () => {
                  if (!confirm("Delete this address?")) return;
                  await api(`/addresses/${a.id}`, { method: "DELETE" });
                  load();
                }}
                className="text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {addresses.length === 0 && !show && <p className="text-muted text-sm">No addresses yet.</p>}
      </div>
    </main>
  );
}
