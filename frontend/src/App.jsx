import { useState, useCallback, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import ChatWindow from './components/ChatWindow'
import MessageInput from './components/MessageInput'
import { streamResponse } from './services/chatService'

// Factory for a fresh chat object
function createChat(title = 'New Chat') {
  const id = Date.now().toString()
  return {
    id,
    conversationId: Number(id), // unique backend thread_id
    title,
    messages: [],
    createdAt: new Date().toISOString(),
  }
}

function loadChats() {
  try { return JSON.parse(localStorage.getItem('chatbuddy_chats') || '[]') }
  catch { return [] }
}

function loadCurrentChatId(chats) {
  const id = localStorage.getItem('chatbuddy_current_chat')
  return chats.find((c) => c.id === id) ? id : null
}

export default function App() {
  const [chats, setChats] = useState(loadChats)
  const [currentChatId, setCurrentChatId] = useState(() => loadCurrentChatId(loadChats()))
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMsgId, setStreamingMsgId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Persist chats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatbuddy_chats', JSON.stringify(chats))
  }, [chats])

  // Persist the active chat ID
  useEffect(() => {
    if (currentChatId) localStorage.setItem('chatbuddy_current_chat', currentChatId)
    else localStorage.removeItem('chatbuddy_current_chat')
  }, [currentChatId])

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
      setCurrentChatId((cur) => (cur === id ? (next[0]?.id ?? null) : cur))
      return next
    })
  }, [])

  const handleSendMessage = useCallback(
    async (text) => {
      if (!text || isLoading) return

      // If no active chat, create one automatically
      let chatId = currentChatId
      let chat = currentChat
      if (!chatId) {
        const newChat = createChat(text.slice(0, 40))
        setChats((prev) => [newChat, ...prev])
        setCurrentChatId(newChat.id)
        chatId = newChat.id
        chat = newChat
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

      // Create an empty assistant bubble immediately — tokens fill it in
      const assistantMsgId = `${Date.now()}-assistant`
      const assistantMsg = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      }
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId ? { ...c, messages: [...c.messages, assistantMsg] } : c
        )
      )
      setIsLoading(true)
      setStreamingMsgId(assistantMsgId)

      try {
        const currentMessages = chat?.messages ?? []
        await streamResponse(
          [...currentMessages, userMsg],
          chat?.conversationId,
          // onToken — append each chunk to the assistant bubble
          (token) => {
            setChats((prev) =>
              prev.map((c) =>
                c.id === chatId
                  ? {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === assistantMsgId
                          ? { ...m, content: m.content + token }
                          : m
                      ),
                    }
                  : c
              )
            )
          },
        )
      } catch {
        // Replace the empty bubble with an error message
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: 'Sorry, something went wrong. Please try again.' }
                      : m
                  ),
                }
              : c
          )
        )
      } finally {
        setIsLoading(false)
        setStreamingMsgId(null)
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
          streamingMsgId={streamingMsgId}
          onSuggestionClick={handleSendMessage}
        />

        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
