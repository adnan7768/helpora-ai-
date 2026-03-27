import { useState, useRef, useEffect } from "react";
import ChatMessage from "./components/ChatMessage";
import TypingIndicator from "./components/TypingIndicator";
import { sendMessage } from "./api/chat";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Hello! I'm your **College Assistant**. I can help you with information about admissions, programs, fees, facilities, exams, placements, and more. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const newUserMsg = { role: "user", content: trimmed };
    const updatedMessages = [...messages, newUserMsg];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    inputRef.current?.focus();

    try {
      // Build history excluding the initial greeting
      const history = updatedMessages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const data = await sendMessage(trimmed, history);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Sorry, I couldn't connect to the server. Please make sure the backend is running and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "👋 Hello! I'm your **College Assistant**. How can I help you today?",
      },
    ]);
    setInput("");
  };

  return (
    <div className="app-wrapper">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">🎓</span>
          <div className="logo-text-block">
            <span className="logo-text">MES AIMAT</span>
            <span className="logo-subtext">since 2001 for MBA &amp; MCA</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <p className="nav-label">Quick Topics</p>
          {[
            { icon: "📋", label: "Admissions" },
            { icon: "📚", label: "Programs" },
            { icon: "💰", label: "Fees & Aid" },
            { icon: "🏛️", label: "Campus Life" },
            { icon: "📊", label: "Exams & Grades" },
            { icon: "💼", label: "Placements" },
            { icon: "📞", label: "Contact" },
          ].map(({ icon, label }) => (
            <button
              key={label}
              className="nav-btn"
              onClick={() => {
                setInput(`Tell me about ${label}`);
                setIsSidebarOpen(false);
                inputRef.current?.focus();
              }}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>
        <button className="clear-btn" onClick={handleClear}>
          🗑️ Clear Chat
        </button>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        <header className="chat-header">
          <div className="header-title">
            <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
              </svg>
            </button>
            <div className="header-icon-container">
              <span className="header-avatar">CA</span>
            </div>
            <div>
              <h1>College Assistant</h1>
              <span className="header-status">
                <span className="status-dot" />
                <span className="header-badge">AI-Powered · RAG Enhanced</span>
              </span>
            </div>
          </div>
        </header>

        <div className="messages-container">
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} role={msg.role} content={msg.content} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        <div className="input-area">
          <div className="input-box">
            <textarea
              ref={inputRef}
              className="input-field"
              placeholder="Ask anything about the college..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              className={`send-btn ${!input.trim() || loading ? "disabled" : ""}`}
              onClick={handleSend}
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
          <p className="input-hint">
            Press <kbd>Enter</kbd> to send &nbsp;·&nbsp; <kbd>Shift+Enter</kbd> for new line
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
