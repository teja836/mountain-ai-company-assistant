
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

function AdminRoute() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;

    async function verifyAdmin() {
      const token = sessionStorage.getItem("access_token");

      if (!token) {
        if (!cancelled) setStatus("unauthenticated");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          sessionStorage.removeItem("access_token");
          sessionStorage.removeItem("user");

          if (!cancelled) setStatus("unauthenticated");
          return;
        }

        if (!response.ok) {
          throw new Error(`Account verification failed (${response.status}).`);
        }

        const user = await response.json();
        const role = String(user.role || "").trim().toLowerCase();

        console.log("Admin route account check:", {
          email: user.email,
          role,
        });

        if (!cancelled) {
          setStatus(role === "admin" ? "admin" : "forbidden");
        }
      } catch (error) {
        console.error("Admin route verification error:", error);

        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    verifyAdmin();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Verifying admin access...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  if (status === "forbidden") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Admin Access Required
        </h1>
        <p className="text-slate-600">
          Your account does not have admin permissions.
        </p>
        <button
          onClick={() => window.location.assign("/dashboard")}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
        <p className="text-red-600">
          Unable to verify admin access. Check that FastAPI is running and try again.
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

  return <Outlet />;
}

export default AdminRoute;
