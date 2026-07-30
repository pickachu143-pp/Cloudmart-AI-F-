import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Cloud } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md card p-8">
        <div className="flex flex-col items-center mb-6">
          <span className="h-11 w-11 rounded-xl bg-brand-600 text-white flex items-center justify-center mb-3">
            <Cloud size={22} />
          </span>
          <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to your CloudMart AI account</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3.5 py-2.5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-slate-500 text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-brand-600 font-semibold hover:underline">Create one</Link>
        </p>

        <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-400 text-center leading-relaxed">
          Demo admin: admin@cloudmart.ai / Admin@12345
          <br />
          Demo customer: customer@cloudmart.ai / Customer@123
        </div>
      </div>
    </div>
  );
};

export default Login;
