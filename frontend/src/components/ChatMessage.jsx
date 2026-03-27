import ReactMarkdown from "react-markdown";
import "./ChatMessage.css";

export default function ChatMessage({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`message-row ${isUser ? "user-row" : "bot-row"}`}>
      {!isUser && (
        <div className="avatar bot-avatar" aria-label="Bot">
          AI
        </div>
      )}
      <div className={`bubble ${isUser ? "user-bubble" : "bot-bubble"}`}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
      {isUser && (
        <div className="avatar user-avatar" aria-label="You">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      )}
    </div>
  );
}
