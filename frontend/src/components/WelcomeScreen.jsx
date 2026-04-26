import { BotMessageSquare } from 'lucide-react'

// Prompt suggestion cards shown on the welcome screen
const SUGGESTIONS = [
  { label: 'Explain a concept', prompt: 'Explain quantum computing in simple terms.' },
  { label: 'Write something', prompt: 'Write a short poem about the ocean.' },
  { label: 'Brainstorm ideas', prompt: 'Give me 5 unique startup ideas for 2025.' },
  { label: 'Ask a question', prompt: 'What are the best practices in software development?' },
]

function SuggestionCard({ label, prompt, onClick }) {
  return (
    <button
      onClick={() => onClick(prompt)}
      className="flex flex-col gap-1 p-4 rounded-xl border border-border bg-surface/40
                 hover:bg-surface hover:border-gray-500 transition-colors duration-150 text-left group"
    >
      <span className="text-sm font-medium text-white">{label}</span>
      <span className="text-xs text-gray-400 leading-relaxed">{prompt}</span>
    </button>
  )
}

export default function WelcomeScreen({ onSuggestionClick }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 pb-8 text-center animate-fade-in">
      {/* Icon */}
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-surface mb-5">
        <BotMessageSquare size={32} className="text-[#19c37d]" />
      </div>

      <h1 className="text-2xl font-semibold text-white mb-2">How can I help you?</h1>
      <p className="text-sm text-gray-400 mb-8 max-w-sm">
        Ask me anything — I'm here to help with questions, writing, ideas, and more.
      </p>

      {/* Suggestion grid */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {SUGGESTIONS.map((s) => (
          <SuggestionCard key={s.label} {...s} onClick={onSuggestionClick} />
        ))}
      </div>
    </div>
  )
}
