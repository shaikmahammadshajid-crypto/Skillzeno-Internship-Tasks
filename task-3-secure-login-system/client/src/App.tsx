import { useEffect, useState, type FormEvent } from "react";
import { ShieldCheck, LockKeyhole, Mail, Eye, EyeOff, ArrowRight, LogOut, CheckCircle2, AlertCircle, LoaderCircle } from "lucide-react";
import "./App.css"
const API = String.fromCharCode(104,116,116,112,58,47,47,49,50,55,46,48,46,48,46,49,58,52,48,48,48,47,97,112,105);
type User = { id: number; email: string; created_at: string };
type Mode = "login" | "register";

async function request(path: string, body?: unknown) {
  const response = await fetch(`${API}${path}`, {
    method: body === undefined ? "GET" : "POST",
    credentials: "include",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

export default function App() {
  const [mode, setMode] = useState<Mode>("login");
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    request("/auth/me").then(data => setUser(data.user)).catch(() => setUser(null)).finally(() => setChecking(false));
  }, []);

  function changeMode(next: Mode) {
    setMode(next);
    setMessage("");
    setPassword("");
    setSuccess(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);
    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setMessage("Please enter a valid email address.");
      return;
    }
    if (mode === "register") {
      if (password.length < 12 || password.length > 128) {
        setMessage("Your password must contain 12–128 characters.");
        return;
      }
      if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
        setMessage("Include uppercase, lowercase, a number, and a symbol.");
        return;
      }
    } else if (!password) {
      setMessage("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
      const data = await request(endpoint, { email: cleanEmail, password });
      setUser(data.user);
      setPassword("");
      setSuccess(true);
      setMessage(mode === "register" ? "Account created successfully." : "Welcome back.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    try {
      await request("/auth/logout", {});
      setUser(null);
      setEmail("");
      setPassword("");
      setMessage("");
      setMode("login");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign out.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) return <main className="loading-screen"><LoaderCircle className="spin" size={30}/><p>Securing your session…</p></main>;

  if (user) return (
    <main className="dashboard-shell">
      <nav className="topbar"><a className="brand" href="#"><span className="brand-icon"><ShieldCheck/></span> Secure<span>Gate</span></a><span className="live-status"><i/> Protected session</span></nav>
      <section className="dashboard">
        <div className="dashboard-kicker"><ShieldCheck size={16}/> AUTHENTICATION SUCCESSFUL</div>
        <h1 className="welcome-title">You're securely<br/><span>signed in.</span></h1>
        <p className="dashboard-subtitle">Your identity has been verified. Your session is active and protected.</p>
        <div className="profile-card"><div className="avatar"><ShieldCheck size={27}/></div><div className="profile-info"><small>AUTHENTICATED ACCOUNT</small><strong>{user.email}</strong><span>Account ID · {user.id}</span></div><CheckCircle2 className="verified-icon"/></div>
        <div className="security-grid">
          <article className="security-card"><LockKeyhole className="card-icon"/><strong>Session protection</strong><p>Your HTTP-only session cookie is enabled.</p><span className="card-status"><i/> Active</span></article>
          <article className="security-card"><ShieldCheck className="card-icon"/><strong>Password security</strong><p>Password verification happens on the server.</p><span className="card-status"><i/> Enabled</span></article>
        </div>
        {message && <p className={`notice ${success ? "success" : "error"}`}>{message}</p>}
        <button className="primary-button logout-button" onClick={logout} disabled={loading}>{loading ? <LoaderCircle className="spin"/> : <LogOut/>} Sign out securely</button>
        <p className="footnote">SecureGate · Built with security-first principles</p>
      </section>
    </main>
  );

  return (
    <main className="auth-shell">
      <aside className="visual-panel">
        <nav className="topbar"><a className="brand" href="#"><span className="brand-icon"><ShieldCheck/></span> Secure<span>Gate</span></a><span className="version-tag">AUTH SYSTEM <b>v1.0</b></span></nav>
        <div className="visual-content">
          <div className="eyebrow"><span className="eyebrow-dot"/> SECURITY THAT STARTS WITH YOU</div>
          <h1>Your digital world.<br/><span>Your control.</span></h1>
          <p className="visual-description">A smarter, safer way to access your account. Designed around privacy, built with modern security standards.</p>
          <div className="security-illustration"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit orbit-three"/><div className="shield-glow"><ShieldCheck size={78} strokeWidth={1.2}/></div><div className="floating-chip chip-top"><CheckCircle2 size={16}/> Identity verified</div><div className="floating-chip chip-bottom"><LockKeyhole size={16}/> Encrypted session</div></div>
          <div className="trust-row"><div className="trust-icon"><ShieldCheck/></div><div><strong>Security by design</strong><span>Every request. Every session.</span></div><ArrowRight className="trust-arrow"/></div>
        </div>
        <div className="panel-footer"><span>© 2026 SecureGate</span><span>PRIVACY FIRST · ALWAYS</span></div>
      </aside>
      <section className="form-panel">
        <div className="mobile-brand"><span className="brand-icon"><ShieldCheck/></span> Secure<span>Gate</span></div>
        <div className="form-wrap">
          <div className="form-heading"><div className="form-symbol"><LockKeyhole/></div><div className="eyebrow form-eyebrow">YOUR SECURE SPACE</div><h2>{mode === "login" ? "Welcome back." : "Create your account."}</h2><p>{mode === "login" ? "Enter your details to access your account." : "Set up your account with a strong password."}</p></div>
          <div className="mode-switch" role="tablist" aria-label="Authentication mode"><button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "mode-active" : ""} onClick={() => changeMode("login")}>Sign in</button><button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "mode-active" : ""} onClick={() => changeMode("register")}>Create account</button></div>
          <form onSubmit={submit} noValidate>
            <label htmlFor="email">Email address</label>
            <div className="input-wrap"><Mail size={18}/><input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required/></div>
            <div className="label-row"><label htmlFor="password">Password</label>{mode === "register" && <span>MIN. 12 CHARACTERS</span>}</div>
            <div className="input-wrap"><LockKeyhole size={18}/><input id="password" type={visible ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder={mode === "login" ? "Enter your password" : "Create a strong password"} value={password} onChange={e => setPassword(e.target.value)} minLength={mode === "register" ? 12 : 1} maxLength={128} required/><button type="button" className="password-toggle" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>
            {mode === "register" && <div className="password-hint">Use uppercase and lowercase letters, a number, and a symbol.</div>}
            {message && <div className={`notice ${success ? "success" : "error"}`} role="status">{success ? <CheckCircle2 size={17}/> : <AlertCircle size={17}/>} {message}</div>}
            <button className="primary-button" type="submit" disabled={loading}>{loading ? <><LoaderCircle className="spin" size={18}/> Please wait…</> : <>{mode === "login" ? "Sign in securely" : "Create secure account"} <ArrowRight size={18}/></>}</button>
          </form>
          <div className="secure-note"><ShieldCheck size={17}/><span>Your information is protected with secure, server-side authentication.</span></div>
          <div className="form-bottom"><span>Protected by design</span><span><i/> SYSTEM OPERATIONAL</span></div>
        </div>
      </section>
    </main>
  );
}
