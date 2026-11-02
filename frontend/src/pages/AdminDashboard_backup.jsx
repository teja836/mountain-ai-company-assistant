
import { useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function AdminDashboard() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const stats = [
    { title: "Total Services", value: "6", icon: "🛠️" },
    { title: "Total Products", value: "3", icon: "📦" },
    { title: "AI Assistant", value: "Active in n8n", icon: "🤖" },
  ];

  async function handleUpload(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!file) {
      setError("Please select a PDF, DOCX, or TXT file.");
      return;
    }

    const token = sessionStorage.getItem("access_token");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    try {
      const response = await fetch(`${API_URL}/admin/documents/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Document upload failed.");
      }

      setMessage(
        `Successfully sent ${data.filename} for processing. Extracted ${data.characters_extracted} characters.`
      );
      setFile(null);
      event.target.reset();
    } catch (err) {
      setError(err.message || "Could not connect to the backend.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 font-bold text-white">
              M
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Mountain-AI</h1>
              <p className="text-xs text-slate-500">Admin Dashboard</p>
            </div>
          </div>

          <Link
            to="/"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-600"
          >
            View Website
          </Link>
          <button
    onClick={() => {
      sessionStorage.removeItem("access_token");
      window.location.href = "/login";
    }}
    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
  >
    Logout
  </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="font-semibold text-blue-600">ADMINISTRATION</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          Admin Overview
        </h2>
        <p className="mt-3 text-slate-600">
          Manage company information and private AI documents.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <article
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900">
                {stat.value}
              </p>
            </article>
          ))}
        </div>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📚</span>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Private Document Management
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Upload documents for processing by the private AI knowledge workflow.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpload} className="mt-6 space-y-4">
            <label
              htmlFor="admin-document"
              className="block text-sm font-semibold text-slate-700"
            >
              Select a document (PDF, DOCX, or TXT)
            </label>

            <input
              id="admin-document"
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,text/plain"
              onChange={(event) => {
                setFile(event.target.files?.[0] || null);
                setMessage("");
                setError("");
              }}
              className="block w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-700"
            />

            <button
              type="submit"
              disabled={uploading}
              className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Upload Document"}
            </button>
          </form>

          {message && (
            <p role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
              {message}
            </p>
          )}

          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {error}
            </p>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <h3 className="font-bold text-blue-900">Admin security</h3>
          <p className="mt-2 text-sm leading-6 text-blue-800">
            Document uploads require a valid login token and administrator
            permissions enforced by the FastAPI backend. Only upload documents
            you are authorized to use.
          </p>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;