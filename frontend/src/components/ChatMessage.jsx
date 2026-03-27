import ReactMarkdown from "react-markdown";
import "./ChatMessage.css";

export default function ChatMessage({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`message-row ${isUser ? "user-row" : "bot-row"}`}>
      {!isUser && (
        <div className="avatar bot-avatar" aria-label="Bot">
          🎓
        </div>
      )}
      <div className={`bubble ${isUser ? "user-bubble" : "bot-bubble"}`}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
      {isUser && (
        <div className="avatar user-avatar" aria-label="You">
          🧑‍🎓
        </div>
      )}
    </div>
  );
}
