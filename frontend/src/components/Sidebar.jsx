import { useState } from 'react'
import { Plus, MessageSquare, Trash2, BotMessageSquare } from 'lucide-react'

// A single chat item in the history list
function ChatItem({ chat, isActive, onSelect, onDelete }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={() => onSelect(chat.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left text-sm
        transition-colors duration-150 cursor-pointer
        ${isActive ? 'bg-surface text-white' : 'text-gray-300 hover:bg-surface/60 hover:text-white'}
      `}
    >
      <MessageSquare size={15} className="shrink-0 text-gray-400" />
      <span className="flex-1 truncate">{chat.title}</span>

      {/* Delete button — only visible on hover */}
      {hovered && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation()
            onDelete(chat.id)
          }}
          onKeyDown={(e) => e.key === 'Enter' && onDelete(chat.id)}
          className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          title="Delete chat"
        >
          <Trash2 size={13} />
        </span>
      )}
    </button>
  )
}

// Groups chats by time period (Today, Yesterday, Older)
function groupChats(chats) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart - 86400000)

  const groups = { Today: [], Yesterday: [], Older: [] }

  chats.forEach((chat) => {
    const created = new Date(chat.createdAt)
    if (created >= todayStart) groups.Today.push(chat)
    else if (created >= yesterdayStart) groups.Yesterday.push(chat)
    else groups.Older.push(chat)
  })

  return groups
}

export default function Sidebar({ chats, currentChatId, onNewChat, onSelectChat, onDeleteChat, isOpen }) {
  const groups = groupChats(chats)

  return (
    <aside
      className={`
        flex flex-col bg-sidebar h-full transition-all duration-300 shrink-0 overflow-hidden
        ${isOpen ? 'w-64' : 'w-0'}
      `}
    >
      <div className="flex flex-col h-full min-w-64 px-3 py-4">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2 px-2 mb-4">
          <BotMessageSquare size={22} className="text-white" />
          <span className="font-semibold text-white text-base tracking-tight">ChatBuddy</span>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 w-full px-3 py-2 mb-4 rounded-lg border border-border
                     text-sm text-gray-300 hover:bg-surface hover:text-white transition-colors duration-150"
        >
          <Plus size={16} />
          New chat
        </button>

        {/* Chat History */}
        <nav className="flex-1 overflow-y-auto space-y-4">
          {chats.length === 0 && (
            <p className="px-3 text-xs text-gray-500 select-none">No conversations yet</p>
          )}

          {Object.entries(groups).map(([label, groupChats]) =>
            groupChats.length > 0 ? (
              <section key={label}>
                <p className="px-3 mb-1 text-xs font-medium text-gray-500 uppercase tracking-wide select-none">
                  {label}
                </p>
                <div className="space-y-0.5">
                  {groupChats.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={chat.id === currentChatId}
                      onSelect={onSelectChat}
                      onDelete={onDeleteChat}
                    />
                  ))}
                </div>
              </section>
            ) : null
          )}
        </nav>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="px-2 text-xs text-gray-600 select-none">ChatBuddy v1.0</p>
        </div>
      </div>
    </aside>
  )
}
