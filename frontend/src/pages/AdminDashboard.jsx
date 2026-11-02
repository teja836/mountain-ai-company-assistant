import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function AdminDashboard() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Private AI chat state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [chatMessages, chatLoading, chatOpen]);

  const stats = [
    { title: "Total Services", value: "6", icon: "🛠️" },
    { title: "Total Products", value: "3", icon: "📦" },
    { title: "AI Assistant", value: "Active", icon: "🤖" },
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
        `Successfully sent ${data.filename} for processing. Extracted ${data.characters_extracted} characters.`,
      );
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err.message || "Could not connect to the backend.");
    } finally {
      setUploading(false);
    }
  }

  async function handleChat(event) {
    event.preventDefault();

    const question = chatInput.trim();

    if (!question || chatLoading) return;

    const token = sessionStorage.getItem("access_token");

    if (!token) {
      setChatError("Your session has expired. Please log in again.");
      return;
    }

    setChatError("");
    setChatInput("");
    setChatMessages((previous) => [
      ...previous,
      {
        role: "user",
        text: question,
        time: new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
      },
    ]);
    setChatLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/private-chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatInput: question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "The private AI request failed.",
        );
      }

      if (!data.answer) {
        throw new Error("The AI returned an empty answer.");
      }

      setChatMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: data.answer,
          time: new Date().toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (err) {
      setChatError(
        err.message || "Could not connect to the private AI assistant.",
      );
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60 text-slate-900">
      {" "}
      <style>{`       @keyframes assistant-pop { from { opacity: 0; transform: translateY(18px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }       @keyframes message-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }      @keyframes orb-float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-4px) rotate(5deg); } }     @keyframes typing-dot { 0%,60%,100% { transform: translateY(0); opacity: .45; } 30% { transform: translateY(-4px); opacity: 1; } }      .assistant-pop { animation: assistant-pop .28s cubic-bezier(.2,.8,.2,1) both; transform-origin: bottom right; }      .message-in { animation: message-in .22s ease-out both; }        .ai-orb { animation: orb-float 3s ease-in-out infinite; }     .typing-dot { animation: typing-dot 1s infinite ease-in-out; }      .typing-dot:nth-child(2) { animation-delay: .15s; } .typing-dot:nth-child(3) { animation-delay: .3s; }\n        @media (prefers-reduced-motion: reduce) { .assistant-pop, .message-in, .ai-orb, .typing-dot { animation: none !important; } }     `}</style>
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/85 px-6 py-4 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 font-bold text-white shadow-lg shadow-blue-200">
              M
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Mountain-AI</h1>
              <p className="text-xs text-slate-500">Admin Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700 hover:shadow-md"
            >
              View Website
            </Link>

            <button
              onClick={() => {
                sessionStorage.removeItem("access_token");
                window.location.href = "/login";
              }}
              className="rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">
        {" "}
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-900 p-7 text-white shadow-xl shadow-blue-950/10 sm:p-9">
          {" "}
          <div className="flex flex-wrap items-center justify-between gap-5">
            {" "}
            <div>
              <p className="text-xs font-bold tracking-[0.22em] text-blue-300">
                MOUNTAIN-AI / CONTROL CENTER
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Admin Overview
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Manage company information, private documents, and your AI
                assistant from one secure workspace.
              </p>
            </div>
            {" "}
            <div className="ai-orb flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-inner backdrop-blur">
              <AIIcon className="h-10 w-10 text-blue-200" />
            </div>
            {" "}
          </div>
          {" "}
        </div>
        {/* Dashboard statistics */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <article
              key={stat.title}
              className="group rounded-2xl border border-white bg-white/90 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-slate-200/70"
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
        {/* Private document upload */}
        <section className="mt-8 rounded-3xl border border-white bg-white/90 p-6 shadow-lg shadow-slate-200/50 backdrop-blur transition duration-300 hover:shadow-xl sm:p-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📚</span>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Private Document Management
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Upload documents for processing by the private AI knowledge
                workflow.
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

            {/* Hidden native file input. The Choose File button opens this picker. */}
            <input
              ref={fileInputRef}
              id="admin-document"
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,text/plain"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0] || null;
                setFile(selectedFile);
                setMessage("");
                setError("");
              }}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
            />

            <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">
                  {file ? file.name : "No document selected"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {file
                    ? `${(file.size / 1024).toFixed(1)} KB · Ready to upload`
                    : "Choose a PDF, DOCX, or TXT file from your computer."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMessage("");
                  setError("");
                  fileInputRef.current?.click();
                }}
                disabled={uploading}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UploadIcon />
                Choose File
              </button>
            </div>

            <button
              type="submit"
              disabled={uploading || !file}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-md shadow-blue-200 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon />
                  Upload Document
                </>
              )}
            </button>
          </form>

          {message && (
            <p
              role="status"
              className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800"
            >
              {message}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
            >
              {error}
            </p>
          )}
        </section>
        {/* Security information */}
        <section className="mt-8 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-sm">
          <h3 className="font-bold text-blue-900">Admin security</h3>
          <p className="mt-2 text-sm leading-6 text-blue-800">
            Document uploads and private chat requests require a valid login
            token and administrator permissions enforced by FastAPI. The private
            n8n webhook secret is never sent to the browser. Only upload
            documents you are authorized to use.
          </p>
        </section>
      </main>
      {/* Floating private AI assistant */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
        {chatOpen && (
          <section className="assistant-pop mb-4 flex h-[min(650px,78vh)] w-[min(410px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.6rem] border border-white/80 bg-white shadow-[0_24px_90px_-20px_rgba(15,23,42,.45)] ring-1 ring-slate-900/5">
            <div className="relative flex items-center gap-3 overflow-hidden bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-800 px-4 py-4 text-white">
              <div className="ai-orb flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-inner">
                <AIIcon className="h-7 w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold">Mountain-AI Assistant</h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-blue-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.8)]" />{" "}
                  Private knowledge · Admin only
                </p>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                aria-label="Minimize private AI assistant"
                className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <span className="text-xl leading-none">−</span>
              </button>
            </div>

            <div
              className="flex flex-1 flex-col gap-4 overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-blue-50/50 p-4 scroll-smooth"
              aria-live="polite"
            >
              {chatMessages.length === 0 && (
                <div className="m-auto max-w-xs py-6 text-center">
                  <div className="ai-orb mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-200">
                    <AIIcon className="h-9 w-9" />
                  </div>
                  <h4 className="mt-4 font-semibold text-slate-800">
                    Your private AI assistant
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Ask questions about documents uploaded to your private
                    knowledge base.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setChatInput(
                        "What is Project Cedar, and what is its planned review date?",
                      )
                    }
                    className="mt-4 rounded-xl border border-blue-100 bg-white px-3.5 py-2.5 text-left text-xs font-semibold text-blue-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                  >
                    Try: What is Project Cedar's review date?
                  </button>
                </div>
              )}

              {chatMessages.map((chat, index) => (
                <div
                  key={`${index}-${chat.role}`}
                  className={`message-in flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-3 text-sm leading-6 ${
                      chat.role === "user"
                        ? "rounded-br-sm bg-blue-600 text-white"
                        : "rounded-bl-sm border border-slate-200 bg-white text-slate-800 shadow-sm"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold opacity-70">
                      {chat.role === "assistant" && (
                        <AIIcon className="h-4 w-4" />
                      )}
                      <span>
                        {chat.role === "user" ? "You" : "Mountain-AI"}
                      </span>
                      {chat.time && <span>· {chat.time}</span>}
                    </div>
                    {chat.text}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="message-in flex items-center gap-2.5 self-start rounded-2xl rounded-bl-md border border-slate-100 bg-white px-4 py-3 text-sm text-slate-500 shadow-md shadow-slate-200/50">
                  <AIIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Thinking</span>
                  <span className="flex items-center gap-1">
                    <i className="typing-dot h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <i className="typing-dot h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <i className="typing-dot h-1.5 w-1.5 rounded-full bg-blue-500" />
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {chatError && (
              <div
                role="alert"
                className="mx-3 mt-2 rounded-lg bg-red-50 p-3 text-xs text-red-700"
              >
                {chatError}
              </div>
            )}

            <form
              onSubmit={handleChat}
              className="border-t border-slate-100 bg-white/95 p-3 backdrop-blur"
            >
              <div className="flex items-end gap-2">
                <textarea
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  placeholder="Ask your private AI..."
                  aria-label="Ask your private AI assistant"
                  maxLength={4000}
                  rows={1}
                  disabled={chatLoading}
                  className="max-h-28 min-h-11 min-w-0 flex-1 resize-y rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  aria-label="Send question"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <SendIcon />
                </button>
              </div>
              <p className="mt-2 text-[10px] text-slate-400">
                Private admin chat · Requests are securely routed through
                FastAPI
              </p>
            </form>
          </section>
        )}

        <button
          type="button"
          onClick={() => setChatOpen((open) => !open)}
          aria-label={
            chatOpen
              ? "Close private AI assistant"
              : "Open private AI assistant"
          }
          className="group relative flex h-[68px] w-[68px] items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white shadow-[0_12px_35px_-8px_rgba(79,70,229,.8)] ring-4 ring-white transition duration-300 hover:-translate-y-1 hover:scale-[1.04] hover:shadow-[0_18px_45px_-8px_rgba(79,70,229,.8)] focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-95"
        >
          <AIIcon
            className={`h-9 w-9 transition duration-300 group-hover:rotate-12 group-hover:scale-110 ${chatOpen ? "rotate-45" : ""}`}
          />
          {!chatOpen && chatMessages.length > 0 && (
            <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
          )}
        </button>
      </div>
    </div>
  );
}

function UploadIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 14.5v3A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5v-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AIIcon({ className = "h-6 w-6" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 3.5 18.9 11l7.6 2.9-7.6 2.9L16 24.5l-2.9-7.7-7.6-2.9 7.6-2.9L16 3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m25 19 1.5 3.5L30 24l-3.5 1.5L25 29l-1.5-3.5L20 24l3.5-1.5L25 19Z"
        fill="currentColor"
      />
      <path
        d="m6 3 .9 2.1L9 6l-2.1.9L6 9l-.9-2.1L3 6l2.1-.9L6 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 3 14 21l-4-8-8-4 19-6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 3 10 13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default AdminDashboard;
