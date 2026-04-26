import { PanelLeftOpen, PanelLeftClose, SquarePen } from 'lucide-react'

// Icon button with tooltip
function IconButton({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface transition-colors duration-150"
    >
      {children}
    </button>
  )
}

export default function Header({ onToggleSidebar, onNewChat, sidebarOpen }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
      {/* Left: sidebar toggle */}
      <div className="flex items-center gap-1">
        <IconButton onClick={onToggleSidebar} title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}>
          {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </IconButton>
      </div>

      {/* Center: model label */}
      <span className="text-sm font-medium text-gray-300 select-none">ChatBuddy</span>

      {/* Right: new chat shortcut */}
      <div className="flex items-center gap-1">
        <IconButton onClick={onNewChat} title="New chat">
          <SquarePen size={20} />
        </IconButton>
      </div>
    </header>
  )
}
