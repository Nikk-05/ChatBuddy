import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import ChatWindow from './components/ChatWindow'
import MessageInput from './components/MessageInput'
import { generateResponse } from './services/chatService'

// Factory for a fresh chat object
function createChat(title = 'New Chat') {
  return {
    id: Date.now().toString(),
    title,
    messages: [],
    createdAt: new Date().toISOString(),
  }
}

export default function App() {
  const [chats, setChats] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Derive current chat and messages from state
  const currentChat = chats.find((c) => c.id === currentChatId) ?? null
  const messages = currentChat?.messages ?? []

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleNewChat = useCallback(() => {
    const chat = createChat()
    setChats((prev) => [chat, ...prev])
    setCurrentChatId(chat.id)
  }, [])

  const handleSelectChat = useCallback((id) => {
    setCurrentChatId(id)
  }, [])

  const handleDeleteChat = useCallback((id) => {
    setChats((prev) => {
      const next = prev.filter((c) => c.id !== id)
      // If we deleted the active chat, switch to the next available one
      setCurrentChatId((cur) => (cur === id ? (next[0]?.id ?? null) : cur))
      return next
    })
  }, [])

  const handleSendMessage = useCallback(
    async (text) => {
      if (!text || isLoading) return

      // If no active chat, create one automatically
      let chatId = currentChatId
      if (!chatId) {
        const chat = createChat(text.slice(0, 40))
        setChats((prev) => [chat, ...prev])
        setCurrentChatId(chat.id)
        chatId = chat.id
      }

      const userMsg = {
        id: `${Date.now()}-user`,
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      }

      // Append user message and update title if this is the first message
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                title: c.messages.length === 0 ? text.slice(0, 40) : c.title,
                messages: [...c.messages, userMsg],
              }
            : c
        )
      )

      setIsLoading(true)

      try {
        // Pass updated messages to the service (include the new user message)
        const currentMessages = currentChat?.messages ?? []
        const response = await generateResponse([...currentMessages, userMsg])

        const assistantMsg = {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: response,
          timestamp: new Date().toISOString(),
        }

        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? { ...c, messages: [...c.messages, assistantMsg] }
              : c
          )
        )
      } catch {
        // Surface errors as an assistant message so the UI never goes silent
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: [
                    ...c.messages,
                    {
                      id: `${Date.now()}-error`,
                      role: 'assistant',
                      content: 'Sorry, something went wrong. Please try again.',
                      timestamp: new Date().toISOString(),
                    },
                  ],
                }
              : c
          )
        )
      } finally {
        setIsLoading(false)
      }
    },
    [currentChatId, currentChat, isLoading]
  )

  return (
    <div className="flex h-screen bg-main text-white overflow-hidden">
      {/* ── Sidebar ── */}
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        isOpen={sidebarOpen}
      />

      {/* ── Main panel ── */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onNewChat={handleNewChat}
        />

        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSuggestionClick={handleSendMessage}
        />

        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
