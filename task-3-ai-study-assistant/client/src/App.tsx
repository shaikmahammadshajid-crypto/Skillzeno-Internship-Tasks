
import { useState } from "react";
import {
  BookOpen,
  BrainCircuit,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  Lightbulb,
  Menu,
  MessageCircle,
  Send,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import "./App.css";

type StudyMode = "ask" | "summarize" | "quiz" | "plan";

const tools = [
  {
    id: "ask" as const,
    title: "Ask AI",
    description: "Understand difficult topics",
    icon: MessageCircle,
  },
  {
    id: "summarize" as const,
    title: "Summarize notes",
    description: "Turn long notes into key points",
    icon: FileText,
  },
  {
    id: "quiz" as const,
    title: "Generate a quiz",
    description: "Test your understanding",
    icon: BrainCircuit,
  },
  {
    id: "plan" as const,
    title: "Study planner",
    description: "Organize your learning",
    icon: CalendarDays,
  },
];

function App() {
  const [mode, setMode] = useState<StudyMode>("ask");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  async function submitPrompt() {
    if (!prompt.trim()) {
      setError("Please enter a question or some study material first.");
      return;
    }

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/assistant`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode, prompt: prompt.trim() }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || "The AI service could not process your request.",
        );
      }

      const result = data.answer ?? data.response ?? data.result;

      if (typeof result !== "string" || !result.trim()) {
        throw new Error("The AI returned an empty response. Please try again.");
      }

      setAnswer(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the server. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedTool = tools.find((tool) => tool.id === mode)!;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <GraduationCap size={25} />
          </div>
          <div>
            <strong>StudyPilot</strong>
            <span>AI LEARNING SPACE</span>
          </div>
          <button
            className="mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <button className="nav-item active" onClick={() => setMenuOpen(false)}>
          <BookOpen size={19} /> Study assistant
        </button>

        <div className="nav-label">YOUR STUDY TOOLS</div>
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              className={`nav-item ${mode === tool.id ? "selected" : ""}`}
              key={tool.id}
              onClick={() => {
                setMode(tool.id);
                setAnswer("");
                setError("");
                setMenuOpen(false);
              }}
            >
              <Icon size={19} />
              {tool.title}
            </button>
          );
        })}

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <Lightbulb size={21} />
            <strong>Small steps, big progress.</strong>
            <p>Consistent learning builds lasting knowledge.</p>
          </div>
          <div className="profile">
            <div className="avatar">S</div>
            <div>
              <strong>Student workspace</strong>
              <span>Ready to learn</span>
            </div>
          </div>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="mobile-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>
          <div className="breadcrumb">
            Workspace <ChevronRight size={15} /> Study assistant
          </div>
          <div className="top-status">
            <span className="status-dot" /> AI study space
          </div>
        </header>

        <section className="content-area">
          <div className="welcome">
            <div className="eyebrow">
              <Sparkles size={15} /> YOUR PERSONAL AI STUDY PARTNER
            </div>
            <h1>
              Learn smarter.
              <br />
              <span>Go further.</span>
            </h1>
            <p>
              What are we learning today? Ask questions, simplify your notes,
              and turn your study goals into action.
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon purple">
                <BrainCircuit size={21} />
              </div>
              <div>
                <strong>AI-powered</strong>
                <span>Learning assistance</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue">
                <Target size={21} />
              </div>
              <div>
                <strong>Goal focused</strong>
                <span>Study at your pace</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">
                <Clock3 size={21} />
              </div>
              <div>
                <strong>Anytime</strong>
                <span>Your learning space</span>
              </div>
            </div>
          </div>

          <section className="tools-section">
            <div className="section-heading">
              <div>
                <h2>What would you like to do?</h2>
                <p>Choose a tool to get started.</p>
              </div>
            </div>

            <div className="tools-grid">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    className={`tool-card ${mode === tool.id ? "tool-active" : ""}`}
                    key={tool.id}
                    onClick={() => {
                      setMode(tool.id);
                      setAnswer("");
                      setError("");
                    }}
                  >
                    <div className="tool-icon">
                      <Icon size={22} />
                    </div>
                    <strong>{tool.title}</strong>
                    <span>{tool.description}</span>
                    <ChevronRight className="tool-arrow" size={18} />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="assistant-card">
            <div className="assistant-heading">
              <div className="assistant-icon">
                <Sparkles size={22} />
              </div>
              <div>
                <h2>{selectedTool.title}</h2>
                <p>Your learning companion is ready.</p>
              </div>
              <span className="beta-tag">AI ASSISTANT</span>
            </div>

            <label className="prompt-label" htmlFor="study-prompt">
              YOUR PROMPT
            </label>
            <textarea
              id="study-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  (event.metaKey || event.ctrlKey)
                ) {
                  void submitPrompt();
                }
              }}
              placeholder={
                mode === "ask"
                  ? "e.g. Explain machine learning in simple terms..."
                  : mode === "summarize"
                    ? "Paste your study notes here to summarize..."
                    : mode === "quiz"
                      ? "e.g. Create a 10-question quiz on DBMS..."
                      : "e.g. Create a 7-day plan to prepare for my exam..."
              }
              rows={4}
              maxLength={12000}
              disabled={loading}
            />
            <div className="prompt-footer">
              <span>{prompt.length}/12,000 characters · ⌘ Enter to submit</span>
              <button
                className="submit-button"
                onClick={() => void submitPrompt()}
                disabled={loading || !prompt.trim()}
              >
                {loading ? "Thinking..." : "Generate response"}
                {loading ? <span className="spinner" /> : <Send size={16} />}
              </button>
            </div>

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            {answer && (
              <div className="answer-panel" aria-live="polite">
                <div className="answer-title">
                  <Sparkles size={18} /> AI response
                  <button
                    onClick={() => setAnswer("")}
                    aria-label="Clear response"
                  >
                    <X size={17} />
                  </button>
                </div>
                <div className="answer-text">{answer}</div>
                <button
                  className="copy-button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(answer);
                  }}
                >
                  <Check size={15} /> Copy response
                </button>
              </div>
            )}
          </section>

          <footer className="footer">
            <span>StudyPilot AI</span>
            <span>
              Built for curious minds <Sparkles size={13} />
            </span>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
