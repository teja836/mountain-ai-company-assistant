
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

function UserDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const token = sessionStorage.getItem("access_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          sessionStorage.removeItem("access_token");
          sessionStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load your account details.");
        }

        const userData = await response.json();

        if (!cancelled) {
          setUser(userData);
        }
      } catch {
        if (!cancelled) {
          setError(
            "Unable to connect to the server. Please check that the backend is running."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function handleLogout() {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6">
        <p role="alert" className="text-center text-red-600">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              M
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Mountain-AI</h1>
              <p className="text-xs text-slate-500">User Dashboard</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-600"
            >
              Back to Website
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="font-semibold text-blue-600">YOUR WORKSPACE</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Welcome, {user.name}!
          </h2>
          <p className="mt-3 text-slate-600">
            Access company information and explore the AI assistant.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">
            Your Account
          </h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Full Name</p>
              <p className="mt-1 break-words font-semibold text-slate-900">
                {user.name}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Email Address</p>
              <p className="mt-1 break-words font-semibold text-slate-900">
                {user.email}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Account Role</p>
              <p className="mt-1 font-semibold capitalize text-slate-900">
                {user.role}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-3xl">🤖</div>
            <h3 className="mt-4 text-xl font-bold text-slate-900">
              AI Company Assistant
            </h3>
            <p className="mt-3 leading-7 text-slate-600">
              Ask questions about Mountain-AI Technologies, its services,
              products, and company information.
            </p>
            <Link
              to="/"
              className="mt-4 inline-block font-semibold text-blue-600 hover:text-blue-800"
            >
              Open website assistant →
            </Link>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-3xl">🛠️</div>
            <h3 className="mt-4 text-xl font-bold text-slate-900">
              Our Services
            </h3>
            <p className="mt-3 leading-7 text-slate-600">
              Explore web development, AI solutions, workflow automation,
              and other technology services.
            </p>
            <Link
              to="/#services"
              className="mt-4 inline-block font-semibold text-blue-600 hover:text-blue-800"
            >
              Explore services →
            </Link>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-3xl">📦</div>
            <h3 className="mt-4 text-xl font-bold text-slate-900">
              Our Products
            </h3>
            <p className="mt-3 leading-7 text-slate-600">
              Discover the digital products and AI tools offered by
              Mountain-AI Technologies.
            </p>
            <Link
              to="/#products"
              className="mt-4 inline-block font-semibold text-blue-600 hover:text-blue-800"
            >
              Explore products →
            </Link>
          </article>
        </div>

        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">
          <h3 className="font-bold text-slate-900">Getting Started</h3>
          <p className="mt-2 leading-7 text-slate-600">
            Your account details are loaded from the backend. Explore our
            services and products, or use the company assistant to learn
            more about Mountain-AI Technologies.
          </p>
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;