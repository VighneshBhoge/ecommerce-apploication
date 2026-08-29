import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("customer");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    businessCode: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (mode === "business" && !form.businessCode.trim()) {
      setError("Business access code is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        ...(mode === "business" && {
          role: "ADMIN",
          businessCode: form.businessCode.trim(),
        }),
      };

      const data = await api("/auth/register", {
        method: "POST",
        body: payload,
      });
      login(data.token, data.user);
      navigate(data.user.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <div className="bg-white border border-line rounded-2xl p-8 hard-shadow">
        <div className="flex bg-paper rounded-full p-1 mb-6 border border-line">
          {[
            { id: "customer", label: "Customer" },
            { id: "business", label: "Business" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setMode(t.id);
                setError("");
              }}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                mode === t.id
                  ? "bg-accent text-ink border border-ink"
                  : "text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <h1 className="font-display text-2xl font-bold text-ink mb-6">
          {mode === "business" ? "Create business account" : "Create your account"}
        </h1>

        {error && (
          <p className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 border border-red-100 text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              {mode === "business" ? "Business name" : "Name"}
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={update("name")}
              className="w-full px-4 py-2.5 rounded-full border border-line bg-paper focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder={mode === "business" ? "Acme Pvt. Ltd." : "John Doe"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={update("email")}
              className="w-full px-4 py-2.5 rounded-full border border-line bg-paper focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="you@example.com"
            />
          </div>

          {mode === "business" && (
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Business access code
              </label>
              <input
                type="text"
                required
                value={form.businessCode}
                onChange={update("businessCode")}
                className="w-full px-4 py-2.5 rounded-full border border-line bg-paper focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm"
                placeholder="SHOPLITE-BUSINESS-2026"
              />
              <p className="text-xs text-muted mt-1">
                Demo code: <span className="font-mono font-medium text-ink">SHOPLITE-BUSINESS-2026</span>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={update("password")}
              className="w-full px-4 py-2.5 rounded-full border border-line bg-paper focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Confirm Password</label>
            <input
              type="password"
              required
              value={form.confirm}
              onChange={update("confirm")}
              className="w-full px-4 py-2.5 rounded-full border border-line bg-paper focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Repeat password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-full bg-accent text-ink font-medium border border-ink hover:bg-accent-dark disabled:opacity-50"
          >
            {submitting
              ? "Creating account..."
              : mode === "business"
              ? "Create Business Account"
              : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-ink underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
