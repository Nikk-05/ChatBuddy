import { useRef, useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export default function MessageInput({ onSendMessage, isLoading }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea as content grows (max 5 lines)
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }, [text])

  const canSend = text.trim().length > 0 && !isLoading

  function handleSend() {
    if (!canSend) return
    onSendMessage(text.trim())
    setText('')
    // Reset height after clearing
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e) {
    // Send on Enter; allow Shift+Enter for new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <footer className="px-6 py-5 shrink-0">
      <div className="max-w-3xl mx-auto">
        {/* Input container */}
        <div className="
          flex items-end gap-3 px-5 py-4 rounded-3xl border
          bg-surface border-border focus-within:border-gray-500
          transition-colors duration-150 shadow-sm
        ">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Message Alexa AI..."
            rows={1}
            className="
              flex-1 bg-transparent text-sm text-white placeholder-gray-400
              resize-none outline-none leading-6
              disabled:opacity-50 disabled:cursor-not-allowed
              pt-0.5
            "
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            title="Send message (Enter)"
            className={`
              flex items-center justify-center w-8 h-8 rounded-lg shrink-0
              transition-all duration-150
              ${canSend
                ? 'bg-white text-black hover:bg-gray-200 cursor-pointer'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
            `}
          >
            <ArrowUp size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* Hint text */}
        <p className="text-center text-[11px] text-gray-600 mt-2 select-none">
          Press <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift+Enter</kbd> for new line
        </p>
      </div>
    </footer>
  )
}
