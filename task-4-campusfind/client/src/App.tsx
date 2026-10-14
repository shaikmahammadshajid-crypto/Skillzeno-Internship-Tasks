import Auth from "./components/Auth";
import { supabase } from "./lib/supabase";
import { getItems, createItem } from "./lib/items";
import type { CampusItem } from "./lib/items";
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  Search, Plus, MapPin, Clock, Package, BookOpen,
  Laptop, KeyRound, BriefcaseBusiness, Headphones,
  Smartphone, CircleHelp, X, GraduationCap
} from "lucide-react";
import "./App.css";

type Item = {
  id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  type: "Lost" | "Found";
  description: string;
  contact: string;
};


const categories = ["All Items", "Electronics", "Cards & IDs", "Books & Notes", "Accessories"];

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All Items");
  const [type, setType] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    title: "", category: "Electronics", location: "",
    type: "Lost" as "Lost" | "Found", description: "", contact: ""
  });
useEffect(() => {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) console.error("Session error:", error);
    setSession(data.session);
    setAuthLoading(false);
  });

  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, newSession) => {
      setSession(newSession);
      setAuthLoading(false);
    }
  );

  return () => listener.subscription.unsubscribe();
}, []);

  useEffect(() => {
    async function loadItems() {
      try {
        const data = await getItems();

        setItems(
          data.map((item: CampusItem) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            location: item.location,
            date: new Date(item.date_reported).toLocaleDateString(),
            type: item.type,
            description: item.description,
            contact: item.contact ?? "",
          }))
        );
      } catch (error) {
        console.error("Failed to load listings:", error);
        setNotice("Could not load listings. Please try again.");
      } finally {
        setItemsLoading(false);
      }
    }

    loadItems();
  }, []);

  const filtered = useMemo(() => items.filter((item) => {
    const matchesSearch = `${item.title} ${item.location} ${item.description}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (filter === "All Items" || item.category === filter) && (type === "All" || item.type === type);
  }), [items, search, filter, type]);

  
async function submitItem(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  if (!session) {
    setNotice("Please log in to report an item.");
    return;
  }

  try {
    const saved = await createItem(form, session.user.id);

    const newItem: Item = {
      id: saved.id,
      title: saved.title,
      category: saved.category,
      location: saved.location,
      date: new Date(saved.date_reported).toLocaleDateString(),
      type: saved.type,
      description: saved.description,
      contact: saved.contact ?? "",
    };

    setItems((current) => [newItem, ...current]);
    setShowForm(false);
    setForm({
      title: "",
      category: "Electronics",
      location: "",
      type: "Lost",
      description: "",
      contact: "",
    });
    setNotice("Your listing was saved successfully!");
  } catch (error) {
    console.error("Failed to save listing:", error);
    setNotice(
      error instanceof Error
        ? `Could not save listing: ${error.message}`
        : "Could not save listing. Please try again."
    );
  }
}
   


  return (
    <main className="app-shell">
{authLoading ? (
  <p>Checking your session...</p>
) : !session ? (
  <Auth onSignedIn={() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }} />
) : (
  <div style={{ textAlign: "right", paddingTop: 12 }}>
    <span>{session.user.email}</span>
    <button
      className="outline-button"
      onClick={() => supabase.auth.signOut()}
    >
      Log out
    </button>
  </div>
)}
      <header className="topbar">
        <a className="brand" href="#" aria-label="CampusFind home">
          <span className="brand-icon"><Package size={23} /></span>
          <span>Campus<span className="brand-accent">Find</span></span>
        </a>
        <nav><a href="#listings">Browse items</a><a href="#how">How it works</a></nav>
        <button className="primary small" onClick={() => setShowForm(true)}><Plus size={17} /> Report item</button>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><GraduationCap size={16} /> MADE FOR CAMPUS LIFE</span>
          <h1>Lost something?<br /><span>Find it here.</span></h1>
          <p>Your campus community is here to help. Report lost belongings, share found items, and help everything find its way home.</p>
          <button className="primary hero-button" onClick={() => { setForm((f) => ({ ...f, type: "Lost" })); setShowForm(true); }}><Search size={18} /> Find my item</button>
          <div className="hero-proof"><span className="proof-dot" /> A little help from your campus community</div>
        </div>
        <div className="hero-art" aria-label="Illustration of a lost-and-found box">
          <div className="art-circle circle-one" /><div className="art-circle circle-two" />
          <div className="art-card card-a"><Headphones size={28} /><span>Headphones</span></div>
          <div className="art-card card-b"><KeyRound size={26} /><span>Keys</span></div>
          <div className="art-card card-c"><BookOpen size={27} /><span>Notebook</span></div>
          <div className="art-box"><div className="box-handle" /><Package size={76} strokeWidth={1.3} /><span>LOST &amp; FOUND</span></div>
          <div className="spark spark-a">✳</div><div className="spark spark-b">✦</div>
        </div>
      </section>

      <section className="stats">
        <div><strong>{items.length}</strong><span>Community listings</span></div>
        <div><strong>{items.filter((i) => i.type === "Lost").length}</strong><span>Items reported lost</span></div>
        <div><strong>{items.filter((i) => i.type === "Found").length}</strong><span>Items found</span></div>
        <div><strong>1</strong><span>Campus community</span></div>
      </section>

      <section className="listings-section" id="listings">
        <div className="section-heading">
          <div><span className="eyebrow">THE COMMUNITY BOARD</span><h2>Recently reported items</h2><p>Browse the latest lost and found posts around campus.</p></div>
          <button className="outline-button" onClick={() => setShowForm(true)}><Plus size={17} /> Add a listing</button>
        </div>

        <div className="toolbar">
          <label className="searchbox"><Search size={19} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items, places..." /></label>
          <div className="type-tabs">{["All", "Lost", "Found"].map((t) => <button key={t} className={type === t ? "active" : ""} onClick={() => setType(t)}>{t === "All" ? "All posts" : t}</button>)}</div>
        </div>

        <div className="category-row">{categories.map((c) => <button key={c} className={filter === c ? "category active" : "category"} onClick={() => setFilter(c)}>{c}</button>)}</div>
        {itemsLoading && <p>Loading listings...</p>}
        <div className="item-grid">
          {filtered.map((item) => <article className="item-card" key={item.id}>
            <div className={`item-visual visual-${item.category === "Electronics" ? "tech" : item.category === "Cards & IDs" ? "id" : item.category === "Books & Notes" ? "book" : "accessory"}`}>
              <span className={`status ${item.type.toLowerCase()}`}>{item.type}</span>
              {item.category === "Electronics" ? <Laptop size={43} /> : item.category === "Cards & IDs" ? <Smartphone size={43} /> : item.category === "Books & Notes" ? <BookOpen size={43} /> : <KeyRound size={43} />}
            </div>
            <div className="item-content"><span className="item-category">{item.category}</span><h3>{item.title}</h3><div className="item-meta"><span><MapPin size={14} />{item.location}</span><span><Clock size={14} />{item.date}</span></div><button className="text-link" onClick={() => setSelected(item)}>View details <span>→</span></button></div>
          </article>)}
        </div>
        {filtered.length === 0 && <div className="empty"><CircleHelp size={32} /><h3>No matching items</h3><p>Try another search or category.</p><button className="outline-button" onClick={() => { setSearch(""); setFilter("All Items"); setType("All"); }}>Clear filters</button></div>}
      </section>

      <section className="how-section" id="how"><span className="eyebrow">SIMPLE. HELPFUL. CAMPUS-POWERED.</span><h2>Help an item find its way home.</h2><div className="how-grid"><div><span>01</span><h3>Report it</h3><p>Share a quick description and where you lost or found the item.</p></div><div><span>02</span><h3>Search nearby</h3><p>Browse campus listings and filter by category or status.</p></div><div><span>03</span><h3>Reconnect</h3><p>Use the listing details to coordinate a safe return.</p></div></div></section>

      <footer><a className="brand" href="#"><span className="brand-icon"><Package size={20} /></span>Campus<span className="brand-accent">Find</span></a><span>Built for a more connected campus.</span><span>CampusFind · Mini Project</span></footer>

      {showForm && <div className="modal-backdrop" onClick={() => setShowForm(false)}><section className="modal" onClick={(e) => e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">COMMUNITY LISTING</span><h2>Report an item</h2></div><button className="icon-button" onClick={() => setShowForm(false)} aria-label="Close"><X /></button></div><form onSubmit={submitItem}><div className="form-tabs"><button type="button" className={form.type === "Lost" ? "active" : ""} onClick={() => setForm({ ...form, type: "Lost" })}>I lost something</button><button type="button" className={form.type === "Found" ? "active" : ""} onClick={() => setForm({ ...form, type: "Found" })}>I found something</button></div><label>Item name<input required minLength={3} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Black headphones" /></label><label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.slice(1).map((c) => <option key={c}>{c}</option>)}</select></label><label>Campus location<input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Library, Block A" /></label><label>Description<textarea required minLength={10} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Add helpful details..." rows={3} /></label><label>Contact information<input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Email or campus contact (optional)" /></label><button className="primary submit-button" type="submit"><Plus size={18} /> Publish listing</button></form></section></div>}

      {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><section className="modal detail-modal" onClick={(e) => e.stopPropagation()}><div className="modal-head"><div><span className={`status ${selected.type.toLowerCase()}`}>{selected.type}</span><h2>{selected.title}</h2></div><button className="icon-button" onClick={() => setSelected(null)} aria-label="Close"><X /></button></div><p>{selected.description}</p><div className="detail-line"><MapPin size={17} />{selected.location}</div><div className="detail-line"><Clock size={17} />{selected.date}</div><div className="detail-line"><Package size={17} />{selected.category}</div>{selected.contact && <div className="detail-line"><BriefcaseBusiness size={17} />{selected.contact}</div>}<p className="privacy-note">Demo listing: contact information is supplied by the poster. Meet in a public campus location when arranging a return.</p><button className="primary submit-button" onClick={() => setSelected(null)}>Done</button></section></div>}

      {notice && <div className="toast">{notice}</div>}
    </main>
  );
}

export default App;