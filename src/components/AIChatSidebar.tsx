import { useState, useEffect } from 'react'
import { Trash2, Sparkles } from 'lucide-react'
import { useChat, UIMessage } from '@ai-sdk/react'
import { nanoid } from 'nanoid'

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarTrigger, useSidebar } from './ui/sidebar'
import { Separator } from './ui/separator'
import { Conversation, ConversationContent, ConversationScrollButton, ConversationEmptyState } from './ai/conversation'
import { Message, MessageContent, MessageResponse } from './ai/message'
import { PromptInput, PromptInputBody, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, PromptInputTools } from './ai/prompt-input'
import { Suggestion, Suggestions } from './ai/suggestion'
import { DefaultChatTransport } from 'ai'
import { useUser } from '@/contexts/UserContext'

const QUICK_SUGGESTIONS = [
  'Summarize my work this week',
  "What's my most productive time?",
  'Show me my bug fixing stats',
  'Generate a weekly report',
  'What should I focus on?'
]

export function AIChatSidebar() {
  const { authFetch, token } = useUser()
  const { state, toggleSidebar } = useSidebar()
  const isExpanded = state === "expanded"
  const [sessionId] = useState(() => {
    const saved = localStorage.getItem('chat_session_id')
    if (saved) return saved
    const newId = nanoid()
    localStorage.setItem('chat_session_id', newId)
    return newId
  })

  const [input, setInput] = useState('')

  const { messages, setMessages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      headers: {
        'Authorization': `Bearer ${token}`
      },
    }),
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        parts: [{ type: 'text', text: "Hi! I'm your work log assistant. I can help you analyze your productivity, generate reports, and provide insights. Try asking me something!" }]
      }
    ],
    onFinish: (message) => {
      console.log('Finished stream:', message)
    },
  })

  const isLoading = status === "streaming" || status === "submitted"

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleSubmitManual = async (_message?: any, e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return
    
    const text = input
    setInput('')
    
    try {
      await sendMessage({ text }, { body: { sessionId } })
    } catch (err) {
      console.error('Failed to send message:', err)
      // Optionally restore input if send fails
      setInput(text)
    }
  }

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {

        const res = await authFetch(`/api/chat/history/${sessionId}`)
        if (res.ok) {
          const history = await res.json()
          if (history.length > 0) {
            setMessages(history.map((m: any) => ({
              id: m.id,
              role: m.role,
              parts: [{ type: 'text', text: m.content }]
            })))
          }
        }
      } catch (err) {
        console.error('Failed to load chat history:', err)
      }
    }
    loadHistory()
  }, [sessionId, setMessages])

  const handleClearChat = () => {
    localStorage.removeItem('chat_session_id')
    window.location.reload() // Simplest way to reset everything for now
  }

  return (
    <Sidebar side='right' variant='floating' collapsible='icon'>
      {/* Header */}
      <SidebarHeader className='p-4 flex-row justify-between items-center w-full'>
        <div className='w-5'>
          {isExpanded ? <SidebarTrigger /> : <Sparkles onClick={toggleSidebar} className='size-4 cursor-pointer' />}
        </div>
        {isExpanded && (
          <div className='flex justify-between items-center w-full'>
            <h2 className='text-lg font-semibold text-[#24292e]'>AI Assistant</h2>
            <button
              onClick={handleClearChat}
              className='p-2 hover:bg-[#e1e4e8] rounded-lg transition-colors'
              title='Clear chat'
            >
              <Trash2 className='w-4 h-4 text-destructive' />
            </button>
          </div>
        )}
      </SidebarHeader>

      <Separator />
      {isExpanded && (
        <>
          <SidebarContent className="flex-1 overflow-hidden h-full flex flex-col">
            <Conversation className="flex-1 overflow-y-auto">
              <ConversationContent>
                {messages.length === 0 ? (
                  <ConversationEmptyState 
                    icon={<Sparkles className="size-8 text-muted-foreground/50" />}
                    title="Start a conversation"
                    description="Ask me anything about your work logs"
                  />
                ) : (
                  messages.map((m: UIMessage) => (
                    <Message key={m.id} from={m.role}>
                      <MessageContent className='text-xs'>
                        <MessageResponse>
                          {m.parts
                            .filter((part: any) => part.type === 'text')
                            .map((part: any) => part.text)
                            .join('')}
                        </MessageResponse>
                      </MessageContent>
                    </Message>
                  ))
                )}
                {isLoading && (
                  <div className="text-xs text-muted-foreground animate-pulse px-4">
                    AI is thinking...
                  </div>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
            {/* <Suggestions className='grid mx-auto'>
              {QUICK_SUGGESTIONS.map(suggestion => (
                <Suggestion
                  key={suggestion}
                  onClick={s => setInput(s)}
                  suggestion={suggestion}
                  className='text-xs'
                />
              ))}
            </Suggestions> */}
          </SidebarContent>
          <SidebarFooter>
            <PromptInput className='bg-white rounded-xl' onSubmit={handleSubmitManual}>
              <PromptInputBody>
                <PromptInputTextarea 
                  value={input} 
                  onChange={handleInputChange}
                  placeholder="Ask assistant..."
                />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputTools />
                <PromptInputSubmit disabled={isLoading || !input.trim()} />
              </PromptInputFooter>
            </PromptInput>
          </SidebarFooter>
        </>
      )}
    </Sidebar>
  )
}
