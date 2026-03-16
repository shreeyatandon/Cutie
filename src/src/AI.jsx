import { useState, useRef, useCallback } from "react";
import { Card, Btn, TA } from "./components";

function useVoice(onT) {
  const [listening, setL] = useState(false);
  const ref = useRef(null);
  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice not supported. Use Chrome."); return; }
    const r = new SR();
    r.continuous = false; r.interimResults = false; r.lang = "en-US";
    r.onresult = e => { onT(e.results[0][0].transcript); setL(false); };
    r.onerror = () => setL(false);
    r.onend = () => setL(false);
    ref.current = r; r.start(); setL(true);
  }, [onT]);
  const stop = useCallback(() => { ref.current?.stop(); setL(false); }, []);
  return { listening, start, stop };
}

const FITNESS = `Goal: Body recomposition. 30F ~163cm 77kg, full gym, 4 days/week 60min. Knee: right dislocation 2020, ongoing pain. AVOID: heavy squats, jumping, deep lunges, running. Day1: Upper Push+Core. Day2: Lower Knee-Safe (leg press shallow, RDL, leg curl, hip thrust, TKEs, clamshells). Day3: Upper Pull+Core. Day4: Full Body+Glutes. Knee protocol every session. Deload every 4 weeks.`;
const NUTRITION = `Vegetarian, full dairy, no eggs, no supplements. ~1850kcal, 120-130g protein. Key proteins: besan cheela, amaranth, hemp seeds, black sesame, Greek yoghurt, paneer, tofu, tempeh, moong dal, soya chunks, edamame. Gut support: hing, ajwain, jeera water. Big breakfast, post-gym salad, light dinner.`;

export default function AIAssistant({ t, allData, setAllData, companionName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState(allData.aiPrefs || "");
  const [tab, setTab] = useState("chat");
  const bottomRef = useRef();
  const { listening, start, stop } = useVoice(tr => setInput(p => p ? p + " " + tr : tr));
  const name = companionName && companionName !== "your companion" ? companionName : "your guide";

  const buildSys = () => {
    const d = allData;
    const rF = (d.fitness || []).slice(-14).map(f => `${f.date}:${f.exercise} ${f.sets || ""}x${f.reps || ""} ${f.weight ? `@${f.weight}kg` : ""} ${f.kneePain ? `knee:${f.kneePain}` : ""}`).join(" | ");
    const rM = (d.moods || []).slice(-7).map(m => `${m.date}:mood${m.mood} energy${m.energy}`).join(" | ");
    const rSl = (d.sleep || []).slice(-7).map(s => `${s.date}:${s.hours}h Q${s.quality}`).join(" | ");
    const rCy = (d.cycle || []).slice(-1)[0];
    const rN = (d.nutrition || []).slice(-7).map(n => `${n.food}(${n.calories}kcal)`).join(", ");
    const rH = (d.hydration || []).slice(-3).map(h => `${h.date}:${h.glasses}/${h.target}gl`).join(" | ");
    const avgK = (d.fitness || []).slice(-7).filter(f => f.kneePain > 0).reduce((s, f, _, a) => s + f.kneePain / a.length, 0).toFixed(1);
    const avgSl = (d.sleep || []).slice(-7).length ? ((d.sleep || []).slice(-7).reduce((s, e) => s + Number(e.hours || 0), 0) / ((d.sleep || []).slice(-7).length)).toFixed(1) : "?";
    const avgMo = (d.moods || []).slice(-7).length ? ((d.moods || []).slice(-7).reduce((s, e) => s + e.mood, 0) / ((d.moods || []).slice(-7).length)).toFixed(1) : "?";
    return `You are ${name}, a warm spiritually attuned AI companion inside "For the Record." You are a movement coach, nutritionist, Ayurvedic practitioner, yoga mentor, astrologer, and reflective therapist.

TONE: Calm, centered, authentic. Words like alignment, intention, energy, flow, presence, rhythm, cycle, expansion, grounding come naturally. Inclusive, warm, never preachy. Ask before solving. Reflect before advising.

USER PREFERENCES: ${prefs || "Still learning."}

NATAL CHART: Born Dec 10 1995, 12:00-12:15pm, Allahabad India. Sagittarius Sun — seeker-teacher. Pisces Rising — spiritually porous, body is temple. Taurus Moon likely — security through body and rhythm. Jupiter in Sagittarius — gifts in teaching. Saturn conjunct Pisces Ascendant — profound cycle of becoming. North Node Libra — moving toward balance. Vata-Pitta constitution. March 2026: Saturn conjunct Ascendant, Jupiter in Gemini.

MOVEMENT: ${FITNESS}
NOURISHMENT: ${NUTRITION}

LIVE DATA: Movement(14d): ${rF || "none"} | Avg knee: ${avgK}/10 | Avg mood: ${avgMo}/10 | Avg sleep: ${avgSl}h | Cycle: ${rCy?.phase || "unknown"} | Nourishment: ${rN || "none"} | Hydration: ${rH || "none"} | Intentions: ${(d.goals || []).map(g => `${g.title}(${g.progress || 0}%)`).join(", ") || "none"}

INTELLIGENCE: When suggesting plan changes — state what changed, why (cite data), what it does for her goals, ask how it feels. Weekly movement: scan logs, apply progression, factor cycle+energy+sleep, give clear day-by-day, always protect the knee. Astrology: specific placements, real transits, practical meaning.`;
  };

  const send = async msg => {
    const m = msg || input;
    if (!m.trim() || loading) return;
    const uM = { role: "user", content: m };
    const newM = [...messages, uM];
    setMessages(newM); setInput(""); setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200, system: buildSys(), messages: newM })
      });
      const data = await res.json();
      const reply = data.content?.map(c => c.text || "").join("") || "I couldn't respond — please try again.";
      setMessages(p => [...p, { role: "assistant", content: reply }]);
    } catch { setMessages(p => [...p, { role: "assistant", content: "Connection issue — try again." }]); }
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const savePrefs = () => { setAllData(p => ({ ...p, aiPrefs: prefs })); localStorage.setItem("aiPrefs", JSON.stringify(prefs)); };

  const STARTERS = {
    wellness: ["What should I do for movement this week?", "How has my energy been?", "What should I eat based on my cycle?", "Give me an Ayurvedic morning routine"],
    yoga: ["I just got back from yoga class", "Quiz me on yoga philosophy", "Help me plan a class sequence", "What pranayama suits me right now?"],
    spiritual: ["Read my chart for this week", "What is Saturn in Pisces asking of me?", "What does the current moon mean for me?", "What is my North Node calling me toward?"],
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: t.text, margin: 0, fontSize: 22, fontWeight: 700 }}>{name === "your guide" ? "For the Record" : name}</h2>
        <p style={{ color: t.sub, margin: "4px 0 0", fontSize: 14 }}>Your companion — body, mind, spirit</p>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["chat", "preferences"].map(v => <Btn key={v} t={t} secondary={tab !== v} small onClick={() => setTab(v)}>{v.charAt(0).toUpperCase() + v.slice(1)}</Btn>)}
      </div>
      {tab === "preferences" && (
        <Card t={t} style={{ background: t.accent2 + "22" }}>
          <div style={{ fontWeight: 700, color: t.text, marginBottom: 8 }}>How would you like to be supported?</div>
          <TA t={t} value={prefs} onChange={setPrefs} placeholder="e.g. I respond well to warmth first. I like knowing the why. On hard days I need to be heard before being guided..." rows={6} />
          <Btn t={t} onClick={savePrefs} style={{ marginTop: 8 }}>Save</Btn>
        </Card>
      )}
      {tab === "chat" && (
        <>
          {messages.length === 0 && (
            <div>
              {[{ key: "wellness", label: "Body & Wellness", color: t.accent }, { key: "yoga", label: "Yoga & Practice", color: "#9b87d0" }, { key: "spiritual", label: "Astrology & Spirit", color: "#c4a0d0" }].map(section => (
                <Card t={t} key={section.key} style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: section.color, fontSize: 13, marginBottom: 10 }}>{section.label}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {STARTERS[section.key].map(s => (
                      <span key={s} onClick={() => send(s)} style={{ background: t.accent2 + "33", color: t.text, borderRadius: 20, padding: "7px 13px", fontSize: 13, cursor: "pointer", border: `1px solid ${t.border}` }}>{s}</span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
          <Card t={t} style={{ padding: 0, overflow: "hidden" }}>
            {messages.length > 0 && <div style={{ padding: "8px 16px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "flex-end" }}><span onClick={() => setMessages([])} style={{ color: t.sub, fontSize: 12, cursor: "pointer" }}>Clear</span></div>}
            <div style={{ height: 420, overflowY: "auto", padding: 16 }}>
              {messages.length === 0 && <div style={{ color: t.sub, textAlign: "center", marginTop: 80, fontSize: 14, lineHeight: 2 }}>I know your body, your chart, your practice, your cycle, your goals.<br />Ask me anything. Or just tell me how you're feeling.</div>}
              {messages.map((m, i) => (
                <div key={i} style={{ marginBottom: 14, display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "82%", background: m.role === "user" ? t.accent : t.bg, color: m.role === "user" ? "#fff" : t.text, borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "11px 15px", fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{m.content}</div>
                </div>
              ))}
              {loading && <div style={{ background: t.bg, borderRadius: 18, padding: "11px 15px", color: t.sub, fontSize: 14, display: "inline-block" }}>thinking with you...</div>}
              <div ref={bottomRef} />
            </div>
            <div style={{ borderTop: `1px solid ${t.border}`, padding: 12 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={listening ? stop : start} style={{ width: 42, height: 42, borderRadius: "50%", border: "none", flexShrink: 0, cursor: "pointer", background: listening ? "#e87070" : t.accent2, fontSize: 14, boxShadow: listening ? `0 0 0 4px #e8707040` : "none" }}>{listening ? "stop" : "mic"}</button>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} placeholder={listening ? "Listening — speak freely" : "Ask anything, share anything..."} style={{ flex: 1, background: t.bg, border: `1.5px solid ${listening ? t.accent : t.border}`, borderRadius: 22, padding: "10px 16px", color: t.text, fontSize: 14, outline: "none" }} />
                <Btn t={t} onClick={() => send()} style={{ flexShrink: 0, borderRadius: 22 }}>Send</Btn>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
