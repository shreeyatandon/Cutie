export const T = {
  bg: "#f2f2f7", card: "#ffffff", accent: "#007aff", accent2: "#34aadc",
  text: "#000000", sub: "#6d6d72", border: "#c6c6c8", nav: "#ffffff",
  shadow: "rgba(0,0,0,0.08)", chart: ["#007aff", "#34aadc", "#5856d6", "#ff9500"]
};

export const Card = ({ t, children, style = {} }) => (
  <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: `0 2px 12px ${t.shadow}`, border: `1px solid ${t.border}`, marginBottom: 16, ...style }}>{children}</div>
);

export const Btn = ({ t, onClick, children, secondary, small, style = {} }) => (
  <button onClick={onClick} style={{ background: secondary ? "transparent" : t.accent, color: secondary ? t.accent : "#fff", border: secondary ? `1.5px solid ${t.accent}` : "none", borderRadius: small ? 8 : 12, padding: small ? "6px 14px" : "10px 20px", fontSize: small ? 13 : 15, fontWeight: 600, cursor: "pointer", ...style }}>{children}</button>
);

export const Inp = ({ t, value, onChange, placeholder, type = "text", style = {} }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ background: t.bg, border: `1.5px solid ${t.border}`, borderRadius: 10, padding: "9px 14px", color: t.text, fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box", ...style }} />
);

export const TA = ({ t, value, onChange, placeholder, rows = 3 }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{ background: t.bg, border: `1.5px solid ${t.border}`, borderRadius: 10, padding: "9px 14px", color: t.text, fontSize: 14, width: "100%", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
);

export const Sel = ({ t, value, onChange, options }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    style={{ background: t.bg, border: `1.5px solid ${t.border}`, borderRadius: 10, padding: "9px 14px", color: t.text, fontSize: 14, width: "100%", outline: "none" }}>
    {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
  </select>
);

export const PBar = ({ t, value, max, color, h = 8 }) => (
  <div style={{ background: t.border, borderRadius: 99, height: h, overflow: "hidden" }}>
    <div style={{ width: `${Math.min(100, max > 0 ? (value / max) * 100 : 0)}%`, background: color || t.accent, height: "100%", borderRadius: 99, transition: "width 0.4s" }} />
  </div>
);

export const MSlider = ({ t, value, onChange, label }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ color: t.sub, fontSize: 13 }}>{label}</span>
      <span style={{ color: t.accent, fontWeight: 700 }}>{value}/10</span>
    </div>
    <input type="range" min={1} max={10} value={value} onChange={e => onChange(Number(e.target.value))} style={{ width: "100%", accentColor: t.accent }} />
  </div>
);

export const MCard = ({ t, label, value, unit, color }) => (
  <div style={{ background: t.card, borderRadius: 14, padding: 14, border: `1px solid ${t.border}`, flex: 1, minWidth: 90, boxShadow: `0 2px 8px ${t.shadow}` }}>
    <div style={{ fontSize: 18, fontWeight: 700, color: color || t.accent }}>{value}</div>
    <div style={{ fontSize: 11, color: t.sub }}>{unit}</div>
    <div style={{ fontSize: 11, color: t.sub, marginTop: 1 }}>{label}</div>
  </div>
);

export const SHdr = ({ t, title, sub }) => (
  <div style={{ marginBottom: 20 }}>
    <h2 style={{ color: t.text, margin: 0, fontSize: 22, fontWeight: 700 }}>{title}</h2>
    {sub && <p style={{ color: t.sub, margin: "4px 0 0", fontSize: 14 }}>{sub}</p>}
  </div>
);

export const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
export const ld = (k, def) => { try { const r = localStorage.getItem(k); return r != null ? JSON.parse(r) : def; } catch (e) { return def; } };

export function MoodCheckin({ t, allData, setAllData, compact = false }) {
  const { useState } = require("react");
  const today = new Date().toLocaleDateString("en-GB");
  const ex = allData.moods?.find(m => m.date === today);
  const [mood, setMood] = useState(ex?.mood || 5);
  const [energy, setEnergy] = useState(ex?.energy || 5);
  const [notes, setNotes] = useState(ex?.notes || "");
  const [emotions, setEmotions] = useState(ex?.emotions || []);
  const [saved, setSaved] = useState(!!ex);
  const EM = ["Anxious", "Calm", "Motivated", "Tired", "Happy", "Stressed", "Grateful", "Focused", "Overwhelmed", "Content"];
  const save_ = () => {
    const entry = { date: today, mood, energy, notes, emotions, time: new Date().toLocaleTimeString() };
    const u = [...(allData.moods || []).filter(m => m.date !== today), entry];
    setAllData(p => ({ ...p, moods: u })); sv("moods", u); setSaved(true);
  };
  if (compact && saved) return (
    <div style={{ background: t.accent2 + "33", borderRadius: 12, padding: 12, marginBottom: 12 }}>
      <span style={{ color: t.text, fontSize: 13 }}>Checked in — Mood {mood}/10, Energy {energy}/10</span>
      <span onClick={() => setSaved(false)} style={{ color: t.accent, fontSize: 12, marginLeft: 8, cursor: "pointer" }}>Edit</span>
    </div>
  );
  return (
    <Card t={t} style={{ background: t.accent2 + "22" }}>
      <div style={{ fontWeight: 700, color: t.text, marginBottom: 12 }}>Check in with yourself</div>
      <MSlider t={t} label="Mood" value={mood} onChange={setMood} />
      <MSlider t={t} label="Energy" value={energy} onChange={setEnergy} />
      <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 12 }}>
        {EM.map(e => (
          <span key={e} onClick={() => setEmotions(p => p.includes(e) ? p.filter(x => x !== e) : [...p, e])}
            style={{ background: emotions.includes(e) ? t.accent : t.border, color: emotions.includes(e) ? "#fff" : t.sub, borderRadius: 20, padding: "4px 10px", fontSize: 12, margin: "2px", cursor: "pointer" }}>{e}</span>
        ))}
      </div>
      <TA t={t} value={notes} onChange={setNotes} placeholder="What's present for you right now?" rows={2} />
      <Btn t={t} onClick={save_} style={{ marginTop: 10 }}>Save</Btn>
    </Card>
  );
}
