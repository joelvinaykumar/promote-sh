import React from 'react';
import { Sparkles, Trash2, ChevronRight, Send } from 'lucide-react';

const RightSidebar: React.FC = () => {
  const suggestions = [
    "Summarize my work this week",
    "What's my most productive time?",
    "Show me my bug fixing stats",
    "Generate a weekly report",
    "What should I focus on?"
  ];

  return (
    <aside className="w-[25%] border-l border-border-main bg-card-main flex flex-col h-full">
      <div className="p-6 border-b border-border-main flex justify-between items-center bg-card-main sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <Sparkles className="text-primary w-5 h-5" />
          <h2 className="font-bold text-lg">AI Assistant</h2>
        </div>
        <div className="flex items-center space-x-3 text-slate-400">
          <Trash2 className="w-4 h-4 cursor-pointer hover:text-slate-600" />
          <ChevronRight className="w-4 h-4 cursor-pointer hover:text-slate-600" />
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Quick Suggestions</h3>
          <div className="space-y-2">
            {suggestions.map((suggestion, idx) => (
              <button key={idx} className="w-full text-left p-3 text-sm rounded-xl border border-border-main bg-bg-main hover:border-primary transition-colors">
                {suggestion}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 space-y-4 custom-scrollbar">
          <div className="flex flex-col space-y-1 max-w-[90%]">
            <div className="p-4 rounded-2xl bg-bg-main border border-border-main text-sm leading-relaxed">
              Hi! I&apos;m your work log assistant. I can help you analyze your productivity, generate reports, and provide insights. Try asking me something!
            </div>
            <span className="text-[10px] text-slate-400 ml-1">9:19 PM</span>
          </div>
        </div>
        <div className="p-6 border-t border-border-main">
          <div className="relative flex items-center">
            <input
              className="w-full pr-12 pl-4 py-3 rounded-xl border border-border-main bg-bg-main focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm"
              placeholder="Ask me anything..."
              type="text"
            />
            <button className="absolute right-2 p-1.5 rounded-lg bg-primary text-white hover:bg-emerald-600 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
