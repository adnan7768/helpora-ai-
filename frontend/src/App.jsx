import { useState, useRef, useEffect } from "react";
import { sendMessage } from "./api/chat";
import ReactMarkdown from "react-markdown";

import LogoImg from "./assets/Logo.png";

const QUICK_ACTIONS = [
  { label: "Admissions", prompt: "How do I apply for MBA/MCA at MES AIMAT?" },
  { label: "Departments", prompt: "Tell me about the departments at MES AIMAT" },
  { label: "Academics", prompt: "What academic programs does MES AIMAT offer?" },
  { label: "Facilities", prompt: "What facilities are available at MES AIMAT?" },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --red:        #E91E63;
  --red-dark:   #C2185B;
  --red-glow:   rgba(233,30,99,0.15);
  --navy:       #1565C0;
  --navy-dark:  #0D47A1;
  --navy-glow:  rgba(21,101,192,0.15);
  --bg:         #FFFFFF;
  --bg2:        #F5F7FA;
  --card:       #FFFFFF;
  --card2:      #F8F9FA;
  --border:     rgba(0,0,0,0.08); /* subtle dark borders for white UI */
  --border-red: rgba(233,30,99,0.3);
  --border-nav: rgba(21,101,192,0.3);
  --text:       #111827; /* dark text for contrast */
  --text2:      #4B5563; /* slightly lighter dark text */
  --muted:      #9CA3AF;
  --grad:       linear-gradient(135deg, #E91E63 0%, #1565C0 100%);
  --grad-red:   linear-gradient(135deg, #E91E63, #C2185B);
  --grad-nav:   linear-gradient(135deg, #1565C0, #0D47A1);
}

html, body, #root {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

body {
  background: var(--bg);
  font-family: 'Calibri', sans-serif;
  color: var(--text);
}

/* ─────────── Shell ─────────── */
.shell {
  width: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  position: relative;
  overflow: hidden;
}

/* Ambient light blobs */
.blob1 {
  position: absolute;
  top: -150px; left: -10vw;
  width: 50vw; height: 50vw;
  max-width: 800px; max-height: 800px;
  background: radial-gradient(ellipse, rgba(233,30,99,0.07) 0%, transparent 65%);
  pointer-events: none; z-index: 0;
  animation: drift1 12s ease-in-out infinite alternate;
}
.blob2 {
  position: absolute;
  top: 100px; right: -10vw;
  width: 45vw; height: 45vw;
  max-width: 700px; max-height: 700px;
  background: radial-gradient(ellipse, rgba(21,101,192,0.08) 0%, transparent 65%);
  pointer-events: none; z-index: 0;
  animation: drift2 15s ease-in-out infinite alternate;
}
.blob3 {
  position: absolute;
  bottom: 50px; left: 15%;
  width: 30vw; height: 30vw;
  max-width: 500px; max-height: 500px;
  background: radial-gradient(ellipse, rgba(233,30,99,0.05) 0%, transparent 65%);
  pointer-events: none; z-index: 0;
}
@keyframes drift1 { from{transform:translate(0,0);} to{transform:translate(4vw,3vh);} }
@keyframes drift2 { from{transform:translate(0,0);} to{transform:translate(-3vw,2vh);} }

/* ─────────── Header ─────────── */
.header {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  background: #FFFFFF;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 0 4vw;
}

/* Gradient top accent line */
.header::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--grad);
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 62px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.brand { display: flex; align-items: center; gap: 12px; }

.brand-img-top {
  height: 36px;
  width: auto;
  min-width: 40px;
  max-width: 200px;
  display: block;
  object-fit: contain;
}

.brand-name {
  font-family: 'Calibri', sans-serif;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: -0.4px;
  background: linear-gradient(120deg, var(--navy) 0%, var(--red) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
}
.brand-college {
  font-size: 11px;
  color: var(--text2);
  margin-top: 3px;
  letter-spacing: 0.05em;
  font-weight: 500;
  text-transform: uppercase;
}

/* ─────────── Feed ─────────── */
.feed {
  flex: 1;
  overflow-y: auto;
  padding: 3vh 4vw 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  z-index: 1;
}
.feed::-webkit-scrollbar { width: 5px; }
.feed::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }

/* Centering container for web layout */
.feed > div {
  max-width: 820px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

/* ─────────── Welcome ─────────── */
.welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  padding: 6vh 0 4vh;
}

.hero-mark {
  position: relative;
  width: 260px; 
  height: auto;
  margin-bottom: -8px;
}

.hero-img-box {
  width: 100%;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-img-box img {
  width: 100%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.05));
}

.welcome-eyebrow {
  display: inline-flex; align-items: center; gap: 7px;
  background: rgba(233,30,99,0.06);
  border: 1px solid var(--border-red);
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--red);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.eyebrow-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--red);
}

.welcome-title {
  font-family: 'Calibri', sans-serif;
  font-size: 46px;
  font-weight: bold;
  line-height: 1.18;
  letter-spacing: -0.5px;
  color: var(--text);
}
.welcome-title .accent {
  background: var(--grad-red);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome-desc {
  font-size: 15px;
  color: var(--text2);
  line-height: 1.7;
  max-width: 500px;
}

.divider {
  width: 100%;
  display: flex; align-items: center; gap: 10px;
  font-size: 11px; font-weight: 600;
  color: var(--muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-top: 32px;
  max-width: 650px;
}
.divider::before, .divider::after { content:''; flex:1; height:1px; background: var(--border); }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
  width: 100%;
  max-width: 760px;
}

.qcard {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 18px;
  cursor: pointer;
  text-align: left;
  transition: all 0.22s;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}
.qcard::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--grad);
  opacity: 0;
  transition: opacity 0.2s;
}
.qcard:hover::before { opacity: 1; }
.qcard:hover {
  border-color: var(--border-red);
  background: var(--card2);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(233,30,99,0.08);
}
.qcard-label {
  font-family: 'Calibri', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.2px;
}
.qcard-sub { font-size: 12px; color: var(--text2); line-height: 1.4; }
.qcard-arr {
  align-self: flex-end;
  font-size: 13px;
  color: var(--red);
  background: rgba(233,30,99,0.08);
  border: 1px solid var(--border-red);
  border-radius: 50%;
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
}

/* ─────────── Messages ─────────── */
.row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  animation: msgIn 0.3s cubic-bezier(.22,.8,.25,1);
}
.row.user { flex-direction: row-reverse; }
@keyframes msgIn { from{opacity:0;transform:translateY(14px);} to{opacity:1;transform:translateY(0);} }

.ava {
  width: 34px; height: 34px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Calibri', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
  margin-top: 4px;
}
.ava.ai {
  background: white;
  color: #111;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  border: 1px solid var(--border);
}
.ava.usr {
  background: var(--card2);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 10px;
}
.ai-logo-img { height: 18px; width: 18px; object-fit: contain; }

.bubble {
  max-width: 85%;
  padding: 16px 20px;
  font-size: 15px;
  line-height: 1.75;
  word-break: break-word;
}
.bubble.ai {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 18px 18px 18px 4px;
  color: var(--text);
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}
.bubble.usr {
  background: var(--grad-red);
  border-radius: 18px 18px 4px 18px;
  color: #fff;
  box-shadow: 0 4px 18px var(--red-glow);
}
.bubble p { margin-bottom: 0.6em; }
.bubble p:last-child { margin-bottom: 0; }
.bubble pre { background: #F3F4F6; padding: 14px; border-radius: 8px; overflow-x: auto; margin-top: 10px; border: 1px solid var(--border); }
.bubble code { font-family: 'JetBrains Mono', monospace; background: #E5E7EB; padding: 3px 6px; border-radius: 5px; font-size: 13px; color: var(--navy-dark); }
.bubble ul, .bubble ol { padding-left: 1.5em; margin-bottom: 0.6em; }

.ts {
  font-size: 11px;
  color: var(--muted);
  padding-top: 6px;
}
.ts.ai-ts { padding-left: 48px; }
.ts.usr-ts { text-align: right; padding-right: 48px; }

/* Typing */
.typing {
  display: flex; align-items: center; gap: 5px;
  padding: 16px 20px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 18px 18px 18px 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}
.d { width: 6px; height: 6px; border-radius: 50%; background: var(--red); animation: blink 1.3s ease infinite; }
.d:nth-child(2){animation-delay:.18s;} .d:nth-child(3){animation-delay:.36s;}
@keyframes blink { 0%,80%,100%{opacity:.2;transform:scale(.7);} 40%{opacity:1;transform:scale(1);} }

/* ─────────── Input ─────────── */
.input-zone {
  flex-shrink: 0;
  padding: 12px 4vw 12px;
  position: relative;
  z-index: 2;
  background: #fff;
  border-top: 1px solid var(--border);
}
.input-zone::before {
  display: none;
}

.ibox {
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: 24px;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 12px 14px 12px 24px;
  transition: border-color 0.2s, box-shadow 0.2s;
  max-width: 820px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}
.ibox:focus-within {
  border-color: var(--border-red);
  box-shadow: 0 0 0 3px rgba(233,30,99,0.1), 0 4px 20px rgba(0,0,0,0.06);
}

.field {
  flex: 1;
  background: transparent;
  border: none; outline: none;
  color: var(--text);
  font-family: 'Calibri', sans-serif;
  font-size: 16px;
  resize: none;
  max-height: 160px;
  scrollbar-width: none;
  padding: 8px 0;
  line-height: 1.6;
}
.field::placeholder { color: var(--muted); }

.ibtn {
  width: 44px; height: 44px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all 0.18s;
}
.ibtn.send {
  background: var(--grad-red);
  color: #fff;
  box-shadow: 0 3px 14px var(--red-glow);
}
.ibtn.send:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 5px 22px rgba(233,30,99,0.4); }
.ibtn.send:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

.hint { display: none; }

/* ─────────── Responsive ─────────── */
@media (max-width: 768px) {
  .welcome-title { font-size: 36px; font-weight: bold; }
  .feed { padding: 2vh 5vw 20px; }
  .input-zone { padding: 16px 5vw 24px; }
  .bubble { font-size: 14.5px; max-width: 90%; }
}
`;

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function App() {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const fieldRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    if (fieldRef.current) fieldRef.current.style.height = "auto";

    const time = getTime();
    const newMsgs = [...msgs, { role: "user", content: msg, time }];
    setMsgs(newMsgs);
    setLoading(true);

    try {
      const historyMsg = newMsgs.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const data = await sendMessage(msg, historyMsg);
      setMsgs([...newMsgs, { role: "assistant", content: data.reply, time: getTime() }]);
    } catch {
      setMsgs([...newMsgs, { role: "assistant", content: "Connection error. Please try again.", time: getTime() }]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const onInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  return (
    <>
      <style>{css}</style>
      <div className="shell">
        <div className="blob1" />
        <div className="blob2" />
        <div className="blob3" />

        {/* Header */}
        <header className="header">
          <div className="header-row">
            <div className="brand">
              <img src={LogoImg} alt="MES AIMAT" className="brand-img-top" />
              <div className="brand-text">
                <div className="brand-name">Helpora</div>
                <div className="brand-college">MES AIMAT · Academic AI</div>
              </div>
            </div>
          </div>
        </header>

        {/* Feed */}
        <div className="feed">
          {msgs.length === 0 ? (
            <div className="welcome">
              <div className="hero-mark">
               <div className="hero-img-box">
                  <img src={LogoImg} alt="MES AIMAT" />
               </div>
              </div>
              <div className="welcome-eyebrow">
                <div className="eyebrow-dot" />
                MES AIMAT Official AI
              </div>
              <h1 className="welcome-title">
                Hi, I'm <span className="accent">Helpora</span><br />
                How can I help you?
              </h1>
              <p className="welcome-desc">
                Your intelligent campus assistant — instant answers on admissions, academics, departments, facilities, and more.
              </p>
              <div className="divider">Quick Actions</div>
              <div className="grid">
                {QUICK_ACTIONS.map((a) => (
                  <button key={a.label} className="qcard" onClick={() => send(a.prompt)}>
                    <div className="qcard-label">{a.label}</div>
                    <div className="qcard-arr">↗</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            msgs.map((m, i) => (
              <div key={i}>
                <div className={`row ${m.role === "user" ? "user" : ""}`}>
                  <div className={`ava ${m.role === "user" ? "usr" : "ai"}`}>
                    {m.role === "user" ? "YOU" : <img src={LogoImg} className="ai-logo-img" alt="AI" />}
                  </div>
                  <div className={`bubble ${m.role === "user" ? "usr" : "ai"}`}>
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
                <div className={`ts ${m.role === "user" ? "usr-ts" : "ai-ts"}`}>
                  {m.role === "user" ? "You" : "Helpora"} · {m.time}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="row">
              <div className="ava ai">
                <img src={LogoImg} className="ai-logo-img" alt="AI" />
              </div>
              <div className="typing">
                <div className="d" /><div className="d" /><div className="d" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="input-zone">
          <div className="ibox">
            <textarea
              ref={fieldRef}
              className="field"
              placeholder="Ask Helpora anything..."
              value={input}
              onChange={onInput}
              onKeyDown={onKey}
              rows={1}
            />
            {/* Removed mic button */}
            <button className="ibtn send" onClick={() => send()} disabled={loading || !input.trim()}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p className="hint">Enter to send · Shift + Enter for new line</p>
        </div>
      </div>
    </>
  );
}
