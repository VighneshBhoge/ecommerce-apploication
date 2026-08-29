import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  if (!user) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-line rounded-2xl p-10 hard-shadow-sm max-w-md mx-auto">
          <p className="text-muted mb-4">Log in to view your profile.</p>
          <Link to="/login" className="inline-block px-6 py-2.5 rounded-full bg-accent border border-ink text-ink font-medium">
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  async function handleProfile(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      const data = await api("/auth/profile", { method: "PUT", body: { name } });
      login(localStorage.getItem("token"), data.user);
      setMsg("Profile updated");
    } catch (e) {
      setErr(e.message);
    }
  }

  async function handlePassword(e) {
    e.preventDefault();
    setPwErr("");
    setPwMsg("");
    if (pw.next !== pw.confirm) return setPwErr("New passwords do not match");
    try {
      await api("/auth/password", { method: "PUT", body: { currentPassword: pw.current, newPassword: pw.next } });
      setPwMsg("Password changed");
      setPw({ current: "", next: "", confirm: "" });
    } catch (e) {
      setPwErr(e.message);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink">Profile</h1>

      <div className="bg-white border border-line rounded-2xl p-6 hard-shadow-sm">
        <p className="text-sm text-muted">
          Email <span className="font-medium text-ink">{user.email}</span> · Role{" "}
          <span className="px-2 py-0.5 rounded-full bg-accent border border-ink text-xs font-bold">{user.role}</span>
        </p>
        <div className="flex gap-2 mt-3 text-xs">
          <Link to="/orders" className="px-3 py-1.5 rounded-full border border-line bg-paper hover:bg-white">
            Orders
          </Link>
          <Link to="/addresses" className="px-3 py-1.5 rounded-full border border-line bg-paper hover:bg-white">
            Addresses
          </Link>
          <Link to="/wishlist" className="px-3 py-1.5 rounded-full border border-line bg-paper hover:bg-white">
            Wishlist
          </Link>
        </div>
      </div>

      <form onSubmit={handleProfile} className="bg-white border border-line rounded-2xl p-6 hard-shadow-sm space-y-3">
        <h2 className="font-bold text-ink">Edit profile</h2>
        {msg && <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-3 py-2">{msg}</p>}
        {err && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{err}</p>}
        <div>
          <label className="text-xs font-medium text-muted">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-full border border-line bg-paper focus:outline-none focus:ring-2 focus:ring-accent text-sm" />
        </div>
        <button type="submit" className="px-6 py-2 rounded-full bg-accent border border-ink text-sm font-medium hover:bg-accent-dark">
          Save
        </button>
      </form>

      <form onSubmit={handlePassword} className="bg-white border border-line rounded-2xl p-6 hard-shadow-sm space-y-3">
        <h2 className="font-bold text-ink">Change password</h2>
        {pwMsg && <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-3 py-2">{pwMsg}</p>}
        {pwErr && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{pwErr}</p>}
        <input type="password" placeholder="Current password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} className="w-full px-4 py-2.5 rounded-full border border-line bg-paper text-sm" required />
        <input type="password" placeholder="New password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className="w-full px-4 py-2.5 rounded-full border border-line bg-paper text-sm" required />
        <input type="password" placeholder="Confirm new password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className="w-full px-4 py-2.5 rounded-full border border-line bg-paper text-sm" required />
        <button type="submit" className="px-6 py-2 rounded-full bg-ink text-white text-sm font-medium hover:bg-black">
          Update password
        </button>
      </form>
    </main>
  );
}
