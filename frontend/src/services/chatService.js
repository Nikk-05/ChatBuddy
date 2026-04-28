const BASE_URL = "http://127.0.0.1:8000/api"

/**
 * Non-streaming chat (kept for fallback use).
 */
export async function generateResponse(messages, conversationId) {
  const lastUserMessage = messages[messages.length - 1].content

  const response = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: lastUserMessage,
      conversation_id: conversationId,
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.detail || "Server error")
  }

  const data = await response.json()
  return data.reply
}

/**
 * Streaming chat — calls onToken for each text chunk, onDone when complete.
 * @param {Array<{role: string, content: string}>} messages
 * @param {number} conversationId
 * @param {(token: string) => void} onToken
 * @param {() => void} onDone
 */
export async function streamResponse(messages, conversationId, onToken, onDone) {
  const lastUserMessage = messages[messages.length - 1].content

  const response = await fetch(`${BASE_URL}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: lastUserMessage,
      conversation_id: conversationId,
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.detail || "Server error")
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const lines = decoder.decode(value, { stream: true }).split("\n")
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue
      const payload = line.slice(6).trim()
      if (payload === "[DONE]") { onDone?.(); return }
      try {
        const parsed = JSON.parse(payload)
        if (parsed.error) throw new Error(parsed.error)
        if (parsed.token) onToken(parsed.token)
      } catch (e) {
        if (e.message !== "Unexpected end of JSON input") throw e
      }
    }
  }
  onDone?.()
}

