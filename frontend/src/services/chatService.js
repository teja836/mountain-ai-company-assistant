const N8N_CHAT_WEBHOOK_URL = import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL;

export async function sendChatMessage(message, sessionId) {
  if (!N8N_CHAT_WEBHOOK_URL) {
    throw new Error("The n8n chat webhook URL has not been configured yet.");
  }

  const response = await fetch(N8N_CHAT_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chatInput: message,
      sessionId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed (${response.status}).`);
  }

  const data = await response.json();

  return {
    reply:
      data.output ??
      data.text ??
      data.response ??
      data.reply ??
      "Sorry, I couldn't find a response.",
  };
}