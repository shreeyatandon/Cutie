import { useState } from "react";
import { Card, Btn, Inp, TA, Sel, PBar, MSlider, MCard, SHdr, MoodCheckin, sv, ld } from "./components";
import AIAssistant from "./AI";

const T = {
  bg: "#f2f2f7", card: "#ffffff", accent: "#007aff", accent2: "#34aadc",
  text: "#000000", sub: "#6d6d72", border: "#c6c6c8", nav: "#ffffff",
  shadow: "rgba(0,0,0,0.08)"
};

const MODULES = [
  { id: "dashboard", label: "Home" },
  { id: "fitness", label: "Movement" },
  { id: "nutrition", label: "Nourishment" },
  { id: "hydration", label: "Hydration" },
  { id: "cycle", label: "Cycle" },
  { id: "sleep", label: "Rest" },
  { id: "meditation", label: "Stillness" },
  { id: "yoga", label: "Yoga & Studies" },
  { id: "mood", label: "Energy & Mood" },
  { id: "journal", label: "Journal" },
  { id: "goals", label: "Intentions" },
  { id: "search", label: "Search" },
  { id: "ai", label: "Your Guide" },
  { id: "settings", label: "Settings" },
];

// ── WELLNESS SCORE ────────────────────────────────────────────────────────
function WellnessScore({ allData }) {
  const t = T;
  const today = new Date().toLocaleDateString("en-GB");
  const gymDone = (allData.fitness || []).filter(f => f.date === today).length > 0 ? 1 : 0;
  const hydGoal = allData.settings?.hydGoal || 8;
  const todayHyd = (allData.hydration || []).find(h => h.date === today);
  const hydDone = todayHyd && todayHyd.glasses >= hydGoal ? 1 : 0;
  const yogaDone = (allData.yogaPractice || []).filter(y => y.date === today).length > 0 ? 1 : 0;
  const bodyScore = Math.round(([gymDone, hydDone, yogaDone].reduce((a, b) => a + b, 0) / 3) * 100);
  const medDone = (allData.meditation || []).filter(m => m.date === today).length > 0 ? 1 : 0;
  const journalDone = (allData.journal || []).filter(j => j.date === today).length > 0 ? 1 : 0;
  const moodDone = (allData.moods || []).find(m => m.date === today) ? 1 : 0;
  const mindScore = Math.round(([medDone, journalDone, moodDone].reduce((a, b) => a + b, 0) / 3) * 100);
  const overall = Math.round((bodyScore * 0.55) + (mindScore * 0.45));
  const allDates = [...(allData.fitness || []), ...(allData.moods || [])].map(e => e.date).filter(Boolean).sort();
  let dayNum = 1;
  if (allDates.length > 0) { try { const [d, m, y] = allDates[0].split("/"); dayNum = Math.max(1, Math.floor((new Date() - new Date(`${y}-${m}-${d}`)) / 86400000) + 1); } catch {} }
  const label = overall >= 80 ? "In full alignment" : overall >= 60 ? "Consistent" : overall >= 35 ? "Building momentum" : "Finding your ground";
  return (
    <Card t={t} style={{ background: `linear-gradient(135deg,${t.card} 0%,${t.accent2}22 100%)` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 700, color: t.text, fontSize: 15 }}>Wellness Score</div>
          <div style={{ color: t.sub, fontSize: 12, marginTop: 2 }}>Day {dayNum} of your journey</div>
        </div>
        <div style={{ background: t.accent + "22", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: t.accent, fontWeight: 600 }}>{label}</div>
      </div>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 48, fontWeight: 800, color: t.accent }}>{overall}%</div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ color: t.text, fontSize: 13 }}>Body</span>
          <span style={{ color: t.accent, fontWeight: 700 }}>{bodyScore}%</span>
        </div>
        <PBar t={t} value={bodyScore} max={100} />
        <div style={{ color: t.sub, fontSize: 10, marginTop: 3 }}>Movement · Hydration · Yoga</div>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ color: t.text, fontSize: 13 }}>Mind</span>
          <span style={{ color: "#5856d6", fontWeight: 700 }}>{mindScore}%</span>
        </div>
        <PBar t={t} value={mindScore} max={100} color="#5856d6" />
        <div style={{ color: t.sub, fontSize: 10, marginTop: 3 }}>Stillness · Journal · Check-in</div>
      </div>
    </Card>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────
function Dashboard({ allData, setAllData, setModule }) {
  const t = T;
  const today = new Date().toLocaleDateString("en-GB");
  const totalCals = (allData.nutrition || []).filter(n => n.date === today).reduce((s, n) => s + (Number(n.calories) || 0), 0);
  const todayH = (allData.hydration || []).find(h => h.date === today);
  const calorieGoal = allData.settings?.calorieGoal || 1850;
  const hour = new Date().getHours();
  return (
    <div>
      <SHdr t={t} title={hour < 12 ? "Good morning" : "Good afternoon"} sub={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} />
      <WellnessScore allData={allData} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <MCard t={t} label="Calories" value={totalCals || "—"} unit={`/ ${calorieGoal}`} />
        <MCard t={t} label="Water" value={todayH?.glasses || 0} unit={`/ ${todayH?.target || 8} gl`} color="#34aadc" />
      </div>
      <MoodCheckin t={t} allData={allData} setAllData={setAllData} compact />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[{ id: "fitness", label: "Movement" }, { id: "nutrition", label: "Nourishment" }, { id: "hydration", label: "Hydration" }, { id: "cycle", label: "Cycle" }, { id: "goals", label: "Intentions" }, { id: "ai", label: "Your Guide" }].map(m => (
          <div key={m.id} onClick={() => setModule(m.id)} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: 16, cursor: "pointer" }}>
            <div style={{ fontWeight: 600, color: t.text, fontSize: 14 }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MOVEMENT ──────────────────────────────────────────────────────────────
function Fitness({ allData, setAllData }) {
  const t = T;
  const [view, setView] = useState("log");
  const [form, setForm] = useState({ exercise: "", sets: "", reps: "", weight: "", duration: "", type: "strength", notes: "", kneePain: 0 });
  const [editId, setEditId] = useState(null);
  const sessions = allData.fitness || [];
  const today = new Date().toLocaleDateString("en-GB");
  const todaySessions = sessions.filter(s => s.date === today);
  const add = () => {
    if (!form.exercise) return;
    let u;
    if (editId) { u = sessions.map(s => s.id === editId ? { ...form, date: s.date, id: editId } : s); setEditId(null); }
    else { u = [...sessions, { ...form, date: today, id: Date.now() }]; }
    setAllData(p => ({ ...p, fitness: u })); sv("fitness", u);
    setForm({ exercise: "", sets: "", reps: "", weight: "", duration: "", type: "strength", notes: "", kneePain: 0 });
  };
  const del = id => { const u = sessions.filter(s => s.id !== id); setAllData(p => ({ ...p, fitness: u })); sv("fitness", u); };
  const prs = {}; sessions.filter(s => s.type === "strength" && s.weight).forEach(s => { if (!prs[s.exercise] || Number(s.weight) > prs[s.exercise]) prs[s.exercise] = Number(s.weight); });
  return (
    <div>
      <SHdr t={t} title="Movement" sub="Record your practice, protect your energy" />
      <MoodCheckin t={t} allData={allData} setAllData={setAllData} compact />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["log", "history", "records"].map(v => <Btn key={v} t={t} secondary={view !== v} small onClick={() => setView(v)}>{v.charAt(0).toUpperCase() + v.slice(1)}</Btn>)}
      </div>
      {view === "log" && (
        <Card t={t}>
          <div style={{ fontWeight: 700, color: t.text, marginBottom: 12 }}>{editId ? "Edit session" : "Record movement"}</div>
          <div style={{ display: "grid", gap: 10 }}>
            <Inp t={t} value={form.exercise} onChange={v => setForm(p => ({ ...p, exercise: v }))} placeholder="What did you practice?" />
            <Sel t={t} value={form.type} onChange={v => setForm(p => ({ ...p, type: v }))} options={["strength", "cardio", "hiit", "flexibility", "yoga", "other"].map(x => ({ value: x, label: x.charAt(0).toUpperCase() + x.slice(1) }))} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <Inp t={t} value={form.sets} onChange={v => setForm(p => ({ ...p, sets: v }))} placeholder="Sets" type="number" />
              <Inp t={t} value={form.reps} onChange={v => setForm(p => ({ ...p, reps: v }))} placeholder="Reps" type="number" />
              <Inp t={t} value={form.weight} onChange={v => setForm(p => ({ ...p, weight: v }))} placeholder="kg" type="number" />
            </div>
            <Inp t={t} value={form.duration} onChange={v => setForm(p => ({ ...p, duration: v }))} placeholder="Duration (mins)" type="number" />
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: t.sub, fontSize: 13 }}>Knee check ({form.kneePain}/10)</span>
                {form.kneePain > 6 && <span style={{ color: "#e87070", fontSize: 12 }}>Rest or modify today</span>}
              </div>
              <input type="range" min={0} max={10} value={form.kneePain} onChange={e => setForm(p => ({ ...p, kneePain: Number(e.target.value) }))} style={{ width: "100%", accentColor: form.kneePain > 5 ? "#e87070" : t.accent }} />
            </div>
            <TA t={t} value={form.notes} onChange={v => setForm(p => ({ ...p, notes: v }))} placeholder="What did your body say?" rows={2} />
            <div style={{ display: "flex", gap: 8 }}>
              <Btn t={t} onClick={add} style={{ flex: 1 }}>{editId ? "Update" : "Add"}</Btn>
              {editId && <Btn t={t} secondary onClick={() => { setEditId(null); setForm({ exercise: "", sets: "", reps: "", weight: "", duration: "", type: "strength", notes: "", kneePain: 0 }); }}>Cancel</Btn>}
            </div>
          </div>
          {todaySessions.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 600, color: t.sub, fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Today</div>
              {todaySessions.map(s => (
                <div key={s.id} style={{ background: t.bg, borderRadius: 10, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: t.text }}>{s.exercise}</div>
                    <div style={{ color: t.sub, fontSize: 13 }}>{s.sets && `${s.sets}×${s.reps}`} {s.weight && `@ ${s.weight}kg`} {s.duration && `${s.duration}min`}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span onClick={() => { setForm({ exercise: s.exercise, sets: s.sets || "", reps: s.reps || "", weight: s.weight || "", duration: s.duration || "", type: s.type, notes: s.notes || "", kneePain: s.kneePain || 0 }); setEditId(s.id); }} style={{ cursor: "pointer", color: t.sub, fontSize: 13 }}>edit</span>
                    <span onClick={() => del(s.id)} style={{ cursor: "pointer", color: t.sub, fontSize: 13 }}>remove</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
      {view === "history" && (
        <div>
          {sessions.length === 0 ? <Card t={t}><div style={{ color: t.sub }}>No sessions recorded yet.</div></Card> :
            [...new Set(sessions.map(s => s.date))].sort((a, b) => b.localeCompare(a)).map(date => (
              <Card t={t} key={date}>
                <div style={{ fontWeight: 700, color: t.text, marginBottom: 8 }}>{date}</div>
                {sessions.filter(s => s.date === date).map(s => (
                  <div key={s.id} style={{ borderLeft: `3px solid ${t.accent}`, paddingLeft: 10, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: t.text }}>{s.exercise}</div>
                      <div style={{ color: t.sub, fontSize: 13 }}>{s.sets && `${s.sets}×${s.reps}`} {s.weight && `@ ${s.weight}kg`}</div>
                    </div>
                    <span onClick={() => del(s.id)} style={{ cursor: "pointer", color: t.sub, fontSize: 12 }}>remove</span>
                  </div>
                ))}
              </Card>
            ))
          }
        </div>
      )}
      {view === "records" && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <MCard t={t} label="Total sessions" value={sessions.length} unit="all time" />
          </div>
          {Object.keys(prs).length > 0 && (
            <Card t={t}>
              <div style={{ fontWeight: 700, color: t.text, marginBottom: 12 }}>Personal Records</div>
              {Object.entries(prs).map(([ex, w]) => (
                <div key={ex} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${t.border}` }}>
                  <span style={{ color: t.text }}>{ex}</span>
                  <span style={{ color: t.accent, fontWeight: 700 }}>{w}kg</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ── NOURISHMENT ───────────────────────────────────────────────────────────
function Nutrition({ allData, setAllData }) {
  const t = T;
  const [form, setForm] = useState({ food: "", calories: "", protein: "", carbs: "", fats: "", meal: "breakfast" });
  const [editId, setEditId] = useState(null);
  const [aiA, setAiA] = useState(""); const [analyzing, setAnalyzing] = useState(false); const [imgData, setImgData] = useState(null);
  const fileRef = useState(null)[0];
  const entries = allData.nutrition || []; const today = new Date().toLocaleDateString("en-GB");
  const todayE = entries.filter(e => e.date === today);
  const totalCals = todayE.reduce((s, e) => s + (Number(e.calories) || 0), 0);
  const totalP = todayE.reduce((s, e) => s + (Number(e.protein) || 0), 0);
  const calorieGoal = allData.settings?.calorieGoal || 1850;
  const add = () => {
    if (!form.food) return;
    let u;
    if (editId) { u = entries.map(e => e.id === editId ? { ...form, date: e.date, id: editId } : e); setEditId(null); }
    else { u = [...entries, { ...form, date: today, id: Date.now() }]; }
    setAllData(p => ({ ...p, nutrition: u })); sv("nutrition", u);
    setForm({ food: "", calories: "", protein: "", carbs: "", fats: "", meal: "breakfast" }); setAiA(""); setImgData(null);
  };
  const del = id => { const u = entries.filter(e => e.id !== id); setAllData(p => ({ ...p, nutrition: u })); sv("nutrition", u); };
  return (
    <div>
      <SHdr t={t} title="Nourishment" sub="Real food, real energy" />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <MCard t={t} label="Calories" value={totalCals} unit={`/ ${calorieGoal}`} />
        <MCard t={t} label="Protein" value={`${totalP}g`} unit="/ 125g goal" />
        <MCard t={t} label="Remaining" value={calorieGoal - totalCals} unit="kcal" color={calorieGoal - totalCals < 0 ? "#e87070" : t.accent} />
      </div>
      <PBar t={t} value={totalCals} max={calorieGoal} color={totalCals > calorieGoal ? "#e87070" : t.accent} />
      <div style={{ marginBottom: 16 }} />
      <Card t={t}>
        <div style={{ fontWeight: 700, color: t.text, marginBottom: 12 }}>{editId ? "Edit entry" : "Nourish and note"}</div>
        <div style={{ display: "grid", gap: 10 }}>
          <Inp t={t} value={form.food} onChange={v => setForm(p => ({ ...p, food: v }))} placeholder="What did you eat?" />
          <Sel t={t} value={form.meal} onChange={v => setForm(p => ({ ...p, meal: v }))} options={["breakfast", "lunch", "dinner", "snack", "pre-workout", "post-workout"].map(x => ({ value: x, label: x.charAt(0).toUpperCase() + x.slice(1) }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Inp t={t} value={form.calories} onChange={v => setForm(p => ({ ...p, calories: v }))} placeholder="Calories" type="number" />
            <Inp t={t} value={form.protein} onChange={v => setForm(p => ({ ...p, protein: v }))} placeholder="Protein (g)" type="number" />
            <Inp t={t} value={form.carbs} onChange={v => setForm(p => ({ ...p, carbs: v }))} placeholder="Carbs (g)" type="number" />
            <Inp t={t} value={form.fats} onChange={v => setForm(p => ({ ...p, fats: v }))} placeholder="Fats (g)" type="number" />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn t={t} onClick={add} style={{ flex: 1 }}>{editId ? "Update" : "Add"}</Btn>
            {editId && <Btn t={t} secondary onClick={() => { setEditId(null); setForm({ food: "", calories: "", protein: "", carbs: "", fats: "", meal: "breakfast" }); }}>Cancel</Btn>}
          </div>
        </div>
        {todayE.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 600, color: t.sub, fontSize: 12, marginBottom: 8, textTransform: "uppercase" }}>Today</div>
            {todayE.map(e => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${t.border}` }}>
                <div><div style={{ color: t.text, fontSize: 14 }}>{e.food}</div><div style={{ color: t.sub, fontSize: 12 }}>{e.meal}</div></div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ textAlign: "right" }}><div style={{ color: t.accent, fontWeight: 700 }}>{e.calories} kcal</div><div style={{ color: t.sub, fontSize: 12 }}>{e.protein && `P: ${e.protein}g`}</div></div>
                  <span onClick={() => del(e.id)} style={{ cursor: "pointer", color: t.sub, fontSize: 12 }}>remove</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── HYDRATION ─────────────────────────────────────────────────────────────
function Hydration({ allData, setAllData }) {
  const t = T;
  const today = new Date().toLocaleDateString("en-GB");
  const logs = allData.hydration || [];
  const todayLog = logs.find(l => l.date === today) || { date: today, glasses: 0, target: 8 };
  const [glasses, setGlasses] = useState(todayLog.glasses);
  const [target, setTarget] = useState(todayLog.target || 8);
  const pct = Math.min(100, Math.round((glasses / target) * 100));
  const update = g => { const entry = { date: today, glasses: g, target }; const u = [...logs.filter(l => l.date !== today), entry]; setAllData(p => ({ ...p, hydration: u })); sv("hydration", u); };
  const add = n => { const ng = Math.max(0, glasses + n); setGlasses(ng); update(ng); };
  return (
    <div>
      <SHdr t={t} title="Hydration" sub="Water is your first medicine" />
      <Card t={t}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: t.accent }}>{glasses}</div>
          <div style={{ color: t.sub, fontSize: 14 }}>of {target} glasses · {glasses * 250}ml · {pct}%</div>
        </div>
        <PBar t={t} value={glasses} max={target} color={pct >= 100 ? "#34c759" : pct >= 50 ? t.accent : "#e87070"} h={12} />
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20 }}>
          <Btn t={t} secondary onClick={() => add(-1)} style={{ padding: "8px 20px", fontSize: 18 }}>−</Btn>
          <Btn t={t} onClick={() => add(1)} style={{ padding: "10px 28px", fontSize: 16 }}>+ glass</Btn>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
          {[2, 3].map(n => <span key={n} onClick={() => add(n)} style={{ background: t.accent2 + "44", color: t.text, borderRadius: 20, padding: "5px 14px", fontSize: 13, cursor: "pointer" }}>+{n} glasses</span>)}
        </div>
      </Card>
      <Card t={t}>
        <div style={{ fontWeight: 700, color: t.text, marginBottom: 12 }}>Today</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {Array.from({ length: target }, (_, i) => (
            <div key={i} onClick={() => { const ng = i < glasses ? i : i + 1; setGlasses(ng); update(ng); }}
              style={{ width: 36, height: 36, borderRadius: "50%", background: i < glasses ? t.accent : t.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer", color: i < glasses ? "#fff" : t.sub }}>
              {i < glasses ? "○" : "·"}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ color: t.sub, fontSize: 13, marginBottom: 4 }}>Daily goal: {target} glasses</div>
          <input type="range" min={4} max={16} value={target} onChange={e => { setTarget(Number(e.target.value)); update(glasses); }} style={{ width: "100%", accentColor: t.accent }} />
        </div>
      </Card>
    </div>
  );
}

// ── CYCLE ─────────────────────────────────────────────────────────────────
function Cycle({ allData, setAllData }) {
  const t = T;
  const [form, setForm] = useState({ date: new Date().toLocaleDateString("en-GB"), phase: "", flow: "", symptoms: [], notes: "" });
  const entries = allData.cycle || [];
  const PHASES = ["Menstrual", "Follicular", "Ovulation", "Luteal"];
  const FLOWS = ["Light", "Medium", "Heavy", "Spotting", "None"];
  const SYMPTOMS = ["Cramps", "Bloating", "Headache", "Fatigue", "Mood swings", "Acne", "Tender breasts", "Back pain", "Nausea", "Cravings"];
  const save_ = () => { const u = [...entries.filter(e => e.date !== form.date), { ...form, id: Date.now() }]; setAllData(p => ({ ...p, cycle: u })); sv("cycle", u); };
  const colors = { Menstrual: "#e87070", Follicular: "#34c759", Ovulation: "#ffd60a", Luteal: "#9b87d0" };
  return (
    <div>
      <SHdr t={t} title="Cycle" sub="Rhythm, flow, attunement" />
      <MoodCheckin t={t} allData={allData} setAllData={setAllData} compact />
      <Card t={t}>
        <div style={{ display: "grid", gap: 10 }}>
          <Sel t={t} value={form.phase} onChange={v => setForm(p => ({ ...p, phase: v }))} options={[{ value: "", label: "Which phase are you in?" }, ...PHASES.map(x => ({ value: x, label: x }))]} />
          <Sel t={t} value={form.flow} onChange={v => setForm(p => ({ ...p, flow: v }))} options={[{ value: "", label: "Flow level..." }, ...FLOWS.map(x => ({ value: x, label: x }))]} />
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {SYMPTOMS.map(s => (
              <span key={s} onClick={() => setForm(p => ({ ...p, symptoms: p.symptoms.includes(s) ? p.symptoms.filter(x => x !== s) : [...p.symptoms, s] }))}
                style={{ background: form.symptoms.includes(s) ? t.accent : t.border, color: form.symptoms.includes(s) ? "#fff" : t.sub, borderRadius: 20, padding: "4px 10px", fontSize: 12, margin: "2px", cursor: "pointer" }}>{s}</span>
            ))}
          </div>
          <TA t={t} value={form.notes} onChange={v => setForm(p => ({ ...p, notes: v }))} placeholder="What's your body telling you?" rows={2} />
          <Btn t={t} onClick={save_}>Save</Btn>
        </div>
      </Card>
      <Card t={t}>
        <div style={{ fontWeight: 700, color: t.text, marginBottom: 12 }}>Recent</div>
        {entries.length === 0 ? <div style={{ color: t.sub }}>Nothing logged yet.</div> :
          entries.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map(e => (
            <div key={e.id} style={{ borderLeft: `3px solid ${colors[e.phase] || t.accent}`, paddingLeft: 10, marginBottom: 10 }}>
              <div style={{ fontWeight: 600, color: t.text }}>{e.date} · {e.phase}</div>
              <div style={{ color: t.sub, fontSize: 13 }}>{e.flow && `Flow: ${e.flow}`}{e.symptoms.length > 0 && ` · ${e.symptoms.join(", ")}`}</div>
            </div>
          ))
        }
      </Card>
    </div>
  );
}

// ── REST ──────────────────────────────────────────────────────────────────
function Sleep({ allData, setAllData }) {
  const t = T;
  const [form, setForm] = useState({ date: new Date().toLocaleDateString("en-GB"), hours: "", quality: 5, bedtime: "", wakeup: "", notes: "" });
  const entries = allData.sleep || [];
  const avg = entries.length ? (entries.reduce((s, e) => s + Number(e.hours || 0), 0) / entries.length).toFixed(1) : "—";
  const save_ = () => { if (!form.hours) return; const u = [...entries.filter(e => e.date !== form.date), { ...form, id: Date.now() }]; setAllData(p => ({ ...p, sleep: u })); sv("sleep", u); };
  const del = id => { const u = entries.filter(e => e.id !== id); setAllData(p => ({ ...p, sleep: u })); sv("sleep", u); };
  return (
    <div>
      <SHdr t={t} title="Rest" sub="Recovery is where growth happens" />
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <MCard t={t} label="Avg sleep" value={avg} unit="hours/night" />
        <MCard t={t} label="Logged" value={entries.length} unit="nights" />
      </div>
      <Card t={t}>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Inp t={t} value={form.bedtime} onChange={v => setForm(p => ({ ...p, bedtime: v }))} placeholder="Bedtime" />
            <Inp t={t} value={form.wakeup} onChange={v => setForm(p => ({ ...p, wakeup: v }))} placeholder="Wake up" />
          </div>
          <Inp t={t} value={form.hours} onChange={v => setForm(p => ({ ...p, hours: v }))} placeholder="Hours slept" type="number" />
          <MSlider t={t} label="Sleep quality" value={form.quality} onChange={v => setForm(p => ({ ...p, quality: v }))} />
          <TA t={t} value={form.notes} onChange={v => setForm(p => ({ ...p, notes: v }))} placeholder="How did you wake?" rows={2} />
          <Btn t={t} onClick={save_}>Save</Btn>
        </div>
      </Card>
      <Card t={t}>
        <div style={{ fontWeight: 700, color: t.text, marginBottom: 12 }}>History</div>
        {entries.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7).map(e => (
          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${t.border}` }}>
            <div>
              <div style={{ color: t.text, fontSize: 14 }}>{e.date}</div>
              <div style={{ color: t.sub, fontSize: 12 }}>{e.bedtime && `${e.bedtime} → ${e.wakeup}`}</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ textAlign: "right" }}><div style={{ color: t.accent, fontWeight: 700 }}>{e.hours}h</div><div style={{ color: t.sub, fontSize: 12 }}>Q: {e.quality}/10</div></div>
              <span onClick={() => del(e.id)} style={{ cursor: "pointer", color: t.sub, fontSize: 12 }}>remove</span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── STILLNESS ─────────────────────────────────────────────────────────────
function Meditation({ allData, setAllData }) {
  const t = T;
  const [form, setForm] = useState({ date: new Date().toLocaleDateString("en-GB"), duration: "", type: "silent", moodBefore: 5, moodAfter: 5, notes: "" });
  const [showInsight, setShowInsight] = useState(false);
  const [iForm, setIForm] = useState({ duration: "", type: "guided" });
  const entries = allData.meditation || [];
  const totalMins = entries.reduce((s, e) => s + Number(e.duration || 0), 0);
  const TYPES = ["Silent", "Guided", "Breathwork", "Body scan", "Visualization", "Yoga nidra", "Pranayama"];
  const save_ = () => { if (!form.duration) return; const u = [...entries, { ...form, id: Date.now() }]; setAllData(p => ({ ...p, meditation: u })); sv("meditation", u); };
  const quickLog = () => { const e = { date: new Date().toLocaleDateString("en-GB"), duration: iForm.duration, type: iForm.type, moodBefore: 5, moodAfter: 7, notes: "Logged from Insight Timer", id: Date.now() }; const u = [...entries, e]; setAllData(p => ({ ...p, meditation: u })); sv("meditation", u); setShowInsight(false); };
  const del = id => { const u = entries.filter(e => e.id !== id); setAllData(p => ({ ...p, meditation: u })); sv("meditation", u); };
  return (
    <div>
      <SHdr t={t} title="Stillness" sub="Presence is the practice" />
      <MoodCheckin t={t} allData={allData} setAllData={setAllData} compact />
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <MCard t={t} label="Total time" value={totalMins} unit="minutes" />
        <MCard t={t} label="Sessions" value={entries.length} unit="logged" />
      </div>
      <Card t={t} style={{ background: t.accent2 + "22", borderLeft: `4px solid ${t.accent}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>Just finished on Insight Timer?</div><div style={{ color: t.sub, fontSize: 12 }}>Quick-log in 2 taps</div></div>
          <Btn t={t} small onClick={() => setShowInsight(v => !v)}>Log it</Btn>
        </div>
        {showInsight && <div style={{ marginTop: 12, display: "grid", gap: 8 }}><Inp t={t} value={iForm.duration} onChange={v => setIForm(p => ({ ...p, duration: v }))} placeholder="Minutes" type="number" /><Sel t={t} value={iForm.type} onChange={v => setIForm(p => ({ ...p, type: v }))} options={TYPES.map(x => ({ value: x.toLowerCase(), label: x }))} /><Btn t={t} onClick={quickLog}>Save</Btn></div>}
      </Card>
      <Card t={t}>
        <div style={{ display: "grid", gap: 10 }}>
          <Sel t={t} value={form.type} onChange={v => setForm(p => ({ ...p, type: v }))} options={TYPES.map(x => ({ value: x.toLowerCase(), label: x }))} />
          <Inp t={t} value={form.duration} onChange={v => setForm(p => ({ ...p, duration: v }))} placeholder="Duration (minutes)" type="number" />
          <MSlider t={t} label="How you felt before" value={form.moodBefore} onChange={v => setForm(p => ({ ...p, moodBefore: v }))} />
          <MSlider t={t} label="How you felt after" value={form.moodAfter} onChange={v => setForm(p => ({ ...p, moodAfter: v }))} />
          <TA t={t} value={form.notes} onChange={v => setForm(p => ({ ...p, notes: v }))} placeholder="Reflections..." rows={2} />
          <Btn t={t} onClick={save_}>Log session</Btn>
        </div>
      </Card>
      {entries.length > 0 && <Card t={t}><div style={{ fontWeight: 700, color: t.text, marginBottom: 12 }}>Recent</div>{entries.sort((a, b) => b.id - a.id).slice(0, 5).map(e => (<div key={e.id} style={{ borderLeft: `3px solid ${t.accent}`, paddingLeft: 10, marginBottom: 10, display: "flex", justifyContent: "space-between" }}><div><div style={{ fontWeight: 600, color: t.text }}>{e.date} · {e.type} · {e.duration}min</div><div style={{ color: t.sub, fontSize: 13 }}>Before {e.moodBefore}/10 → After {e.moodAfter}/10</div></div><span onClick={() => del(e.id)} style={{ cursor: "pointer", color: t.sub, fontSize: 12 }}>remove</span></div>))}</Card>}
    </div>
  );
}

// ── YOGA ──────────────────────────────────────────────────────────────────
function Yoga({ allData, setAllData }) {
  const t = T;
  const [tab, setTab] = useState("practice");
  const [pF, setPF] = useState({ date: new Date().toLocaleDateString("en-GB"), style: "", duration: "", sequence: "", notes: "", moodBefore: 5, moodAfter: 5 });
  const [sF, setSF] = useState({ date: new Date().toLocaleDateString("en-GB"), topic: "", subtopic: "", hours: "", notes: "", confidence: 5 });
  const [tF, setTF] = useState({ date: new Date().toLocaleDateString("en-GB"), theme: "", students: "", sequence: "", wentWell: "", improve: "" });
  const practices = allData.yogaPractice || []; const studies = allData.yogaStudy || []; const teaches = allData.yogaTeach || [];
  const STYLES = ["Hatha", "Vinyasa", "Yin", "Restorative", "Ashtanga", "Kundalini", "Nidra", "Pranayama", "Mixed"];
  const TOPICS = ["Anatomy", "Philosophy", "Sanskrit", "Sequencing", "Pranayama", "Meditation", "Adjustments", "Business of yoga", "History", "Other"];
  const sP = () => { if (!pF.duration) return; const u = [...practices, { ...pF, id: Date.now() }]; setAllData(p => ({ ...p, yogaPractice: u })); sv("yogaPractice", u); };
  const sS = () => { if (!sF.topic) return; const u = [...studies, { ...sF, id: Date.now() }]; setAllData(p => ({ ...p, yogaStudy: u })); sv("yogaStudy", u); };
  const sT = () => { if (!tF.theme) return; const u = [...teaches, { ...tF, id: Date.now() }]; setAllData(p => ({ ...p, yogaTeach: u })); sv("yogaTeach", u); };
  const studyHours = studies.reduce((s, e) => s + Number(e.hours || 0), 0);
  return (
    <div>
      <SHdr t={t} title="Yoga & Studies" sub="Practice, teaching, and the path of learning" />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <MCard t={t} label="Study hours" value={studyHours.toFixed(1)} unit="of 100hr goal" />
        <MCard t={t} label="Practice" value={practices.reduce((s, e) => s + Number(e.duration || 0), 0)} unit="minutes" />
        <MCard t={t} label="Classes taught" value={teaches.length} unit="sessions" />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["practice", "study", "teach", "history"].map(v => <Btn key={v} t={t} secondary={tab !== v} small onClick={() => setTab(v)}>{v.charAt(0).toUpperCase() + v.slice(1)}</Btn>)}
      </div>
      {tab === "practice" && <Card t={t}><div style={{ display: "grid", gap: 10 }}><Sel t={t} value={pF.style} onChange={v => setPF(p => ({ ...p, style: v }))} options={[{ value: "", label: "Style..." }, ...STYLES.map(x => ({ value: x, label: x }))]} /><Inp t={t} value={pF.duration} onChange={v => setPF(p => ({ ...p, duration: v }))} placeholder="Duration (minutes)" type="number" /><TA t={t} value={pF.sequence} onChange={v => setPF(p => ({ ...p, sequence: v }))} placeholder="Sequence and poses..." rows={2} /><MSlider t={t} label="Before" value={pF.moodBefore} onChange={v => setPF(p => ({ ...p, moodBefore: v }))} /><MSlider t={t} label="After" value={pF.moodAfter} onChange={v => setPF(p => ({ ...p, moodAfter: v }))} /><TA t={t} value={pF.notes} onChange={v => setPF(p => ({ ...p, notes: v }))} placeholder="What did your body show you?" rows={2} /><Btn t={t} onClick={sP}>Save</Btn></div></Card>}
      {tab === "study" && <Card t={t}><div style={{ display: "grid", gap: 10 }}><Sel t={t} value={sF.topic} onChange={v => setSF(p => ({ ...p, topic: v }))} options={[{ value: "", label: "Topic..." }, ...TOPICS.map(x => ({ value: x, label: x }))]} /><Inp t={t} value={sF.subtopic} onChange={v => setSF(p => ({ ...p, subtopic: v }))} placeholder="Specific subject" /><Inp t={t} value={sF.hours} onChange={v => setSF(p => ({ ...p, hours: v }))} placeholder="Hours" type="number" /><div><div style={{ color: t.sub, fontSize: 13, marginBottom: 4 }}>Confidence: {sF.confidence}/10</div><input type="range" min={1} max={10} value={sF.confidence} onChange={e => setSF(p => ({ ...p, confidence: Number(e.target.value) }))} style={{ width: "100%", accentColor: t.accent }} /></div><TA t={t} value={sF.notes} onChange={v => setSF(p => ({ ...p, notes: v }))} placeholder="Key takeaways..." rows={3} /><Btn t={t} onClick={sS}>Save</Btn></div></Card>}
      {tab === "teach" && <Card t={t}><div style={{ display: "grid", gap: 10 }}><Inp t={t} value={tF.theme} onChange={v => setTF(p => ({ ...p, theme: v }))} placeholder="Class theme or intention" /><Inp t={t} value={tF.students} onChange={v => setTF(p => ({ ...p, students: v }))} placeholder="Number of students" type="number" /><TA t={t} value={tF.sequence} onChange={v => setTF(p => ({ ...p, sequence: v }))} placeholder="Sequence..." rows={2} /><TA t={t} value={tF.wentWell} onChange={v => setTF(p => ({ ...p, wentWell: v }))} placeholder="What flowed well?" rows={2} /><TA t={t} value={tF.improve} onChange={v => setTF(p => ({ ...p, improve: v }))} placeholder="What to refine?" rows={2} /><Btn t={t} onClick={sT}>Save</Btn></div></Card>}
      {tab === "history" && <div>{studies.length > 0 && <Card t={t}><div style={{ fontWeight: 700, color: t.text, marginBottom: 10 }}>Study history</div>{studies.sort((a, b) => b.id - a.id).map(e => <div key={e.id} style={{ borderLeft: `3px solid ${t.accent}`, paddingLeft: 10, marginBottom: 10 }}><div style={{ fontWeight: 600, color: t.text }}>{e.topic} — {e.subtopic}</div><div style={{ color: t.sub, fontSize: 13 }}>{e.hours}h · Confidence {e.confidence}/10</div>{e.notes && <div style={{ color: t.sub, fontSize: 12 }}>{e.notes}</div>}</div>)}</Card>}{teaches.length > 0 && <Card t={t}><div style={{ fontWeight: 700, color: t.text, marginBottom: 10 }}>Teaching history</div>{teaches.sort((a, b) => b.id - a.id).map(e => <div key={e.id} style={{ borderLeft: `3px solid ${t.accent2}`, paddingLeft: 10, marginBottom: 10 }}><div style={{ fontWeight: 600, color: t.text }}>{e.date} · {e.theme}</div><div style={{ color: t.sub, fontSize: 13 }}>{e.students} students</div>{e.wentWell && <div style={{ color: t.sub, fontSize: 12 }}>Flowed: {e.wentWell}</div>}</div>)}</Card>}</div>}
    </div>
  );
}

// ── MOOD ──────────────────────────────────────────────────────────────────
function MoodModule({ allData, setAllData }) {
  const t = T;
  const entries = allData.moods || [];
  const avg = entries.length ? (entries.reduce((s, e) => s + e.mood, 0) / entries.length).toFixed(1) : "—";
  const avgE = entries.length ? (entries.reduce((s, e) => s + e.energy, 0) / entries.length).toFixed(1) : "—";
  return (
    <div>
      <SHdr t={t} title="Energy & Mood" sub="One check-in, synced everywhere" />
      <div style={{ background: t.accent2 + "33", borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 13, color: t.sub }}>Log once here — your check-in flows through every module automatically.</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <MCard t={t} label="Avg mood" value={avg} unit="/10" />
        <MCard t={t} label="Avg energy" value={avgE} unit="/10" />
        <MCard t={t} label="Check-ins" value={entries.length} unit="total" />
      </div>
      <MoodCheckin t={t} allData={allData} setAllData={setAllData} />
      <Card t={t}><div style={{ fontWeight: 700, color: t.text, marginBottom: 12 }}>History</div>{entries.length === 0 ? <div style={{ color: t.sub }}>Nothing logged yet.</div> : entries.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10).map((e, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${t.border}` }}><div><div style={{ color: t.text, fontSize: 14 }}>{e.date}</div>{e.emotions?.length > 0 && <div style={{ color: t.sub, fontSize: 12 }}>{e.emotions.join(", ")}</div>}</div><div style={{ color: t.accent, fontWeight: 700 }}>M{e.mood} E{e.energy}</div></div>))}</Card>
    </div>
  );
}

// ── JOURNAL ───────────────────────────────────────────────────────────────
function Journal({ allData, setAllData }) {
  const t = T;
  const [view, setView] = useState("write");
  const [entry, setEntry] = useState(""); const [editId, setEditId] = useState(null);
  const [prompt, setPrompt] = useState(""); const [loading, setLoading] = useState(false);
  const entries = allData.journal || []; const today = new Date().toLocaleDateString("en-GB");
  const getPrompt = async () => {
    setLoading(true);
    try { const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 150, messages: [{ role: "user", content: "Give one beautiful spiritually grounded journal prompt for a Sagittarian yoga teacher. Just the prompt." }] }) }); const d = await res.json(); setPrompt(d.content?.[0]?.text || ""); } catch {}
    setLoading(false);
  };
  const save_ = () => {
    if (!entry.trim()) return;
    let u;
    if (editId) { u = entries.map(e => e.id === editId ? { ...e, text: entry } : e); setEditId(null); }
    else { u = [...entries, { date: today, text: entry, time: new Date().toLocaleTimeString(), id: Date.now() }]; }
    setAllData(p => ({ ...p, journal: u })); sv("journal", u); setEntry("");
  };
  const del = id => { const u = entries.filter(e => e.id !== id); setAllData(p => ({ ...p, journal: u })); sv("journal", u); };
  return (
    <div>
      <SHdr t={t} title="Journal" sub="Reflect, process, integrate" />
      <MoodCheckin t={t} allData={allData} setAllData={setAllData} compact />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["write", "entries"].map(v => <Btn key={v} t={t} secondary={view !== v} small onClick={() => setView(v)}>{v === "entries" ? `Entries (${entries.length})` : "Write"}</Btn>)}
      </div>
      {view === "write" && <div>{prompt && <Card t={t} style={{ background: t.accent2 + "22" }}><div style={{ color: t.sub, fontSize: 13, fontStyle: "italic" }}>{prompt}</div></Card>}<Card t={t}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><div style={{ fontWeight: 700, color: t.text }}>{editId ? "Editing" : "New entry"}</div><Btn t={t} secondary small onClick={getPrompt}>{loading ? "..." : "Get a prompt"}</Btn></div><TA t={t} value={entry} onChange={setEntry} placeholder="Write freely..." rows={8} /><div style={{ display: "flex", gap: 8, marginTop: 10 }}><Btn t={t} onClick={save_} style={{ flex: 1 }}>{editId ? "Update" : "Save"}</Btn>{editId && <Btn t={t} secondary onClick={() => { setEditId(null); setEntry(""); }}>Cancel</Btn>}</div></Card></div>}
      {view === "entries" && (entries.length === 0 ? <Card t={t}><div style={{ color: t.sub }}>No entries yet.</div></Card> : entries.sort((a, b) => b.id - a.id).map(e => <Card t={t} key={e.id}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><div style={{ color: t.sub, fontSize: 12 }}>{e.date} · {e.time}</div><div style={{ display: "flex", gap: 8 }}><span onClick={() => { setEntry(e.text); setEditId(e.id); setView("write"); }} style={{ cursor: "pointer", color: t.sub, fontSize: 12 }}>edit</span><span onClick={() => del(e.id)} style={{ cursor: "pointer", color: t.sub, fontSize: 12 }}>remove</span></div></div><div style={{ color: t.text, fontSize: 14, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{e.text.slice(0, 300)}{e.text.length > 300 ? "..." : ""}</div></Card>))}
    </div>
  );
}

// ── INTENTIONS ────────────────────────────────────────────────────────────
function Goals({ allData, setAllData }) {
  const t = T;
  const BLANK = { title: "", icon: "◎", category: "health", description: "", deadline: "", progress: 0, milestones: [] };
  const [form, setForm] = useState(BLANK);
  const [selected, setSelected] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newMilestone, setNewMilestone] = useState("");
  const [showForm, setShowForm] = useState(false);
  const goals = allData.goals || [];
  const ICONS = ["◎", "◈", "◉", "◌", "◐", "◯", "◇", "◆", "○", "●"];
  const CATS = ["Health", "Movement", "Nourishment", "Yoga", "Studies", "Personal", "Career", "Financial", "Relationships", "Other"];
  const saveGoal = () => {
    if (!form.title) return;
    let u;
    if (editingGoal) { u = goals.map(g => g.id === editingGoal ? { ...g, ...form } : g); }
    else { u = [...goals, { ...form, id: Date.now(), completed: false, milestones: [] }]; }
    setAllData(p => ({ ...p, goals: u })); sv("goals", u);
    setForm(BLANK); setEditingGoal(null); setShowForm(false);
  };
  const updP = (id, val) => { const u = goals.map(g => g.id === id ? { ...g, progress: val } : g); setAllData(p => ({ ...p, goals: u })); sv("goals", u); };
  const toggle = id => { const u = goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g); setAllData(p => ({ ...p, goals: u })); sv("goals", u); };
  const del = id => { const u = goals.filter(g => g.id !== id); setAllData(p => ({ ...p, goals: u })); sv("goals", u); setSelected(null); };
  const addMs = id => { if (!newMilestone.trim()) return; const u = goals.map(g => g.id === id ? { ...g, milestones: [...(g.milestones || []), { id: Date.now(), text: newMilestone, done: false }] } : g); setAllData(p => ({ ...p, goals: u })); sv("goals", u); setNewMilestone(""); };
  const toggleMs = (gId, mId) => { const u = goals.map(g => g.id === gId ? { ...g, milestones: (g.milestones || []).map(m => m.id === mId ? { ...m, done: !m.done } : m) } : g); setAllData(p => ({ ...p, goals: u })); sv("goals", u); };
  const startEdit = g => { setForm({ title: g.title, icon: g.icon, category: g.category, description: g.description || "", deadline: g.deadline || "", progress: g.progress || 0, milestones: g.milestones || [] }); setEditingGoal(g.id); setShowForm(true); setSelected(null); };
  if (selected) {
    const goal = goals.find(g => g.id === selected);
    if (!goal) { setSelected(null); return null; }
    return (
      <div>
        <div onClick={() => setSelected(null)} style={{ color: t.accent, cursor: "pointer", marginBottom: 12, fontSize: 14 }}>← Back</div>
        <Card t={t}>
          <div style={{ fontSize: 28, textAlign: "center" }}>{goal.icon}</div>
          <div style={{ fontWeight: 700, color: t.text, fontSize: 20, textAlign: "center", marginTop: 8 }}>{goal.title}</div>
          <div style={{ color: t.sub, fontSize: 13, textAlign: "center", marginBottom: 16 }}>{goal.category}{goal.deadline && ` · ${goal.deadline}`}</div>
          {goal.description && <div style={{ color: t.sub, lineHeight: 1.7, marginBottom: 16 }}>{goal.description}</div>}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: t.sub, fontSize: 13 }}>Progress</span><span style={{ color: t.accent, fontWeight: 700 }}>{goal.progress}%</span></div>
            <PBar t={t} value={goal.progress} max={100} />
            <input type="range" min={0} max={100} value={goal.progress} onChange={e => updP(goal.id, Number(e.target.value))} style={{ width: "100%", accentColor: t.accent, marginTop: 8 }} />
          </div>
          <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 16 }}>
            <div style={{ fontWeight: 600, color: t.text, fontSize: 14, marginBottom: 10 }}>Milestones</div>
            {(goal.milestones || []).map(m => (
              <div key={m.id} onClick={() => toggleMs(goal.id, m.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${t.border}`, cursor: "pointer" }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${t.accent}`, background: m.done ? t.accent : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11 }}>{m.done ? "✓" : ""}</div>
                <span style={{ color: t.text, fontSize: 14, textDecoration: m.done ? "line-through" : "none", opacity: m.done ? 0.5 : 1 }}>{m.text}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Inp t={t} value={newMilestone} onChange={setNewMilestone} placeholder="Add a milestone..." style={{ flex: 1 }} />
              <Btn t={t} small onClick={() => addMs(goal.id)}>Add</Btn>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Btn t={t} secondary onClick={() => startEdit(goal)} style={{ flex: 1 }}>Edit</Btn>
            <Btn t={t} secondary onClick={() => toggle(goal.id)} style={{ flex: 1 }}>{goal.completed ? "Reopen" : "Complete"}</Btn>
            <Btn t={t} secondary onClick={() => del(goal.id)} style={{ color: "#e87070", borderColor: "#e87070" }}>Delete</Btn>
          </div>
        </Card>
      </div>
    );
  }
  return (
    <div>
      <SHdr t={t} title="Intentions" sub="What are you moving toward?" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ color: t.sub, fontSize: 13 }}>{goals.filter(g => !g.completed).length} active</div>
        <Btn t={t} small onClick={() => { setForm(BLANK); setEditingGoal(null); setShowForm(v => !v); }}>{showForm ? "Cancel" : "+ New intention"}</Btn>
      </div>
      {showForm && <Card t={t} style={{ background: t.accent2 + "22" }}>
        <div style={{ fontWeight: 700, color: t.text, marginBottom: 12 }}>{editingGoal ? "Edit intention" : "Set a new intention"}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>{ICONS.map(ic => <span key={ic} onClick={() => setForm(p => ({ ...p, icon: ic }))} style={{ fontSize: 20, cursor: "pointer", padding: 6, borderRadius: 8, background: form.icon === ic ? t.accent2 : t.bg, border: `1px solid ${form.icon === ic ? t.accent : t.border}` }}>{ic}</span>)}</div>
        <div style={{ display: "grid", gap: 10 }}>
          <Inp t={t} value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} placeholder="Name your intention" />
          <Sel t={t} value={form.category} onChange={v => setForm(p => ({ ...p, category: v }))} options={CATS.map(x => ({ value: x.toLowerCase(), label: x }))} />
          <TA t={t} value={form.description} onChange={v => setForm(p => ({ ...p, description: v }))} placeholder="Why does this matter?" rows={2} />
          <Inp t={t} value={form.deadline} onChange={v => setForm(p => ({ ...p, deadline: v }))} placeholder="Target date (optional)" />
          <Btn t={t} onClick={saveGoal}>{editingGoal ? "Save changes" : "Set intention"}</Btn>
        </div>
      </Card>}
      {goals.filter(g => !g.completed).length === 0 && !showForm && <Card t={t} style={{ textAlign: "center", padding: 32 }}><div style={{ color: t.sub, fontSize: 14, lineHeight: 1.8 }}>No active intentions yet.</div><Btn t={t} onClick={() => setShowForm(true)} style={{ marginTop: 16 }}>Set your first intention</Btn></Card>}
      {goals.filter(g => !g.completed).map(g => (
        <Card t={t} key={g.id} style={{ cursor: "pointer" }} onClick={() => setSelected(g.id)}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ fontSize: 22, marginTop: 2 }}>{g.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: t.text }}>{g.title}</div>
              <div style={{ color: t.sub, fontSize: 12, marginBottom: 8 }}>{g.category}{g.deadline && ` · ${g.deadline}`}</div>
              <PBar t={t} value={g.progress || 0} max={100} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <div style={{ color: t.accent, fontSize: 12 }}>{g.progress || 0}%</div>
                {(g.milestones || []).length > 0 && <div style={{ color: t.sub, fontSize: 11 }}>{(g.milestones || []).filter(m => m.done).length}/{(g.milestones || []).length} milestones</div>}
              </div>
            </div>
          </div>
        </Card>
      ))}
      {goals.filter(g => g.completed).length > 0 && <><div style={{ fontWeight: 600, color: t.sub, fontSize: 12, margin: "8px 0", textTransform: "uppercase" }}>Completed</div>{goals.filter(g => g.completed).map(g => <Card t={t} key={g.id} style={{ opacity: 0.6, cursor: "pointer" }} onClick={() => setSelected(g.id)}><div style={{ display: "flex", gap: 10, alignItems: "center" }}><div style={{ fontSize: 18 }}>{g.icon}</div><div style={{ fontWeight: 600, color: t.text, textDecoration: "line-through", fontSize: 14 }}>{g.title}</div></div></Card>)}</>}
    </div>
  );
}

// ── SEARCH ────────────────────────────────────────────────────────────────
function SearchLogs({ allData }) {
  const t = T;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const SOURCES = [
    { key: "fitness", label: "Movement", fields: ["exercise", "notes", "type"] },
    { key: "nutrition", label: "Nourishment", fields: ["food", "meal"] },
    { key: "moods", label: "Mood", fields: ["notes", "emotions"] },
    { key: "sleep", label: "Rest", fields: ["notes"] },
    { key: "meditation", label: "Stillness", fields: ["type", "notes"] },
    { key: "journal", label: "Journal", fields: ["text"] },
    { key: "cycle", label: "Cycle", fields: ["phase", "symptoms", "notes"] },
    { key: "yogaPractice", label: "Yoga", fields: ["style", "sequence", "notes"] },
    { key: "yogaStudy", label: "Study", fields: ["topic", "subtopic", "notes"] },
  ];
  const search = q => {
    if (q.trim().length < 2) { setResults([]); return; }
    const ql = q.toLowerCase(); const found = [];
    SOURCES.forEach(src => {
      (allData[src.key] || []).forEach(entry => {
        const matches = src.fields.some(f => { const v = entry[f]; if (Array.isArray(v)) return v.some(x => String(x).toLowerCase().includes(ql)); return v && String(v).toLowerCase().includes(ql); });
        if (matches) found.push({ ...entry, _label: src.label });
      });
    });
    found.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    setResults(found);
  };
  return (
    <div>
      <SHdr t={t} title="Search" sub="Find anything you've ever recorded" />
      <Card t={t}><Inp t={t} value={query} onChange={v => { setQuery(v); search(v); }} placeholder="Search across everything..." /></Card>
      {query.length > 1 && <Card t={t}>
        <div style={{ color: t.sub, fontSize: 13, marginBottom: 12 }}>{results.length} result{results.length !== 1 ? "s" : ""} for "{query}"</div>
        {results.length === 0 ? <div style={{ color: t.sub }}>Nothing found.</div> :
          results.map((e, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${t.accent}`, paddingLeft: 12, marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${t.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ background: t.accent2 + "44", color: t.text, borderRadius: 20, padding: "2px 10px", fontSize: 11 }}>{e._label}</span>
                <span style={{ color: t.sub, fontSize: 12 }}>{e.date}</span>
              </div>
              <div style={{ color: t.text, fontSize: 14, fontWeight: 600 }}>{e.text || e.exercise || e.food || e.topic || e.phase || "Entry"}</div>
              {e.notes && <div style={{ color: t.sub, fontSize: 13 }}>{e.notes.slice(0, 100)}</div>}
            </div>
          ))
        }
      </Card>}
    </div>
  );
}

// ── SETTINGS ──────────────────────────────────────────────────────────────
function Settings({ allData, setAllData }) {
  const t = T;
  const [calorieGoal, setCG] = useState(allData.settings?.calorieGoal || 1850);
  const [hydGoal, setHG] = useState(allData.settings?.hydGoal || 8);
  const [companionName, setCN] = useState(allData.settings?.companionName || "");
  const [saved, setSaved] = useState(false);
  const saveAll = () => { const s = { calorieGoal, hydGoal, companionName }; setAllData(p => ({ ...p, settings: s })); sv("settings", s); setSaved(true); setTimeout(() => setSaved(false), 1500); };
  return (
    <div>
      <SHdr t={t} title="Settings" sub="Your space, your way" />
      <Card t={t}>
        <div style={{ fontWeight: 700, color: t.text, marginBottom: 14 }}>Personal targets</div>
        <div style={{ display: "grid", gap: 12 }}>
          <div><div style={{ color: t.sub, fontSize: 13, marginBottom: 4 }}>Daily calorie goal</div><Inp t={t} value={calorieGoal} onChange={v => setCG(Number(v))} placeholder="1850" type="number" /></div>
          <div><div style={{ color: t.sub, fontSize: 13, marginBottom: 4 }}>Daily hydration goal (glasses)</div><Inp t={t} value={hydGoal} onChange={v => setHG(Number(v))} placeholder="8" type="number" /></div>
        </div>
      </Card>
      <Card t={t}>
        <div style={{ fontWeight: 700, color: t.text, marginBottom: 4 }}>Name your companion</div>
        <div style={{ color: t.sub, fontSize: 13, marginBottom: 12 }}>Give her a name. Change it whenever you want.</div>
        <Inp t={t} value={companionName} onChange={setCN} placeholder="e.g. Nova, Sage, Echo, Vera..." />
        {companionName && <div style={{ marginTop: 12, background: t.accent2 + "22", borderRadius: 12, padding: 14, color: t.sub, fontSize: 13, fontStyle: "italic" }}>"{companionName} is here. What would you like to explore today?"</div>}
        <Btn t={t} onClick={saveAll} style={{ marginTop: 12 }}>{saved ? "Saved" : "Save"}</Btn>
      </Card>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────
export default function App() {
  const t = T;
  const [active, setActive] = useState("dashboard");
  const [navOpen, setNavOpen] = useState(false);
  const [allData, setAllData] = useState(() => {
    const keys = ["fitness", "nutrition", "hydration", "cycle", "sleep", "meditation", "moods", "journal", "goals", "yogaPractice", "yogaStudy", "yogaTeach"];
    const data = { aiPrefs: ld("aiPrefs", ""), settings: ld("settings", {}) };
    keys.forEach(k => { data[k] = ld(k, []); });
    return data;
  });

  const companionName = allData.settings?.companionName || "your companion";
  const activeMod = MODULES.find(m => m.id === active);
  const mp = { allData, setAllData, companionName };

  const render = () => {
    switch (active) {
      case "dashboard": return <Dashboard {...mp} setModule={setActive} />;
      case "fitness": return <Fitness {...mp} />;
      case "nutrition": return <Nutrition {...mp} />;
      case "hydration": return <Hydration {...mp} />;
      case "cycle": return <Cycle {...mp} />;
      case "sleep": return <Sleep {...mp} />;
      case "meditation": return <Meditation {...mp} />;
      case "yoga": return <Yoga {...mp} />;
      case "mood": return <MoodModule {...mp} />;
      case "journal": return <Journal {...mp} />;
      case "goals": return <Goals {...mp} />;
      case "search": return <SearchLogs allData={allData} />;
      case "ai": return <AIAssistant t={t} {...mp} />;
      case "settings": return <Settings {...mp} />;
      default: return null;
    }
  };

  return (
    <div style={{ fontFamily: "system-ui,sans-serif", fontSize: 15, background: t.bg, minHeight: "100vh", color: t.text }}>
      <div style={{ background: t.nav, borderBottom: `1px solid ${t.border}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: `0 1px 8px ${t.shadow}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div onClick={() => setNavOpen(v => !v)} style={{ fontSize: 18, cursor: "pointer", color: t.accent }}>☰</div>
          <div style={{ fontWeight: 700, color: t.text, fontSize: 15 }}>{active === "dashboard" ? "For the Record" : activeMod?.label}</div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div onClick={() => setActive("search")} style={{ cursor: "pointer", color: t.accent, fontSize: 15 }}>⌕</div>
          <div onClick={() => setActive("ai")} style={{ cursor: "pointer", color: t.accent, fontSize: 13, fontWeight: 600, background: t.accent2 + "44", padding: "4px 10px", borderRadius: 20 }}>{companionName !== "your companion" ? companionName.split(" ")[0] : "Guide"}</div>
          <div onClick={() => setActive("settings")} style={{ cursor: "pointer", color: t.accent, fontSize: 15 }}>⚙</div>
        </div>
      </div>

      {navOpen && <>
        <div style={{ width: 220, background: t.nav, borderRight: `1px solid ${t.border}`, overflowY: "auto", padding: "12px 0", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 200 }}>
          <div style={{ padding: "16px 20px", fontWeight: 700, color: t.text, fontSize: 15, borderBottom: `1px solid ${t.border}`, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            For the Record <span onClick={() => setNavOpen(false)} style={{ cursor: "pointer", color: t.sub, fontSize: 18, fontWeight: 300 }}>✕</span>
          </div>
          {MODULES.map(m => (
            <div key={m.id} onClick={() => { setActive(m.id); setNavOpen(false); }}
              style={{ padding: "11px 20px", cursor: "pointer", background: active === m.id ? t.accent2 + "44" : "transparent", borderLeft: active === m.id ? `3px solid ${t.accent}` : "3px solid transparent", color: active === m.id ? t.accent : t.sub, fontWeight: active === m.id ? 600 : 400, fontSize: 14 }}>
              {m.label}
            </div>
          ))}
        </div>
        <div onClick={() => setNavOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 199 }} />
      </>}

      <div style={{ padding: "20px 16px", maxWidth: 700, margin: "0 auto" }}>
        {render()}
        <div style={{ height: 90 }} />
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: t.nav, borderTop: `1px solid ${t.border}`, display: "flex", justifyContent: "space-around", padding: "8px 0", zIndex: 100 }}>
        {[{ id: "dashboard", label: "Home" }, { id: "fitness", label: "Move" }, { id: "nutrition", label: "Nourish" }, { id: "hydration", label: "Water" }, { id: "ai", label: companionName !== "your companion" ? companionName.split(" ")[0] : "Guide" }].map(m => (
          <div key={m.id} onClick={() => setActive(m.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", color: active === m.id ? t.accent : t.sub, padding: "4px 8px", borderRadius: 12, background: active === m.id ? t.accent2 + "33" : "transparent" }}>
            <span style={{ fontSize: 10, fontWeight: active === m.id ? 600 : 400 }}>{m.label}</span>
          </div>
        ))}
        <div onClick={() => setNavOpen(v => !v)} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", color: t.sub, padding: "4px 8px" }}>
          <span style={{ fontSize: 10 }}>More</span>
        </div>
      </div>
    </div>
  );
}
