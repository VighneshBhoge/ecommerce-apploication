import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      const wantsBusiness = mode === "business";
      if (wantsBusiness && data.user.role !== "ADMIN") {
        setError("This is not a business account. Switch to the customer tab.");
        return;
      }
      if (!wantsBusiness && data.user.role === "ADMIN") {
        setError("This is a business account. Use the Business tab to log in.");
        return;
      }

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
          {mode === "business" ? "Business login" : "Welcome back"}
        </h1>

        {error && (
          <p className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 border border-red-100 text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full border border-line bg-paper focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full border border-line bg-paper focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-full bg-accent text-ink font-medium border border-ink hover:bg-accent-dark disabled:opacity-50"
          >
            {submitting
              ? "Logging in..."
              : mode === "business"
              ? "Log in to Dashboard"
              : "Log In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          No account?{" "}
          <Link to="/register" className="font-medium text-ink underline underline-offset-4">
            Sign up
          </Link>
        </p>

        <div className="mt-6 pt-4 border-t border-line text-xs text-muted text-center">
          Demo customer: customer@shop.com / password123
          <br />
          Demo business: admin@shop.com / admin123
        </div>
      </div>
    </main>
  );
}
