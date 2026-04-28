import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import WelcomeScreen from './WelcomeScreen'

export default function ChatWindow({ messages, isLoading, streamingMsgId, onSuggestionClick }) {
  const bottomRef = useRef(null)

  // Auto-scroll on every new token or message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const isEmpty = messages.length === 0

  return (
    <main className="flex flex-col flex-1 overflow-y-auto">
      {isEmpty && !isLoading ? (
        <WelcomeScreen onSuggestionClick={onSuggestionClick} />
      ) : (
        <div className="flex flex-col gap-6 px-4 py-6 max-w-3xl mx-auto w-full">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isStreaming={msg.id === streamingMsgId}
            />
          ))}
          {/* TypingIndicator only while waiting for the very first token */}
          {isLoading && !streamingMsgId && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      )}
    </main>
  )
}
