import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { login, register } from "../services/auth";

export default function AuthForm({ mode, onAuth }) {
  const isLogin = mode === "login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = isLogin
        ? await login(email, password)
        : await register(email, password);
      onAuth(user);
      navigate("/");
    } catch (err) {
      setError(err.message || (isLogin ? "Login failed" : "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center">
      <div className="w-full rounded-2xl border border-border bg-surface p-7 shadow-2xl shadow-black/40 sm:p-8">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary font-serif italic text-xl text-on-primary">
            R
          </span>
          <h1 className="font-serif text-2xl text-foreground sm:text-3xl">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {isLogin
              ? "Log in to access your watchlist."
              : "Sign up to start building your watchlist."}
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/15 px-3 py-2 text-center text-sm text-foreground">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-faint focus:border-primary/60"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-faint focus:border-primary/60"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-on-primary transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Please wait..." : isLogin ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <NavLink
            to={isLogin ? "/register" : "/login"}
            className="font-semibold text-primary transition hover:text-primary-strong"
          >
            {isLogin ? "Register" : "Log in"}
          </NavLink>
        </p>
      </div>
    </div>
  );
}