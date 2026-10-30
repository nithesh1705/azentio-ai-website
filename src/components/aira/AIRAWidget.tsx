'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { queryAIRA } from '@/server/dal/store';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  ShieldCheck,
  ExternalLink,
  Bot,
  AlertCircle,
} from 'lucide-react';

export function AIRAWidget() {
  const { actor } = usePersona();
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<
    {
      role: 'user' | 'assistant';
      content: string;
      citations?: { id: string; title: string; offering: string }[];
    }[]
  >([
    {
      role: 'assistant',
      content:
        'Hello! I am AIRA, Azentio’s Intelligent Research Assistant. I synthesize insights strictly from approved, de-identified collective-learning evidence. How can I assist your financial analysis or market inquiries?',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!prompt.trim() || loading) return;
    const userMessage = prompt;
    setPrompt('');
    setChatHistory((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    setTimeout(() => {
      const result = queryAIRA(actor, userMessage);
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.answer,
          citations: result.citations,
        },
      ]);
      setLoading(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-semibold text-sm shadow-xl shadow-emerald-500/25 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          aria-label="Open AIRA Assistant"
        >
          <Sparkles className="w-4 h-4 animate-spin-slow" />
          <span>AIRA AI</span>
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
        </motion.button>
      </div>

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-20 right-6 z-50 w-full max-w-md rounded-2xl glass-panel border border-border shadow-2xl overflow-hidden flex flex-col h-[520px]"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm tracking-tight">AIRA Synthesis</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Governed
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Strictly cites approved shared learning</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[88%] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                        : 'bg-muted/80 text-foreground border border-border rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* Citations Box */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-border/80 space-y-1.5">
                        <div className="flex items-center gap-1 font-semibold text-[10px] text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Approved Evidence Citations:</span>
                        </div>
                        {msg.citations.map((c) => (
                          <div
                            key={c.id}
                            className="p-1.5 rounded-lg bg-background/80 border border-border/60 text-[11px] text-muted-foreground flex items-center justify-between"
                          >
                            <span className="truncate max-w-[260px] font-medium text-foreground">
                              {c.title}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider text-emerald-500 ml-1">
                              {c.offering}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/80 border border-border text-xs text-muted-foreground w-fit">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Synthesizing approved evidence...</span>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="p-3 bg-card border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask about SME seasonality or liquidity..."
                  className="flex-1 bg-muted px-3.5 py-2 rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary border border-border"
                />
                <button
                  type="submit"
                  disabled={!prompt.trim() || loading}
                  className="p-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground px-1">
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-500" /> Synthetic Data
                </span>
                <span>Retrieval ≤ 60s hard withdrawal</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
