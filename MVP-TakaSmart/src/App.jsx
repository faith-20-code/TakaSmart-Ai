import { useState, useEffect, useRef, createContext, useContext } from "react";

// ─── Auth Context ──────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

// ─── Sample Data ───────────────────────────────────────────────────────────────
const INITIAL_LISTINGS = [
  { id: 1, sellerId: 2, sellerName: "James Mwangi", material: "Plastic", subtype: "PET Bottles", quantity: 50, unit: "kg", price: 18, location: "Westlands", lat: -1.2641, lng: 36.8025, description: "Clean PET bottles, sorted and compressed. Ready for pickup.", status: "active", createdAt: "2025-05-20", image: null, aiPriceMin: 15, aiPriceMax: 22 },
  { id: 2, sellerId: 2, sellerName: "James Mwangi", material: "Metal", subtype: "Aluminium Cans", quantity: 30, unit: "kg", price: 55, location: "Parklands", lat: -1.2590, lng: 36.8129, description: "Crushed aluminium cans from beverage company.", status: "active", createdAt: "2025-05-18", image: null, aiPriceMin: 50, aiPriceMax: 65 },
  { id: 3, sellerId: 5, sellerName: "Grace Njeri", material: "Paper", subtype: "Cardboard", quantity: 200, unit: "kg", price: 8, location: "Karen", lat: -1.3191, lng: 36.7128, description: "Dry cardboard from supermarket. Large flat sheets.", status: "active", createdAt: "2025-05-22", image: null, aiPriceMin: 7, aiPriceMax: 12 },
  { id: 4, sellerId: 5, sellerName: "Grace Njeri", material: "Electronics", subtype: "Mobile Phones", quantity: 15, unit: "units", price: 500, location: "CBD Nairobi", lat: -1.2833, lng: 36.8167, description: "Old Nokia and Samsung handsets. Mix of working and non-working.", status: "active", createdAt: "2025-05-19", image: null, aiPriceMin: 400, aiPriceMax: 700 },
  { id: 5, sellerId: 2, sellerName: "James Mwangi", material: "Glass", subtype: "Glass Bottles", quantity: 80, unit: "kg", price: 5, location: "Eastleigh", lat: -1.2774, lng: 36.8548, description: "Mixed glass bottles, mostly brown and green.", status: "active", createdAt: "2025-05-21", image: null, aiPriceMin: 4, aiPriceMax: 8 },
];

const USERS = [
  { id: 1, name: "Admin User", email: "admin@takasmart.co.ke", password: "admin123", role: "admin" },
  { id: 2, name: "James Mwangi", email: "seller@takasmart.co.ke", password: "seller123", role: "seller", phone: "+254 712 345 678", location: "Westlands, Nairobi" },
  { id: 3, name: "EcoCycle Kenya", email: "buyer@takasmart.co.ke", password: "buyer123", role: "buyer", phone: "+254 722 111 222", location: "Industrial Area, Nairobi", company: "EcoCycle Kenya Ltd" },
  { id: 4, name: "GreenWaste Solutions", email: "buyer2@takasmart.co.ke", password: "buyer456", role: "buyer", phone: "+254 733 555 666", location: "Athi River, Nairobi", company: "GreenWaste Solutions" },
  { id: 5, name: "Grace Njeri", email: "seller2@takasmart.co.ke", password: "seller456", role: "seller", phone: "+254 744 999 888", location: "Karen, Nairobi" },
];

const MATERIALS = ["Plastic", "Metal", "Paper", "Glass", "Electronics", "Rubber", "Textiles", "Organic"];
const SUBTYPES = {
  Plastic: ["PET Bottles", "HDPE", "PVC", "LDPE", "PP", "Mixed Plastic"],
  Metal: ["Aluminium Cans", "Copper Wire", "Steel Scrap", "Iron", "Mixed Metal"],
  Paper: ["Cardboard", "Newspaper", "Office Paper", "Mixed Paper"],
  Glass: ["Glass Bottles", "Window Glass", "Mixed Glass"],
  Electronics: ["Mobile Phones", "Computers", "Cables", "PCBs", "Mixed E-Waste"],
  Rubber: ["Tyres", "Rubber Hose", "Mixed Rubber"],
  Textiles: ["Cotton", "Denim", "Mixed Fabric"],
  Organic: ["Food Waste", "Garden Waste"],
};
const NAIROBI_AREAS = ["CBD Nairobi", "Westlands", "Parklands", "Karen", "Eastleigh", "Kasarani", "Embakasi", "Langata", "Industrial Area", "Athi River", "Kiambu Road", "Ngong Road"];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const materialColors = { Plastic: "#1d9e75", Metal: "#378add", Paper: "#ba7517", Glass: "#7f77dd", Electronics: "#d4537e", Rubber: "#888780", Textiles: "#d85a30", Organic: "#639922" };
const materialIcons = { Plastic: "ti-bottle", Metal: "ti-bolt", Paper: "ti-file", Glass: "ti-glass-full", Electronics: "ti-device-mobile", Rubber: "ti-circle", Textiles: "ti-shirt", Organic: "ti-leaf" };
const statusColors = { active: "#1d9e75", pending: "#ba7517", sold: "#888780" };

function Badge({ color, children }) {
  return <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: color + "22", color }}>{children}</span>;
}

function MaterialBadge({ material }) {
  const c = materialColors[material] || "#888780";
  return <Badge color={c}><i className={`ti ${materialIcons[material] || "ti-recycle"}`} style={{ fontSize: 11, marginRight: 4 }} aria-hidden />{material}</Badge>;
}

// ─── Claude AI Service ─────────────────────────────────────────────────────────
async function getAIPriceSuggestion(material, subtype, quantity, unit, location) {
  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: "You are a recycling market pricing expert for Nairobi, Kenya. Respond ONLY with a JSON object, no markdown fences, no explanation. The JSON must have: priceMin (number), priceMax (number), suggestedPrice (number), unit (string, e.g. 'per kg'), reasoning (string, 1 sentence max). All prices in KES.",
        messages: [{ role: "user", content: `Nairobi recycling market price for: ${subtype} (${material}), ${quantity} ${unit}, location: ${location}. Give current 2025 Nairobi scrap dealer market rates.` }],
      }),
    });
    const data = await resp.json();
    const text = data.content?.find(b => b.type === "text")?.text || "{}";
    return JSON.parse(text);
  } catch {
    const fallback = { Plastic: [12, 25], Metal: [45, 80], Paper: [6, 15], Glass: [4, 9], Electronics: [300, 800] };
    const [min, max] = fallback[material] || [10, 30];
    return { priceMin: min, priceMax: max, suggestedPrice: Math.round((min + max) / 2), unit: `per ${unit}`, reasoning: "Based on typical Nairobi market rates." };
  }
}

async function getAIBuyerMatch(listing, buyers) {
  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        system: "You are a recycling marketplace matching agent. Respond ONLY with a JSON array, no markdown fences. Each item: { buyerId, matchScore (0-100), reason (string, max 10 words) }.",
        messages: [{ role: "user", content: `Listing: ${listing.material} - ${listing.subtype}, ${listing.quantity}${listing.unit}, ${listing.location}.\nBuyers: ${JSON.stringify(buyers.map(b => ({ id: b.id, name: b.company || b.name, location: b.location })))}\nRank buyers by fit. Return top 3.` }],
      }),
    });
    const data = await resp.json();
    const text = data.content?.find(b => b.type === "text")?.text || "[]";
    return JSON.parse(text);
  } catch {
    return buyers.slice(0, 2).map((b, i) => ({ buyerId: b.id, matchScore: 85 - i * 15, reason: "Buys this material type" }));
  }
}

async function askChatbot(messages, userMessage) {
  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: "You are TakaBot, the friendly AI assistant for TakaSmart — a Nairobi recycling marketplace. Help users with prices, listings, recycling tips, and platform usage. Keep answers concise and practical. Use KES for prices. Focus on Nairobi/Kenya context.",
        messages: [...messages, { role: "user", content: userMessage }],
      }),
    });
    const data = await resp.json();
    return data.content?.find(b => b.type === "text")?.text || "Sorry, I couldn't process that.";
  } catch {
    return "TakaBot is temporarily unavailable. Please try again.";
  }
}

// ─── Components ────────────────────────────────────────────────────────────────

function TopNav({ page, setPage }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{ background: "#0a2e1a", borderBottom: "1px solid #1d9e7533", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setPage(user ? (user.role + "-dashboard") : "home")}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1d9e75", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <i className="ti ti-recycle" style={{ color: "#fff", fontSize: 18 }} />
        </div>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, fontFamily: "Georgia, serif", letterSpacing: "-0.5px" }}>TakaSmart</span>
        <span style={{ color: "#1d9e75", fontSize: 11, fontWeight: 600, background: "#1d9e7522", padding: "2px 6px", borderRadius: 4 }}>AI</span>
      </div>
      {user ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#9fe1cb", fontSize: 13 }}>{user.name}</span>
          <Badge color={user.role === "seller" ? "#1d9e75" : user.role === "buyer" ? "#378add" : "#888780"}>{user.role}</Badge>
          <button onClick={logout} style={{ background: "transparent", border: "1px solid #1d9e7544", color: "#9fe1cb", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>Sign out</button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setPage("login")} style={{ background: "transparent", border: "1px solid #1d9e7544", color: "#9fe1cb", padding: "6px 16px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>Login</button>
          <button onClick={() => setPage("register")} style={{ background: "#1d9e75", border: "none", color: "#fff", padding: "6px 16px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Sign up</button>
        </div>
      )}
    </nav>
  );
}

// ─── Home Page ─────────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  const stats = [
    { label: "Active Listings", value: "2,847" },
    { label: "Registered Sellers", value: "1,290" },
    { label: "Recycling Companies", value: "84" },
    { label: "KG Recycled", value: "45,000+" },
  ];
  return (
    <div style={{ fontFamily: "Georgia, serif" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0a2e1a 0%, #0f4a2a 60%, #134d2e 100%)", minHeight: 520, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "radial-gradient(circle at 20% 80%, #1d9e7511 0%, transparent 50%), radial-gradient(circle at 80% 20%, #5dcaa511 0%, transparent 50%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#1d9e7522", border: "1px solid #1d9e7544", borderRadius: 20, padding: "6px 16px", marginBottom: "1.5rem" }}>
            <i className="ti ti-sparkles" style={{ color: "#1d9e75", fontSize: 14 }} />
            <span style={{ color: "#9fe1cb", fontSize: 13, fontFamily: "system-ui" }}>AI-Powered Recycling Marketplace</span>
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, color: "#fff", lineHeight: 1.15, marginBottom: "1rem", maxWidth: 700 }}>
            Turn Your Waste Into <span style={{ color: "#1d9e75" }}>KES</span> — The Smart Way
          </h1>
          <p style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "#9fe1cb", maxWidth: 560, lineHeight: 1.7, marginBottom: "2rem", fontFamily: "system-ui" }}>
            Nairobi's first AI-powered recyclable waste marketplace. Connect with recycling buyers, get fair prices, and help build a cleaner city.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => { window.setPageGlobal("register"); window.setRegisterRoleGlobal("seller"); }} style={{ background: "#1d9e75", border: "none", color: "#fff", padding: "14px 32px", borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui" }}>
              <i className="ti ti-tag" style={{ marginRight: 8 }} />List Your Waste
            </button>
            <button onClick={() => { window.setPageGlobal("register"); window.setRegisterRoleGlobal("buyer"); }} style={{ background: "transparent", border: "2px solid #1d9e75", color: "#1d9e75", padding: "14px 32px", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui" }}>
              <i className="ti ti-search" style={{ marginRight: 8 }} />Browse Materials
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: "#fff", padding: "3rem 2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 1, borderBottom: "1px solid #e5e5e5" }}>
        {stats.map(s => (
          <div key={s.label} style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#0a2e1a", fontFamily: "Georgia, serif" }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 4, fontFamily: "system-ui" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{ background: "#f8faf9", padding: "4rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#0a2e1a", marginBottom: "0.5rem" }}>How TakaSmart Works</h2>
        <p style={{ color: "#666", marginBottom: "3rem", fontFamily: "system-ui" }}>Three simple steps to turn recyclables into cash</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, maxWidth: 860, margin: "0 auto" }}>
          {[
            { icon: "ti-camera", title: "1. List Your Materials", desc: "Photo + details. Our AI instantly suggests a fair KES price based on Nairobi market rates.", color: "#1d9e75" },
            { icon: "ti-robot", title: "2. AI Matches Buyers", desc: "The AI agent automatically notifies nearby recycling companies that buy your material type.", color: "#378add" },
            { icon: "ti-cash", title: "3. Get Paid", desc: "Agree on a price, arrange pickup or drop-off, and get paid directly.", color: "#ba7517" },
          ].map(s => (
            <div key={s.title} style={{ background: "#fff", borderRadius: 12, padding: "2rem 1.5rem", border: "1px solid #e8ede9", textAlign: "left" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: s.color + "18", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <i className={`ti ${s.icon}`} style={{ fontSize: 24, color: s.color }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0a2e1a", marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, fontFamily: "system-ui", margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Material categories */}
      <div style={{ background: "#fff", padding: "4rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#0a2e1a", marginBottom: "0.5rem" }}>Materials We Handle</h2>
        <p style={{ color: "#666", marginBottom: "2.5rem", fontFamily: "system-ui" }}>From household plastics to industrial e-waste</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 12, maxWidth: 700, margin: "0 auto" }}>
          {MATERIALS.map(m => (
            <div key={m} style={{ padding: "1rem 0.5rem", borderRadius: 10, border: "1px solid #e8ede9", background: materialColors[m] + "0a", cursor: "pointer", transition: "transform 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}>
              <i className={`ti ${materialIcons[m]}`} style={{ fontSize: 28, color: materialColors[m], display: "block", marginBottom: 6 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#444", fontFamily: "system-ui" }}>{m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "#0a2e1a", padding: "4rem 2rem", textAlign: "center" }}>
        <h2 style={{ color: "#fff", fontSize: "1.8rem", marginBottom: "1rem" }}>Ready to start recycling smarter?</h2>
        <p style={{ color: "#9fe1cb", marginBottom: "2rem", fontFamily: "system-ui" }}>Join 1,290+ Nairobi sellers already on the platform</p>
        <button onClick={() => setPage("register")} style={{ background: "#1d9e75", border: "none", color: "#fff", padding: "14px 36px", borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui" }}>
          Create Free Account →
        </button>
      </div>
    </div>
  );
}

// ─── Auth Pages ────────────────────────────────────────────────────────────────
function LoginPage({ setPage }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 400));
    const u = USERS.find(u => u.email === form.email && u.password === form.password);
    if (u) { login(u); setPage(u.role + "-dashboard"); }
    else setError("Invalid email or password.");
    setLoading(false);
  };

  const quickLogin = (role) => {
    const u = USERS.find(u => u.role === role);
    login(u);
    setPage(role + "-dashboard");
  };

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: "#f5f8f6", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e0ebe3", padding: "2.5rem", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0a2e1a", marginBottom: 4, fontFamily: "Georgia, serif" }}>Welcome back</h2>
          <p style={{ color: "#888", fontSize: 14, marginBottom: "1.5rem" }}>Sign in to your TakaSmart account</p>
          {error && <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", color: "#cc3333", padding: "10px 14px", borderRadius: 8, marginBottom: "1rem", fontSize: 14 }}>{error}</div>}
          <form onSubmit={handle}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 6, fontWeight: 600 }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #d0d8d3", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 6, fontWeight: 600 }}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="••••••••" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #d0d8d3", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: "100%", background: "#0a2e1a", border: "none", color: "#fff", padding: "12px", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: loading ? "wait" : "pointer" }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #eee" }}>
            <p style={{ fontSize: 12, color: "#aaa", marginBottom: 10, textAlign: "center" }}>Quick demo access:</p>
            <div style={{ display: "flex", gap: 8 }}>
              {["seller", "buyer", "admin"].map(r => (
                <button key={r} onClick={() => quickLogin(r)} style={{ flex: 1, padding: "8px 4px", borderRadius: 6, border: "1px solid #e0ebe3", background: "#f5f8f6", fontSize: 12, cursor: "pointer", textTransform: "capitalize", fontWeight: 600, color: "#0a2e1a" }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <p style={{ textAlign: "center", fontSize: 13, color: "#888", marginTop: "1rem" }}>No account? <button onClick={() => setPage("register")} style={{ background: "none", border: "none", color: "#1d9e75", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Sign up</button></p>
        </div>
      </div>
    </div>
  );
}

function RegisterPage({ setPage, defaultRole }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", location: "", role: defaultRole || "seller", company: "" });
  const [step, setStep] = useState(1);

  const handle = (e) => {
    e.preventDefault();
    const newUser = { id: Date.now(), ...form };
    login(newUser);
    setPage(form.role + "-dashboard");
  };

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: "#f5f8f6", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e0ebe3", padding: "2.5rem" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0a2e1a", marginBottom: 4, fontFamily: "Georgia, serif" }}>Create Account</h2>
          <p style={{ color: "#888", fontSize: 14, marginBottom: "1.5rem" }}>Join Nairobi's smart recycling marketplace</p>

          <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", background: "#f5f8f6", borderRadius: 10, padding: 4 }}>
            {[{ v: "seller", label: "I'm a Seller", icon: "ti-tag" }, { v: "buyer", label: "I'm a Buyer", icon: "ti-building-factory" }].map(o => (
              <button key={o.v} onClick={() => setForm({ ...form, role: o.v })} style={{ flex: 1, padding: "10px 8px", borderRadius: 8, border: form.role === o.v ? "2px solid #1d9e75" : "2px solid transparent", background: form.role === o.v ? "#fff" : "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: form.role === o.v ? "#0a2e1a" : "#888" }}>
                <i className={`ti ${o.icon}`} style={{ marginRight: 6, color: form.role === o.v ? "#1d9e75" : "#aaa" }} />{o.label}
              </button>
            ))}
          </div>

          <form onSubmit={handle}>
            {[
              { key: "name", label: "Full Name", type: "text", ph: "e.g. Jane Wanjiku" },
              { key: "email", label: "Email", type: "email", ph: "jane@example.com" },
              { key: "password", label: "Password", type: "password", ph: "••••••••" },
              { key: "phone", label: "Phone Number", type: "tel", ph: "+254 7XX XXX XXX" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 5, fontWeight: 600 }}>{f.label}</label>
                <input type={f.type} placeholder={f.ph} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #d0d8d3", fontSize: 14, boxSizing: "border-box" }} />
              </div>
            ))}
            {form.role === "buyer" && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 5, fontWeight: 600 }}>Company Name</label>
                <input type="text" placeholder="e.g. EcoCycle Kenya Ltd" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #d0d8d3", fontSize: 14, boxSizing: "border-box" }} />
              </div>
            )}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 5, fontWeight: 600 }}>Location in Nairobi</label>
              <select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #d0d8d3", fontSize: 14, boxSizing: "border-box" }}>
                <option value="">Select area...</option>
                {NAIROBI_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <button type="submit" style={{ width: "100%", background: "#1d9e75", border: "none", color: "#fff", padding: "12px", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              Create Account →
            </button>
          </form>
          <p style={{ textAlign: "center", fontSize: 13, color: "#888", marginTop: "1rem" }}>Have an account? <button onClick={() => setPage("login")} style={{ background: "none", border: "none", color: "#1d9e75", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Sign in</button></p>
        </div>
      </div>
    </div>
  );
}

// ─── Seller Dashboard ──────────────────────────────────────────────────────────
function SellerDashboard({ setPage, listings, setListings }) {
  const { user } = useAuth();
  const myListings = listings.filter(l => l.sellerId === user.id || l.sellerName === user.name);
  const totalVal = myListings.reduce((a, l) => a + l.price * l.quantity, 0);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0a2e1a", fontFamily: "Georgia, serif", marginBottom: 4 }}>My Seller Dashboard</h1>
          <p style={{ color: "#666", fontSize: 14 }}>Welcome back, {user.name} · {user.location || "Nairobi"}</p>
        </div>
        <button onClick={() => setPage("create-listing")} style={{ background: "#1d9e75", border: "none", color: "#fff", padding: "12px 20px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <i className="ti ti-plus" /> New Listing
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: "2rem" }}>
        {[
          { label: "Active Listings", value: myListings.filter(l => l.status === "active").length, icon: "ti-list", color: "#1d9e75" },
          { label: "Total Stock", value: myListings.reduce((a, l) => a + l.quantity, 0) + " kg", icon: "ti-weight", color: "#378add" },
          { label: "Est. Value", value: "KES " + totalVal.toLocaleString(), icon: "ti-cash", color: "#ba7517" },
          { label: "Sold", value: myListings.filter(l => l.status === "sold").length, icon: "ti-check", color: "#888780" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 10, border: "1px solid #e0ebe3", padding: "1rem 1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#888" }}>{s.label}</span>
              <i className={`ti ${s.icon}`} style={{ fontSize: 18, color: s.color }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#0a2e1a", fontFamily: "Georgia, serif" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Listings */}
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0a2e1a", marginBottom: "1rem" }}>My Listings</h2>
      {myListings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "#f5f8f6", borderRadius: 12, border: "2px dashed #c5d8cb" }}>
          <i className="ti ti-package-off" style={{ fontSize: 40, color: "#c5d8cb", display: "block", marginBottom: 12 }} />
          <p style={{ color: "#888", marginBottom: "1rem" }}>No listings yet. Post your first recyclable material!</p>
          <button onClick={() => setPage("create-listing")} style={{ background: "#1d9e75", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Post First Listing</button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {myListings.map(l => (
            <ListingCard key={l.id} listing={l} view="seller" setPage={setPage} setListings={setListings} listings={listings} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Create Listing ────────────────────────────────────────────────────────────
function CreateListingPage({ setPage, listings, setListings }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ material: "", subtype: "", quantity: "", unit: "kg", price: "", location: user.location || "", description: "" });
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [step, setStep] = useState(1);
  const [buyers, setBuyers] = useState([]);
  const [loadingMatch, setLoadingMatch] = useState(false);

  const fetchAIPrice = async () => {
    if (!form.material || !form.quantity) return;
    setLoadingAI(true);
    const result = await getAIPriceSuggestion(form.material, form.subtype || form.material, form.quantity, form.unit, form.location || "Nairobi");
    setAiSuggestion(result);
    if (result.suggestedPrice) setForm(f => ({ ...f, price: result.suggestedPrice }));
    setLoadingAI(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    const newListing = {
      id: Date.now(),
      sellerId: user.id,
      sellerName: user.name,
      ...form,
      quantity: Number(form.quantity),
      price: Number(form.price),
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      image: null,
      aiPriceMin: aiSuggestion?.priceMin,
      aiPriceMax: aiSuggestion?.priceMax,
    };
    setListings([newListing, ...listings]);
    // Get AI matches
    setLoadingMatch(true);
    const buyerUsers = USERS.filter(u => u.role === "buyer");
    const matches = await getAIBuyerMatch(newListing, buyerUsers);
    setBuyers(matches.map(m => ({ ...m, buyer: buyerUsers.find(b => b.id === m.buyerId) })).filter(m => m.buyer));
    setLoadingMatch(false);
    setStep(2);
  };

  if (step === 2) return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e0ebe3", padding: "2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 60, height: 60, background: "#1d9e7522", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
            <i className="ti ti-check" style={{ fontSize: 28, color: "#1d9e75" }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0a2e1a", fontFamily: "Georgia, serif" }}>Listing Posted!</h2>
          <p style={{ color: "#666", fontSize: 14 }}>Your listing is live. The AI has matched it with nearby buyers.</p>
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a2e1a", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
          <i className="ti ti-robot" style={{ color: "#378add" }} /> AI-Matched Buyers
        </h3>
        {loadingMatch ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
            <i className="ti ti-loader-2 ti-spin" style={{ fontSize: 24, display: "block", marginBottom: 8 }} />Finding best matches...
          </div>
        ) : buyers.length > 0 ? (
          <div style={{ display: "grid", gap: 10 }}>
            {buyers.map(m => (
              <div key={m.buyerId} style={{ background: "#f5f8f6", borderRadius: 10, padding: "14px 16px", border: "1px solid #e0ebe3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#0a2e1a", fontSize: 14 }}>{m.buyer?.company || m.buyer?.name}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{m.reason}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#1d9e75" }}>{m.matchScore}%</div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>match</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#888", fontSize: 14 }}>No matches found yet. Buyers will be notified automatically.</p>
        )}

        <button onClick={() => setPage("seller-dashboard")} style={{ width: "100%", background: "#0a2e1a", border: "none", color: "#fff", padding: "12px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: "1.5rem" }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <button onClick={() => setPage("seller-dashboard")} style={{ background: "none", border: "none", color: "#1d9e75", cursor: "pointer", fontSize: 14, marginBottom: "1rem", display: "flex", alignItems: "center", gap: 6 }}>
        <i className="ti ti-arrow-left" /> Back
      </button>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0a2e1a", fontFamily: "Georgia, serif", marginBottom: "0.25rem" }}>Create New Listing</h1>
      <p style={{ color: "#888", fontSize: 14, marginBottom: "1.5rem" }}>Tell buyers what recyclables you have. Our AI will suggest a fair price.</p>

      <form onSubmit={submit}>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e0ebe3", padding: "1.5rem", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a2e1a", marginBottom: "1rem" }}>Material Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 5, fontWeight: 600 }}>Material Type *</label>
              <select required value={form.material} onChange={e => setForm({ ...form, material: e.target.value, subtype: "" })} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d0d8d3", fontSize: 14 }}>
                <option value="">Select...</option>
                {MATERIALS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 5, fontWeight: 600 }}>Subtype</label>
              <select value={form.subtype} onChange={e => setForm({ ...form, subtype: e.target.value })} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d0d8d3", fontSize: 14 }}>
                <option value="">Select...</option>
                {(SUBTYPES[form.material] || []).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 5, fontWeight: 600 }}>Quantity *</label>
              <input type="number" required min="0.1" step="0.1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 50" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d0d8d3", fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 5, fontWeight: 600 }}>Unit</label>
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d0d8d3", fontSize: 14 }}>
                {["kg", "tonnes", "units", "litres", "bags"].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 5, fontWeight: 600 }}>Location *</label>
            <select required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d0d8d3", fontSize: 14 }}>
              <option value="">Select area...</option>
              {NAIROBI_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {/* AI Price */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e0ebe3", padding: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a2e1a" }}>Pricing</h3>
            <button type="button" onClick={fetchAIPrice} disabled={loadingAI || !form.material || !form.quantity} style={{ background: loadingAI ? "#f5f8f6" : "#1d9e7518", border: "1px solid #1d9e7533", color: "#1d9e75", padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <i className="ti ti-robot" />{loadingAI ? "Getting AI price..." : "Get AI Price Suggestion"}
            </button>
          </div>

          {aiSuggestion && (
            <div style={{ background: "#e1f5ee", borderRadius: 10, padding: "14px", marginBottom: "1rem", border: "1px solid #9fe1cb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f6e56" }}>AI Price Suggestion</span>
                <span style={{ fontSize: 12, color: "#1d9e75" }}>{aiSuggestion.unit}</span>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#0f6e56" }}>KES {aiSuggestion.priceMin} – {aiSuggestion.priceMax}</span>
                <span style={{ fontSize: 13, color: "#aaa" }}>→</span>
                <span style={{ fontWeight: 700, color: "#085041", fontSize: 15 }}>Suggested: KES {aiSuggestion.suggestedPrice}</span>
              </div>
              <p style={{ fontSize: 12, color: "#0f6e56", marginTop: 6 }}>{aiSuggestion.reasoning}</p>
            </div>
          )}

          <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 5, fontWeight: 600 }}>Your Price (KES per {form.unit}) *</label>
          <input type="number" required min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. 18" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d0d8d3", fontSize: 14, boxSizing: "border-box" }} />
        </div>

        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e0ebe3", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 5, fontWeight: 600 }}>Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe condition, packaging, any special notes..." style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d0d8d3", fontSize: 14, boxSizing: "border-box", resize: "vertical" }} />
        </div>

        <button type="submit" style={{ width: "100%", background: "#0a2e1a", border: "none", color: "#fff", padding: "14px", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          <i className="ti ti-send" style={{ marginRight: 8 }} />Post Listing & Find Buyers
        </button>
      </form>
    </div>
  );
}

// ─── Buyer Dashboard ───────────────────────────────────────────────────────────
function BuyerDashboard({ setPage, listings }) {
  const [filters, setFilters] = useState({ material: "", location: "", search: "" });
  const [sortBy, setSortBy] = useState("newest");

  const filtered = listings.filter(l => {
    if (l.status !== "active") return false;
    if (filters.material && l.material !== filters.material) return false;
    if (filters.location && l.location !== filters.location) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!l.material.toLowerCase().includes(q) && !l.subtype?.toLowerCase().includes(q) && !l.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => sortBy === "price-asc" ? a.price - b.price : sortBy === "price-desc" ? b.price - a.price : b.id - a.id);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0a2e1a", fontFamily: "Georgia, serif", marginBottom: 4 }}>Browse Materials</h1>
      <p style={{ color: "#666", fontSize: 14, marginBottom: "1.5rem" }}>Find recyclables near you across Nairobi. {filtered.length} listings available.</p>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e0ebe3", padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: "1 1 200px", position: "relative" }}>
          <i className="ti ti-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 16 }} />
          <input placeholder="Search materials..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} style={{ width: "100%", padding: "9px 12px 9px 36px", borderRadius: 8, border: "1.5px solid #d0d8d3", fontSize: 14, boxSizing: "border-box" }} />
        </div>
        <select value={filters.material} onChange={e => setFilters({ ...filters, material: e.target.value })} style={{ padding: "9px 12px", borderRadius: 8, border: "1.5px solid #d0d8d3", fontSize: 14, flex: "0 1 160px" }}>
          <option value="">All Materials</option>
          {MATERIALS.map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={filters.location} onChange={e => setFilters({ ...filters, location: e.target.value })} style={{ padding: "9px 12px", borderRadius: 8, border: "1.5px solid #d0d8d3", fontSize: 14, flex: "0 1 160px" }}>
          <option value="">All Locations</option>
          {NAIROBI_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "9px 12px", borderRadius: 8, border: "1.5px solid #d0d8d3", fontSize: 14, flex: "0 1 140px" }}>
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>
      </div>

      {/* Material quick filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {MATERIALS.map(m => (
          <button key={m} onClick={() => setFilters(f => ({ ...f, material: f.material === m ? "" : m }))} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${filters.material === m ? materialColors[m] : "#e0ebe3"}`, background: filters.material === m ? materialColors[m] + "18" : "#fff", color: filters.material === m ? materialColors[m] : "#666", fontSize: 13, cursor: "pointer", fontWeight: filters.material === m ? 700 : 400, display: "flex", alignItems: "center", gap: 6 }}>
            <i className={`ti ${materialIcons[m]}`} style={{ fontSize: 14 }} />{m}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "#f5f8f6", borderRadius: 12 }}>
          <p style={{ color: "#888" }}>No listings match your filters.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map(l => <ListingCard key={l.id} listing={l} view="buyer" setPage={setPage} />)}
        </div>
      )}
    </div>
  );
}

// ─── Listing Card ──────────────────────────────────────────────────────────────
function ListingCard({ listing: l, view, setPage, setListings, listings }) {
  const [contacted, setContacted] = useState(false);

  const markSold = () => {
    if (setListings) setListings(listings.map(x => x.id === l.id ? { ...x, status: "sold" } : x));
  };

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e0ebe3", overflow: "hidden", transition: "transform 0.15s, box-shadow 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
      {/* Image placeholder */}
      <div style={{ height: 120, background: `linear-gradient(135deg, ${materialColors[l.material] || "#1d9e75"}18, ${materialColors[l.material] || "#1d9e75"}08)`, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #f0f4f1", position: "relative" }}>
        <i className={`ti ${materialIcons[l.material] || "ti-recycle"}`} style={{ fontSize: 40, color: materialColors[l.material] || "#1d9e75", opacity: 0.6 }} />
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          <Badge color={statusColors[l.status] || "#888"}>{l.status}</Badge>
        </div>
        {l.aiPriceMin && (
          <div style={{ position: "absolute", top: 10, left: 10, background: "#378add18", border: "1px solid #378add33", borderRadius: 6, padding: "3px 8px", display: "flex", alignItems: "center", gap: 4 }}>
            <i className="ti ti-robot" style={{ fontSize: 11, color: "#378add" }} />
            <span style={{ fontSize: 11, color: "#378add", fontWeight: 600 }}>AI priced</span>
          </div>
        )}
      </div>
      <div style={{ padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <MaterialBadge material={l.material} />
            {l.subtype && <span style={{ fontSize: 12, color: "#888", display: "block", marginTop: 4 }}>{l.subtype}</span>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0a2e1a", fontFamily: "Georgia, serif" }}>KES {l.price}</div>
            <div style={{ fontSize: 11, color: "#aaa" }}>per {l.unit}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 13, color: "#666", marginBottom: 8 }}>
          <span><i className="ti ti-weight" style={{ marginRight: 4, fontSize: 14 }} />{l.quantity} {l.unit}</span>
          <span><i className="ti ti-map-pin" style={{ marginRight: 4, fontSize: 14 }} />{l.location}</span>
        </div>
        {l.description && <p style={{ fontSize: 13, color: "#777", marginBottom: 10, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{l.description}</p>}
        <div style={{ fontSize: 12, color: "#aaa", marginBottom: "0.75rem" }}>By {l.sellerName} · {l.createdAt}</div>

        {view === "buyer" && (
          <button onClick={() => setContacted(!contacted)} style={{ width: "100%", background: contacted ? "#f5f8f6" : "#1d9e75", border: contacted ? "1px solid #e0ebe3" : "none", color: contacted ? "#0a2e1a" : "#fff", padding: "9px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {contacted ? <><i className="ti ti-check" style={{ marginRight: 6 }} />Contacted</> : <><i className="ti ti-phone" style={{ marginRight: 6 }} />Contact Seller</>}
          </button>
        )}
        {view === "seller" && l.status === "active" && (
          <button onClick={markSold} style={{ width: "100%", background: "#f5f8f6", border: "1px solid #e0ebe3", color: "#555", padding: "9px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
            <i className="ti ti-check" style={{ marginRight: 6 }} />Mark as Sold
          </button>
        )}
        {view === "seller" && l.status === "sold" && (
          <div style={{ textAlign: "center", padding: "9px", fontSize: 13, color: "#888" }}>
            <i className="ti ti-check-circle" style={{ marginRight: 6, color: "#1d9e75" }} />Sold
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ listings, setListings }) {
  const [tab, setTab] = useState("listings");
  const sellers = USERS.filter(u => u.role === "seller");
  const buyers = USERS.filter(u => u.role === "buyer");

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0a2e1a", fontFamily: "Georgia, serif", marginBottom: "0.25rem" }}>Admin Portal</h1>
      <p style={{ color: "#666", fontSize: 14, marginBottom: "1.5rem" }}>Platform overview and management</p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
        {[
          { label: "Total Listings", value: listings.length, icon: "ti-list", color: "#1d9e75" },
          { label: "Active", value: listings.filter(l => l.status === "active").length, icon: "ti-circle-check", color: "#378add" },
          { label: "Sellers", value: sellers.length, icon: "ti-user", color: "#ba7517" },
          { label: "Buyers", value: buyers.length, icon: "ti-building-factory", color: "#7f77dd" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 10, border: "1px solid #e0ebe3", padding: "1rem" }}>
            <i className={`ti ${s.icon}`} style={{ fontSize: 20, color: s.color, display: "block", marginBottom: 6 }} />
            <div style={{ fontSize: 22, fontWeight: 700, color: "#0a2e1a", fontFamily: "Georgia, serif" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: "1.5rem", borderBottom: "1px solid #e0ebe3" }}>
        {["listings", "sellers", "buyers"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", borderBottom: tab === t ? "2px solid #1d9e75" : "2px solid transparent", color: tab === t ? "#1d9e75" : "#888", padding: "10px 16px", fontSize: 14, fontWeight: tab === t ? 700 : 400, cursor: "pointer", textTransform: "capitalize" }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "listings" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e0ebe3", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f5f8f6" }}>
                {["Material", "Subtype", "Qty", "Price (KES)", "Location", "Seller", "Status", "Action"].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontWeight: 700, color: "#444", fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listings.map(l => (
                <tr key={l.id} style={{ borderTop: "1px solid #f0f4f1" }}>
                  <td style={{ padding: "12px 14px" }}><MaterialBadge material={l.material} /></td>
                  <td style={{ padding: "12px 14px", color: "#666" }}>{l.subtype || "—"}</td>
                  <td style={{ padding: "12px 14px", color: "#333" }}>{l.quantity} {l.unit}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0a2e1a" }}>{l.price}</td>
                  <td style={{ padding: "12px 14px", color: "#666" }}>{l.location}</td>
                  <td style={{ padding: "12px 14px", color: "#666" }}>{l.sellerName}</td>
                  <td style={{ padding: "12px 14px" }}><Badge color={statusColors[l.status] || "#888"}>{l.status}</Badge></td>
                  <td style={{ padding: "12px 14px" }}>
                    <button onClick={() => setListings(listings.filter(x => x.id !== l.id))} style={{ background: "#fff0f0", border: "1px solid #ffcccc", color: "#cc3333", padding: "4px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "sellers" && (
        <div style={{ display: "grid", gap: 10 }}>
          {sellers.map(s => (
            <div key={s.id} style={{ background: "#fff", borderRadius: 10, border: "1px solid #e0ebe3", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1d9e7522", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#1d9e75", fontSize: 14 }}>{s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
                <div>
                  <div style={{ fontWeight: 700, color: "#0a2e1a", fontSize: 14 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{s.email} · {s.location}</div>
                </div>
              </div>
              <Badge color="#1d9e75">Seller</Badge>
            </div>
          ))}
        </div>
      )}

      {tab === "buyers" && (
        <div style={{ display: "grid", gap: 10 }}>
          {buyers.map(b => (
            <div key={b.id} style={{ background: "#fff", borderRadius: 10, border: "1px solid #e0ebe3", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#378add22", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#378add", fontSize: 14 }}><i className="ti ti-building-factory" /></div>
                <div>
                  <div style={{ fontWeight: 700, color: "#0a2e1a", fontSize: 14 }}>{b.company || b.name}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{b.email} · {b.location}</div>
                </div>
              </div>
              <Badge color="#378add">Buyer</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TakaBot Chatbot ───────────────────────────────────────────────────────────
function TakaBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", content: "Habari! I'm TakaBot 🤖 I can help with recycling prices, listing tips, and market info in Nairobi. What would you like to know?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const history = messages.filter(m => m.role !== "system").map(m => ({ role: m.role, content: m.content }));
    setMessages(m => [...m, { role: "user", content: userMsg }]);
    setLoading(true);
    const reply = await askChatbot(history, userMsg);
    setMessages(m => [...m, { role: "assistant", content: reply }]);
    setLoading(false);
  };

  return (
    <>
      {/* Toggle button */}
      <button onClick={() => setOpen(!open)} style={{ position: "fixed", bottom: 24, right: 24, width: 54, height: 54, borderRadius: "50%", background: "#0a2e1a", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(10,46,26,0.3)", zIndex: 1000 }}>
        <i className={`ti ${open ? "ti-x" : "ti-robot"}`} style={{ fontSize: 22 }} />
      </button>

      {open && (
        <div style={{ position: "fixed", bottom: 90, right: 24, width: 340, height: 440, background: "#fff", borderRadius: 16, border: "1px solid #e0ebe3", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", zIndex: 1000 }}>
          {/* Header */}
          <div style={{ background: "#0a2e1a", borderRadius: "16px 16px 0 0", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: "#1d9e75", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="ti ti-robot" style={{ color: "#fff", fontSize: 18 }} />
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>TakaBot</div>
              <div style={{ color: "#9fe1cb", fontSize: 11 }}>AI Recycling Assistant</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "80%", padding: "9px 13px", borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px", background: m.role === "user" ? "#0a2e1a" : "#f5f8f6", color: m.role === "user" ? "#fff" : "#333", fontSize: 13, lineHeight: 1.5 }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex" }}>
                <div style={{ background: "#f5f8f6", borderRadius: "12px 12px 12px 4px", padding: "9px 13px", fontSize: 13, color: "#888" }}>
                  <span style={{ display: "inline-block", animation: "pulse 1s infinite" }}>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div style={{ padding: "0 12px 8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Plastic prices today", "Best materials to sell", "How do I list?"].map(q => (
                <button key={q} onClick={() => { setInput(q); setTimeout(send, 100); }} style={{ background: "#f5f8f6", border: "1px solid #e0ebe3", color: "#555", padding: "5px 10px", borderRadius: 20, fontSize: 11, cursor: "pointer" }}>{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "10px 12px", borderTop: "1px solid #f0f4f1", display: "flex", gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask about prices, tips..." style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "1.5px solid #d0d8d3", fontSize: 13 }} />
            <button onClick={send} disabled={loading} style={{ background: "#1d9e75", border: "none", color: "#fff", width: 36, height: 36, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="ti ti-send" style={{ fontSize: 16 }} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home");
  const [listings, setListings] = useState(INITIAL_LISTINGS);
  const [registerRole, setRegisterRole] = useState("seller");

  // Expose globals for nav buttons inside HomePage
  window.setPageGlobal = setPage;
  window.setRegisterRoleGlobal = setRegisterRole;

  const login = (u) => setUser(u);
  const logout = () => { setUser(null); setPage("home"); };

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage setPage={setPage} />;
      case "login": return <LoginPage setPage={setPage} />;
      case "register": return <RegisterPage setPage={setPage} defaultRole={registerRole} />;
      case "seller-dashboard": return <SellerDashboard setPage={setPage} listings={listings} setListings={setListings} />;
      case "create-listing": return <CreateListingPage setPage={setPage} listings={listings} setListings={setListings} />;
      case "buyer-dashboard": return <BuyerDashboard setPage={setPage} listings={listings} />;
      case "admin-dashboard": return <AdminDashboard listings={listings} setListings={setListings} />;
      default: return <HomePage setPage={setPage} />;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <div style={{ minHeight: "100vh", background: "#f5f8f6", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
        <TopNav page={page} setPage={setPage} />
        <main>{renderPage()}</main>
        <TakaBot />
      </div>
    </AuthContext.Provider>
  );
}
