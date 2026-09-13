import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Language } from '../../types';
import { translations } from '../../translations';
import { Bot, Send, X, Trash2, Sparkles, MessageSquare, ChevronDown, Check, ShieldCheck } from 'lucide-react';

interface MadhuMitraAssistantProps {
  currentLang: Language;
}

const STORAGE_KEY = 'hivenexa_madhu_mitra_chat_history';

export const MadhuMitraAssistant: React.FC<MadhuMitraAssistantProps> = ({ currentLang }) => {
  const t = translations[currentLang];
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (err) {
      console.warn('Could not load chat history:', err);
    }

    // Default welcome message if empty
    const welcomeMsg: ChatMessage = {
      id: 'welcome-msg',
      sender: 'assistant',
      text: currentLang === 'hi'
        ? 'नमस्ते! मैं "मधु-मित्र AI" हूँ, आपका केवीआईसी (KVIC) डिजिटल मौनपालन साथी। हाइव H-001 का स्वास्थ्य स्कोर 92/100 है। आप कीट नियंत्रण, छत्ते के तापमान, रेज़ोनेंस या क्रेट सीलिंग पर कोई भी प्रश्न पूछ सकते हैं।'
        : 'Welcome! I am "Madhu-Mitra AI", your KVIC Digital Apiculture Advisor. Hive H-001 is currently healthy at 92/100 score in the Mustard Floral Zone. Ask me about hive health, Varroa mite detection, seasonal weather care, or crate traceability!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'domain-engine',
    };
    setMessages([welcomeMsg]);
  }, [currentLang]);

  // Persist conversation history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        console.warn('Failed to persist messages:', e);
      }
    }
  }, [messages]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          lang: currentLang,
          history: newHistory.map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await res.json();
      const replyText = data.text || 'I have noted your request. Please monitor brood frames and maintain hive ventilation.';

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'gemini',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Failed to get chat response:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now()}-fallback`,
        sender: 'assistant',
        text: currentLang === 'hi'
          ? 'हाइव H-001 34.2°C और 245 Hz रेज़ोनेंस पर स्थिर है। कृपया वरोआ माइट के लिए तल बोर्ड की नियमित सफाई रखें और नमी 20% से कम बनाए रखें।'
          : 'Hive H-001 is stable at 34.2°C and 245 Hz resonance. Keep screened bottom boards clean to prevent Varroa mites and seal crates with low moisture.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'domain-engine',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    const resetMsg: ChatMessage = {
      id: `msg-reset-${Date.now()}`,
      sender: 'assistant',
      text: currentLang === 'hi'
        ? 'इतिहास रीसेट कर दिया गया है। मैं मधु-मित्र AI आपकी सेवा में तत्पर हूँ।'
        : 'Conversation history reset. Madhu-Mitra AI is ready to assist your apiculture tasks.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'domain-engine',
    };
    setMessages([resetMsg]);
  };

  const quickPrompts = currentLang === 'hi'
    ? [
        'मक्खियों के स्वास्थ्य की जांच कैसे करें?',
        'आज का तापमान सही है?',
        'रेज़ोनेंस 245 Hz का क्या अर्थ है?',
        'कच्चे शहद की नमी 20% से कम कैसे रखें?',
      ]
    : [
        'How to check bee health & brood condition?',
        'Is hive temperature 34.2°C optimal?',
        'Why is hive resonance at 245 Hz?',
        'How to maintain moisture < 20%?',
      ];

  return (
    <>
      {/* 1. Floating AI Chatbot Icon labeled "Madhu-Mitra AI" */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          id="floating-madhu-mitra-btn"
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all border-2 border-amber-300 ${
            isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          aria-label="Open Madhu-Mitra AI Assistant"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white border border-amber-200">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-amber-700 animate-pulse" />
          </div>
          <div className="text-left pr-1">
            <div className="flex items-center gap-1.5">
              <span>{t.aiChatbotName}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            </div>
            <p className="text-[10px] font-normal text-amber-100 -mt-0.5">
              {t.onlineBadge}
            </p>
          </div>
        </button>
      </div>

      {/* 2. Persistent AI Beekeeping Assistant Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div
            className="w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl flex flex-col border-l border-amber-900/20 animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 bg-white border-b border-amber-900/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-base">
                      {t.aiChatbotName}
                    </h3>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {t.aiChatbotRole}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearHistory}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t.clearChat}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  id="close-madhu-mitra-drawer-btn"
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Context bar: Current Hive Status */}
            <div className="px-4 py-2 bg-amber-50/90 border-b border-amber-200 text-xs flex items-center justify-between text-amber-900">
              <span className="font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                {currentLang === 'hi' ? 'हाइव H-001 (तापमान: 34.2°C • रेज़ोनेंस: 245 Hz)' : 'Hive H-001 (Temp: 34.2°C • Res: 245 Hz)'}
              </span>
              <span className="text-[11px] font-mono text-amber-800">
                KVIC Mission
              </span>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      msg.sender === 'user'
                        ? 'bg-amber-600 text-white rounded-tr-xs'
                        : 'bg-white border border-amber-900/10 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 px-1 mt-1 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="bg-white border border-amber-200 rounded-2xl px-4 py-3 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium">
                      <Sparkles className="w-4 h-4 animate-spin text-amber-600" />
                      <span>{t.aiThinking}</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="p-3 bg-white/80 border-t border-amber-900/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                {t.quickQuestions}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isLoading}
                    className="text-[11px] bg-[#FAF8F5] hover:bg-amber-100 hover:text-amber-900 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200 hover:border-amber-300 transition-colors text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-white border-t border-amber-900/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  id="madhu-mitra-chat-input"
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t.aiChatPromptPlaceholder}
                  disabled={isLoading}
                  className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-[#FAF8F5] text-slate-900"
                />
                <button
                  id="madhu-mitra-send-btn"
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
