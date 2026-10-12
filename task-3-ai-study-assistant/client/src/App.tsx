import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  BookOpen, BrainCircuit, Check, ChevronDown, CircleHelp, Clock3,
  GraduationCap, Lightbulb, LoaderCircle, Menu, MessageCircle, NotebookPen,
  Send, Sparkles, Target, WandSparkles, X
} from "lucide-react";

type Mode = "ask" | "summarize" | "quiz" | "plan";
type Message = { id: number; role: "user" | "assistant"; text: string; mode?: Mode };

const modes: { id: Mode; label: string; icon: typeof MessageCircle; title: string; description: string; placeholder: string }[] = [
  { id: "ask", label: "Ask AI", icon: MessageCircle, title: "What are we learning today?", description: "Ask a question, explore a concept, or get a tricky topic explained simply.", placeholder: "e.g. Explain overfitting in machine learning with a simple example..." },
  { id: "summarize", label: "Summarize notes", icon: NotebookPen, title: "Turn long notes into clear ideas", description: "Paste your notes and get a structured, student-friendly summary.", placeholder: "Paste your notes or learning material here..." },
  { id: "quiz", label: "Create a quiz", icon: CircleHelp, title: "Ready to test your knowledge?", description: "Generate practice questions with an answer key and explanations.", placeholder: "e.g. Create a quiz on DBMS normalization and SQL joins..." },
  { id: "plan", label: "Study plan", icon: Target, title: "Make a plan you can stick to", description: "Build a realistic study schedule around your goal and available time.", placeholder: "e.g. Make a 7-day plan to revise Python and statistics, 2 hours per day..." }
];

const examples = [
  { icon: BrainCircuit, title: "Explain a concept", text: "Explain neural networks like I'm a beginner, with a real-world example." },
  { icon: NotebookPen, title: "Summarize my notes", text: "Summarize the key concepts of DBMS normalization into revision notes." },
  { icon: CircleHelp, title: "Test my knowledge", text: "Create a 5-question multiple-choice quiz on Python fundamentals." },
  { icon: Clock3, title: "Plan my week", text: "Create a 7-day study plan for data structures with 90 minutes each day." }
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function App() {
  const [mode, setMode] = useState<Mode>("ask");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const selectedMode = modes.find((item) => item.id === mode)!;

  async function submitPrompt(value = prompt) {
    const clean = value.trim();
    if (loading) return;
    if (clean.length < 3) {
      setError("Please enter at least 3 characters so StudyPilot can help.");
      return;
    }
    if (clean.length > 8000) {
      setError("Your input is too long. Please keep it under 8,000 characters.");
      return;
    }

    const userMessage: Message = { id: Date.now(), role: "user", text: clean, mode };
    setMessages((current) => [...current, userMessage]);
    setPrompt("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, prompt: clean })
      });
      const data: { answer?: string; error?: string } = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      if (!data.answer?.trim()) throw new Error("The AI returned an empty response. Please try again.");
      setMessages((current) => [...current, {
        id: Date.now() + 1, role: "assistant", text: data.answer!, mode
      }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to reach StudyPilot. Check that the backend is running.";
      setError(message.includes("Failed to fetch")
        ? "Can't connect to the server. Make sure the backend is running at http://localhost:4000."
        : message);
    } finally {
      setLoading(false);
    }
  }

  function chooseMode(next: Mode) {
    setMode(next);
    setError("");
    setMobileMenu(false);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><GraduationCap size={23} /></div>
          <span>StudyPilot<span className="brand-ai"> AI</span></span>
          <button className="icon-button mobile-close" aria-label="Close menu" onClick={() => setMobileMenu(false)}><X size={19}/></button>
        </div>
        <button className="new-chat" onClick={() => { setMessages([]); setError(""); setPrompt(""); }}>
          <WandSparkles size={17} /> New study session <span>＋</span>
        </button>
        <div className="side-label">YOUR WORKSPACE</div>
        <nav className="nav-list" aria-label="Study tools">
          {modes.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${mode === id ? "nav-active" : ""}`} onClick={() => chooseMode(id)}>
              <Icon size={18} strokeWidth={1.8}/><span>{label}</span>{mode === id && <span className="nav-dot"/>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="tip-card">
            <div className="tip-icon"><Lightbulb size={18}/></div>
            <div><strong>Study tip</strong><p>Small, focused sessions beat last-minute cramming. Keep showing up.</p></div>
          </div>
          <div className="profile">
            <div className="avatar">SP</div>
            <div className="profile-text"><strong>Student workspace</strong><span>Learn at your pace</span></div>
            <span className="online-dot"/>
          </div>
        </div>
      </aside>

      {mobileMenu && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileMenu(false)}/>}

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button menu-button" aria-label="Open menu" onClick={() => setMobileMenu(true)}><Menu size={21}/></button>
          <div className="breadcrumb">Workspace <span>/</span> <strong>{selectedMode.label}</strong></div>
          <div className="topbar-right"><span className="status-dot"/><span>AI assistant ready</span><div className="top-avatar">S</div></div>
        </header>

        <section className="content">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="eyebrow"><Sparkles size={14}/> YOUR PERSONAL STUDY COMPANION</div>
              <div className="hero-icon"><selectedMode.icon size={29} strokeWidth={1.7}/><span><Sparkles size={13}/></span></div>
              <h1>{selectedMode.title}</h1>
              <p className="hero-description">{selectedMode.description}</p>

              <div className="mode-tabs" role="tablist" aria-label="Choose an AI tool">
                {modes.map(({ id, label, icon: Icon }) => (
                  <button key={id} role="tab" aria-selected={mode === id} className={`mode-tab ${mode === id ? "mode-tab-active" : ""}`} onClick={() => chooseMode(id)}>
                    <Icon size={16}/><span>{label}</span>
                  </button>
                ))}
              </div>

              <div className="examples-heading"><span>TRY STARTING WITH</span><div/></div>
              <div className="example-grid">
                {examples.map(({ icon: Icon, title, text }) => (
                  <button className="example-card" key={title} onClick={() => { setMode(title === "Summarize my notes" ? "summarize" : title === "Test my knowledge" ? "quiz" : title === "Plan my week" ? "plan" : "ask"); setPrompt(text); setError(""); }}>
                    <div className="example-icon"><Icon size={17}/></div><strong>{title}</strong><p>{text}</p><span className="example-arrow">↗</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="conversation">
              <div className="conversation-heading"><div><span className="eyebrow"><Sparkles size={13}/> STUDY SESSION</span><h2>Your learning workspace</h2></div><span className="message-count">{messages.length} messages</span></div>
              {messages.map((message) => (
                <article key={message.id} className={`message message-${message.role}`}>
                  <div className={`message-avatar ${message.role === "assistant" ? "assistant-avatar" : ""}`}>{message.role === "assistant" ? <BrainCircuit size={18}/> : "S"}</div>
                  <div className="message-body">
                    <div className="message-meta"><strong>{message.role === "assistant" ? "StudyPilot AI" : "You"}</strong>{message.mode && <span>{modes.find(m => m.id === message.mode)?.label}</span>}</div>
                    {message.role === "assistant" ? <div className="markdown"><ReactMarkdown>{message.text}</ReactMarkdown></div> : <p className="user-text">{message.text}</p>}
                  </div>
                </article>
              ))}
              {loading && <div className="message message-assistant"><div className="message-avatar assistant-avatar"><BrainCircuit size={18}/></div><div className="message-body"><div className="message-meta"><strong>StudyPilot AI</strong><span>Thinking</span></div><div className="loading-line"><LoaderCircle className="spin" size={17}/><span>Putting together a helpful answer...</span></div><div className="skeleton skeleton-one"/><div className="skeleton skeleton-two"/></div></div>}
              <div className="end-note"><Check size={14}/> Your study session is ready when you are</div>
            </div>
          )}

          {error && <div className="error-banner" role="alert"><CircleHelp size={17}/><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError("")}><X size={16}/></button></div>}

          <div className={`composer-wrap ${messages.length === 0 ? "composer-first" : ""}`}>
            <form className="composer" onSubmit={(event) => { event.preventDefault(); void submitPrompt(); }}>
              <div className="composer-mode"><selectedMode.icon size={15}/><span>{selectedMode.label}</span><ChevronDown size={14}/></div>
              <textarea value={prompt} onChange={(event) => { setPrompt(event.target.value); if (error) setError(""); }} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void submitPrompt(); } }} placeholder={selectedMode.placeholder} rows={3} maxLength={8000} aria-label="Enter your study prompt" />
              <div className="composer-footer"><span className={prompt.length > 7600 ? "char-count warning" : "char-count"}>{prompt.length.toLocaleString()} / 8,000 <span>·</span> Shift + Enter for a new line</span><button className="send-button" type="submit" disabled={loading || prompt.trim().length < 3} aria-label="Send prompt">{loading ? <LoaderCircle className="spin" size={17}/> : <Send size={17}/>}<span>{loading ? "Working" : "Ask AI"}</span></button></div>
            </form>
            <p className="disclaimer">StudyPilot AI can make mistakes. Verify important information with trusted learning materials.</p>
          </div>
        </section>
        <footer className="footer"><span>© 2026 StudyPilot AI</span><span><span className="footer-dot"/> Built for curious minds</span><span className="footer-right">Skillzeno Internship · Task 3</span></footer>
      </main>
    </div>
  );
}
