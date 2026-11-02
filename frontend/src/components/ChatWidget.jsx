import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { sendChatMessage } from "../services/chatService";

function getCurrentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const createWelcomeMessage = () => ({
  role: "assistant",
  text: "Hi! Welcome to Mountain-AI Technologies. How can I help you with our company, services, or products?",
  time: getCurrentTime(),
});

function cleanAssistantText(text) {
  let cleaned = String(text ?? "").trim();

  // Remove a code fence that wraps the entire response.
  cleaned = cleaned.replace(
    /^```(?:jsx|javascript|markdown|md|text|txt)?[ \t]*\r?\n([\s\S]*?)\r?\n```[ \t]*$/i,
    "$1"
  );

  // Repair flattened Markdown tables, such as a table whose rows were
  // returned on one line. Keep any introduction and trailing sentence.
  const separatorPattern =
    /\|[ \t]*:?-{3,}:?[ \t]*(?:\|[ \t]*:?-{3,}:?[ \t]*)+\|/;
  const separatorMatch = separatorPattern.exec(cleaned);

  if (separatorMatch) {
    const separatorStart = separatorMatch.index;
    const previousNewline = cleaned.lastIndexOf("\n", separatorStart);
    const lineStart = previousNewline + 1;
    const firstPipeOnLine = cleaned.indexOf("|", lineStart);
    const headerStart =
      firstPipeOnLine !== -1 && firstPipeOnLine < separatorStart
        ? firstPipeOnLine
        : lineStart;
    const headerLine = cleaned.slice(headerStart, separatorStart).trim();
    const columnCount = (headerLine.match(/\|/g) || []).length - 1;

    if (columnCount > 0) {
      const afterSeparator = separatorStart + separatorMatch[0].length;
      const lastPipe = cleaned.lastIndexOf("|");
      const tableEnd = lastPipe >= afterSeparator ? lastPipe + 1 : cleaned.length;
      const tableBody = cleaned.slice(afterSeparator, tableEnd);
      const trailingText = cleaned.slice(tableEnd).trim();

      const cells = tableBody
        .split("|")
        .map((cell) => cell.trim())
        .filter(Boolean);

      // In a flattened table, each row contains the same number of cells.
      // Rebuild only when the cells can be grouped into complete rows.
      if (cells.length >= columnCount && cells.length % columnCount === 0) {
        const rows = [];
        for (let index = 0; index < cells.length; index += columnCount) {
          rows.push(`| ${cells.slice(index, index + columnCount).join(" | ")} |`);
        }

        const intro = cleaned.slice(0, headerStart).trimEnd();
        const normalizedTable = [
          headerLine,
          separatorMatch[0].trim(),
          ...rows,
        ].join("\n");

        cleaned = [
          intro,
          normalizedTable,
          trailingText,
        ].filter(Boolean).join("\n\n");
      }
    }
  }

  return cleaned;
}

function TableView({ children }) {
  const [expanded, setExpanded] = useState(false);
  const tableRef = useRef(null);
  const [copyState, setCopyState] = useState("Copy table");

  async function copyTable() {
    const table = tableRef.current?.querySelector("table");
    if (!table) return;

    const rows = Array.from(table.querySelectorAll("tr")).map((row) =>
      Array.from(row.querySelectorAll("th, td"))
        .map((cell) => cell.innerText.trim().replace(/\s+/g, " "))
        .join("\t")
    );

    try {
      await navigator.clipboard.writeText(rows.join("\n"));
      setCopyState("Copied!");
      window.setTimeout(() => setCopyState("Copy table"), 1600);
    } catch (error) {
      console.error("Could not copy table:", error);
      setCopyState("Copy unavailable");
      window.setTimeout(() => setCopyState("Copy table"), 1800);
    }
  }

  return (
    <div
      className={`my-3 max-w-full rounded-xl border border-slate-200 bg-white shadow-sm ${
        expanded
          ? "fixed inset-3 z-[70] flex flex-col overflow-hidden sm:inset-8"
          : "overflow-hidden"
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Table data
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={copyTable}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
          >
            {copyState}
          </button>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="rounded-lg bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-blue-700"
          >
            {expanded ? "Close full table" : "View full table"}
          </button>
        </div>
      </div>

      {expanded && (
        <button
          type="button"
          aria-label="Close expanded table overlay"
          onClick={() => setExpanded(false)}
          className="fixed inset-0 -z-10 cursor-default bg-slate-950/40"
        />
      )}

      <div
        ref={tableRef}
        className={`max-w-full overflow-auto ${
          expanded ? "min-h-0 flex-1 p-3" : "p-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([createWelcomeMessage()]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sessionId = useRef(crypto.randomUUID());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  function startNewChat() {
    if (isLoading) return;
    sessionId.current = crypto.randomUUID();
    setMessages([createWelcomeMessage()]);
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const text = message.trim();
    if (!text || isLoading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", text, time: getCurrentTime() },
    ]);
    setMessage("");
    setIsLoading(true);

    try {
      const result = await sendChatMessage(text, sessionId.current);
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: cleanAssistantText(
            result?.reply || "Sorry, I couldn't find a response."
          ),
          time: getCurrentTime(),
        },
      ]);
    } catch (error) {
      console.error("Mountain-AI chat error:", error);
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: "Sorry, I couldn't connect right now. Please check your connection and try again.",
          time: getCurrentTime(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const markdownComponents = {
    table: ({ children }) => (
      <TableView>
        <table className="w-full min-w-[430px] border-collapse text-left text-xs leading-5">
          {children}
        </table>
      </TableView>
    ),
    thead: ({ children }) => (
      <thead className="bg-blue-50 text-slate-800">{children}</thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-slate-200">{children}</tbody>
    ),
    tr: ({ children }) => (
      <tr className="transition-colors hover:bg-blue-50/50">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-2 align-top">{children}</td>
    ),
    ul: ({ children }) => (
      <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>
    ),
    li: ({ children }) => <li className="pl-1">{children}</li>,
    p: ({ children }) => <p className="my-1">{children}</p>,
    h1: ({ children }) => (
      <h1 className="mb-2 mt-3 text-lg font-bold text-slate-900">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-2 mt-3 text-base font-bold text-slate-900">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-1 mt-2 font-bold text-slate-900">{children}</h3>
    ),
    strong: ({ children }) => (
      <strong className="font-bold text-slate-900">{children}</strong>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-2 border-l-4 border-blue-300 pl-3 text-slate-600">
        {children}
      </blockquote>
    ),
    a: ({ children, href }) => (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 underline underline-offset-2 hover:text-blue-800"
      >
        {children}
      </a>
    ),
    code: ({ children }) => (
      <code className="break-words rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-800">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="my-3 max-w-full overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs leading-5 text-slate-100">
        {children}
      </pre>
    ),
    hr: () => <hr className="my-3 border-slate-200" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <style>{`
        @keyframes chat-pop {
          from { opacity: 0; transform: translateY(18px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes message-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        .chat-pop { animation: chat-pop 220ms cubic-bezier(0.16, 1, 0.3, 1); }
        .chat-message { animation: message-in 220ms ease-out both; }
        .typing-dot { animation: typing-dot 1s infinite ease-in-out; }
        .typing-dot:nth-child(2) { animation-delay: 150ms; }
        .typing-dot:nth-child(3) { animation-delay: 300ms; }
        @media (prefers-reduced-motion: reduce) {
          .chat-pop, .chat-message, .typing-dot { animation: none; }
        }
      `}</style>

      {isOpen && (
        <section
          aria-label="Mountain-AI chat window"
          className="chat-pop mb-4 flex h-[min(560px,calc(100dvh-120px))] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20"
        >
          <header className="flex items-center justify-between bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 px-4 py-4 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-xl">
                ✦
              </div>
              <div className="min-w-0">
                <h2 className="font-bold tracking-tight">Mountain-AI Assistant</h2>
                <p className="mt-1 flex items-center gap-2 text-xs text-blue-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Company information and support
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={startNewChat}
                disabled={isLoading}
                className="rounded-xl px-3 py-2 text-xs font-semibold transition duration-200 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                title="Start a new conversation"
              >
                + New
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-2xl transition duration-200 hover:rotate-90 hover:bg-white/15"
              >
                ×
              </button>
            </div>
          </header>

          <div
            className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-slate-50 to-white p-4"
            aria-live="polite"
            aria-relevant="additions"
          >
            <div className="text-center">
              <span className="inline-block rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-medium tracking-wide text-slate-500 shadow-sm">
                MOUNTAIN-AI SUPPORT
              </span>
            </div>

            {messages.map((item, index) => (
              <div
                key={`${sessionId.current}-${index}`}
                className={`chat-message flex ${
                  item.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`min-w-0 max-w-[88%] break-words rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                    item.role === "user"
                      ? "rounded-br-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                      : "rounded-bl-md border border-slate-200/80 bg-white text-slate-700"
                  }`}
                >
                  {item.role === "assistant" ? (
                    <div className="chat-markdown min-w-0">
                      <ReactMarkdown skipHtml components={markdownComponents}>
                        {item.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{item.text}</p>
                  )}

                  {item.time && (
                    <p
                      className={`mt-2 text-right text-[10px] leading-4 ${
                        item.role === "user" ? "text-blue-100" : "text-slate-400"
                      }`}
                    >
                      {item.time}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chat-message flex justify-start">
                <div
                  className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-4 shadow-sm"
                  role="status"
                  aria-label="Assistant is typing"
                >
                  <span className="typing-dot h-2 w-2 rounded-full bg-blue-500" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-blue-500" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-blue-500" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 transition duration-200 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask about our company..."
                aria-label="Your message"
                autoComplete="off"
                disabled={isLoading}
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm transition duration-200 hover:scale-105 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400">
              Powered by Mountain-AI Technologies
            </p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
        aria-expanded={isOpen}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-2xl text-white shadow-xl shadow-blue-600/30 transition duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-blue-600/40 active:scale-95"
      >
        {isOpen ? (
          <span className="text-3xl leading-none">×</span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="27"
            height="27"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8Z" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default ChatWidget;
