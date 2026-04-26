import { BotMessageSquare } from 'lucide-react'

// Three animated dots indicating the assistant is "typing"
export default function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      {/* Bot avatar */}
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#19c37d]/20 text-[#19c37d] shrink-0">
        <BotMessageSquare size={16} />
      </div>

      {/* Dots */}
      <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-tl-sm bg-transparent">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-blink [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-blink [animation-delay:200ms]" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-blink [animation-delay:400ms]" />
      </div>
    </div>
  )
}
