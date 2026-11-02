
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || "Login failed. Please check your credentials."
        );
      }

      if (!data.access_token || !data.user) {
        throw new Error("The server returned an incomplete login response.");
      }

      // Store the authenticated session.
      sessionStorage.setItem("access_token", data.access_token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      // Send admins and regular users to their respective dashboards.
      const destination =
        data.user.role?.trim().toLowerCase() === "admin"
          ? "/admin"
          : "/dashboard";

      // If a protected page requested login, prefer that destination
      // only when it matches the user's role.
      const requestedPath = location.state?.from?.pathname;
      const safeRequestedPath =
        requestedPath === "/admin" && data.user.role?.trim().toLowerCase() === "admin"
          ? "/admin"
          : requestedPath === "/dashboard" &&
              data.user.role?.trim().toLowerCase() !== "admin"
            ? "/dashboard"
            : destination;

      navigate(safeRequestedPath, { replace: true });
    } catch (err) {
      setError(
        err.message || "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg sm:p-10">
        <Link to="/" className="flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
            M
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Mountain-AI</h1>
            <p className="text-sm text-slate-500">Technologies</p>
          </div>
        </Link>

        <h2 className="mt-8 text-center text-2xl font-bold text-slate-900">
          Welcome Back
        </h2>

        <p className="mt-2 text-center text-slate-600">
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="login-email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email Address
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-blue-600 hover:text-blue-800"
          >
            Sign up
          </Link>
        </p>

        <Link
          to="/"
          className="mt-6 block text-center text-sm text-slate-500 hover:text-blue-600"
        >
          ← Back to Home
        </Link>
      </div>
    </section>
  );
}

export default Login;
