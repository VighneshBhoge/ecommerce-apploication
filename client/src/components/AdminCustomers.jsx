import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const d = await api("/admin/customers");
      setUsers(d.users);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleRole(u) {
    const nextRole = u.role === "ADMIN" ? "CUSTOMER" : "ADMIN";
    if (!confirm(`Change ${u.email} to ${nextRole}?`)) return;
    try {
      await api(`/admin/customers/${u.id}/role`, { method: "PATCH", body: { role: nextRole } });
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h2 className="font-display text-lg font-bold text-ink mb-4">Customers ({users.length})</h2>
      <div className="bg-white border border-line rounded-2xl overflow-hidden hard-shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-line bg-paper/50">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-paper/50">
                <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                <td className="px-4 py-3 text-muted">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold border ${u.role === "ADMIN" ? "bg-accent border-ink text-ink" : "bg-paper border-line text-muted"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">{u._count.orders}</td>
                <td className="px-4 py-3 text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => toggleRole(u)} className="text-xs font-medium text-ink underline">
                    Make {u.role === "ADMIN" ? "Customer" : "Admin"}
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
