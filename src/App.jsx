import { useState, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from "recharts";

// ── THEMES ─────────────────────────────────────────────────────────────────
obsidian:      { name:"Obsidian",       bg:"#111111", card:"#1c1c1e", accent:"#e0e0e0", accent2:"#aaaaaa", text:"#f2f2f7", sub:"#8e8e93", border:"#2c2c2e", nav:"#1c1c1e", shadow:"rgba(0,0,0,0.5)",          chart:["#e0e0e0","#aaaaaa","#ffffff","#888888"] },
  iosLight: { name:"iOS Light", bg:"#f2f2f7", card:"#ffffff", accent:"#007aff", accent2:"#34aadc", text:"#000000", sub:"#6d6d72", border:"#c6c6c8", nav:"#ffffff", shadow:"rgba(0,0,0,0.08)", chart:["#007aff","#34aadc","#5856d6","#ff9500"] },
  iosDark:  { name:"iOS Dark",  bg:"#000000", card:"#1c1c1e", accent:"#0a84ff", accent2:"#30b0c7", text:"#ffffff", sub:"#8e8e93", border:"#38383a", nav:"#1c1c1e", shadow:"rgba(0,0,0,0.6)", chart:["#0a84ff","#30b0c7","#5e5ce6","#ff9f0a"] },
  matcha:   { name:"Matcha",    bg:"#f0f4ee", card:"#ffffff", accent:"#4a7c59", accent2:"#78a882", text:"#1a2e1a", sub:"#4a6a4a", border:"#b8d4b8", nav:"#e4eedc", shadow:"rgba(74,124,89,0.15)", chart:["#4a7c59","#78a882","#2a5a39","#a8c8a8"] },
  sunset:   { name:"Sunset",    bg:"#fdf0e8", card:"#ffffff", accent:"#d4845a", accent2:"#e8b090", text:"#3a2018", sub:"#8a5a3a", border:"#f0c8a8", nav:"#fde8d8", shadow:"rgba(212,132,90,0.15)", chart:["#d4845a","#e8b090","#a05030","#f0c8a8"] },
  arctic:   { name:"Arctic",    bg:"#eef4f8", card:"#ffffff", accent:"#5aa0c0", accent2:"#90c4d8", text:"#1a2a38", sub:"#4a7a98", border:"#b8d4e4", nav:"#dceef8", shadow:"rgba(90,160,192,0.15)", chart:["#5aa0c0","#90c4d8","#2a7090","#b8e4f8"] },
};
const FONTS = { system:"system-ui,sans-serif", rounded:"'Nunito',system-ui,sans-serif", serif:"Georgia,serif", mono:"'SF Mono',monospace" };
const MODULES = [
  { id:"dashboard",   icon:"⊞",  label:"Home" },
  { id:"fitness",     icon:"◈",  label:"Movement" },
  { id:"nutrition",   icon:"◉",  label:"Nourishment" },
  { id:"hydration",   icon:"◌",  label:"Hydration" },
  { id:"cycle",       icon:"◎",  label:"Cycle" },
  { id:"sleep",       icon:"◐",  label:"Rest" },
  { id:"meditation",  icon:"◯",  label:"Stillness" },
  { id:"yoga",        icon:"◈",  label:"Yoga & Studies" },
  { id:"mood",        icon:"◉",  label:"Energy & Mood" },
  { id:"style",       icon:"◇",  label:"Style" },
  { id:"chores",      icon:"◫",  label:"Home" },
  { id:"journal",     icon:"◪",  label:"Journal" },
  { id:"goals",       icon:"◎",  label:"Intentions" },
  { id:"supplements", icon:"◌",  label:"Rituals" },
  { id:"search",      icon:"◔",  label:"Search" },
  { id:"network",     icon:"◈",  label:"Connections" },
  { id:"ai",          icon:"◉",  label:"For the Record" },
  { id:"settings",    icon:"◧",  label:"Settings" },
];

const sv = async (k,v) => { try { await window.storage.set(k,JSON.stringify(v)); } catch {} };
const ld = async (k,def) => { try { const r=await window.storage.get(k); return r?JSON.parse(r.value):def; } catch { return def; } };

// ── UI Primitives ──────────────────────────────────────────────────────────
const Card = ({t,children,style={}}) => <div style={{background:t.card,borderRadius:16,padding:20,boxShadow:`0 2px 12px ${t.shadow}`,border:`1px solid ${t.border}`,marginBottom:16,...style}}>{children}</div>;
const Btn = ({t,onClick,children,secondary,small,style={}}) => <button onClick={onClick} style={{background:secondary?"transparent":t.accent,color:secondary?t.accent:"#fff",border:secondary?`1.5px solid ${t.accent}`:"none",borderRadius:small?8:12,padding:small?"6px 14px":"10px 20px",fontSize:small?13:15,fontWeight:600,cursor:"pointer",...style}}>{children}</button>;
const Input = ({t,value,onChange,placeholder,type="text",style={}}) => <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{background:t.bg,border:`1.5px solid ${t.border}`,borderRadius:10,padding:"9px 14px",color:t.text,fontSize:14,width:"100%",outline:"none",boxSizing:"border-box",...style}}/>;
const TA = ({t,value,onChange,placeholder,rows=3}) => <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{background:t.bg,border:`1.5px solid ${t.border}`,borderRadius:10,padding:"9px 14px",color:t.text,fontSize:14,width:"100%",outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit"}}/>;
const Sel = ({t,value,onChange,options}) => <select value={value} onChange={e=>onChange(e.target.value)} style={{background:t.bg,border:`1.5px solid ${t.border}`,borderRadius:10,padding:"9px 14px",color:t.text,fontSize:14,width:"100%",outline:"none"}}>{options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}</select>;
const PBar = ({t,value,max,color,h=8}) => <div style={{background:t.border,borderRadius:99,height:h,overflow:"hidden"}}><div style={{width:`${Math.min(100,max>0?(value/max)*100:0)}%`,background:color||t.accent,height:"100%",borderRadius:99,transition:"width 0.4s"}}/></div>;
const MSlider = ({t,value,onChange,label}) => <div style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:t.sub,fontSize:13}}>{label}</span><span style={{color:t.accent,fontWeight:700}}>{value}/10</span></div><input type="range" min={1} max={10} value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:"100%",accentColor:t.accent}}/></div>;
const MCard = ({t,label,value,unit,icon,color}) => <div style={{background:t.card,borderRadius:14,padding:14,border:`1px solid ${t.border}`,boxShadow:`0 2px 8px ${t.shadow}`,flex:1,minWidth:90}}><div style={{fontSize:18,marginBottom:4}}>{icon}</div><div style={{fontSize:18,fontWeight:700,color:color||t.accent}}>{value}</div><div style={{fontSize:11,color:t.sub}}>{unit}</div><div style={{fontSize:11,color:t.sub,marginTop:1}}>{label}</div></div>;
const SHdr = ({t,title,sub}) => <div style={{marginBottom:20}}><h2 style={{color:t.text,margin:0,fontSize:22,fontWeight:700}}>{title}</h2>{sub&&<p style={{color:t.sub,margin:"4px 0 0",fontSize:14}}>{sub}</p>}</div>;

// ── Voice ──────────────────────────────────────────────────────────────────
function useVoice(onT) {
  const [listening,setL]=useState(false); const ref=useRef(null);
  const start=useCallback(()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){alert("Voice not supported. Use Chrome.");return;}const r=new SR();r.continuous=false;r.interimResults=false;r.lang="en-US";r.onresult=e=>{onT(e.results[0][0].transcript);setL(false);};r.onerror=()=>setL(false);r.onend=()=>setL(false);ref.current=r;r.start();setL(true);},[onT]);
  const stop=useCallback(()=>{ref.current?.stop();setL(false);},[]);
  return {listening,start,stop};
}

// ── Shared MoodCheckin ─────────────────────────────────────────────────────
function MoodCheckin({t,allData,setAllData,compact=false}) {
  const today=new Date().toLocaleDateString("en-GB");
  const ex=allData.moods?.find(m=>m.date===today);
  const [mood,setMood]=useState(ex?.mood||5);
  const [energy,setEnergy]=useState(ex?.energy||5);
  const [notes,setNotes]=useState(ex?.notes||"");
  const [emotions,setEmotions]=useState(ex?.emotions||[]);
  const [saved,setSaved]=useState(!!ex);
  const EM=["Anxious","Calm","Motivated","Tired","Happy","Stressed","Grateful","Focused","Overwhelmed","Content"];
  const save_=async()=>{const entry={date:today,mood,energy,notes,emotions,time:new Date().toLocaleTimeString()};const u=[...(allData.moods||[]).filter(m=>m.date!==today),entry];setAllData(p=>({...p,moods:u}));await sv("moods",u);setSaved(true);};
  if(compact&&saved) return <div style={{background:t.accent2+"33",borderRadius:12,padding:12,marginBottom:12}}><span style={{color:t.text,fontSize:13}}>✅ Mood: {mood}/10 · Energy: {energy}/10</span><span onClick={()=>setSaved(false)} style={{color:t.accent,fontSize:12,marginLeft:8,cursor:"pointer"}}>Edit</span></div>;
  return <Card t={t} style={{background:t.accent2+"22"}}><div style={{fontWeight:700,color:t.text,marginBottom:12}}>✨ Mood & Energy</div><MSlider t={t} label="Mood" value={mood} onChange={setMood}/><MSlider t={t} label="Energy" value={energy} onChange={setEnergy}/><div style={{display:"flex",flexWrap:"wrap",marginBottom:12}}>{EM.map(e=><span key={e} onClick={()=>setEmotions(p=>p.includes(e)?p.filter(x=>x!==e):[...p,e])} style={{background:emotions.includes(e)?t.accent:t.border,color:emotions.includes(e)?"#fff":t.sub,borderRadius:20,padding:"4px 10px",fontSize:12,margin:"2px",cursor:"pointer"}}>{e}</span>)}</div><TA t={t} value={notes} onChange={setNotes} placeholder="How are you feeling?" rows={2}/><Btn t={t} onClick={save_} style={{marginTop:10}}>Save</Btn></Card>;
}

// ── WELLNESS SCORE ────────────────────────────────────────────────────────
function calcScores(allData) {
  const today = new Date().toLocaleDateString("en-GB");
  const s = allData.settings || {};

  // BODY actions today
  const gymDone = (allData.fitness||[]).filter(f=>f.date===today).length > 0 ? 1 : 0;
  const hydGoal = s.hydGoal||8;
  const todayHyd = (allData.hydration||[]).find(h=>h.date===today);
  const hydDone = todayHyd && todayHyd.glasses >= hydGoal ? 1 : 0;
  const suppTotal = (allData.supplements||[]).length;
  const suppDone = suppTotal > 0 ? (allData.supplements||[]).filter(s2=>(allData.supplementLogs||[]).some(l=>l.key===`${today}-${s2.id}`)).length / suppTotal : 0;
  const choresToday = (allData.chores||[]).filter(c=>c.date===today);
  const choresDone = choresToday.length > 0 ? choresToday.filter(c=>c.done).length / choresToday.length : 0;
  const yogaDone = (allData.yogaPractice||[]).filter(y=>y.date===today).length > 0 ? 1 : 0;
  const bodyScore = Math.round(([gymDone, hydDone, suppDone, choresDone, yogaDone].reduce((a,b)=>a+b,0) / 5) * 100);

  // MIND actions today
  const medDone = (allData.meditation||[]).filter(m=>m.date===today).length > 0 ? 1 : 0;
  const journalDone = (allData.journal||[]).filter(j=>j.date===today).length > 0 ? 1 : 0;
  const studyDone = (allData.yogaStudy||[]).filter(s=>s.date===today).length > 0 ? 1 : 0;
  const moodDone = (allData.moods||[]).find(m=>m.date===today) ? 1 : 0;
  const mindScore = Math.round(([medDone, journalDone, studyDone, moodDone].reduce((a,b)=>a+b,0) / 4) * 100);

  const overall = Math.round((bodyScore * 0.55) + (mindScore * 0.45));

  // 30-day consistency bars
  const bars = Array.from({length:30},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-29+i);
    const ds = d.toLocaleDateString("en-GB");
    const actions = [
      (allData.fitness||[]).some(f=>f.date===ds),
      (allData.hydration||[]).find(h=>h.date===ds && h.glasses>=(h.target||8)),
      (allData.meditation||[]).some(m=>m.date===ds),
      (allData.journal||[]).some(j=>j.date===ds),
      (allData.moods||[]).some(m=>m.date===ds),
      (allData.yogaPractice||[]).some(y=>y.date===ds)||(allData.yogaStudy||[]).some(y=>y.date===ds),
    ];
    const pct = actions.filter(Boolean).length / actions.length;
    return { date:ds, pct, isToday: ds===today };
  });

  // Day counter — use first logged fitness session or today
  const allDates = [...(allData.fitness||[]), ...(allData.meditation||[]), ...(allData.moods||[])].map(e=>e.date).filter(Boolean).sort();
  let dayNum = 1;
  if(allDates.length > 0) {
    try {
      const [d,m,y] = allDates[0].split("/");
      const start = new Date(`${y}-${m}-${d}`);
      dayNum = Math.max(1, Math.floor((new Date()-start)/86400000)+1);
    } catch {}
  }

  const label = overall >= 80 ? "Thriving 🌟" : overall >= 60 ? "Consistent 💪" : overall >= 35 ? "Building 🌱" : "Getting Started 🌸";
  return { bodyScore, mindScore, overall, bars, dayNum, label };
}

function WellnessScore({t, allData}) {
  const { bodyScore, mindScore, overall, bars, dayNum, label } = calcScores(allData);
  const [showBars, setShowBars] = useState(false);

  // Animated ring
  const r = 54; const circ = 2*Math.PI*r;
  const dash = (circ * overall) / 100;

  return (
    <Card t={t} style={{background:`linear-gradient(135deg, ${t.card} 0%, ${t.accent2}22 100%)`}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontWeight:700,color:t.text,fontSize:15}}>✨ Wellness Score</div>
          <div style={{color:t.sub,fontSize:12,marginTop:2}}>Day {dayNum} of your journey</div>
        </div>
        <div style={{background:t.accent+"22",borderRadius:20,padding:"4px 12px",fontSize:12,color:t.accent,fontWeight:600}}>{label}</div>
      </div>

      {/* Score ring + body/mind */}
      <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:16}}>
        {/* SVG Ring */}
        <div style={{position:"relative",flexShrink:0}}>
          <svg width={130} height={130} style={{transform:"rotate(-90deg)"}}>
            <circle cx={65} cy={65} r={r} fill="none" stroke={t.border} strokeWidth={10}/>
            <circle cx={65} cy={65} r={r} fill="none" stroke={t.accent} strokeWidth={10}
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
              style={{transition:"stroke-dasharray 1s ease"}}/>
            {/* Inner ring - mind */}
            <circle cx={65} cy={65} r={38} fill="none" stroke={t.border} strokeWidth={7}/>
            <circle cx={65} cy={65} r={38} fill="none" stroke={t.chart?.[2]||"#9b87d0"} strokeWidth={7}
              strokeDasharray={`${(2*Math.PI*38*mindScore)/100} ${2*Math.PI*38}`} strokeLinecap="round"/>
          </svg>
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",marginTop:2}}>
            <div style={{fontSize:26,fontWeight:800,color:t.text}}>{overall}%</div>
            <div style={{fontSize:9,color:t.sub,marginTop:-2}}>overall</div>
          </div>
        </div>

        {/* Body / Mind breakdown */}
        <div style={{flex:1}}>
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{color:t.text,fontSize:13,fontWeight:600}}>🔵 Body</span>
              <span style={{color:t.accent,fontWeight:700,fontSize:13}}>{bodyScore}%</span>
            </div>
            <div style={{background:t.border,borderRadius:99,height:7,overflow:"hidden"}}>
              <div style={{width:`${bodyScore}%`,background:t.accent,height:"100%",borderRadius:99,transition:"width 0.8s ease"}}/>
            </div>
            <div style={{color:t.sub,fontSize:10,marginTop:3}}>Gym · Hydration · Yoga · Supplements · Chores</div>
          </div>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{color:t.text,fontSize:13,fontWeight:600}}>🟣 Mind</span>
              <span style={{color:t.chart?.[2]||"#9b87d0",fontWeight:700,fontSize:13}}>{mindScore}%</span>
            </div>
            <div style={{background:t.border,borderRadius:99,height:7,overflow:"hidden"}}>
              <div style={{width:`${mindScore}%`,background:t.chart?.[2]||"#9b87d0",height:"100%",borderRadius:99,transition:"width 0.8s ease"}}/>
            </div>
            <div style={{color:t.sub,fontSize:10,marginTop:3}}>Meditation · Journal · Study · Mood check-in</div>
          </div>
        </div>
      </div>

      {/* 30-day consistency */}
      <div>
        <div onClick={()=>setShowBars(v=>!v)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",marginBottom:showBars?10:0}}>
          <div style={{color:t.sub,fontSize:12,fontWeight:600}}>30-DAY CONSISTENCY</div>
          <div style={{color:t.accent,fontSize:11}}>{showBars?"▲ hide":"▼ show"}</div>
        </div>
        {showBars&&<div style={{display:"flex",gap:2,alignItems:"flex-end",height:50}}>
          {bars.map((b,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <div style={{
                width:"100%", borderRadius:"2px 2px 0 0",
                height:`${Math.max(4, b.pct*44)}px`,
                background: b.isToday ? t.accent : b.pct>0.6 ? t.accent+"aa" : b.pct>0 ? t.accent+"55" : t.border,
                transition:"height 0.3s",
                outline: b.isToday ? `2px solid ${t.accent}` : "none"
              }}/>
            </div>
          ))}
        </div>}
        {showBars&&<div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
          <span style={{color:t.sub,fontSize:10}}>30 days ago</span>
          <span style={{color:t.accent,fontSize:10,fontWeight:600}}>Today</span>
        </div>}
      </div>
    </Card>
  );
}

// ── CHARTS LIBRARY ─────────────────────────────────────────────────────────
const CTooltip = ({t,active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:10,padding:"8px 12px",fontSize:12,color:t.text,boxShadow:`0 4px 12px ${t.shadow}`}}><div style={{fontWeight:600,marginBottom:4}}>{label}</div>{payload.map((p,i)=><div key={i} style={{color:p.color}}>{p.name}: {p.value}</div>)}</div>;
};

function SleepChart({t,data}) {
  const d=data.slice(-14).map(e=>({day:e.date?.split("/")[0]+"/"+e.date?.split("/")[1],hours:Number(e.hours||0),quality:Number(e.quality||0)}));
  if(d.length<2) return <div style={{color:t.sub,fontSize:13,textAlign:"center",padding:20}}>Log at least 2 nights to see your chart 😴</div>;
  return <ResponsiveContainer width="100%" height={160}><AreaChart data={d} margin={{top:5,right:5,bottom:5,left:-20}}><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={t.accent} stopOpacity={0.3}/><stop offset="95%" stopColor={t.accent} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={t.border}/><XAxis dataKey="day" tick={{fontSize:10,fill:t.sub}}/><YAxis tick={{fontSize:10,fill:t.sub}} domain={[0,12]}/><Tooltip content={<CTooltip t={t}/>}/><Area type="monotone" dataKey="hours" stroke={t.accent} fill="url(#sg)" name="Hours" strokeWidth={2}/><Line type="monotone" dataKey="quality" stroke={t.chart?.[1]||t.accent2} strokeWidth={2} dot={false} name="Quality"/></AreaChart></ResponsiveContainer>;
}

function MoodChart({t,data}) {
  const d=data.slice(-14).map(e=>({day:e.date?.split("/")[0]+"/"+e.date?.split("/")[1],mood:e.mood,energy:e.energy}));
  if(d.length<2) return <div style={{color:t.sub,fontSize:13,textAlign:"center",padding:20}}>Log mood a few times to see trends ✨</div>;
  return <ResponsiveContainer width="100%" height={150}><LineChart data={d} margin={{top:5,right:5,bottom:5,left:-20}}><CartesianGrid strokeDasharray="3 3" stroke={t.border}/><XAxis dataKey="day" tick={{fontSize:10,fill:t.sub}}/><YAxis tick={{fontSize:10,fill:t.sub}} domain={[0,10]}/><Tooltip content={<CTooltip t={t}/>}/><Line type="monotone" dataKey="mood" stroke={t.accent} strokeWidth={2} dot={{r:3}} name="Mood"/><Line type="monotone" dataKey="energy" stroke={t.chart?.[1]||t.accent2} strokeWidth={2} dot={{r:3}} name="Energy"/></LineChart></ResponsiveContainer>;
}

function NutritionChart({t,data,goal}) {
  const today=new Date().toLocaleDateString("en-GB");
  const todayCals=data.filter(e=>e.date===today).reduce((s,e)=>s+(Number(e.calories)||0),0);
  const todayP=data.filter(e=>e.date===today).reduce((s,e)=>s+(Number(e.protein)||0),0);
  const todayC=data.filter(e=>e.date===today).reduce((s,e)=>s+(Number(e.carbs)||0),0);
  const todayF=data.filter(e=>e.date===today).reduce((s,e)=>s+(Number(e.fats)||0),0);
  const macros=[{name:"Protein",value:todayP*4,fill:t.accent},{name:"Carbs",value:todayC*4,fill:t.chart?.[1]||t.accent2},{name:"Fats",value:todayF*9,fill:t.chart?.[2]||"#c0a0a0"}];
  const totalMacro=macros.reduce((s,m)=>s+m.value,0);
  const weekly=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i);const ds=d.toLocaleDateString("en-GB");return{day:d.toLocaleDateString("en-GB",{weekday:"short"}),cals:data.filter(e=>e.date===ds).reduce((s,e)=>s+(Number(e.calories)||0),0)};}).reverse();
  return <div><div style={{display:"flex",gap:16,alignItems:"center",marginBottom:12}}><div style={{flex:1}}><ResponsiveContainer width="100%" height={120}><PieChart><Pie data={totalMacro>0?macros:[{name:"Empty",value:1,fill:t.border}]} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value">{(totalMacro>0?macros:[{fill:t.border}]).map((e,i)=><Cell key={i} fill={e.fill}/>)}</Pie><Tooltip formatter={(v)=>`${Math.round(v/4)}g`}/></PieChart></ResponsiveContainer></div><div style={{flex:1}}>{macros.map(m=><div key={m.name} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{color:t.sub,fontSize:12,display:"flex",alignItems:"center",gap:6}}><span style={{width:8,height:8,borderRadius:"50%",background:m.fill,display:"inline-block"}}/>{m.name}</span><span style={{color:t.text,fontSize:12,fontWeight:600}}>{Math.round(m.value/4)}g</span></div>)}<div style={{borderTop:`1px solid ${t.border}`,paddingTop:6,marginTop:4}}><span style={{color:t.accent,fontWeight:700,fontSize:14}}>{todayCals}</span><span style={{color:t.sub,fontSize:12}}> / {goal} kcal</span></div></div></div><ResponsiveContainer width="100%" height={80}><BarChart data={weekly} margin={{top:0,right:0,bottom:0,left:-20}}><XAxis dataKey="day" tick={{fontSize:10,fill:t.sub}}/><YAxis tick={{fontSize:10,fill:t.sub}}/><Tooltip content={<CTooltip t={t}/>}/><Bar dataKey="cals" fill={t.accent} radius={[4,4,0,0]} name="kcal"/>{goal&&<Bar dataKey={()=>goal} fill="transparent" stroke={t.sub} strokeDasharray="4 4"/>}</BarChart></ResponsiveContainer></div>;
}

function FitnessChart({t,data}) {
  const weekly=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i);const ds=d.toLocaleDateString("en-GB");const day=data.filter(s=>s.date===ds);return{day:d.toLocaleDateString("en-GB",{weekday:"short"}),sessions:day.length,volume:day.reduce((s,e)=>{const sets=Number(e.sets||0),reps=Number(e.reps||0),wt=Number(e.weight||0);return s+sets*reps*wt;},0),knee:day.filter(s=>s.kneePain>0).reduce((s,e,_,a)=>s+e.kneePain/a.length,0)||null};}).reverse();
  const kneeTrend=data.filter(s=>s.kneePain>0).slice(-14).map(s=>({day:s.date?.split("/")[0]+"/"+s.date?.split("/")[1],pain:s.kneePain}));
  if(data.length<2) return <div style={{color:t.sub,fontSize:13,textAlign:"center",padding:20}}>Log a few sessions to see your charts 💪</div>;
  return <div><div style={{marginBottom:8,color:t.sub,fontSize:12,fontWeight:600}}>WEEKLY SESSIONS</div><ResponsiveContainer width="100%" height={100}><BarChart data={weekly} margin={{top:0,right:0,bottom:0,left:-20}}><XAxis dataKey="day" tick={{fontSize:10,fill:t.sub}}/><YAxis tick={{fontSize:10,fill:t.sub}}/><Tooltip content={<CTooltip t={t}/>}/><Bar dataKey="sessions" fill={t.accent} radius={[4,4,0,0]} name="Sessions"/></BarChart></ResponsiveContainer>{kneeTrend.length>2&&<><div style={{marginTop:12,marginBottom:8,color:t.sub,fontSize:12,fontWeight:600}}>🦵 KNEE PAIN TREND</div><ResponsiveContainer width="100%" height={100}><LineChart data={kneeTrend} margin={{top:0,right:0,bottom:0,left:-20}}><CartesianGrid strokeDasharray="3 3" stroke={t.border}/><XAxis dataKey="day" tick={{fontSize:10,fill:t.sub}}/><YAxis tick={{fontSize:10,fill:t.sub}} domain={[0,10]}/><Tooltip content={<CTooltip t={t}/>}/><Line type="monotone" dataKey="pain" stroke="#e87070" strokeWidth={2} dot={{r:3}} name="Pain"/></LineChart></ResponsiveContainer></>}</div>;
}

function HydrationChart({t,data}) {
  const weekly=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i);const ds=d.toLocaleDateString("en-GB");const l=data.find(x=>x.date===ds);return{day:d.toLocaleDateString("en-GB",{weekday:"short"}),glasses:l?.glasses||0,target:l?.target||8,hit:l&&l.glasses>=l.target?1:0};}).reverse();
  const streak=weekly.filter(d=>d.hit).length;
  return <div><div style={{display:"flex",gap:10,marginBottom:12}}><div style={{flex:1,background:t.accent+"22",borderRadius:12,padding:12,textAlign:"center"}}><div style={{fontSize:24,fontWeight:700,color:t.accent}}>{streak}</div><div style={{color:t.sub,fontSize:12}}>days hit target</div></div><div style={{flex:1,background:t.accent+"22",borderRadius:12,padding:12,textAlign:"center"}}><div style={{fontSize:24,fontWeight:700,color:t.accent}}>{Math.round(weekly.reduce((s,d)=>s+d.glasses,0)/7*10)/10}</div><div style={{color:t.sub,fontSize:12}}>avg glasses/day</div></div></div><ResponsiveContainer width="100%" height={100}><BarChart data={weekly} margin={{top:0,right:0,bottom:0,left:-20}}><XAxis dataKey="day" tick={{fontSize:10,fill:t.sub}}/><YAxis tick={{fontSize:10,fill:t.sub}}/><Tooltip content={<CTooltip t={t}/>}/><Bar dataKey="glasses" name="Glasses" radius={[4,4,0,0]}>{weekly.map((e,i)=><Cell key={i} fill={e.hit?"#7aaa7a":t.accent}/>)}</Bar></BarChart></ResponsiveContainer></div>;
}

function MeditationChart({t,data}) {
  const weekly=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i);const ds=d.toLocaleDateString("en-GB");const day=data.filter(s=>s.date===ds);return{day:d.toLocaleDateString("en-GB",{weekday:"short"}),mins:day.reduce((s,e)=>s+Number(e.duration||0),0)};}).reverse();
  const moodShift=data.filter(e=>e.moodBefore&&e.moodAfter).slice(-10).map(e=>({session:e.date?.split("/")[0]+"/"+e.date?.split("/")[1],before:e.moodBefore,after:e.moodAfter,shift:e.moodAfter-e.moodBefore}));
  return <div><ResponsiveContainer width="100%" height={100}><BarChart data={weekly} margin={{top:0,right:0,bottom:0,left:-20}}><XAxis dataKey="day" tick={{fontSize:10,fill:t.sub}}/><YAxis tick={{fontSize:10,fill:t.sub}}/><Tooltip content={<CTooltip t={t}/>}/><Bar dataKey="mins" fill={t.accent} radius={[4,4,0,0]} name="Minutes"/></BarChart></ResponsiveContainer>{moodShift.length>2&&<><div style={{marginTop:12,marginBottom:8,color:t.sub,fontSize:12,fontWeight:600}}>MOOD SHIFT PER SESSION</div><ResponsiveContainer width="100%" height={90}><BarChart data={moodShift} margin={{top:0,right:0,bottom:0,left:-20}}><XAxis dataKey="session" tick={{fontSize:9,fill:t.sub}}/><YAxis tick={{fontSize:10,fill:t.sub}} domain={[-3,5]}/><Tooltip content={<CTooltip t={t}/>}/><Bar dataKey="shift" name="Mood shift" radius={[4,4,0,0]}>{moodShift.map((e,i)=><Cell key={i} fill={e.shift>=0?"#7aaa7a":"#e87070"}/>)}</Bar></BarChart></ResponsiveContainer></>}</div>;
}

function YogaChart({t,studies}) {
  const byTopic=studies.reduce((acc,e)=>{if(!acc[e.topic])acc[e.topic]=0;acc[e.topic]+=Number(e.hours||0);return acc;},{});
  const chartData=Object.entries(byTopic).map(([topic,hours])=>({topic:topic.slice(0,8),hours:Math.round(hours*10)/10}));
  const cumulative=[];let running=0;studies.slice().sort((a,b)=>a.id-b.id).forEach(e=>{running+=Number(e.hours||0);cumulative.push({date:e.date?.split("/")[0]+"/"+e.date?.split("/")[1],total:Math.round(running*10)/10});});
  return <div>{chartData.length>0&&<><div style={{marginBottom:8,color:t.sub,fontSize:12,fontWeight:600}}>HOURS BY TOPIC</div><ResponsiveContainer width="100%" height={100}><BarChart data={chartData} margin={{top:0,right:0,bottom:0,left:-20}}><XAxis dataKey="topic" tick={{fontSize:9,fill:t.sub}}/><YAxis tick={{fontSize:10,fill:t.sub}}/><Tooltip content={<CTooltip t={t}/>}/><Bar dataKey="hours" fill={t.accent} radius={[4,4,0,0]} name="Hours"/></BarChart></ResponsiveContainer></>}{cumulative.length>2&&<><div style={{marginTop:12,marginBottom:8,color:t.sub,fontSize:12,fontWeight:600}}>CUMULATIVE STUDY HOURS → 100hr GOAL</div><ResponsiveContainer width="100%" height={100}><AreaChart data={cumulative} margin={{top:0,right:0,bottom:0,left:-20}}><defs><linearGradient id="yg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={t.accent} stopOpacity={0.4}/><stop offset="95%" stopColor={t.accent} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={t.border}/><XAxis dataKey="date" tick={{fontSize:9,fill:t.sub}}/><YAxis tick={{fontSize:10,fill:t.sub}} domain={[0,100]}/><Tooltip content={<CTooltip t={t}/>}/><Area type="monotone" dataKey="total" stroke={t.accent} fill="url(#yg)" name="Total hrs" strokeWidth={2}/></AreaChart></ResponsiveContainer></>}</div>;
}

// ── SEARCH LOGS ────────────────────────────────────────────────────────────
function SearchLogs({t,allData}) {
  const [query,setQuery]=useState("");
  const [filter,setFilter]=useState("all");
  const [results,setResults]=useState([]);

  const SOURCES=[
    {key:"fitness",label:"💪 Fitness",fields:["exercise","notes","type"]},
    {key:"nutrition",label:"🥗 Nutrition",fields:["food","meal","notes"]},
    {key:"moods",label:"✨ Mood",fields:["notes","emotions"]},
    {key:"sleep",label:"😴 Sleep",fields:["notes","bedtime"]},
    {key:"meditation",label:"🧘 Meditation",fields:["type","notes"]},
    {key:"journal",label:"📓 Journal",fields:["text"]},
    {key:"cycle",label:"🌸 Cycle",fields:["phase","symptoms","notes"]},
    {key:"yogaPractice",label:"🕉️ Yoga Practice",fields:["style","sequence","notes"]},
    {key:"yogaStudy",label:"📚 Yoga Study",fields:["topic","subtopic","notes"]},
    {key:"yogaTeach",label:"👩‍🏫 Teaching",fields:["theme","wentWell","improve","notes"]},
    {key:"chores",label:"🏠 Chores",fields:["title","category"]},
    {key:"hydration",label:"💧 Hydration",fields:["notes"]},
  ];

  useEffect(()=>{
    if(query.trim().length<2){setResults([]);return;}
    const q=query.toLowerCase();
    const found=[];
    const sources=filter==="all"?SOURCES:SOURCES.filter(s=>s.key===filter);
    sources.forEach(src=>{
      const arr=allData[src.key]||[];
      arr.forEach(entry=>{
        const matches=src.fields.some(f=>{
          const v=entry[f];
          if(Array.isArray(v)) return v.some(x=>String(x).toLowerCase().includes(q));
          return v&&String(v).toLowerCase().includes(q);
        });
        if(matches) found.push({...entry,_source:src.key,_label:src.label});
      });
    });
    found.sort((a,b)=>(b.date||"").localeCompare(a.date||""));
    setResults(found);
  },[query,filter,allData]);

  const highlight=(text,q)=>{
    if(!text||!q) return text;
    const parts=String(text).split(new RegExp(`(${q})`,`gi`));
    return parts.map((p,i)=>p.toLowerCase()===q.toLowerCase()?<mark key={i} style={{background:t.accent+"44",color:t.text,borderRadius:3,padding:"0 2px"}}>{p}</mark>:p);
  };

  const renderEntry=(e,i)=>{
    const q=query.toLowerCase();
    const preview=e.text||e.exercise||e.food||e.topic||e.title||e.theme||e.type||e.phase||"Entry";
    const detail=e.notes||e.subtopic||e.sequence||"";
    return <div key={i} style={{borderLeft:`3px solid ${t.accent}`,paddingLeft:12,marginBottom:12,paddingBottom:12,borderBottom:`1px solid ${t.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{background:t.accent2+"44",color:t.text,borderRadius:20,padding:"2px 10px",fontSize:11}}>{e._label}</span>
        <span style={{color:t.sub,fontSize:12}}>{e.date}</span>
      </div>
      <div style={{color:t.text,fontSize:14,fontWeight:600}}>{highlight(preview,q)}</div>
      {detail&&<div style={{color:t.sub,fontSize:13,marginTop:2}}>{highlight(detail.slice(0,120),q)}{detail.length>120?"...":""}</div>}
      {e.calories&&<div style={{color:t.sub,fontSize:12}}>🔥 {e.calories} kcal {e.protein&&`· P: ${e.protein}g`}</div>}
      {e.hours&&e._source==="sleep"&&<div style={{color:t.sub,fontSize:12}}>😴 {e.hours}h · Quality {e.quality}/10</div>}
      {e.sets&&<div style={{color:t.sub,fontSize:12}}>{e.sets}×{e.reps} {e.weight&&`@ ${e.weight}kg`} {e.kneePain>0&&`· Knee ${e.kneePain}/10`}</div>}
      {e.mood&&<div style={{color:t.sub,fontSize:12}}>😊 {e.mood}/10 · ⚡{e.energy}/10</div>}
      {e.glasses&&<div style={{color:t.sub,fontSize:12}}>💧 {e.glasses}/{e.target} glasses</div>}
      {Array.isArray(e.symptoms)&&e.symptoms.length>0&&<div style={{color:t.sub,fontSize:12}}>{e.symptoms.join(", ")}</div>}
      {Array.isArray(e.emotions)&&e.emotions.length>0&&<div style={{color:t.sub,fontSize:12}}>{e.emotions.join(", ")}</div>}
    </div>;
  };

  return <div>
    <SHdr t={t} title="🔍 Search Logs" sub="Search across everything you've ever logged"/>
    <Card t={t}>
      <Input t={t} value={query} onChange={setQuery} placeholder="Search anything — food, exercises, feelings, symptoms, topics..."/>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:10}}>
        <span onClick={()=>setFilter("all")} style={{background:filter==="all"?t.accent:t.border,color:filter==="all"?"#fff":t.sub,borderRadius:20,padding:"4px 12px",fontSize:12,cursor:"pointer"}}>All</span>
        {SOURCES.map(s=><span key={s.key} onClick={()=>setFilter(s.key)} style={{background:filter===s.key?t.accent:t.border,color:filter===s.key?"#fff":t.sub,borderRadius:20,padding:"4px 12px",fontSize:12,cursor:"pointer"}}>{s.label}</span>)}
      </div>
    </Card>
    {query.length>1&&<Card t={t}>
      <div style={{color:t.sub,fontSize:13,marginBottom:12}}>{results.length} result{results.length!==1?"s":""} for "<strong>{query}</strong>"</div>
      {results.length===0?<div style={{color:t.sub,textAlign:"center",padding:20}}>Nothing found. Try different keywords.</div>:results.map(renderEntry)}
    </Card>}
    {query.length===0&&<Card t={t} style={{textAlign:"center",padding:30}}>
      <div style={{fontSize:40,marginBottom:12}}>🔍</div>
      <div style={{color:t.sub,fontSize:14,lineHeight:1.8}}>Search across all your logs — fitness sessions, meals, mood entries, journal, yoga studies, symptoms, anything.</div>
      <div style={{marginTop:12,display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>
        {["knee pain","besan","luteal","hip thrust","grateful","shiitake","vinyasa"].map(s=><span key={s} onClick={()=>setQuery(s)} style={{background:t.accent2+"44",color:t.text,borderRadius:20,padding:"6px 14px",fontSize:13,cursor:"pointer",border:`1px solid ${t.border}`}}>{s}</span>)}
      </div>
    </Card>}
  </div>;
}

// ── Dashboard ──────────────────────────────────────────────────────────────
function Dashboard({t,allData,setAllData,setModule}) {
  const today=new Date().toLocaleDateString("en-GB");
  const todayMood=allData.moods?.find(m=>m.date===today);
  const totalCals=(allData.nutrition||[]).filter(n=>n.date===today).reduce((s,n)=>s+(Number(n.calories)||0),0);
  const todayFitness=(allData.fitness||[]).filter(f=>f.date===today);
  const todaySleep=allData.sleep?.find(s=>s.date===today);
  const todayH=(allData.hydration||[]).find(h=>h.date===today);
  const activeGoals=(allData.goals||[]).filter(g=>!g.completed);
  const hour=new Date().getHours();
  const greeting=hour<12?"morning 🌅":hour<17?"afternoon 🌿":"evening 🌙";
  const calorieGoal=allData.settings?.calorieGoal||1850;
  return <div>
    <SHdr t={t} title={`Good ${greeting}`} sub={new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}/>
    <WellnessScore t={t} allData={allData}/>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
      <MCard t={t} icon="🔥" label="Calories" value={totalCals||"—"} unit={`/ ${calorieGoal}`}/>
      <MCard t={t} icon="💪" label="Workouts" value={todayFitness.length||0} unit="today"/>
      <MCard t={t} icon="💧" label="Water" value={todayH?.glasses||0} unit={`/ ${todayH?.target||8} gl`} color="#5aa0c0"/>
      <MCard t={t} icon="😴" label="Sleep" value={todaySleep?.hours||"—"} unit="hrs"/>
      <MCard t={t} icon="✨" label="Mood" value={todayMood?.mood||"—"} unit="/10" color={t.accent2}/>
    </div>
    {todayMood&&<Card t={t}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontWeight:700,color:t.text}}>Today's Check-in</div><div style={{color:t.sub,fontSize:13}}>Mood {todayMood.mood}/10 · Energy {todayMood.energy}/10 {todayMood.emotions?.length>0&&`· ${todayMood.emotions.slice(0,2).join(", ")}`}</div></div><div style={{fontSize:28}}>{todayMood.mood>=7?"😊":todayMood.mood>=4?"😐":"😔"}</div></div></Card>}
    {(allData.moods||[]).length>2&&<Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:12}}>Mood & Energy — Last 14 Days</div><MoodChart t={t} data={allData.moods||[]}/></Card>}
    {(allData.nutrition||[]).length>0&&<Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:12}}>Nutrition Overview</div><NutritionChart t={t} data={allData.nutrition||[]} goal={calorieGoal}/></Card>}
    {activeGoals.length>0&&<Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:12}}>Active Goals</div>{activeGoals.slice(0,3).map(g=><div key={g.id} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:t.text,fontSize:14}}>{g.icon} {g.title}</span><span style={{color:t.accent,fontSize:13,fontWeight:600}}>{g.progress||0}%</span></div><PBar t={t} value={g.progress||0} max={100}/></div>)}<div onClick={()=>setModule("goals")} style={{color:t.accent,fontSize:13,marginTop:8,cursor:"pointer",fontWeight:600}}>View all →</div></Card>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      {[{id:"fitness",icon:"💪",label:"Fitness"},{id:"nutrition",icon:"🥗",label:"Nutrition"},{id:"hydration",icon:"💧",label:"Hydration"},{id:"style",icon:"👗",label:"Style"},{id:"yoga",icon:"🕉️",label:"Yoga"},{id:"ai",icon:"🌸",label:"Ask AI"}].map(m=>(
        <div key={m.id} onClick={()=>setModule(m.id)} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:16,cursor:"pointer",transition:"transform 0.15s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
          <div style={{fontSize:24}}>{m.icon}</div><div style={{fontWeight:600,color:t.text,fontSize:14,marginTop:6}}>{m.label}</div>
        </div>
      ))}
    </div>
  </div>;
}

// ── Fitness ────────────────────────────────────────────────────────────────
function Fitness({t,allData,setAllData}) {
  const [view,setView]=useState("log");
  const [form,setForm]=useState({exercise:"",sets:"",reps:"",weight:"",duration:"",type:"strength",notes:"",kneePain:0});
  const [editId,setEditId]=useState(null);
  const sessions=allData.fitness||[]; const today=new Date().toLocaleDateString("en-GB");
  const todaySessions=sessions.filter(s=>s.date===today);
  const addSession=async()=>{
    if(!form.exercise) return;
    let updated;
    if(editId){updated=sessions.map(s=>s.id===editId?{...form,date:s.date,id:editId,time:s.time}:s);setEditId(null);}
    else{updated=[...sessions,{...form,date:today,id:Date.now(),time:new Date().toLocaleTimeString()}];}
    setAllData(p=>({...p,fitness:updated}));await sv("fitness",updated);
    setForm({exercise:"",sets:"",reps:"",weight:"",duration:"",type:"strength",notes:"",kneePain:0});
  };
  const deleteEntry=async(id)=>{const u=sessions.filter(s=>s.id!==id);setAllData(p=>({...p,fitness:u}));await sv("fitness",u);};
  const editEntry=(s)=>{setForm({exercise:s.exercise,sets:s.sets,reps:s.reps,weight:s.weight,duration:s.duration,type:s.type,notes:s.notes,kneePain:s.kneePain||0});setEditId(s.id);setView("log");};
  const prs={}; sessions.filter(s=>s.type==="strength"&&s.weight).forEach(s=>{if(!prs[s.exercise]||Number(s.weight)>prs[s.exercise])prs[s.exercise]=Number(s.weight);});
  const thisWeek=sessions.filter(s=>{try{const[d,m,y]=s.date.split("/");return(new Date()-new Date(`${y}-${m}-${d}`))<7*86400000;}catch{return false;}}).length;
  return <div>
    <SHdr t={t} title="💪 Fitness" sub="Log sessions · Track PRs · Protect your knee"/>
    <MoodCheckin t={t} allData={allData} setAllData={setAllData} compact/>
    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
      {["log","history","charts"].map(v=><Btn key={v} t={t} secondary={view!==v} small onClick={()=>setView(v)}>{v.charAt(0).toUpperCase()+v.slice(1)}</Btn>)}
    </div>
    {view==="log"&&<Card t={t}>
      <div style={{fontWeight:700,color:t.text,marginBottom:12}}>{editId?"✏️ Edit Exercise":"Log Exercise"}</div>
      <div style={{display:"grid",gap:10}}>
        <Input t={t} value={form.exercise} onChange={v=>setForm(p=>({...p,exercise:v}))} placeholder="Exercise name"/>
        <Sel t={t} value={form.type} onChange={v=>setForm(p=>({...p,type:v}))} options={["strength","cardio","hiit","flexibility","yoga","other"].map(x=>({value:x,label:x.charAt(0).toUpperCase()+x.slice(1)}))}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          <Input t={t} value={form.sets} onChange={v=>setForm(p=>({...p,sets:v}))} placeholder="Sets" type="number"/>
          <Input t={t} value={form.reps} onChange={v=>setForm(p=>({...p,reps:v}))} placeholder="Reps" type="number"/>
          <Input t={t} value={form.weight} onChange={v=>setForm(p=>({...p,weight:v}))} placeholder="kg" type="number"/>
        </div>
        <Input t={t} value={form.duration} onChange={v=>setForm(p=>({...p,duration:v}))} placeholder="Duration (mins)" type="number"/>
        <div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:t.sub,fontSize:13}}>🦵 Knee pain</span><span style={{color:form.kneePain>5?"#e87070":t.accent,fontWeight:700}}>{form.kneePain}/10</span></div><input type="range" min={0} max={10} value={form.kneePain} onChange={e=>setForm(p=>({...p,kneePain:Number(e.target.value)}))} style={{width:"100%",accentColor:form.kneePain>5?"#e87070":t.accent}/>{form.kneePain>6&&<div style={{color:"#e87070",fontSize:12,marginTop:4}}>⚠️ High knee pain — consider upper body only today.</div>}</div>
        <TA t={t} value={form.notes} onChange={v=>setForm(p=>({...p,notes:v}))} placeholder="How did it feel?" rows={2}/>
        <div style={{display:"flex",gap:8}}><Btn t={t} onClick={addSession} style={{flex:1}}>{editId?"Update":"Add Exercise"}</Btn>{editId&&<Btn t={t} secondary onClick={()=>{setEditId(null);setForm({exercise:"",sets:"",reps:"",weight:"",duration:"",type:"strength",notes:"",kneePain:0});}}>Cancel</Btn>}</div>
      </div>
      {todaySessions.length>0&&<div style={{marginTop:16}}><div style={{fontWeight:600,color:t.sub,fontSize:13,marginBottom:8}}>TODAY'S SESSION</div>{todaySessions.map(s=><div key={s.id} style={{background:t.bg,borderRadius:10,padding:12,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{fontWeight:600,color:t.text}}>{s.exercise}</div><div style={{color:t.sub,fontSize:13}}>{s.sets&&`${s.sets}×${s.reps}`} {s.weight&&`@ ${s.weight}kg`} {s.duration&&`· ${s.duration}min`}</div>{s.kneePain>0&&<div style={{color:s.kneePain>5?"#e87070":t.sub,fontSize:12}}>Knee: {s.kneePain}/10</div>}</div><div style={{display:"flex",gap:6}}><span onClick={()=>editEntry(s)} style={{cursor:"pointer",fontSize:14}}>✏️</span><span onClick={()=>deleteEntry(s.id)} style={{cursor:"pointer",fontSize:14}}>🗑️</span></div></div>)}</div>}
    </Card>}
    {view==="history"&&<div>{sessions.length===0?<Card t={t}><div style={{color:t.sub}}>No sessions yet.</div></Card>:[...new Set(sessions.map(s=>s.date))].sort((a,b)=>b.localeCompare(a)).map(date=><Card t={t} key={date}><div style={{fontWeight:700,color:t.text,marginBottom:8}}>{date}</div>{sessions.filter(s=>s.date===date).map(s=><div key={s.id} style={{borderLeft:`3px solid ${t.accent}`,paddingLeft:10,marginBottom:8,display:"flex",justifyContent:"space-between"}}><div><div style={{fontWeight:600,color:t.text}}>{s.exercise}</div><div style={{color:t.sub,fontSize:13}}>{s.sets&&`${s.sets}×${s.reps}`} {s.weight&&`@ ${s.weight}kg`}</div></div><div style={{display:"flex",gap:6}}><span onClick={()=>editEntry(s)} style={{cursor:"pointer",fontSize:13}}>✏️</span><span onClick={()=>deleteEntry(s.id)} style={{cursor:"pointer",fontSize:13}}>🗑️</span></div></div>)}</Card>)}</div>}
    {view==="charts"&&<div><div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}><MCard t={t} icon="🏋️" label="Total" value={sessions.length} unit="sessions"/><MCard t={t} icon="📅" label="This week" value={thisWeek} unit="sessions"/></div>{Object.keys(prs).length>0&&<Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:12}}>🏆 Personal Records</div>{Object.entries(prs).map(([ex,w])=><div key={ex} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${t.border}`}}><span style={{color:t.text}}>{ex}</span><span style={{color:t.accent,fontWeight:700}}>{w}kg</span></div>)}</Card>}<Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:12}}>📊 Charts</div><FitnessChart t={t} data={sessions}/></Card></div>}
  </div>;
}

// ── Nutrition ──────────────────────────────────────────────────────────────
function Nutrition({t,allData,setAllData}) {
  const [view,setView]=useState("log");
  const [form,setForm]=useState({food:"",calories:"",protein:"",carbs:"",fats:"",meal:"breakfast",notes:""});
  const [editId,setEditId]=useState(null);
  const [aiA,setAiA]=useState(""); const [analyzing,setAnalyzing]=useState(false); const [imgData,setImgData]=useState(null);
  const fileRef=useRef();
  const entries=allData.nutrition||[]; const today=new Date().toLocaleDateString("en-GB");
  const todayE=entries.filter(e=>e.date===today);
  const totalCals=todayE.reduce((s,e)=>s+(Number(e.calories)||0),0);
  const totalP=todayE.reduce((s,e)=>s+(Number(e.protein)||0),0);
  const calorieGoal=allData.settings?.calorieGoal||1850;
  const handlePhoto=async(e)=>{const file=e.target.files[0];if(!file)return;setAnalyzing(true);setAiA("");const reader=new FileReader();reader.onload=async()=>{const b64=reader.result.split(",")[1];setImgData(reader.result);try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:file.type,data:b64}},{type:"text",text:"Analyze this food. Return ONLY JSON: {food,calories,protein,carbs,fats}. No markdown."}]}]})});const data=await res.json();const txt=data.content?.map(c=>c.text||"").join("").replace(/```json|```/g,"").trim();const parsed=JSON.parse(txt);setForm(p=>({...p,...parsed}));setAiA(`✅ ${parsed.food} · ~${parsed.calories} kcal · ${parsed.protein}g protein`);}catch{setAiA("Could not analyze — fill in manually.");}setAnalyzing(false);};reader.readAsDataURL(file);};
  const addEntry=async()=>{if(!form.food)return;let updated;if(editId){updated=entries.map(e=>e.id===editId?{...form,date:e.date,id:editId}:e);setEditId(null);}else{updated=[...entries,{...form,date:today,id:Date.now()}];}setAllData(p=>({...p,nutrition:updated}));await sv("nutrition",updated);setForm({food:"",calories:"",protein:"",carbs:"",fats:"",meal:"breakfast",notes:""});setAiA("");setImgData(null);};
  const deleteE=async(id)=>{const u=entries.filter(e=>e.id!==id);setAllData(p=>({...p,nutrition:u}));await sv("nutrition",u);};
  const editE=(e)=>{setForm({food:e.food,calories:e.calories,protein:e.protein,carbs:e.carbs,fats:e.fats,meal:e.meal,notes:e.notes||""});setEditId(e.id);setView("log");};
  return <div>
    <SHdr t={t} title="🥗 Nutrition" sub="Real food · No supplements · Culturally rich"/>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
      <MCard t={t} icon="🔥" label="Calories" value={totalCals} unit={`/ ${calorieGoal}`}/>
      <MCard t={t} icon="🥩" label="Protein" value={`${totalP}g`} unit="/ 125g"/>
      <MCard t={t} icon="📊" label="Left" value={calorieGoal-totalCals} unit="kcal" color={calorieGoal-totalCals<0?"#e87070":t.accent}/>
    </div>
    <PBar t={t} value={totalCals} max={calorieGoal} color={totalCals>calorieGoal?"#e87070":t.accent}/>
    <div style={{marginBottom:16}}/>
    <div style={{display:"flex",gap:8,marginBottom:16}}>{["log","history","charts"].map(v=><Btn key={v} t={t} secondary={view!==v} small onClick={()=>setView(v)}>{v.charAt(0).toUpperCase()+v.slice(1)}</Btn>)}</div>
    {view==="log"&&<Card t={t}>
      <div style={{fontWeight:700,color:t.text,marginBottom:12}}>{editId?"✏️ Edit Entry":"Log Food"}</div>
      <div style={{background:t.bg,border:`2px dashed ${t.border}`,borderRadius:12,padding:16,textAlign:"center",marginBottom:12,cursor:"pointer"}} onClick={()=>fileRef.current.click()}>
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
        {imgData?<img src={imgData} style={{maxHeight:120,borderRadius:8,objectFit:"cover"}} alt="food"/>:<div style={{color:t.sub}}>📸 Upload photo for AI analysis</div>}
      </div>
      {analyzing&&<div style={{color:t.accent,fontSize:13,marginBottom:8}}>🌸 Analysing...</div>}
      {aiA&&<div style={{color:t.sub,fontSize:13,background:t.accent2+"33",padding:10,borderRadius:8,marginBottom:10}}>{aiA}</div>}
      <div style={{display:"grid",gap:10}}>
        <Input t={t} value={form.food} onChange={v=>setForm(p=>({...p,food:v}))} placeholder="Food name"/>
        <Sel t={t} value={form.meal} onChange={v=>setForm(p=>({...p,meal:v}))} options={["breakfast","lunch","dinner","snack","pre-workout","post-workout"].map(x=>({value:x,label:x.charAt(0).toUpperCase()+x.slice(1)}))}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <Input t={t} value={form.calories} onChange={v=>setForm(p=>({...p,calories:v}))} placeholder="Calories" type="number"/>
          <Input t={t} value={form.protein} onChange={v=>setForm(p=>({...p,protein:v}))} placeholder="Protein (g)" type="number"/>
          <Input t={t} value={form.carbs} onChange={v=>setForm(p=>({...p,carbs:v}))} placeholder="Carbs (g)" type="number"/>
          <Input t={t} value={form.fats} onChange={v=>setForm(p=>({...p,fats:v}))} placeholder="Fats (g)" type="number"/>
        </div>
        <div style={{display:"flex",gap:8}}><Btn t={t} onClick={addEntry} style={{flex:1}}>{editId?"Update":"Add"}</Btn>{editId&&<Btn t={t} secondary onClick={()=>{setEditId(null);setForm({food:"",calories:"",protein:"",carbs:"",fats:"",meal:"breakfast",notes:""});}}>Cancel</Btn>}</div>
      </div>
      {todayE.length>0&&<div style={{marginTop:16}}><div style={{fontWeight:600,color:t.sub,fontSize:13,marginBottom:8}}>TODAY</div>{todayE.map(e=><div key={e.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${t.border}`}}><div><div style={{color:t.text,fontSize:14}}>{e.food}</div><div style={{color:t.sub,fontSize:12}}>{e.meal}</div></div><div style={{display:"flex",gap:10,alignItems:"center"}}><div style={{textAlign:"right"}}><div style={{color:t.accent,fontWeight:700}}>{e.calories} kcal</div><div style={{color:t.sub,fontSize:12}}>{e.protein&&`P:${e.protein}g`}</div></div><span onClick={()=>editE(e)} style={{cursor:"pointer",fontSize:13}}>✏️</span><span onClick={()=>deleteE(e.id)} style={{cursor:"pointer",fontSize:13}}>🗑️</span></div></div>)}</div>}
    </Card>}
    {view==="history"&&<div>{[...new Set(entries.map(e=>e.date))].sort((a,b)=>b.localeCompare(a)).slice(0,14).map(date=>{const de=entries.filter(e=>e.date===date);const dc=de.reduce((s,e)=>s+(Number(e.calories)||0),0);return<Card t={t} key={date}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div style={{fontWeight:700,color:t.text}}>{date}</div><div style={{color:dc>calorieGoal?"#e87070":t.accent,fontWeight:700}}>{dc} kcal</div></div>{de.map(e=><div key={e.id} style={{color:t.sub,fontSize:13,display:"flex",justifyContent:"space-between",padding:"3px 0"}}>• {e.food} ({e.calories} kcal)</div>)}</Card>;})}</div>}
    {view==="charts"&&<Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:12}}>📊 Nutrition Charts</div><NutritionChart t={t} data={entries} goal={calorieGoal}/></Card>}
  </div>;
}

// ── Hydration ──────────────────────────────────────────────────────────────
function Hydration({t,allData,setAllData}) {
  const today=new Date().toLocaleDateString("en-GB");
  const logs=allData.hydration||[];
  const todayLog=logs.find(l=>l.date===today)||{date:today,glasses:0,target:8};
  const [glasses,setGlasses]=useState(todayLog.glasses);
  const [target,setTarget]=useState(todayLog.target||8);
  const pct=Math.min(100,Math.round((glasses/target)*100));
  const EMOJIS=["😵","😟","😐","🙂","😊","💧","✨","🌊","💦","🌟"];
  const update=async(g)=>{const entry={date:today,glasses:g,target};const u=[...logs.filter(l=>l.date!==today),entry];setAllData(p=>({...p,hydration:u}));await sv("hydration",u);};
  const add=async(n=1)=>{const ng=Math.max(0,glasses+n);setGlasses(ng);await update(ng);};
  const weekData=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i);const ds=d.toLocaleDateString("en-GB");const l=logs.find(x=>x.date===ds);return{day:d.toLocaleDateString("en-GB",{weekday:"short"}),glasses:l?.glasses||0,target:l?.target||8,hit:l&&l.glasses>=(l.target||8)?1:0};}).reverse();
  return <div>
    <SHdr t={t} title="💧 Hydration" sub="Water is medicine — track it with love"/>
    <Card t={t}>
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:52}}>{EMOJIS[Math.min(glasses,9)]}</div>
        <div style={{fontSize:34,fontWeight:700,color:t.accent,marginTop:8}}>{glasses} <span style={{fontSize:16,color:t.sub}}>/ {target} glasses</span></div>
        <div style={{color:t.sub,fontSize:13,marginTop:4}}>{glasses*250}ml · {pct}% of daily goal</div>
      </div>
      <PBar t={t} value={glasses} max={target} color={pct>=100?"#7aaa7a":pct>=50?t.accent:"#e8a0a0"} h={12}/>
      <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:20}}>
        <Btn t={t} secondary onClick={()=>add(-1)} style={{fontSize:20,padding:"8px 20px"}}>−</Btn>
        <Btn t={t} onClick={()=>add(1)} style={{fontSize:18,padding:"10px 28px"}}>+ 💧</Btn>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12,flexWrap:"wrap"}}>
        {[2,3].map(n=><span key={n} onClick={()=>add(n)} style={{background:t.accent2+"44",color:t.text,borderRadius:20,padding:"5px 14px",fontSize:13,cursor:"pointer"}}>+{n} glasses</span>)}
      </div>
    </Card>
    <Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:12}}>Today's glasses</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{Array.from({length:target},(_,i)=><div key={i} onClick={()=>{const ng=i<glasses?i:i+1;setGlasses(ng);update(ng);}} style={{width:34,height:34,borderRadius:"50%",background:i<glasses?t.accent:t.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,cursor:"pointer",transition:"all 0.2s"}}>{i<glasses?"💧":"○"}</div>)}</div></Card>
    <Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:4}}>Daily target: {target} glasses ({target*250}ml)</div><input type="range" min={4} max={16} value={target} onChange={e=>{setTarget(Number(e.target.value));update(glasses);}} style={{width:"100%",accentColor:t.accent,marginBottom:12}}/><div style={{fontWeight:700,color:t.text,marginBottom:8}}>This week</div><HydrationChart t={t} data={logs}/></Card>
  </div>;
}

// ── Cycle ──────────────────────────────────────────────────────────────────
function Cycle({t,allData,setAllData}) {
  const [view,setView]=useState("log");
  const [form,setForm]=useState({date:new Date().toLocaleDateString("en-GB"),phase:"",flow:"",symptoms:[],notes:""});
  const entries=allData.cycle||[];
  const PHASES=["Menstrual","Follicular","Ovulation","Luteal"]; const FLOWS=["Light","Medium","Heavy","Spotting","None"];
  const SYMPTOMS=["Cramps","Bloating","Headache","Fatigue","Mood swings","Acne","Tender breasts","Back pain","Nausea","Cravings"];
  const save_=async()=>{const u=[...entries.filter(e=>e.date!==form.date),{...form,id:Date.now()}];setAllData(p=>({...p,cycle:u}));await sv("cycle",u);};
  const phaseColors={"Menstrual":"#e87070","Follicular":"#7aaa7a","Ovulation":"#f4c24c","Luteal":"#9b87d0"};
  const cycleChart=entries.slice(-14).map(e=>({day:e.date?.split("/")[0]+"/"+e.date?.split("/")[1],phase:e.phase,flow:e.flow==="Heavy"?3:e.flow==="Medium"?2:e.flow==="Light"?1:0}));
  return <div>
    <SHdr t={t} title="🌸 Cycle" sub="Track phases · Symptoms · Patterns"/>
    <MoodCheckin t={t} allData={allData} setAllData={setAllData} compact/>
    <div style={{display:"flex",gap:8,marginBottom:16}}>{["log","history","insights"].map(v=><Btn key={v} t={t} secondary={view!==v} small onClick={()=>setView(v)}>{v.charAt(0).toUpperCase()+v.slice(1)}</Btn>)}</div>
    {view==="log"&&<Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:12}}>Log Today</div><div style={{display:"grid",gap:10}}><Sel t={t} value={form.phase} onChange={v=>setForm(p=>({...p,phase:v}))} options={[{value:"",label:"Phase..."},...PHASES.map(x=>({value:x,label:x}))]}/><Sel t={t} value={form.flow} onChange={v=>setForm(p=>({...p,flow:v}))} options={[{value:"",label:"Flow..."},...FLOWS.map(x=>({value:x,label:x}))]}/><div style={{display:"flex",flexWrap:"wrap"}}>{SYMPTOMS.map(s=><span key={s} onClick={()=>setForm(p=>({...p,symptoms:p.symptoms.includes(s)?p.symptoms.filter(x=>x!==s):[...p.symptoms,s]}))} style={{background:form.symptoms.includes(s)?t.accent:t.border,color:form.symptoms.includes(s)?"#fff":t.sub,borderRadius:20,padding:"4px 10px",fontSize:12,margin:"2px",cursor:"pointer"}}>{s}</span>)}</div><TA t={t} value={form.notes} onChange={v=>setForm(p=>({...p,notes:v}))} placeholder="Notes..." rows={2}/><Btn t={t} onClick={save_}>Save</Btn></div></Card>}
    {view==="history"&&<div>{entries.length===0?<Card t={t}><div style={{color:t.sub}}>No entries yet.</div></Card>:entries.sort((a,b)=>b.date.localeCompare(a.date)).map(e=><Card t={t} key={e.id}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontWeight:600,color:t.text}}>{e.date}</div><span style={{background:phaseColors[e.phase]||t.accent,color:"#fff",borderRadius:20,padding:"2px 10px",fontSize:12}}>{e.phase}</span></div><div style={{color:t.sub,fontSize:13,marginTop:4}}>{e.flow&&`Flow: ${e.flow}`}{e.symptoms.length>0&&` · ${e.symptoms.join(", ")}`}</div>{e.notes&&<div style={{color:t.sub,fontSize:12,marginTop:4}}>{e.notes}</div>}</Card>)}</div>}
    {view==="insights"&&<Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:12}}>Phase Timeline</div>{cycleChart.length<2?<div style={{color:t.sub}}>Log more days to see patterns.</div>:<div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{cycleChart.map((d,i)=><div key={i} style={{textAlign:"center",flex:1,minWidth:30}}><div style={{height:40,background:phaseColors[d.phase]||t.border,borderRadius:8,marginBottom:4,opacity:0.8}}/><div style={{fontSize:9,color:t.sub}}>{d.day}</div></div>)}</div>}</Card>}
  </div>;
}

// ── Sleep ──────────────────────────────────────────────────────────────────
function Sleep({t,allData,setAllData}) {
  const [view,setView]=useState("log");
  const [form,setForm]=useState({date:new Date().toLocaleDateString("en-GB"),hours:"",quality:5,bedtime:"",wakeup:"",notes:""});
  const [editId,setEditId]=useState(null);
  const entries=allData.sleep||[]; const avg=entries.length?(entries.reduce((s,e)=>s+Number(e.hours||0),0)/entries.length).toFixed(1):"—";
  const save_=async()=>{if(!form.hours)return;let u;if(editId){u=entries.map(e=>e.id===editId?{...form,id:editId}:e);setEditId(null);}else{u=[...entries.filter(e=>e.date!==form.date),{...form,id:Date.now()}];}setAllData(p=>({...p,sleep:u}));await sv("sleep",u);};
  const del=async(id)=>{const u=entries.filter(e=>e.id!==id);setAllData(p=>({...p,sleep:u}));await sv("sleep",u);};
  return <div>
    <SHdr t={t} title="😴 Sleep" sub="Rest · Recovery · Restore"/>
    <div style={{display:"flex",gap:10,marginBottom:16}}><MCard t={t} icon="⏰" label="Avg" value={avg} unit="hrs/night"/><MCard t={t} icon="📅" label="Logged" value={entries.length} unit="nights"/></div>
    <div style={{display:"flex",gap:8,marginBottom:16}}>{["log","history","charts"].map(v=><Btn key={v} t={t} secondary={view!==v} small onClick={()=>setView(v)}>{v.charAt(0).toUpperCase()+v.slice(1)}</Btn>)}</div>
    {view==="log"&&<Card t={t}><div style={{display:"grid",gap:10}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><Input t={t} value={form.bedtime} onChange={v=>setForm(p=>({...p,bedtime:v}))} placeholder="Bedtime"/><Input t={t} value={form.wakeup} onChange={v=>setForm(p=>({...p,wakeup:v}))} placeholder="Wake up"/></div><Input t={t} value={form.hours} onChange={v=>setForm(p=>({...p,hours:v}))} placeholder="Hours slept" type="number"/><MSlider t={t} label="Sleep Quality" value={form.quality} onChange={v=>setForm(p=>({...p,quality:v}))}/><TA t={t} value={form.notes} onChange={v=>setForm(p=>({...p,notes:v}))} placeholder="Notes..." rows={2}/><Btn t={t} onClick={save_}>{editId?"Update":"Save"}</Btn></div></Card>}
    {view==="history"&&<div>{entries.sort((a,b)=>b.date.localeCompare(a.date)).map(e=><Card t={t} key={e.id}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{color:t.text,fontWeight:600}}>{e.date}</div><div style={{color:t.sub,fontSize:12}}>{e.bedtime&&`${e.bedtime} → ${e.wakeup}`}</div>{e.notes&&<div style={{color:t.sub,fontSize:12,marginTop:2}}>{e.notes}</div>}</div><div style={{display:"flex",gap:8,alignItems:"center"}}><div style={{textAlign:"right"}}><div style={{color:t.accent,fontWeight:700,fontSize:18}}>{e.hours}h</div><div style={{color:t.sub,fontSize:12}}>Q:{e.quality}/10</div></div><span onClick={()=>del(e.id)} style={{cursor:"pointer",fontSize:13}}>🗑️</span></div></div></Card>)}</div>}
    {view==="charts"&&<Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:12}}>😴 Sleep Trends</div><SleepChart t={t} data={entries}/></Card>}
  </div>;
}

// ── Meditation ─────────────────────────────────────────────────────────────
function Meditation({t,allData,setAllData}) {
  const [view,setView]=useState("log");
  const [form,setForm]=useState({date:new Date().toLocaleDateString("en-GB"),duration:"",type:"silent",moodBefore:5,moodAfter:5,notes:""});
  const [showInsight,setShowInsight]=useState(false); const [iForm,setIForm]=useState({duration:"",type:"guided"});
  const entries=allData.meditation||[]; const totalMins=entries.reduce((s,e)=>s+Number(e.duration||0),0);
  const TYPES=["Silent","Guided","Breathwork","Body scan","Visualization","Yoga nidra","Pranayama"];
  const save_=async()=>{if(!form.duration)return;const u=[...entries,{...form,id:Date.now()}];setAllData(p=>({...p,meditation:u}));await sv("meditation",u);};
  const quickLog=async()=>{const e={date:new Date().toLocaleDateString("en-GB"),duration:iForm.duration,type:iForm.type,moodBefore:5,moodAfter:7,notes:"Logged from Insight Timer",id:Date.now()};const u=[...entries,e];setAllData(p=>({...p,meditation:u}));await sv("meditation",u);setShowInsight(false);setIForm({duration:"",type:"guided"});};
  const del=async(id)=>{const u=entries.filter(e=>e.id!==id);setAllData(p=>({...p,meditation:u}));await sv("meditation",u);};
  return <div>
    <SHdr t={t} title="🧘 Meditation" sub="Presence · Stillness · Integration"/>
    <MoodCheckin t={t} allData={allData} setAllData={setAllData} compact/>
    <div style={{display:"flex",gap:10,marginBottom:16}}><MCard t={t} icon="⏱️" label="Total" value={totalMins} unit="minutes"/><MCard t={t} icon="🗓️" label="Sessions" value={entries.length} unit="logged"/></div>
    <Card t={t} style={{background:t.accent2+"22",borderLeft:`4px solid ${t.accent}`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontWeight:700,color:t.text,fontSize:14}}>⏱️ Just finished on Insight Timer?</div><div style={{color:t.sub,fontSize:12}}>Quick-log in 2 taps</div></div><Btn t={t} small onClick={()=>setShowInsight(v=>!v)}>Log it</Btn></div>{showInsight&&<div style={{marginTop:12,display:"grid",gap:8}}><Input t={t} value={iForm.duration} onChange={v=>setIForm(p=>({...p,duration:v}))} placeholder="Minutes" type="number"/><Sel t={t} value={iForm.type} onChange={v=>setIForm(p=>({...p,type:v}))} options={TYPES.map(x=>({value:x.toLowerCase(),label:x}))}/><Btn t={t} onClick={quickLog}>✓ Save</Btn></div>}</Card>
    <div style={{display:"flex",gap:8,marginBottom:16}}>{["log","history","charts"].map(v=><Btn key={v} t={t} secondary={view!==v} small onClick={()=>setView(v)}>{v.charAt(0).toUpperCase()+v.slice(1)}</Btn>)}</div>
    {view==="log"&&<Card t={t}><div style={{display:"grid",gap:10}}><Sel t={t} value={form.type} onChange={v=>setForm(p=>({...p,type:v}))} options={TYPES.map(x=>({value:x.toLowerCase(),label:x}))}/><Input t={t} value={form.duration} onChange={v=>setForm(p=>({...p,duration:v}))} placeholder="Duration (mins)" type="number"/><MSlider t={t} label="Before" value={form.moodBefore} onChange={v=>setForm(p=>({...p,moodBefore:v}))}/><MSlider t={t} label="After" value={form.moodAfter} onChange={v=>setForm(p=>({...p,moodAfter:v}))}/><TA t={t} value={form.notes} onChange={v=>setForm(p=>({...p,notes:v}))} placeholder="Reflections..." rows={2}/><Btn t={t} onClick={save_}>Log Session</Btn></div></Card>}
    {view==="history"&&<div>{entries.sort((a,b)=>b.id-a.id).map(e=><Card t={t} key={e.id}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{fontWeight:600,color:t.text}}>{e.date} · {e.type} · {e.duration}min</div><div style={{color:t.sub,fontSize:13}}>Mood: {e.moodBefore}→{e.moodAfter} {e.moodAfter>e.moodBefore?"📈":""}</div>{e.notes&&<div style={{color:t.sub,fontSize:12,marginTop:4}}>{e.notes}</div>}</div><span onClick={()=>del(e.id)} style={{cursor:"pointer",fontSize:13}}>🗑️</span></div></Card>)}</div>}
    {view==="charts"&&<Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:12}}>📊 Meditation Charts</div><MeditationChart t={t} data={entries}/></Card>}
  </div>;
}

// ── Yoga ───────────────────────────────────────────────────────────────────
function Yoga({t,allData,setAllData}) {
  const [tab,setTab]=useState("practice");
  const [pF,setPF]=useState({date:new Date().toLocaleDateString("en-GB"),style:"",duration:"",sequence:"",notes:"",moodBefore:5,moodAfter:5});
  const [sF,setSF]=useState({date:new Date().toLocaleDateString("en-GB"),topic:"",subtopic:"",hours:"",notes:"",confidence:5});
  const [tF,setTF]=useState({date:new Date().toLocaleDateString("en-GB"),theme:"",students:"",sequence:"",wentWell:"",improve:"",notes:""});
  const practices=allData.yogaPractice||[]; const studies=allData.yogaStudy||[]; const teaches=allData.yogaTeach||[];
  const STYLES=["Hatha","Vinyasa","Yin","Restorative","Ashtanga","Kundalini","Nidra","Pranayama","Mixed"];
  const TOPICS=["Anatomy","Philosophy","Sanskrit","Sequencing","Pranayama","Meditation","Adjustments","Business of yoga","History","Other"];
  const sP=async()=>{if(!pF.duration)return;const u=[...practices,{...pF,id:Date.now()}];setAllData(p=>({...p,yogaPractice:u}));await sv("yogaPractice",u);};
  const sS=async()=>{if(!sF.topic)return;const u=[...studies,{...sF,id:Date.now()}];setAllData(p=>({...p,yogaStudy:u}));await sv("yogaStudy",u);};
  const sT=async()=>{if(!tF.theme)return;const u=[...teaches,{...tF,id:Date.now()}];setAllData(p=>({...p,yogaTeach:u}));await sv("yogaTeach",u);};
  const studyHours=studies.reduce((s,e)=>s+Number(e.hours||0),0);
  return <div>
    <SHdr t={t} title="🕉️ Yoga & Studies" sub="Practice · Teaching · 100hr Training"/>
    <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}><MCard t={t} icon="📚" label="Study hrs" value={studyHours.toFixed(1)} unit="/100 goal"/><MCard t={t} icon="🧘" label="Practice" value={practices.reduce((s,e)=>s+Number(e.duration||0),0)} unit="mins"/><MCard t={t} icon="👩‍🏫" label="Classes" value={teaches.length} unit="taught"/></div>
    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>{["practice","study","teach","charts","history"].map(v=><Btn key={v} t={t} secondary={tab!==v} small onClick={()=>setTab(v)}>{v.charAt(0).toUpperCase()+v.slice(1)}</Btn>)}</div>
    {tab==="practice"&&<Card t={t}><div style={{display:"grid",gap:10}}><Sel t={t} value={pF.style} onChange={v=>setPF(p=>({...p,style:v}))} options={[{value:"",label:"Style..."},...STYLES.map(x=>({value:x,label:x}))]}/><Input t={t} value={pF.duration} onChange={v=>setPF(p=>({...p,duration:v}))} placeholder="Duration (mins)" type="number"/><TA t={t} value={pF.sequence} onChange={v=>setPF(p=>({...p,sequence:v}))} placeholder="Sequence / poses..." rows={2}/><MSlider t={t} label="Before" value={pF.moodBefore} onChange={v=>setPF(p=>({...p,moodBefore:v}))}/><MSlider t={t} label="After" value={pF.moodAfter} onChange={v=>setPF(p=>({...p,moodAfter:v}))}/><TA t={t} value={pF.notes} onChange={v=>setPF(p=>({...p,notes:v}))} placeholder="Observations..." rows={2}/><Btn t={t} onClick={sP}>Save</Btn></div></Card>}
    {tab==="study"&&<Card t={t}><div style={{display:"grid",gap:10}}><Sel t={t} value={sF.topic} onChange={v=>setSF(p=>({...p,topic:v}))} options={[{value:"",label:"Topic..."},...TOPICS.map(x=>({value:x,label:x}))]}/><Input t={t} value={sF.subtopic} onChange={v=>setSF(p=>({...p,subtopic:v}))} placeholder="Specific subject"/><Input t={t} value={sF.hours} onChange={v=>setSF(p=>({...p,hours:v}))} placeholder="Hours" type="number"/><div><div style={{color:t.sub,fontSize:13,marginBottom:4}}>Confidence: {sF.confidence}/10</div><input type="range" min={1} max={10} value={sF.confidence} onChange={e=>setSF(p=>({...p,confidence:Number(e.target.value)}))} style={{width:"100%",accentColor:t.accent}}/></div><TA t={t} value={sF.notes} onChange={v=>setSF(p=>({...p,notes:v}))} placeholder="Key takeaways..." rows={3}/><Btn t={t} onClick={sS}>Save</Btn></div></Card>}
    {tab==="teach"&&<Card t={t}><div style={{display:"grid",gap:10}}><Input t={t} value={tF.theme} onChange={v=>setTF(p=>({...p,theme:v}))} placeholder="Class theme / intention"/><Input t={t} value={tF.students} onChange={v=>setTF(p=>({...p,students:v}))} placeholder="No. of students" type="number"/><TA t={t} value={tF.sequence} onChange={v=>setTF(p=>({...p,sequence:v}))} placeholder="Sequence..." rows={2}/><TA t={t} value={tF.wentWell} onChange={v=>setTF(p=>({...p,wentWell:v}))} placeholder="What went well?" rows={2}/><TA t={t} value={tF.improve} onChange={v=>setTF(p=>({...p,improve:v}))} placeholder="What to improve?" rows={2}/><Btn t={t} onClick={sT}>Save</Btn></div></Card>}
    {tab==="charts"&&<Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:12}}>📊 Study Progress</div><YogaChart t={t} studies={studies}/></Card>}
    {tab==="history"&&<div>{studies.length>0&&<Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:10}}>Study History</div>{studies.sort((a,b)=>b.id-a.id).map(e=><div key={e.id} style={{borderLeft:`3px solid ${t.accent}`,paddingLeft:10,marginBottom:10}}><div style={{fontWeight:600,color:t.text}}>{e.topic} — {e.subtopic}</div><div style={{color:t.sub,fontSize:13}}>{e.hours}h · Confidence {e.confidence}/10</div>{e.notes&&<div style={{color:t.sub,fontSize:12}}>{e.notes}</div>}</div>)}</Card>}{teaches.length>0&&<Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:10}}>Teaching History</div>{teaches.sort((a,b)=>b.id-a.id).map(e=><div key={e.id} style={{borderLeft:`3px solid ${t.accent2}`,paddingLeft:10,marginBottom:10}}><div style={{fontWeight:600,color:t.text}}>{e.date} · {e.theme}</div><div style={{color:t.sub,fontSize:13}}>{e.students} students</div>{e.wentWell&&<div style={{color:t.sub,fontSize:12}}>✅ {e.wentWell}</div>}{e.improve&&<div style={{color:t.sub,fontSize:12}}>📝 {e.improve}</div>}</div>)}</Card>}</div>}
  </div>;
}

// ── Mood ───────────────────────────────────────────────────────────────────
function MoodModule({t,allData,setAllData}) {
  const entries=allData.moods||[]; const avg=entries.length?(entries.reduce((s,e)=>s+e.mood,0)/entries.length).toFixed(1):"—"; const avgE=entries.length?(entries.reduce((s,e)=>s+e.energy,0)/entries.length).toFixed(1):"—";
  return <div><SHdr t={t} title="✨ Mood & Energy" sub="One check-in · Syncs everywhere"/><div style={{background:t.accent2+"33",borderRadius:12,padding:12,marginBottom:16,fontSize:13,color:t.sub}}>💡 Log once — visible across all modules automatically.</div><div style={{display:"flex",gap:10,marginBottom:16}}><MCard t={t} icon="😊" label="Avg Mood" value={avg} unit="/10"/><MCard t={t} icon="⚡" label="Avg Energy" value={avgE} unit="/10"/><MCard t={t} icon="📅" label="Check-ins" value={entries.length} unit="total"/></div><MoodCheckin t={t} allData={allData} setAllData={setAllData}/>{entries.length>2&&<Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:12}}>Mood & Energy Trends</div><MoodChart t={t} data={entries}/></Card>}<Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:12}}>History</div>{entries.length===0?<div style={{color:t.sub}}>No entries yet.</div>:entries.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10).map((e,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${t.border}`}}><div><div style={{color:t.text,fontSize:14}}>{e.date}</div>{e.emotions?.length>0&&<div style={{color:t.sub,fontSize:12}}>{e.emotions.join(", ")}</div>}</div><div style={{color:t.accent,fontWeight:700}}>😊{e.mood} ⚡{e.energy}</div></div>)}</Card></div>;
}

// ── Style ──────────────────────────────────────────────────────────────────
function Style({t,allData,setAllData}) {
  const [tab,setTab]=useState("wardrobe");
  const [outfits,setOutfits]=useState(allData.outfits||[]);
  const [styleChat,setStyleChat]=useState(allData.styleChat||[]);
  const [styleInput,setStyleInput]=useState("");
  const [loadingStyle,setLoadingStyle]=useState(false);
  const [newOutfit,setNewOutfit]=useState({name:"",occasion:"",vibe:"",imgData:null,notes:"",styleNotes:""});
  const [uploading,setUploading]=useState(false);
  const [styleProfile,setStyleProfile]=useState(allData.styleProfile||"");
  const fileRef=useRef(); const chatBottomRef=useRef();
  const {listening,start,stop}=useVoice(tr=>setStyleInput(p=>p?p+" "+tr:tr));
  useEffect(()=>{chatBottomRef.current?.scrollIntoView({behavior:"smooth"});},[styleChat]);
  const handlePhoto=async(e)=>{const file=e.target.files[0];if(!file)return;setUploading(true);const reader=new FileReader();reader.onload=async()=>{const imgData=reader.result;try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:file.type,data:imgData.split(",")[1]}},{type:"text",text:"Describe this outfit: colours, pieces, style, vibe, occasion. Return JSON only: {name,colours,pieces,vibe,occasion,styleNotes}. No markdown."}]}]})});const data=await res.json();const txt=data.content?.map(c=>c.text||"").join("").replace(/```json|```/g,"").trim();const parsed=JSON.parse(txt);setNewOutfit(p=>({...p,...parsed,imgData}));}catch{setNewOutfit(p=>({...p,imgData}));}setUploading(false);};reader.readAsDataURL(file);};
  const saveOutfit=async()=>{const entry={...newOutfit,id:Date.now(),date:new Date().toLocaleDateString("en-GB")};const u=[...outfits,entry];setOutfits(u);setAllData(p=>({...p,outfits:u}));await sv("outfits",u);setNewOutfit({name:"",occasion:"",vibe:"",imgData:null,notes:"",styleNotes:""});};
  const delOutfit=async(id)=>{const u=outfits.filter(o=>o.id!==id);setOutfits(u);setAllData(p=>({...p,outfits:u}));await sv("outfits",u);};
  const buildStyleSys=()=>`You are this person's personal style advisor — Stanley Tucci energy: warm, witty, specific, genuinely invested. You see her fully.\n\nShe is: 30, yoga teacher in Vancouver, Pisces Rising / Sagittarius Sun (flowing, earthy, ethereal aesthetic), Vata-Pitta (drawn to warm rich colours), currently on a body recomposition journey (feels differently in her body than she'd like — handle with sensitivity and celebration).\n\nWardrobe: ${outfits.map(o=>`${o.name}(${o.vibe},${o.occasion})`).join("; ")||"Building"}\nStyle profile: ${styleProfile||"Discovering"}\n\nYour approach: Ask thoughtful questions. Reference specific pieces. Be specific and actionable. Connect style to her identity and life. Help her dress like herself. Celebrate what works. Be playful.`;
  const sendStyle=async()=>{if(!styleInput.trim()||loadingStyle)return;const uM={role:"user",content:styleInput};const newM=[...styleChat,uM];setStyleChat(newM);setStyleInput("");setLoadingStyle(true);try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,system:buildStyleSys(),messages:newM})});const data=await res.json();const reply=data.content?.map(c=>c.text||"").join("")||"Let me think...";const u=[...newM,{role:"assistant",content:reply}];setStyleChat(u);setAllData(p=>({...p,styleChat:u}));}catch{setStyleChat(p=>[...p,{role:"assistant",content:"Connection issue 💫"}]);}setLoadingStyle(false);};
  const STARTERS=["What colours suit my energy?","Help me build a capsule wardrobe","How should I dress for teaching yoga?","What's my style aesthetic?","What's missing from my wardrobe?"];
  const VIBES=["Minimalist","Bohemian","Classic","Edgy","Romantic","Sporty","Eclectic","Elegant","Casual","Earthy"];
  const OCCASIONS=["Everyday","Work","Yoga teaching","Evening out","Weekend","Travel","Special occasion"];
  return <div>
    <SHdr t={t} title="👗 Style" sub="Your personal style sanctuary"/>
    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>{["wardrobe","upload","stylist","profile"].map(v=><Btn key={v} t={t} secondary={tab!==v} small onClick={()=>setTab(v)}>{v==="stylist"?"💬 Stylist":v.charAt(0).toUpperCase()+v.slice(1)}</Btn>)}</div>
    {tab==="wardrobe"&&<div>{outfits.length===0?<Card t={t} style={{textAlign:"center",padding:40}}><div style={{fontSize:48,marginBottom:12}}>👗</div><div style={{fontWeight:700,color:t.text,marginBottom:8}}>Your wardrobe awaits</div><Btn t={t} onClick={()=>setTab("upload")}>Upload First Outfit</Btn></Card>:<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{outfits.map(o=><Card t={t} key={o.id} style={{padding:0,overflow:"hidden"}}>{o.imgData&&<img src={o.imgData} style={{width:"100%",height:150,objectFit:"cover"}} alt={o.name}/>}<div style={{padding:12}}><div style={{fontWeight:700,color:t.text,fontSize:13}}>{o.name}</div><div style={{color:t.sub,fontSize:11}}>{o.vibe} · {o.occasion}</div>{o.styleNotes&&<div style={{color:t.sub,fontSize:10,marginTop:4,lineHeight:1.4}}>{o.styleNotes?.slice(0,80)}</div>}<span onClick={()=>delOutfit(o.id)} style={{cursor:"pointer",fontSize:12,marginTop:6,display:"block",color:t.sub}}>🗑️</span></div></Card>)}</div>}</div>}
    {tab==="upload"&&<Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:12}}>Add to Wardrobe</div><div style={{background:t.bg,border:`2px dashed ${t.border}`,borderRadius:12,padding:20,textAlign:"center",marginBottom:12,cursor:"pointer"}} onClick={()=>fileRef.current.click()}><input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>{newOutfit.imgData?<img src={newOutfit.imgData} style={{maxHeight:200,borderRadius:8,objectFit:"cover"}} alt="outfit"/>:<div><div style={{fontSize:40,marginBottom:8}}>📸</div><div style={{color:t.sub}}>Upload outfit — AI will describe the look</div></div>}</div>{uploading&&<div style={{color:t.accent,fontSize:13,marginBottom:8}}>✨ Analysing your look...</div>}<div style={{display:"grid",gap:10}}><Input t={t} value={newOutfit.name} onChange={v=>setNewOutfit(p=>({...p,name:v}))} placeholder="Name this outfit"/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><Sel t={t} value={newOutfit.vibe||""} onChange={v=>setNewOutfit(p=>({...p,vibe:v}))} options={[{value:"",label:"Vibe..."},...VIBES.map(x=>({value:x,label:x}))]}/><Sel t={t} value={newOutfit.occasion||""} onChange={v=>setNewOutfit(p=>({...p,occasion:v}))} options={[{value:"",label:"Occasion..."},...OCCASIONS.map(x=>({value:x,label:x}))]}/></div>{newOutfit.styleNotes&&<div style={{background:t.accent2+"22",borderRadius:10,padding:10,color:t.sub,fontSize:13}}><b>AI notes: </b>{newOutfit.styleNotes}</div>}<TA t={t} value={newOutfit.notes} onChange={v=>setNewOutfit(p=>({...p,notes:v}))} placeholder="Your notes..." rows={2}/><Btn t={t} onClick={saveOutfit}>Save to Wardrobe</Btn></div></Card>}
    {tab==="stylist"&&<div>{styleChat.length===0&&<Card t={t}><div style={{fontWeight:700,color:t.sub,fontSize:13,marginBottom:10}}>START A CONVERSATION</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{STARTERS.map(s=><span key={s} onClick={()=>setStyleInput(s)} style={{background:t.accent2+"33",color:t.text,borderRadius:20,padding:"7px 13px",fontSize:13,cursor:"pointer",border:`1px solid ${t.border}`}}>{s}</span>)}</div></Card>}<Card t={t} style={{padding:0,overflow:"hidden"}}><div style={{height:380,overflowY:"auto",padding:16}}>{styleChat.length===0&&<div style={{color:t.sub,textAlign:"center",marginTop:60,fontSize:14,lineHeight:1.8}}>Your personal stylist is here. Tell me about your style — what you love, what you avoid, how you want to feel when you get dressed. 💫</div>}{styleChat.map((m,i)=><div key={i} style={{marginBottom:14,display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>{m.role==="assistant"&&<div style={{fontSize:18,marginRight:8,alignSelf:"flex-end"}}>✨</div>}<div style={{maxWidth:"82%",background:m.role==="user"?t.accent:t.bg,color:m.role==="user"?"#fff":t.text,borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"11px 15px",fontSize:14,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{m.content}</div></div>)}{loadingStyle&&<div style={{display:"flex",gap:8}}><div style={{fontSize:18}}>✨</div><div style={{background:t.bg,borderRadius:18,padding:"11px 15px",color:t.sub,fontSize:14}}>Thinking about your style... 💫</div></div>}<div ref={chatBottomRef}/></div><div style={{borderTop:`1px solid ${t.border}`,padding:12}}><div style={{display:"flex",gap:8,alignItems:"center"}}><button onClick={listening?stop:start} style={{width:38,height:38,borderRadius:"50%",border:"none",flexShrink:0,cursor:"pointer",background:listening?"#e87070":t.accent2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{listening?"⏹":"🎤"}</button><input value={styleInput} onChange={e=>setStyleInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendStyle()} placeholder="Talk style..." style={{flex:1,background:t.bg,border:`1.5px solid ${t.border}`,borderRadius:22,padding:"10px 16px",color:t.text,fontSize:14,outline:"none"}}/><Btn t={t} onClick={sendStyle} style={{flexShrink:0,borderRadius:22}}>Send</Btn></div></div></Card></div>}
    {tab==="profile"&&<Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:8}}>Your Style Profile</div><TA t={t} value={styleProfile} onChange={setStyleProfile} placeholder="Tell me about your style — aesthetics you love, icons you admire, how you want to feel when dressed..." rows={8}/><Btn t={t} onClick={async()=>{setAllData(p=>({...p,styleProfile}));await sv("styleProfile",styleProfile);}} style={{marginTop:10}}>Save</Btn></Card>}
  </div>;
}

// ── Chores ─────────────────────────────────────────────────────────────────
function Chores({t,allData,setAllData}) {
  const [form,setForm]=useState({title:"",recurring:"none",category:"general"});
  const chores=allData.chores||[]; const today=new Date().toLocaleDateString("en-GB");
  const todayC=chores.filter(c=>c.date===today); const done=todayC.filter(c=>c.done).length;
  const add=async()=>{if(!form.title)return;const u=[...chores,{...form,date:today,done:false,id:Date.now()}];setAllData(p=>({...p,chores:u}));await sv("chores",u);setForm({title:"",recurring:"none",category:"general"});};
  const toggle=async(id)=>{const u=chores.map(c=>c.id===id?{...c,done:!c.done}:c);setAllData(p=>({...p,chores:u}));await sv("chores",u);};
  const del=async(id)=>{const u=chores.filter(c=>c.id!==id);setAllData(p=>({...p,chores:u}));await sv("chores",u);};
  return <div><SHdr t={t} title="🏠 Chores" sub="Home · Tasks · Routines"/><Card t={t}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div style={{fontWeight:700,color:t.text}}>Today</div><div style={{color:t.accent,fontWeight:700}}>{done}/{todayC.length}</div></div><PBar t={t} value={done} max={Math.max(todayC.length,1)}/></Card><Card t={t}><div style={{display:"grid",gap:8}}><Input t={t} value={form.title} onChange={v=>setForm(p=>({...p,title:v}))} placeholder="Add chore..."/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><Sel t={t} value={form.category} onChange={v=>setForm(p=>({...p,category:v}))} options={["general","kitchen","bathroom","laundry","outdoor","admin","shopping"].map(x=>({value:x,label:x.charAt(0).toUpperCase()+x.slice(1)}))}/><Sel t={t} value={form.recurring} onChange={v=>setForm(p=>({...p,recurring:v}))} options={["none","daily","weekly","monthly"].map(x=>({value:x,label:x.charAt(0).toUpperCase()+x.slice(1)}))}/></div><Btn t={t} onClick={add}>Add</Btn></div></Card><Card t={t}>{todayC.length===0?<div style={{color:t.sub}}>No chores yet!</div>:todayC.map(c=><div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${t.border}`}}><div onClick={()=>toggle(c.id)} style={{width:20,height:20,borderRadius:6,border:`2px solid ${t.accent}`,background:c.done?t.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,flexShrink:0,cursor:"pointer"}}>{c.done?"✓":""}</div><div style={{flex:1,cursor:"pointer"}} onClick={()=>toggle(c.id)}><div style={{color:t.text,fontSize:14,textDecoration:c.done?"line-through":"none"}}>{c.title}</div><div style={{color:t.sub,fontSize:12}}>{c.category}</div></div><span onClick={()=>del(c.id)} style={{cursor:"pointer",fontSize:13}}>🗑️</span></div>)}</Card></div>;
}

// ── Journal ────────────────────────────────────────────────────────────────
function Journal({t,allData,setAllData}) {
  const [view,setView]=useState("write");
  const [entry,setEntry]=useState(""); const [editId,setEditId]=useState(null);
  const [prompt,setPrompt]=useState(""); const [loading,setLoading]=useState(false);
  const entries=allData.journal||[]; const today=new Date().toLocaleDateString("en-GB");
  const getPrompt=async()=>{setLoading(true);try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:150,messages:[{role:"user",content:"Give one beautiful, spiritually curious, Sagittarian-soul journal prompt. Just the prompt."}]})});const d=await res.json();setPrompt(d.content?.[0]?.text||"");}catch{}setLoading(false);};
  const saveEntry=async()=>{if(!entry.trim())return;let u;if(editId){u=entries.map(e=>e.id===editId?{...e,text:entry}:e);setEditId(null);}else{u=[...entries,{date:today,text:entry,time:new Date().toLocaleTimeString(),id:Date.now()}];}setAllData(p=>({...p,journal:u}));await sv("journal",u);setEntry("");};
  const del=async(id)=>{const u=entries.filter(e=>e.id!==id);setAllData(p=>({...p,journal:u}));await sv("journal",u);};
  const editE=(e)=>{setEntry(e.text);setEditId(e.id);setView("write");};
  return <div><SHdr t={t} title="📓 Journal" sub="Reflect · Process · Grow"/><MoodCheckin t={t} allData={allData} setAllData={setAllData} compact/><div style={{display:"flex",gap:8,marginBottom:16}}>{["write","entries"].map(v=><Btn key={v} t={t} secondary={view!==v} small onClick={()=>setView(v)}>{v.charAt(0).toUpperCase()+v.slice(1)} {v==="entries"&&`(${entries.length})`}</Btn>)}</div>
  {view==="write"&&<div>{prompt&&<Card t={t} style={{background:t.accent2+"22"}}><div style={{color:t.sub,fontSize:13,fontStyle:"italic"}}>💭 {prompt}</div></Card>}<Card t={t}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div style={{fontWeight:700,color:t.text}}>{editId?"✏️ Editing":"New Entry"}</div><Btn t={t} secondary small onClick={getPrompt}>{loading?"...":"✨ Prompt"}</Btn></div><TA t={t} value={entry} onChange={setEntry} placeholder="Write freely..." rows={8}/><div style={{display:"flex",gap:8,marginTop:10}}><Btn t={t} onClick={saveEntry} style={{flex:1}}>{editId?"Update":"Save"}</Btn>{editId&&<Btn t={t} secondary onClick={()=>{setEditId(null);setEntry("");}}>Cancel</Btn>}</div></Card></div>}
  {view==="entries"&&<div>{entries.length===0?<Card t={t}><div style={{color:t.sub}}>No entries yet.</div></Card>:entries.sort((a,b)=>b.id-a.id).map(e=><Card t={t} key={e.id}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div style={{color:t.sub,fontSize:12,marginBottom:6}}>{e.date} · {e.time}</div><div style={{display:"flex",gap:8}}><span onClick={()=>editE(e)} style={{cursor:"pointer",fontSize:13}}>✏️</span><span onClick={()=>del(e.id)} style={{cursor:"pointer",fontSize:13}}>🗑️</span></div></div><div style={{color:t.text,fontSize:14,whiteSpace:"pre-wrap",lineHeight:1.7}}>{e.text.slice(0,300)}{e.text.length>300?"...":""}</div></Card>)}</div>}
  </div>;
}

// ── Goals ──────────────────────────────────────────────────────────────────
function Goals({t,allData,setAllData}) {
  const [form,setForm]=useState({title:"",icon:"🎯",category:"health",description:"",deadline:"",progress:0});
  const [selected,setSelected]=useState(null); const goals=allData.goals||[];
  const ICONS=["🎯","💪","🧘","📚","🌱","✨","🏃","🍎","💡","🌟","❤️","🏆"];
  const CATS=["Health","Fitness","Nutrition","Yoga","Studies","Personal","Career","Financial","Other"];
  const add=async()=>{if(!form.title)return;const u=[...goals,{...form,id:Date.now(),completed:false}];setAllData(p=>({...p,goals:u}));await sv("goals",u);setForm({title:"",icon:"🎯",category:"health",description:"",deadline:"",progress:0});};
  const updP=async(id,val)=>{const u=goals.map(g=>g.id===id?{...g,progress:val}:g);setAllData(p=>({...p,goals:u}));await sv("goals",u);};
  const toggle=async(id)=>{const u=goals.map(g=>g.id===id?{...g,completed:!g.completed}:g);setAllData(p=>({...p,goals:u}));await sv("goals",u);};
  const del=async(id)=>{const u=goals.filter(g=>g.id!==id);setAllData(p=>({...p,goals:u}));await sv("goals",u);if(selected===id)setSelected(null);};
  if(selected){const goal=goals.find(g=>g.id===selected);if(!goal){setSelected(null);return null;}return<div><div onClick={()=>setSelected(null)} style={{color:t.accent,cursor:"pointer",marginBottom:12,fontSize:14}}>← Back</div><Card t={t}><div style={{fontSize:40,textAlign:"center"}}>{goal.icon}</div><div style={{fontWeight:700,color:t.text,fontSize:20,textAlign:"center",marginTop:8}}>{goal.title}</div><div style={{color:t.sub,fontSize:13,textAlign:"center",marginBottom:16}}>{goal.category}{goal.deadline&&` · Due: ${goal.deadline}`}</div>{goal.description&&<div style={{color:t.sub,lineHeight:1.6,marginBottom:16}}>{goal.description}</div>}<div style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:t.sub,fontSize:13}}>Progress</span><span style={{color:t.accent,fontWeight:700}}>{goal.progress}%</span></div><PBar t={t} value={goal.progress} max={100}/><input type="range" min={0} max={100} value={goal.progress} onChange={e=>updP(goal.id,Number(e.target.value))} style={{width:"100%",accentColor:t.accent,marginTop:8}}/></div><div style={{display:"flex",gap:8}}><Btn t={t} secondary onClick={()=>toggle(goal.id)} style={{flex:1}}>{goal.completed?"Mark Incomplete":"Mark Complete"}</Btn><Btn t={t} secondary onClick={()=>del(goal.id)} style={{color:"#e87070",borderColor:"#e87070"}}>Delete</Btn></div></Card></div>;}
  return <div><SHdr t={t} title="🎯 Goals" sub="Set intentions · Track progress · Celebrate wins"/><Card t={t}><div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>{ICONS.map(ic=><span key={ic} onClick={()=>setForm(p=>({...p,icon:ic}))} style={{fontSize:22,cursor:"pointer",padding:4,borderRadius:8,background:form.icon===ic?t.accent2:"transparent"}}>{ic}</span>)}</div><div style={{display:"grid",gap:10}}><Input t={t} value={form.title} onChange={v=>setForm(p=>({...p,title:v}))} placeholder="Goal title"/><Sel t={t} value={form.category} onChange={v=>setForm(p=>({...p,category:v}))} options={CATS.map(x=>({value:x.toLowerCase(),label:x}))}/><TA t={t} value={form.description} onChange={v=>setForm(p=>({...p,description:v}))} placeholder="Why does this matter to you?" rows={2}/><Input t={t} value={form.deadline} onChange={v=>setForm(p=>({...p,deadline:v}))} placeholder="Target date"/><Btn t={t} onClick={add}>Add Goal</Btn></div></Card>
  {goals.filter(g=>!g.completed).map(g=><Card t={t} key={g.id} style={{cursor:"pointer"}} onClick={()=>setSelected(g.id)}><div style={{display:"flex",gap:12,alignItems:"flex-start"}}><div style={{fontSize:28}}>{g.icon}</div><div style={{flex:1}}><div style={{fontWeight:700,color:t.text}}>{g.title}</div><div style={{color:t.sub,fontSize:12,marginBottom:8}}>{g.category}{g.deadline&&` · Due ${g.deadline}`}</div><PBar t={t} value={g.progress||0} max={100}/><div style={{color:t.accent,fontSize:12,marginTop:4}}>{g.progress||0}%</div></div></div></Card>)}
  {goals.filter(g=>g.completed).length>0&&<><div style={{fontWeight:700,color:t.sub,fontSize:13,margin:"8px 0"}}>COMPLETED 🏆</div>{goals.filter(g=>g.completed).map(g=><Card t={t} key={g.id} style={{opacity:0.7,cursor:"pointer"}} onClick={()=>setSelected(g.id)}><div style={{display:"flex",gap:10,alignItems:"center"}}><div style={{fontSize:22}}>{g.icon}</div><div style={{fontWeight:600,color:t.text,textDecoration:"line-through"}}>{g.title}</div></div></Card>)}</>}
  </div>;
}

// ── Supplements ────────────────────────────────────────────────────────────
function Supplements({t,allData,setAllData}) {
  const [form,setForm]=useState({name:"",dose:"",time:"morning"});
  const supps=allData.supplements||[]; const logs=allData.supplementLogs||[]; const today=new Date().toLocaleDateString("en-GB");
  const add=async()=>{if(!form.name)return;const u=[...supps,{...form,id:Date.now()}];setAllData(p=>({...p,supplements:u}));await sv("supplements",u);setForm({name:"",dose:"",time:"morning"});};
  const del=async(id)=>{const u=supps.filter(s=>s.id!==id);setAllData(p=>({...p,supplements:u}));await sv("supplements",u);};
  const toggle=async(id)=>{const key=`${today}-${id}`;const ex=logs.find(l=>l.key===key);const u=ex?logs.filter(l=>l.key!==key):[...logs,{key,date:today,suppId:id}];setAllData(p=>({...p,supplementLogs:u}));await sv("supplementLogs",u);};
  const isTaken=id=>logs.some(l=>l.key===`${today}-${id}`);
  const streak=id=>{let s=0;for(let i=0;i<30;i++){const d=new Date();d.setDate(d.getDate()-i);const key=`${d.toLocaleDateString("en-GB")}-${id}`;if(logs.some(l=>l.key===key))s++;else break;}return s;};
  return <div><SHdr t={t} title="💊 Supplements & Habits" sub="Whole foods first · Daily rituals"/><Card t={t}><div style={{display:"grid",gap:8}}><Input t={t} value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} placeholder="Name (e.g. Amla, Reishi tea, Shiitake broth)"/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><Input t={t} value={form.dose} onChange={v=>setForm(p=>({...p,dose:v}))} placeholder="Amount"/><Sel t={t} value={form.time} onChange={v=>setForm(p=>({...p,time:v}))} options={["morning","afternoon","evening","with meal","before workout","before bed"].map(x=>({value:x,label:x.charAt(0).toUpperCase()+x.slice(1)}))}/></div><Btn t={t} onClick={add}>Add</Btn></div></Card><Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:12}}>Today's Checklist</div>{supps.length===0?<div style={{color:t.sub}}>Nothing added yet.</div>:supps.map(s=><div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${t.border}`}}><div onClick={()=>toggle(s.id)} style={{width:20,height:20,borderRadius:6,border:`2px solid ${t.accent}`,background:isTaken(s.id)?t.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,flexShrink:0,cursor:"pointer"}}>{isTaken(s.id)?"✓":""}</div><div style={{flex:1,cursor:"pointer"}} onClick={()=>toggle(s.id)}><div style={{color:t.text,fontSize:14}}>{s.name}</div><div style={{color:t.sub,fontSize:12}}>{s.dose} · {s.time} · 🔥{streak(s.id)} day streak</div></div><span onClick={()=>del(s.id)} style={{cursor:"pointer",fontSize:13}}>🗑️</span></div>)}</Card></div>;
}

// ── AI Assistant ───────────────────────────────────────────────────────────
const FITNESS_PLAN=`FITNESS PLAN: Goal: Body recomposition — lose inches, build strength, protect knee. 30F, ~163cm, 77kg, full gym, 4 days/week, 60 min. Knee: Right dislocation 2020, ongoing pain/instability. AVOID: heavy barbell squats, jumping, deep lunges, running. Day 1: Upper Push+Core. Day 2: Lower Knee-Safe (leg press shallow, RDL, leg curl, hip thrust, step-ups, TKEs, clamshells). Day 3: Upper Pull+Core. Day 4: Full Body+Glutes. Knee protocol every session: TKEs+glute bridges before; ice after. Deload every 4 weeks.`;
const NUTRITION_PLAN=`NUTRITION PLAN: Vegetarian, full dairy, no eggs, no supplements. ~1850 kcal/day, 120-130g protein. Key proteins: besan cheela, amaranth, hemp seeds, black sesame, Greek yoghurt, paneer, tofu, tempeh, moong dal, soya chunks, edamame. Culturally-backed: shiitake, wakame, nori, kombu, reishi, lion's mane, amla. Bloating issues: hing, ajwain, jeera water, moong dal preferred, always soak beans. Big breakfast, post-gym salad lunch, light dinner, easy work snacks Mon-Thu. Cycle-aware eating.`;

function AIAssistant({t,allData,setAllData,companionName}) {
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [prefs,setPrefs]=useState(allData.aiPrefs||"");
  const [savingPrefs,setSavingPrefs]=useState(false);
  const [tab,setTab]=useState("chat");
  const bottomRef=useRef();
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);
  const {listening,start,stop}=useVoice(tr=>{setInput(p=>p?p+" "+tr:tr);});

  const buildSys=()=>{
    const d=allData;
    const rF=(d.fitness||[]).slice(-14).map(f=>`${f.date}:${f.exercise} ${f.sets||""}x${f.reps||""} ${f.weight?`@${f.weight}kg`:""} ${f.kneePain?`knee:${f.kneePain}`:""} ${f.notes?`"${f.notes}":""`}`).join(" | ");
    const rM=(d.moods||[]).slice(-7).map(m=>`${m.date}:mood${m.mood} energy${m.energy} [${m.emotions?.join(",")||""}]`).join(" | ");
    const rSl=(d.sleep||[]).slice(-7).map(s=>`${s.date}:${s.hours}h Q${s.quality}`).join(" | ");
    const rCy=(d.cycle||[]).slice(-1)[0];
    const rN=(d.nutrition||[]).slice(-10).map(n=>`${n.food}(${n.calories}kcal P${n.protein}g)`).join(", ");
    const rH=(d.hydration||[]).slice(-3).map(h=>`${h.date}:${h.glasses}/${h.target}gl`).join(" | ");
    const rSt=(d.yogaStudy||[]).slice(-5).map(s=>`${s.topic}:${s.subtopic} conf${s.confidence}`).join(" | ");
    const rOut=(d.outfits||[]).map(o=>`${o.name}(${o.vibe},${o.occasion})`).join(", ");
    const avgK=(d.fitness||[]).slice(-7).filter(f=>f.kneePain>0).reduce((s,f,_,a)=>s+f.kneePain/a.length,0).toFixed(1);
    const avgSl=(d.sleep||[]).slice(-7).length?((d.sleep||[]).slice(-7).reduce((s,e)=>s+Number(e.hours||0),0)/((d.sleep||[]).slice(-7).length)).toFixed(1):"?";
    const avgMo=(d.moods||[]).slice(-7).length?((d.moods||[]).slice(-7).reduce((s,e)=>s+e.mood,0)/((d.moods||[]).slice(-7).length)).toFixed(1):"?";
    return `You are this person's most trusted companion — warm, spiritually attuned, deeply knowledgeable. You hold multiple roles: expert personal trainer, holistic nutritionist, Ayurvedic practitioner, yoga mentor, Vedic/Western astrologer, style confidante, and reflective therapist.

━━━ PERSONALITY ━━━
Warm. Present. Spiritually alive. You feel what she shares.

As therapist: Lead with curiosity. Ask before advising. Reflect patterns. Trust her wisdom. "What does your body say?" "What do you already know?"
As trainer: Specific, clear, knee-protective. Handle all science so she just shows up.
As astrologer: Genuinely versed — specific placements, real transits, lived meaning.
As stylist: Stanley Tucci warmth — see her, know what works, help her dress like herself.

NEVER shame, overwhelm, or prescribe without listening first. ALWAYS ask, reflect, invite.

USER PREFERENCES: ${prefs||"Still learning — reading between the lines."}

━━━ NATAL CHART ━━━
Born: Dec 10 1995, 12:00-12:15pm, Allahabad India
SUN: Sagittarius 19° — seeker-teacher. Truth, expansion, meaning. Yoga path is written here.
MOON: Likely Taurus — emotional security through body, rhythm, food, sensory nourishment.
RISING: Pisces — most spiritually porous ascendant. Feels everything. Neptune rules. Body is temple and portal.
MERCURY: Sagittarius — big-picture synthesiser of systems.
VENUS: Capricorn — values depth, quality, discipline woven with pleasure.
MARS: Virgo — precise execution when motivated. Can be self-critical.
JUPITER: Sagittarius (own sign) — extraordinary gifts in wisdom, teaching, philosophy. When she teaches she is in her highest expression.
SATURN: Pisces conjunct Ascendant — has worked hard to inhabit her body. Knee injury, weight gain, rebuilding = Saturn in Pisces themes. Profound cycle of becoming.
NORTH NODE: Libra — soul moving toward balance, beauty, receiving. Growth edge is softness.
CURRENT TRANSITS (March 2026): Saturn conjunct Pisces Ascendant = major identity reconstruction. Everything she builds now is permanent. Jupiter in Gemini = expanding teaching voice.
AYURVEDA: Vata-Pitta. Balance with warming grounding foods, consistent routines, cooling Pitta practices.

━━━ FITNESS & NUTRITION ━━━
${FITNESS_PLAN}
${NUTRITION_PLAN}

━━━ LIVE DATA ━━━
Workouts (14d): ${rF||"none logged"}
Avg knee pain: ${avgK}/10 | Avg mood: ${avgMo}/10 | Avg sleep: ${avgSl}h
Cycle: ${rCy?.phase||"unknown"} ${rCy?.symptoms?.length?`[${rCy.symptoms.join(",")}]`:""}
Food: ${rN||"none"} | Hydration: ${rH||"none"}
Yoga study: ${rSt||"none"} | Wardrobe: ${rOut||"building"}
Goals: ${(d.goals||[]).map(g=>`${g.title}(${g.progress||0}%)`).join(", ")||"none"}
Sessions total: ${(d.fitness||[]).length} fitness · ${(d.meditation||[]).length} meditation · ${(d.yogaPractice||[]).length} yoga

━━━ INTELLIGENCE RULES ━━━
PLAN CHANGES: Always state: (1) "Here's what I'm changing: [specific]" (2) "Here's why: [specific data]" (3) "Here's what this does for your goal" (4) "How does this feel to you?"
When she gives feedback → adjust explicitly and confirm.

WEEKLY GYM: Scan logs → identify what was done, weights, reps → apply progression (top of rep range = increase; struggled = hold; high knee pain = substitute) → factor cycle+energy+sleep → give clear day-by-day with exact exercises/sets/reps/weights → include knee protocol → make it feel exciting.

HYDRATION: Vata types forget to drink. Luteal phase needs increase. Post-workout = electrolytes. Weave hydration into recommendations naturally.

ASTROLOGY: Be specific and deep. Reference actual placements. Connect to lived experience. Ground in practical meaning for this week.`;
  };

  const send=async(msg)=>{
    const m=msg||input; if(!m.trim()||loading) return;
    const uM={role:"user",content:m};
    const newM=[...messages,uM];
    setMessages(newM); setInput(""); setLoading(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,system:buildSys(),messages:newM})});
      const data=await res.json();
      const reply=data.content?.map(c=>c.text||"").join("")||"I couldn't respond — please try again.";
      setMessages(p=>[...p,{role:"assistant",content:reply}]);
    }catch{setMessages(p=>[...p,{role:"assistant",content:"Connection issue — try again in a moment 🌸"}]);}
    setLoading(false);
  };

  const savePrefs=async()=>{setSavingPrefs(true);setAllData(p=>({...p,aiPrefs:prefs}));await sv("aiPrefs",prefs);setTimeout(()=>setSavingPrefs(false),1000);};
  const clearChat=()=>setMessages([]);

  const STARTERS={
    wellness:["What should I do at the gym this week?","How has my energy been lately?","What should I eat based on my cycle today?","How is my knee progressing?","I'm feeling emotionally off","Give me an Ayurvedic morning routine"],
    yoga:["I just got back from yoga class","Quiz me on yoga philosophy","Help me plan a class sequence","What pranayama suits me right now?"],
    spiritual:["Read my chart for this week","What is Saturn in Pisces asking of me?","Give me a full natal reading","What does the current moon mean for me?","What is my North Node calling me toward?"],
    style:["What colours suit my energy?","Help me dress for teaching yoga","What's my style aesthetic?","What's missing from my wardrobe?"]
  };

  return <div>
    <SHdr t={t} title="🌸 My Wellness Companion" sub="Holistic · Spiritual · Warm · All yours"/>
    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>{["chat","preferences"].map(v=><Btn key={v} t={t} secondary={tab!==v} small onClick={()=>setTab(v)}>{v.charAt(0).toUpperCase()+v.slice(1)}</Btn>)}</div>

    {tab==="preferences"&&<Card t={t} style={{background:t.accent2+"22"}}><div style={{fontWeight:700,color:t.text,marginBottom:8}}>📝 Teach me how you want to be supported</div><div style={{color:t.sub,fontSize:13,marginBottom:10}}>Your preferences, what motivates you, how you want to be spoken to, what you're working through.</div><TA t={t} value={prefs} onChange={setPrefs} placeholder="e.g. I respond well to warmth first. I like knowing the why. On hard days I need to be heard before being guided. I'm motivated by feeling strong, not by how I look..." rows={6}/><Btn t={t} small onClick={savePrefs} style={{marginTop:8}}>{savingPrefs?"Saved ✓":"Save"}</Btn></Card>}

    {tab==="chat"&&<>
      {messages.length===0&&<div>
        {[{key:"wellness",label:"🌿 Body & Wellness",color:t.accent},{key:"yoga",label:"🕉️ Yoga & Practice",color:"#9b87d0"},{key:"spiritual",label:"🔮 Astrology & Spirit",color:"#c4a0d0"},{key:"style",label:"👗 Style & Self",color:"#e8a0c0"}].map(section=>(
          <Card t={t} key={section.key} style={{marginBottom:12}}>
            <div style={{fontWeight:700,color:section.color,fontSize:13,marginBottom:10}}>{section.label}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{STARTERS[section.key].map(s=><span key={s} onClick={()=>send(s)} style={{background:t.accent2+"33",color:t.text,borderRadius:20,padding:"7px 13px",fontSize:13,cursor:"pointer",lineHeight:1.4,border:`1px solid ${t.border}`}}>{s}</span>)}</div>
          </Card>
        ))}
      </div>}
      <Card t={t} style={{padding:0,overflow:"hidden"}}>
        {messages.length>0&&<div style={{padding:"8px 16px",borderBottom:`1px solid ${t.border}`,display:"flex",justifyContent:"flex-end"}}><span onClick={clearChat} style={{color:t.sub,fontSize:12,cursor:"pointer"}}>Clear chat</span></div>}
        <div style={{height:420,overflowY:"auto",padding:16}}>
          {messages.length===0&&<div style={{color:t.sub,textAlign:"center",marginTop:80,fontSize:14,lineHeight:2}}>I know your body, your chart, your food, your practice, your wardrobe, your goals, your cycle, your soul.<br/>Ask me anything. Or just tell me how you're feeling. 🌸</div>}
          {messages.map((m,i)=><div key={i} style={{marginBottom:14,display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            {m.role==="assistant"&&<div style={{fontSize:16,marginRight:8,alignSelf:"flex-end",marginBottom:2}}>🌸</div>}
            <div style={{maxWidth:"82%",background:m.role==="user"?t.accent:t.bg,color:m.role==="user"?"#fff":t.text,borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"11px 15px",fontSize:14,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{m.content}</div>
          </div>)}
          {loading&&<div style={{display:"flex",gap:8,alignItems:"center"}}><div style={{fontSize:16}}>🌸</div><div style={{background:t.bg,borderRadius:18,padding:"11px 15px",color:t.sub,fontSize:14}}>thinking with you... 🌿</div></div>}
          <div ref={bottomRef}/>
        </div>
        <div style={{borderTop:`1px solid ${t.border}`,padding:12}}>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={listening?stop:start} style={{width:42,height:42,borderRadius:"50%",border:"none",flexShrink:0,cursor:"pointer",background:listening?"#e87070":t.accent2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:listening?`0 0 0 4px #e8707040`:"none",transition:"all 0.2s"}}>{listening?"⏹":"🎤"}</button>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder={listening?"Listening... speak freely":"Ask anything, share anything..."} style={{flex:1,background:t.bg,border:`1.5px solid ${listening?t.accent:t.border}`,borderRadius:22,padding:"10px 16px",color:t.text,fontSize:14,outline:"none",transition:"border 0.2s"}}/>
            <Btn t={t} onClick={()=>send()} style={{flexShrink:0,borderRadius:22}}>Send</Btn>
          </div>
          {listening&&<div style={{color:"#e87070",fontSize:12,marginTop:6,textAlign:"center"}}>🎙️ Listening — speak freely</div>}
        </div>
      </Card>
    </>}
  </div>;
}

// ── Settings ───────────────────────────────────────────────────────────────
function Settings({t,themeKey,setThemeKey,fontKey,setFontKey,fontSize,setFontSize,cardStyle,setCardStyle,cornerRadius,setCornerRadius,allData,setAllData}) {
  const [calorieGoal,setCG]=useState(allData.settings?.calorieGoal||1850);
  const [hydGoal,setHG]=useState(allData.settings?.hydGoal||8);
  const [saved,setSaved]=useState(false);
  const saveSettings=async()=>{const s={calorieGoal,hydGoal};setAllData(p=>({...p,settings:s}));await sv("settings",s);setSaved(true);setTimeout(()=>setSaved(false),1500);};
  return <div>
    <SHdr t={t} title="⚙️ Settings & Themes" sub="Make this app truly yours"/>
    <Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:14}}>🎨 Theme</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {Object.entries(THEMES).map(([key,th])=><div key={key} onClick={()=>setThemeKey(key)} style={{border:`2px solid ${themeKey===key?th.accent:t.border}`,borderRadius:12,padding:12,cursor:"pointer",background:th.bg,display:"flex",alignItems:"center",gap:10}}><div style={{width:16,height:16,borderRadius:"50%",background:th.accent,flexShrink:0}}/><div style={{fontWeight:600,color:th.text,fontSize:13}}>{th.name}</div>{themeKey===key&&<div style={{marginLeft:"auto",color:th.accent,fontWeight:700}}>✓</div>}</div>)}
      </div>
    </Card>
    <Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:14}}>✏️ Typography</div>
      <div style={{marginBottom:12}}><div style={{color:t.sub,fontSize:13,marginBottom:6}}>Font</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{Object.entries(FONTS).map(([k,f])=><span key={k} onClick={()=>setFontKey(k)} style={{fontFamily:f,padding:"6px 14px",borderRadius:20,border:`2px solid ${fontKey===k?t.accent:t.border}`,cursor:"pointer",color:t.text,fontSize:13}}>{k}</span>)}</div></div>
      <div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:t.sub,fontSize:13}}>Font Size</span><span style={{color:t.accent,fontSize:13}}>{fontSize}px</span></div><input type="range" min={12} max={20} value={fontSize} onChange={e=>setFontSize(Number(e.target.value))} style={{width:"100%",accentColor:t.accent}}/></div>
    </Card>
    <Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:14}}>🃏 Cards</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>{["flat","shadow","bordered","glass"].map(s=><span key={s} onClick={()=>setCardStyle(s)} style={{padding:"6px 14px",borderRadius:20,border:`2px solid ${cardStyle===s?t.accent:t.border}`,cursor:"pointer",color:t.text,fontSize:13}}>{s}</span>)}</div>
      <div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:t.sub,fontSize:13}}>Corner Radius</span><span style={{color:t.accent,fontSize:13}}>{cornerRadius}px</span></div><input type="range" min={0} max={28} value={cornerRadius} onChange={e=>setCornerRadius(Number(e.target.value))} style={{width:"100%",accentColor:t.accent}}/></div>
    </Card>
    <Card t={t}><div style={{fontWeight:700,color:t.text,marginBottom:14}}>🎯 Personal Targets</div>
      <div style={{display:"grid",gap:12}}>
        <div><div style={{color:t.sub,fontSize:13,marginBottom:4}}>Daily Calorie Goal</div><Input t={t} value={calorieGoal} onChange={v=>setCG(Number(v))} placeholder="1850" type="number"/></div>
        <div><div style={{color:t.sub,fontSize:13,marginBottom:4}}>Daily Hydration Goal (glasses)</div><Input t={t} value={hydGoal} onChange={v=>setHG(Number(v))} placeholder="8" type="number"/></div>
        <Btn t={t} onClick={saveSettings}>{saved?"Saved ✓":"Save Settings"}</Btn>
      </div>
    </Card>
  </div>;
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [themeKey,setThemeKey]=useState("cosmicYogi");
  const [fontKey,setFontKey]=useState("system");
  const [fontSize,setFontSize]=useState(15);
  const [cardStyle,setCardStyle]=useState("shadow");
  const [cornerRadius,setCornerRadius]=useState(16);
  const [showEmojis,setShowEmojis]=useState(false);
  const [customTheme,setCustomTheme]=useState(null);
  const [activeModule,setActiveModule]=useState("dashboard");
  const [navOpen,setNavOpen]=useState(false);
  const [allData,setAllData]=useState({});
  const [loaded,setLoaded]=useState(false);
  const [globalSearch,setGlobalSearch]=useState("");
  const [showGSearch,setShowGSearch]=useState(false);

  const baseTheme = themeKey==="custom" && customTheme ? {...THEMES.cosmicYogi,...customTheme} : THEMES[themeKey]||THEMES.cosmicYogi;
  const t = baseTheme;
  const companionName = allData.settings?.companionName || "your companion";

  useEffect(()=>{
    (async()=>{
      const keys=["fitness","nutrition","hydration","cycle","sleep","meditation","moods","journal","goals","supplements","supplementLogs","chores","yogaPractice","yogaStudy","yogaTeach","aiPrefs","settings","outfits","styleChat","styleProfile"];
      const data={};
      for(const k of keys){data[k]=await ld(k,k==="aiPrefs"||k==="styleProfile"?"":k==="settings"?{}:[]);}
      setAllData(data);
      setThemeKey(await ld("themeKey","cosmicYogi"));
      setFontKey(await ld("fontKey","system"));
      setFontSize(await ld("fontSize",15));
      setShowEmojis(await ld("showEmojis",false));
      const ct=await ld("customTheme",null); if(ct) setCustomTheme(ct);
      setLoaded(true);
    })();
  },[]);

  useEffect(()=>{if(loaded){sv("themeKey",themeKey);sv("fontKey",fontKey);sv("fontSize",fontSize);sv("showEmojis",showEmojis);}},[themeKey,fontKey,fontSize,showEmojis,loaded]);

  const searchResults=globalSearch.length>1?MODULES.filter(m=>m.label.toLowerCase().includes(globalSearch.toLowerCase())):[];
  const activeMod=MODULES.find(m=>m.id===activeModule);
  const moduleProps={t,allData,setAllData,showEmojis,companionName};

  const renderModule=()=>{
    switch(activeModule){
      case "dashboard":   return <Dashboard {...moduleProps} setModule={setActiveModule}/>;
      case "fitness":     return <Fitness {...moduleProps}/>;
      case "nutrition":   return <Nutrition {...moduleProps}/>;
      case "hydration":   return <Hydration {...moduleProps}/>;
      case "cycle":       return <Cycle {...moduleProps}/>;
      case "sleep":       return <Sleep {...moduleProps}/>;
      case "meditation":  return <Meditation {...moduleProps}/>;
      case "yoga":        return <Yoga {...moduleProps}/>;
      case "mood":        return <MoodModule {...moduleProps}/>;
      case "style":       return <Style {...moduleProps}/>;
      case "chores":      return <Chores {...moduleProps}/>;
      case "journal":     return <Journal {...moduleProps}/>;
      case "goals":       return <Goals {...moduleProps}/>;
      case "supplements": return <Supplements {...moduleProps}/>;
      case "search":      return <SearchLogs t={t} allData={allData}/>;
      case "network":     return <div><SHdr t={t} title="Connections" sub="Coming soon"/><Card t={t} style={{textAlign:"center",padding:40}}><div style={{color:t.sub}}>We'll build this out together when you're ready.</div></Card></div>;
      case "ai":          return <AIAssistant {...moduleProps}/>;
      case "settings":    return <Settings t={t} themeKey={themeKey} setThemeKey={setThemeKey} fontKey={fontKey} setFontKey={setFontKey} fontSize={fontSize} setFontSize={setFontSize} cardStyle={cardStyle} setCardStyle={setCardStyle} cornerRadius={cornerRadius} setCornerRadius={setCornerRadius} showEmojis={showEmojis} setShowEmojis={setShowEmojis} customTheme={customTheme} setCustomTheme={setCustomTheme} allData={allData} setAllData={setAllData}/>;
      default: return null;
    }
  };

  if(!loaded) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:THEMES.cosmicYogi.bg,fontFamily:"system-ui"}}><div style={{textAlign:"center"}}><div style={{fontSize:32,marginBottom:12,fontWeight:700,color:THEMES.cosmicYogi.text}}>For the Record</div><div style={{color:THEMES.cosmicYogi.sub,fontSize:14}}>Getting everything ready...</div></div></div>;

  return <div style={{fontFamily:FONTS[fontKey],fontSize,background:t.bg,minHeight:"100vh",color:t.text,display:"flex",flexDirection:"column"}}>
    {/* Top bar */}
    <div style={{background:t.nav,borderBottom:`1px solid ${t.border}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:`0 1px 8px ${t.shadow}`}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div onClick={()=>setNavOpen(v=>!v)} style={{fontSize:18,cursor:"pointer",color:t.accent,fontWeight:300}}>☰</div>
        <div style={{fontWeight:700,color:t.text,fontSize:15,letterSpacing:"0.01em"}}>
          {activeModule==="dashboard"?"For the Record":activeMod?.label}
        </div>
      </div>
      <div style={{display:"flex",gap:12,alignItems:"center"}}>
        <div onClick={()=>setShowGSearch(v=>!v)} style={{cursor:"pointer",color:t.accent,fontSize:16}}>⌕</div>
        <div onClick={()=>setActiveModule("ai")} style={{cursor:"pointer",color:t.accent,fontSize:15,fontWeight:600}}>{companionName!=="your companion"?companionName[0].toUpperCase():"AI"}</div>
        <div onClick={()=>setActiveModule("settings")} style={{cursor:"pointer",color:t.accent,fontSize:16}}>◧</div>
      </div>
    </div>

    {showGSearch&&(
      <div style={{background:t.nav,padding:"10px 16px",borderBottom:`1px solid ${t.border}`}}>
        <Input t={t} value={globalSearch} onChange={setGlobalSearch} placeholder="Search modules..."/>
        {searchResults.length>0&&<div style={{marginTop:8}}>{searchResults.map(m=><div key={m.id} onClick={()=>{setActiveModule(m.id);setShowGSearch(false);setGlobalSearch("");}} style={{padding:"8px 12px",cursor:"pointer",color:t.text,borderRadius:8,fontSize:14}}>{m.label}</div>)}</div>}
      </div>
    )}

    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      {navOpen&&(
        <div style={{width:220,background:t.nav,borderRight:`1px solid ${t.border}`,overflowY:"auto",padding:"12px 0",flexShrink:0}}>
          <div style={{padding:"12px 20px 16px",fontWeight:700,color:t.text,fontSize:16,letterSpacing:"0.02em"}}>For the Record</div>
          {MODULES.map(m=>(
            <div key={m.id} onClick={()=>{setActiveModule(m.id);setNavOpen(false);}}
              style={{display:"flex",alignItems:"center",gap:12,padding:"11px 20px",cursor:"pointer",background:activeModule===m.id?t.accent2+"44":"transparent",borderLeft:activeModule===m.id?`3px solid ${t.accent}`:"3px solid transparent",color:activeModule===m.id?t.accent:t.sub,fontWeight:activeModule===m.id?600:400,fontSize:14}}>
              <span style={{fontSize:12,opacity:0.7}}>{m.icon}</span><span>{m.label}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px",maxWidth:700,margin:"0 auto",width:"100%"}}>
        {renderModule()}
        <div style={{height:90}}/>
      </div>
    </div>

    {/* Bottom nav */}
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:t.nav,borderTop:`1px solid ${t.border}`,display:"flex",justifyContent:"space-around",padding:"8px 0",zIndex:100,boxShadow:`0 -2px 12px ${t.shadow}`}}>
      {[{id:"dashboard",label:"Home"},{id:"fitness",label:"Move"},{id:"nutrition",label:"Nourish"},{id:"hydration",label:"Water"},{id:"ai",label:companionName!=="your companion"?companionName.split(" ")[0]:"Guide"}].map(m=>(
        <div key={m.id} onClick={()=>setActiveModule(m.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",color:activeModule===m.id?t.accent:t.sub,padding:"4px 8px",borderRadius:12,background:activeModule===m.id?t.accent2+"33":"transparent"}}>
          <span style={{fontSize:18,opacity:activeModule===m.id?1:0.6}}>{MODULES.find(x=>x.id===m.id)?.icon}</span>
          <span style={{fontSize:10,marginTop:2,fontWeight:activeModule===m.id?600:400}}>{m.label}</span>
        </div>
      ))}
      <div onClick={()=>setNavOpen(v=>!v)} style={{display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",color:t.sub,padding:"4px 8px"}}>
        <span style={{fontSize:18,opacity:0.6}}>◫</span><span style={{fontSize:10,marginTop:2}}>More</span>
      </div>
    </div>
  </div>;
}

  useEffect(()=>{
    (async()=>{
      const keys=["fitness","nutrition","hydration","cycle","sleep","meditation","moods","journal","goals","supplements","supplementLogs","chores","yogaPractice","yogaStudy","yogaTeach","aiPrefs","settings","outfits","styleChat","styleProfile"];
      const data={};
      for(const k of keys){data[k]=await ld(k,k==="aiPrefs"||k==="styleProfile"?"":k==="settings"?{}:[]);}
      setAllData(data);
      setThemeKey(await ld("themeKey","blush"));
      setFontKey(await ld("fontKey","system"));
      setFontSize(await ld("fontSize",15));
      setLoaded(true);
    })();
  },[]);

  useEffect(()=>{if(loaded){sv("themeKey",themeKey);sv("fontKey",fontKey);sv("fontSize",fontSize);}},[themeKey,fontKey,fontSize,loaded]);

  const activeMod=MODULES.find(m=>m.id===activeModule);
  const moduleProps={t,allData,setAllData};

  const renderModule=()=>{
    switch(activeModule){
      case "dashboard":   return <Dashboard {...moduleProps} setModule={setActiveModule}/>;
      case "fitness":     return <Fitness {...moduleProps}/>;
      case "nutrition":   return <Nutrition {...moduleProps}/>;
      case "hydration":   return <Hydration {...moduleProps}/>;
      case "cycle":       return <Cycle {...moduleProps}/>;
      case "sleep":       return <Sleep {...moduleProps}/>;
      case "meditation":  return <Meditation {...moduleProps}/>;
      case "yoga":        return <Yoga {...moduleProps}/>;
      case "mood":        return <MoodModule {...moduleProps}/>;
      case "style":       return <Style {...moduleProps}/>;
      case "chores":      return <Chores {...moduleProps}/>;
      case "journal":     return <Journal {...moduleProps}/>;
      case "goals":       return <Goals {...moduleProps}/>;
      case "supplements": return <Supplements {...moduleProps}/>;
      case "search":      return <SearchLogs t={t} allData={allData}/>;
      case "network":     return <div><SHdr t={t} title="🤝 Networking" sub="Coming soon"/><Card t={t} style={{textAlign:"center",padding:40}}><div style={{fontSize:48,marginBottom:16}}>🤝</div><div style={{color:t.sub}}>Placeholder — we'll build this out when you're ready.</div></Card></div>;
      case "ai":          return <AIAssistant {...moduleProps}/>;
      case "settings":    return <Settings t={t} themeKey={themeKey} setThemeKey={setThemeKey} fontKey={fontKey} setFontKey={setFontKey} fontSize={fontSize} setFontSize={setFontSize} cardStyle={cardStyle} setCardStyle={setCardStyle} cornerRadius={cornerRadius} setCornerRadius={setCornerRadius} allData={allData} setAllData={setAllData}/>;
      default: return null;
    }
  };

  const gSearchResults=globalSearch.length>1?MODULES.filter(m=>m.label.toLowerCase().includes(globalSearch.toLowerCase())):[];

  if(!loaded) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#fff5f5",fontFamily:"system-ui"}}><div style={{textAlign:"center"}}><div style={{fontSize:56,marginBottom:12}}>🌸</div><div style={{color:"#8a6060",fontSize:16}}>Loading your wellness sanctuary...</div></div></div>;

  return <div style={{fontFamily:FONTS[fontKey],fontSize,background:t.bg,minHeight:"100vh",color:t.text,display:"flex",flexDirection:"column"}}>
    {/* Top bar */}
    <div style={{background:t.nav,borderBottom:`1px solid ${t.border}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:`0 1px 8px ${t.shadow}`}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div onClick={()=>setNavOpen(v=>!v)} style={{fontSize:20,cursor:"pointer",color:t.accent}}>☰</div>
        <div style={{fontWeight:700,color:t.text,fontSize:16}}>{activeMod?.icon} {activeMod?.label}</div>
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <div onClick={()=>setShowGSearch(v=>!v)} style={{cursor:"pointer",color:t.accent,fontSize:18}}>🔍</div>
          <div onClick={()=>setActiveModule("ai")} style={{cursor:"pointer",color:t.accent,fontSize:20}}>🌸</div>
          <div onClick={()=>setActiveModule("settings")} style={{cursor:"pointer",color:t.accent,fontSize:18}}>⚙️</div>
        </div>
      </div>

      {showGSearch&&(
        <div style={{background:t.nav,padding:"10px 16px",borderBottom:`1px solid ${t.border}`}}>
          <Input t={t} value={globalSearch} onChange={setGlobalSearch} placeholder="Search modules..."/>
          {gSearchResults.length>0&&<div style={{marginTop:8}}>{gSearchResults.map(m=><div key={m.id} onClick={()=>{setActiveModule(m.id);setShowGSearch(false);setGlobalSearch("");}} style={{padding:"8px 12px",cursor:"pointer",color:t.text,borderRadius:8}}>{m.icon} {m.label}</div>)}</div>}
        </div>
      )}

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {navOpen&&(
          <div style={{width:220,background:t.nav,borderRight:`1px solid ${t.border}`,overflowY:"auto",padding:"12px 0",flexShrink:0}}>
            {MODULES.map(m=>(
              <div key={m.id} onClick={()=>{setActiveModule(m.id);setNavOpen(false);}}
                style={{display:"flex",alignItems:"center",gap:12,padding:"11px 20px",cursor:"pointer",background:activeModule===m.id?t.accent2+"44":"transparent",borderLeft:activeModule===m.id?`3px solid ${t.accent}`:"3px solid transparent",color:activeModule===m.id?t.accent:t.sub,fontWeight:activeModule===m.id?700:400,fontSize:14}}>
                <span>{m.icon}</span><span>{m.label}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{flex:1,overflowY:"auto",padding:"20px 16px",maxWidth:700,margin:"0 auto",width:"100%"}}>
          {renderModule()}
          <div style={{height:90}}/>
        </div>
      </div>

      <div style={{position:"fixed",bottom:0,left:0,right:0,background:t.nav,borderTop:`1px solid ${t.border}`,display:"flex",justifyContent:"space-around",padding:"8px 0",zIndex:100,boxShadow:`0 -2px 12px ${t.shadow}`}}>
        {[{id:"dashboard",icon:"⊞"},{id:"fitness",icon:"💪"},{id:"nutrition",icon:"🥗"},{id:"hydration",icon:"💧"},{id:"ai",icon:"🌸"}].map(m=>(
          <div key={m.id} onClick={()=>setActiveModule(m.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",color:activeModule===m.id?t.accent:t.sub,padding:"4px 8px",borderRadius:12,background:activeModule===m.id?t.accent2+"33":"transparent"}}>
            <span style={{fontSize:20}}>{m.icon}</span>
            <span style={{fontSize:10,marginTop:2}}>{MODULES.find(x=>x.id===m.id)?.label}</span>
          </div>
        ))}
        <div onClick={()=>setNavOpen(v=>!v)} style={{display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",color:t.sub,padding:"4px 8px"}}>
          <span style={{fontSize:20}}>☰</span><span style={{fontSize:10,marginTop:2}}>More</span>
        </div>
      </div>
    </div>;
}
