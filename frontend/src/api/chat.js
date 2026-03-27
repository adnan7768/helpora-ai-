/**
 * Sends a user message to the FastAPI backend and returns the response.
 * @param {string} message - The current user message
 * @param {Array<{role: string, content: string}>} history - Previous chat history
 */
export async function sendMessage(message, history = []) {
  const response = await fetch("http://localhost:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error ${response.status}`);
  }

  return response.json(); // { reply: string, context_used: string[] }
}
