/**
 * ChatPanel — slide-out Claude AI crisis analyst panel.
 *
 * Features: streaming response, mode toggle, replay loader,
 * starter prompts, markdown rendering, responsive.
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Zap, Loader2 } from 'lucide-react';
import { useChatStream, type ChatMessage, type ChatMode } from '../../hooks/useChatStream';

const STARTER_PROMPTS = [
  "Why is banking risk elevated right now?",
  "What if the Fed raises rates by 200bps?",
  "Walk me through the 2008 crisis buildup",
  "What should I monitor if liquidity risk spikes?",
];

function formatMarkdown(text: string): string {
  // Simple markdown → HTML conversion for chat
  let html = text
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Tables
    .replace(/\|(.+)\|/g, (match) => {
      if (match.includes('---')) return '';
      const cells = match.split('|').filter(Boolean).map(c => c.trim());
      return `<div class="chat-table-row">${cells.map(c => `<span class="chat-table-cell">${c}</span>`).join('')}</div>`;
    })
    // Headers
    .replace(/^### (.+)$/gm, '<div class="chat-h3">$1</div>')
    .replace(/^## (.+)$/gm, '<div class="chat-h2">$1</div>')
    .replace(/^# (.+)$/gm, '<div class="chat-h1">$1</div>')
    // Bullet points
    .replace(/^- (.+)$/gm, '<div class="chat-bullet">• $1</div>')
    .replace(/^\d+\. (.+)$/gm, '<div class="chat-bullet">$&</div>')
    // Line breaks
    .replace(/\n\n/g, '<div class="chat-gap"></div>')
    .replace(/\n/g, '<br/>');

  return html;
}

export default function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>('auto');
  const [input, setInput] = useState('');
  const [showReplayMenu, setShowReplayMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isConnected,
    isStreaming,
    replays,
    sendMessage,
    loadReplay,
    clearMessages,
  } = useChatStream();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    sendMessage(trimmed, mode);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStarter = (prompt: string) => {
    sendMessage(prompt, mode);
  };

  return (
    <>
      {/* Toggle button */}
      <button
        className="chat-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Analyst"
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
        {!isOpen && isConnected && (
          <span className="chat-toggle-dot" />
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-panel"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header-title">
                <Zap size={16} style={{ color: 'var(--accent)' }} />
                <span>AI Crisis Analyst</span>
                <span className={`chat-status-dot ${isConnected ? 'on' : 'off'}`} />
              </div>
              <div className="chat-header-controls">
                {/* Mode toggle */}
                <div className="mode-toggle">
                  {(['simple', 'advanced'] as ChatMode[]).map(m => (
                    <button
                      key={m}
                      className={`mode-btn ${mode === m ? 'active' : ''}`}
                      onClick={() => setMode(m)}
                    >
                      {m === 'simple' ? 'Simple' : 'Deep'}
                    </button>
                  ))}
                </div>
                {/* Replay dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    className="replay-btn"
                    onClick={() => setShowReplayMenu(!showReplayMenu)}
                  >
                    📜
                  </button>
                  {showReplayMenu && (
                    <div className="replay-menu">
                      <div className="replay-menu-title">Load Historical Crisis</div>
                      {replays.length > 0 ? replays.map(r => (
                        <button
                          key={r.id}
                          className="replay-item"
                          onClick={() => {
                            loadReplay(r.id);
                            setShowReplayMenu(false);
                          }}
                        >
                          <div className="replay-item-name">{r.name}</div>
                          <div className="replay-item-detail">{r.period} • {r.frame_count} frames</div>
                        </button>
                      )) : (
                        <>
                          <button className="replay-item" onClick={() => { loadReplay('2008_lehman'); setShowReplayMenu(false); }}>
                            <div className="replay-item-name">2008 Lehman Brothers</div>
                            <div className="replay-item-detail">Sep 2007 – Mar 2009 • 26 frames</div>
                          </button>
                          <button className="replay-item" onClick={() => { loadReplay('svb_2023'); setShowReplayMenu(false); }}>
                            <div className="replay-item-name">SVB Banking Crisis</div>
                            <div className="replay-item-detail">Jan – Mar 2023 • 8 frames</div>
                          </button>
                          <button className="replay-item" onClick={() => { loadReplay('eu_debt_2011'); setShowReplayMenu(false); }}>
                            <div className="replay-item-name">EU Sovereign Debt Crisis</div>
                            <div className="replay-item-detail">Jan – Dec 2011 • 12 frames</div>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="chat-empty">
                  <div className="chat-empty-icon">🧠</div>
                  <div className="chat-empty-title">CrisisLens AI Analyst</div>
                  <div className="chat-empty-sub">
                    Ask about current risks, simulate scenarios, or replay historical crises.
                  </div>
                  <div className="chat-starters">
                    {STARTER_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        className="chat-starter-btn"
                        onClick={() => handleStarter(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
              <textarea
                ref={inputRef}
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about risks, simulate scenarios..."
                rows={1}
                disabled={isStreaming}
              />
              <button
                className="chat-send-btn"
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
              >
                {isStreaming ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="chat-system-msg">
        {message.content}
      </div>
    );
  }

  return (
    <div className={`chat-bubble ${isUser ? 'user' : 'agent'}`}>
      {!isUser && <div className="chat-bubble-label">CrisisLens AI</div>}
      <div
        className="chat-bubble-content"
        dangerouslySetInnerHTML={{
          __html: isUser ? message.content : formatMarkdown(message.content),
        }}
      />
      {message.isStreaming && (
        <span className="chat-cursor">▊</span>
      )}
      <div className="chat-bubble-time">
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}
