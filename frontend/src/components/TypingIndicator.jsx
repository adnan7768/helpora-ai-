import "./TypingIndicator.css";

export default function TypingIndicator() {
  return (
    <div className="message-row bot-row">
      <div className="avatar bot-avatar">AI</div>
      <div className="bubble bot-bubble typing-bubble">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}
