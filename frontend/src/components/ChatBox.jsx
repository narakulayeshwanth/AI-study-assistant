import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Trash2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendChatMessage } from '../services/aiService';
import toast from 'react-hot-toast';

function MarkdownText({ text }) {
  // Simple markdown parser for bold, code, bullets
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 rounded text-primary-300 text-sm">$1</code>')
    .replace(/^• /gm, '<span class="text-primary-400">•</span> ')
    .replace(/\n/g, '<br/>');
  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
}

export default function ChatBox({ docId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text, id: Date.now() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(docId, text, sessionId);
      const { response, sessionId: sid } = res.data;
      if (sid) setSessionId(sid);
      setMessages(m => [...m, { role: 'assistant', content: response, id: Date.now() + 1 }]);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to get response';
      toast.error(errMsg);
      setMessages(m => m.filter(msg => msg.id !== userMsg.id));
      setInput(text);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
  };

  const suggestions = [
    'Summarize the key topics covered',
    'What are the most important concepts?',
    'Create a simple explanation of this topic',
    'What questions might appear in an exam?',
  ];

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Study AI Chat</p>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ready
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-6">
            <div className="text-center space-y-2">
              <MessageSquare className="w-12 h-12 text-primary-500/40 mx-auto" />
              <p className="text-slate-400 font-medium">Ask anything about this document</p>
              <p className="text-slate-600 text-sm">I'll answer based on the document content</p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-md">
              {suggestions.map(s => (
                <button key={s} onClick={() => { setInput(s); }}
                  className="text-left text-sm px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:border-primary-500/40 hover:text-white hover:bg-primary-500/10 transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div key={msg.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                  ${msg.role === 'user'
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'bg-gradient-to-br from-primary-500 to-accent-500'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                {/* Bubble */}
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-primary-600/30 border border-primary-500/30 text-white rounded-tr-sm'
                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm'}`}>
                  <MarkdownText text={msg.content} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Typing indicator */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
              {[0.1, 0.2, 0.3].map(d => (
                <span key={d} className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: `${d}s` }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-3 mt-4 pt-4 border-t border-white/10">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
          placeholder="Ask about this document..."
          disabled={loading}
          className="input-field flex-1 text-sm py-3 disabled:opacity-50"
        />
        <button type="submit" disabled={!input.trim() || loading}
          className="btn-primary px-4 py-3 disabled:opacity-40 disabled:cursor-not-allowed">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}
