import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
  MessageSquare,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { PHCNode } from '../types/health';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface AegisChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: PHCNode[];
  federatedRound: number;
}

export const AegisChatDrawer: React.FC<AegisChatDrawerProps> = ({
  isOpen,
  onClose,
  nodes,
  federatedRound,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      role: 'model',
      text: `Greetings Officer. I am the Aegis AI Logistics & BRICS Epidemiological Co-Pilot. I am continuously monitoring ${nodes.length} primary health facilities, cold chain sensors, and shared BRICS Round #${federatedRound} weight tensors. How can I assist with your supply chain resilience today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || inputText).trim();
    if (!messageText || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const historyPayload = messages.concat(userMsg).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          networkContext: {
            totalPHCs: nodes.length,
            criticalDepletedPHCs: nodes
              .filter((n) => n.stocks.some((s) => s.status === 'CRITICAL_DEPLETION'))
              .map((n) => n.name),
            federatedRound,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const modelMsg: Message = {
          id: `model-${Date.now()}`,
          role: 'model',
          text: data.reply || 'Operational response received.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, modelMsg]);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-reset-${Date.now()}`,
        role: 'model',
        text: `Conversation cleared. I am ready to evaluate health telemetry and logistics directives.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickPrompts = [
    'Which PHCs need immediate antivenom rebalancing?',
    'Recommend UAV drone flight routes for riverine flood zones.',
    'Explain how BRICS Differential Privacy (ε=1.2) protects patient records.',
    'Draft emergency requisition for Koppal District Central Store.',
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl text-slate-100">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-teal-950 border border-teal-700/80 flex items-center justify-center text-teal-400 shrink-0">
              <Sparkles className="w-5 h-5 text-teal-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Aegis AI Health Logistics Assistant</span>
              </h2>
              <span className="text-[10px] font-mono text-teal-400">
                Gemini 3.8 Flash Multi-Turn Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearHistory}
              title="Clear Conversation"
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="h-7 w-7 rounded-md bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-300 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl p-3 space-y-1 ${
                    isUser
                      ? 'bg-teal-600 text-white rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-75 font-mono mb-0.5">
                    <span>{isUser ? 'You (Disaster Officer)' : 'Aegis AI Assistant'}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>

                {isUser && (
                  <div className="h-7 w-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-xs text-slate-400 font-mono">
              <div className="h-7 w-7 rounded-md bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-300 shrink-0">
                <Sparkles className="w-4 h-4 animate-spin text-teal-300" />
              </div>
              <span>Evaluating logistics tensors &amp; multi-variate vector models...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Container */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/50 space-y-1.5">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-mono">
            Suggested Operational Queries:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Aegis AI about PHC stocks, drone routes, or BRICS models..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 text-white transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
