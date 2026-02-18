import { useState, useEffect, useRef } from 'react'
import { WorkEntry, CATEGORIES } from '../App'
import { Check } from 'lucide-react'

interface QuickLogFormProps {
  onAddEntry: (entry: Omit<WorkEntry, 'id' | 'createdAt'>) => void
  entries: WorkEntry[]
}

const TIME_PRESETS = [
  { label: '30m', minutes: 30 },
  { label: '1h', minutes: 60 },
  { label: '2h', minutes: 120 },
  { label: '4h', minutes: 240 }
]

export function QuickLogForm({ onAddEntry, entries }: QuickLogFormProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('bug')
  const [timeSpent, setTimeSpent] = useState(60)
  const [customTime, setCustomTime] = useState('')
  const [showCustomTime, setShowCustomTime] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [description, setDescription] = useState('')
  const [showDescription, setShowDescription] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [showSuccess, setShowSuccess] = useState(false)

  const titleInputRef = useRef<HTMLInputElement>(null)

  // Smart defaults from last entry
  useEffect(() => {
    if (entries.length > 0) {
      const lastEntry = entries[0]
      setCategory(lastEntry.category)

      // Average time of last 3 entries
      const recentEntries = entries.slice(0, 3)
      const avgTime = Math.round(recentEntries.reduce((sum, e) => sum + e.timeSpent, 0) / recentEntries.length)
      setTimeSpent(avgTime)
    }
  }, [entries.length]) // Only run when entries count changes

  // Get last 3 unique tags
  const getRecentTags = () => {
    const allTags = entries.flatMap(e => e.tags)
    const uniqueTags = Array.from(new Set(allTags))
    return uniqueTags.slice(0, 3)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const finalTime = showCustomTime && customTime ? parseInt(customTime) : timeSpent

    // onAddEntry({
    //   title: title.trim(),
    //   category,
    //   timeSpent: finalTime,
    //   tags,
    //   description: description.trim() || undefined,
    //   date: new Date(date).toISOString()
    // })

    // Show success animation
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 1000)

    // Reset form but keep smart defaults
    setTitle('')
    setTagInput('')
    setDescription('')
    setShowDescription(false)
    setShowCustomTime(false)
    setCustomTime('')
    setDate(new Date().toISOString().split('T')[0])

    // Focus title input for next entry
    setTimeout(() => titleInputRef.current?.focus(), 100)
  }

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
    }
    setTagInput('')
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag(tagInput)
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const lastEntry = entries[0]
  const timeSinceLastEntry = lastEntry ? Math.floor((Date.now() - lastEntry.createdAt) / 1000 / 60) : null

  const formatTimeSince = (minutes: number) => {
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return `${Math.floor(minutes / 1440)}d ago`
  }

  return (
    <div className='p-6 bg-white h-full'>
      <h2 className='text-2xl font-semibold text-[#24292e] mb-6'>Quick Log</h2>

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className='space-y-5'>
        {/* Title Input */}
        <div>
          <label className='block text-xs font-medium text-[#57606a] uppercase tracking-wide mb-2'>
            What did you work on?
          </label>
          <input
            ref={titleInputRef}
            type='text'
            value={title}
            onChange={e => setTitle(e.target.value)}
            className='w-full px-4 py-3 text-lg border border-[#d0d7de] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39d353] focus:border-transparent'
            placeholder='e.g., Fixed auth bug'
            autoFocus
          />
        </div>

        {/* Category Buttons */}
        <div>
          <label className='block text-xs font-medium text-[#57606a] uppercase tracking-wide mb-2'>Category</label>
          <div className='flex flex-wrap gap-2'>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type='button'
                onClick={() => setCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  category === cat.id
                    ? 'bg-[#39d353] text-white shadow-md'
                    : 'bg-[#f6f8fa] text-[#24292e] hover:bg-[#e1e4e8]'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Picker */}
        <div>
          <label className='block text-xs font-medium text-[#57606a] uppercase tracking-wide mb-2'>Time Spent</label>
          <div className='flex flex-wrap gap-2'>
            {TIME_PRESETS.map(preset => (
              <button
                key={preset.minutes}
                type='button'
                onClick={() => {
                  setTimeSpent(preset.minutes)
                  setShowCustomTime(false)
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeSpent === preset.minutes && !showCustomTime
                    ? 'bg-[#39d353] text-white shadow-md'
                    : 'bg-[#f6f8fa] text-[#24292e] hover:bg-[#e1e4e8]'
                }`}
              >
                {preset.label}
              </button>
            ))}
            <button
              type='button'
              onClick={() => setShowCustomTime(!showCustomTime)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                showCustomTime ? 'bg-[#39d353] text-white shadow-md' : 'bg-[#f6f8fa] text-[#24292e] hover:bg-[#e1e4e8]'
              }`}
            >
              Custom
            </button>
          </div>
          {showCustomTime && (
            <input
              type='number'
              value={customTime}
              onChange={e => setCustomTime(e.target.value)}
              placeholder='Minutes'
              className='mt-2 w-full px-4 py-2 border border-[#d0d7de] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39d353]'
            />
          )}
        </div>

        {/* Tags */}
        <div>
          <label className='block text-xs font-medium text-[#57606a] uppercase tracking-wide mb-2'>Tags</label>

          {/* Recent tags as quick-add chips */}
          {entries.length > 0 && tags.length === 0 && (
            <div className='flex flex-wrap gap-2 mb-2'>
              {getRecentTags().map(tag => (
                <button
                  key={tag}
                  type='button'
                  onClick={() => setTags([...tags, tag])}
                  className='px-3 py-1 bg-[#f6f8fa] text-[#24292e] rounded-full text-sm hover:bg-[#e1e4e8] transition-colors'
                >
                  + {tag}
                </button>
              ))}
            </div>
          )}

          {/* Current tags */}
          <div className='flex flex-wrap gap-2 mb-2'>
            {tags.map(tag => (
              <span
                key={tag}
                className='px-3 py-1 bg-[#39d353]/10 text-[#39d353] rounded-full text-sm flex items-center gap-1'
              >
                {tag}
                <button
                  type='button'
                  onClick={() => setTags(tags.filter(t => t !== tag))}
                  className='hover:text-[#24292e]'
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <input
            type='text'
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            onBlur={() => tagInput && handleAddTag(tagInput)}
            className='w-full px-4 py-2 border border-[#d0d7de] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39d353]'
            placeholder='Add tags...'
          />
        </div>

        {/* Date */}
        <div>
          <label className='block text-xs font-medium text-[#57606a] uppercase tracking-wide mb-2'>Date</label>
          <input
            type='date'
            value={date}
            onChange={e => setDate(e.target.value)}
            className='w-full px-4 py-2 border border-[#d0d7de] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39d353]'
          />
        </div>

        {/* Description (collapsible) */}
        <div>
          <button
            type='button'
            onClick={() => setShowDescription(!showDescription)}
            className='text-sm text-[#57606a] hover:text-[#24292e] mb-2'
          >
            {showDescription ? '− Hide' : '+ Add'} description
          </button>
          {showDescription && (
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className='w-full px-4 py-3 border border-[#d0d7de] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39d353] resize-none'
              rows={4}
              placeholder='Optional details...'
            />
          )}
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          disabled={!title.trim()}
          className='w-full py-4 bg-[#39d353] text-white font-semibold rounded-lg hover:bg-[#2ea44f] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2'
        >
          {showSuccess ? (
            <>
              <Check className='w-5 h-5' />
              Logged!
            </>
          ) : (
            'Log It'
          )}
        </button>

        {/* Last Entry Info */}
        {lastEntry && (
          <div className='pt-4 border-t border-[#d0d7de]'>
            <p className='text-xs text-[#57606a]'>
              Last: {lastEntry.title} • {timeSinceLastEntry !== null && formatTimeSince(timeSinceLastEntry)}
            </p>
          </div>
        )}

        {/* Keyboard Hint */}
        <p className='text-xs text-[#57606a] text-center'>
          Press <kbd className='px-2 py-1 bg-[#f6f8fa] border border-[#d0d7de] rounded'>⌘</kbd> +{' '}
          <kbd className='px-2 py-1 bg-[#f6f8fa] border border-[#d0d7de] rounded'>Enter</kbd> to log
        </p>
      </form>
    </div>
  )
}
