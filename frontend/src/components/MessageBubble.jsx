import { User, BotMessageSquare } from 'lucide-react'

// Formats timestamp to readable short form
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Avatar shown next to each message
function Avatar({ role }) {
  const isUser = role === 'user'
  return (
    <div
      className={`
        flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-white
        ${isUser ? 'bg-indigo-600' : 'bg-[#19c37d]/20 text-[#19c37d]'}
      `}
    >
      {isUser ? <User size={16} /> : <BotMessageSquare size={16} />}
    </div>
  )
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar role={message.role} />

      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div
          className={`
            px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words
            ${isUser
              ? 'bg-surface text-white rounded-tr-sm'
              : 'bg-transparent text-gray-100 rounded-tl-sm'}
          `}
        >
          {message.content}
        </div>

        {/* Timestamp */}
        <span className="text-[11px] text-gray-600 px-1">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  )
}
