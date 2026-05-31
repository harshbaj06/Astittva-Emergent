import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_50ac1e2c-4ee3-4d48-ad5e-fd37063ae3c0/artifacts/13645h8f_Astittva%20group%20logo.jpeg";

export default function AdminLoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user && user !== false) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await login(email, password);
    if (res.ok) {
      toast.success("Welcome back");
      navigate("/admin");
    } else {
      setError(res.error || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div data-testid="admin-login-page" className="min-h-screen bg-charcoal flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <img src={LOGO_URL} alt="Astitva" className="h-20 w-20 mx-auto mb-6 ring-1 ring-copper/40 object-cover" />
          <div className="overline mb-2">Astitva Group</div>
          <h1 className="font-display font-light text-3xl text-ivory">Admin Console</h1>
        </div>

        <form onSubmit={submit} className="luxury-card p-8 sm:p-10 space-y-5" data-testid="login-form">
          <div>
            <label className="input-label">Email</label>
            <input
              type="email"
              required
              data-testid="login-email"
              className="input-filled"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="input-label">Password</label>
            <input
              type="password"
              required
              data-testid="login-password"
              className="input-filled"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div data-testid="login-error" className="text-red-400 text-sm">{error}</div>}
          <button type="submit" disabled={loading} data-testid="login-submit" className="btn-primary w-full disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
