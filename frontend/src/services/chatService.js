const BASE_URL = "http://127.0.0.1:8000/api"

// track conversation across messages
let currentConversationId = null

/**
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<string>}
 */
export async function generateResponse(messages) {
  const lastUserMessage = messages[messages.length - 1].content

  const response = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: lastUserMessage,
      conversation_id: currentConversationId
    })
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.detail || "Server error")
  }

  const data = await response.json()
  currentConversationId = data.conversation_id
  return data.reply
}

export function resetConversation() {
  currentConversationId = null
}

// --- Mock responses (kept for offline testing) ---
// const MOCK_RESPONSES = {
//   greet: ["Hello! How can I help you today?", "Hi there! What's on your mind?"],
//   thanks: ["You're welcome! Is there anything else I can help with?"],
//   howAreYou: ["I'm an AI, but I'm ready to help!"],
//   fallback: ["That's an interesting question. Could you elaborate?"],
// }
// function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)] }
// function classifyMessage(text) {
//   const lower = text.toLowerCase()
//   if (/^(hi|hello|hey|howdy)/.test(lower)) return 'greet'
//   if (/(thank you|thanks|thx)/.test(lower)) return 'thanks'
//   if (/(how are you)/.test(lower)) return 'howAreYou'
//   return 'fallback'
// }
