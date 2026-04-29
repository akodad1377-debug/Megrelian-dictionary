import { useState, useMemo } from "react";
import { GEO_ALPHA, TOPICS, DICT } from "./data";

// --- Вспомогательные функции ---
function firstLetter(meg) {
  for (const ch of meg) if (GEO_ALPHA.includes(ch)) return ch;
  return "";
}

function compareGeorgian(a, b) {
  const aw = a.meg;
  const bw = b.meg;
  const len = Math.max(aw.length, bw.length);
  for (let i = 0; i < len; i++) {
    const ac = aw[i] ?? "";
    const bc = bw[i] ?? "";
    if (ac === bc) continue;
    const ai = GEO_ALPHA.indexOf(ac);
    const bi = GEO_ALPHA.indexOf(bc);
    const an = ai === -1 ? 999 : ai;
    const bn = bi === -1 ? 999 : bi;
    if (an !== bn) return an - bn;
  }
  return 0;
}

function HL({ text, q }) {
  if (!q || !text) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return <>{text.slice(0,idx)}<mark style={{background:"rgba(244,160,35,0.45)",borderRadius:3,color:"inherit"}}>{text.slice(idx,idx+q.length)}</mark>{text.slice(idx+q.length)}</>;
}

export default function App() {
  const [uiLang, setUiLang]     = useState("ru");
  const [query, setQuery]       = useState("");
  const [topic, setTopic]       = useState("all");
  const [alpha, setAlpha]       = useState("all");
  const [dialect, setDialect]   = useState("all"); 
  const [cardDialects, setCardDialects] = useState({}); 

  // Смена диалекта сверху сбрасывает ручные настройки карточек
  const handleDialectChange = (newDialect) => {
    setDialect(newDialect);
    setCardDialects({}); 
  };

  const alphaList = useMemo(() => {
    const s = new Set();
    DICT.forEach(e => { const ch = firstLetter(e.meg); if (ch) s.add(ch); });
    return ["all", ...GEO_ALPHA.filter(l => s.has(l))];
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DICT.filter(e => {
      if (alpha !== "all" && firstLetter(e.meg) !== alpha) return false;
      if (topic !== "all" && e.topic !== topic) return false;
      
      // Показываем если: выбрано "Все", или это общее слово, или есть совпадение по диалекту
      if (dialect !== "all") {
        const isCommon = !e.dialect && !e.dialects; 
        const hasInRoot = e.dialect === dialect;
        const hasInVariants = e.dialects && !!e.dialects[dialect];
        if (!isCommon && !hasInRoot && !hasInVariants) return false;
      }

      if (!q) return true;
      return (
        e.meg.toLowerCase().includes(q) || e.geo.toLowerCase().includes(q) ||
        e.ru.toLowerCase().includes(q) || e.en.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      if (a.topic === "numbers" && b.topic === "numbers") return (a.num ?? 0) - (b.num ?? 0);
      return compareGeorgian(a, b);
    });
  }, [query, topic, alpha, dialect]);

  const UI = {
    ru:{title:"Мегрельский словарь", sub:"Климов & Каджаиа, 2026", ph:"Поиск слова...", tot:"слов в базе", dial:"ДИАЛЕКТ"},
    en:{title:"Mingrelian Dictionary", sub:"Klimov & Kadjaia, 2026", ph:"Search...", tot:"words", dial:"DIALECT"},
    ge:{title:"მეგრული ლექსიკონი", sub:"კლიმოვი & კაჯაია, 2026", ph:"ძიება...", tot:"სიტყვა", dial:"დიალექტი"},
  };
  const t = UI[uiLang];
  const FLAG = {ru:"🇷🇺", en:"🇬🇧", ge:"🇬🇪"};
  const topLabel = tp => uiLang==="ge" ? tp.ge : uiLang==="en" ? tp.en : tp.ru;
  const allLabel = uiLang==="ge" ? "ყველა" : uiLang==="en" ? "All" : "Все";

  return (
    <div style={{minHeight:"100vh", background:"#0f1a12", color:"#e8e0cc", fontFamily:"'Georgia', serif"}}>
      <style>{`
        .sc::-webkit-scrollbar { display: none; }
        .pill { border: none; border-radius: 20px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
        input:focus { outline: none; }
      `}</style>

      {/* ШАПКА */}
      <header style={{position:"sticky", top:0, zIndex:100, background:"rgba(8,14,9,0.95)", padding:"11px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(80,160,80,0.2)"}}>
        <div style={{display:"flex", alignItems:"center", gap:9}}>
          <span style={{fontSize:22}}>📖</span>
          <div>
            <div style={{fontWeight:"bold", fontSize:16, color:"#7dcf7d"}}>{t.title}</div>
            <div style={{fontSize:10, opacity:0.4}}>{t.sub}</div>
          </div>
        </div>
        <div style={{display:"flex", gap:4}}>
          {["ru","en","ge"].map(l=>(
            <button key={l} onClick={()=>setUiLang(l)} className="pill" style={{padding:"5px 11px", fontSize:12, background:uiLang===l?"#7dcf7d":"rgba(80,160,80,0.12)", color:uiLang===l?"#0f1a12":"#e8e0cc"}}>
              {FLAG[l]}
            </button>
          ))}
        </div>
      </header>

      <div style={{maxWidth:700, margin:"0 auto", padding:"16px 14px"}}>
        
        {/* АЛФАВИТ */}
        <div className="sc" style={{display:"flex", gap:3, overflowX:"auto", marginBottom:15}}>
          {alphaList.map(l=>(
            <button key={l} onClick={()=>setAlpha(l)} className="pill" style={{
              minWidth: 35, padding: "8px", background: alpha===l ? "#7dcf7d" : "rgba(80,160,80,0.1)",
              color: alpha===l ? "#0f1a12" : "#b8d8b8", fontSize: l==="all"?12:18
            }}>{l==="all" ? allLabel : l}</button>
          ))}
        </div>

        {/* ТЕМЫ */}
        <div className="sc" style={{display:"flex", gap:5, overflowX:"auto", marginBottom:15}}>
          {TOPICS.map(tp=>(
            <button key={tp.key} onClick={()=>setTopic(tp.key)} className="pill" style={{
              whiteSpace:"nowrap", padding:"6px 12px", fontSize:12,
              background: topic===tp.key ? "#7dcf7d" : "rgba(80,160,80,0.1)",
              color: topic===tp.key ? "#0f1a12" : "#e8e0cc"
            }}>{tp.icon} {topLabel(tp)}</button>
          ))}
        </div>

        {/* ФИЛЬТР ДИАЛЕКТОВ (Твой стиль) */}
        <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:15, fontSize:11}}>
          <span style={{opacity:0.3}}>{t.dial}:</span>
          {[
            {k:"all", n:allLabel},
            {k:"sam", n:"Самурзакано-зугдидский"},
            {k:"sen", n:"Сенакский"}
          ].map(d=>(
            <button key={d.k} onClick={()=>handleDialectChange(d.k)} className="pill" style={{
              padding:"6px 12px", fontSize:11, border:"1px solid rgba(80,160,80,0.2)",
              background: dialect===d.k ? "rgba(125,180,255,0.2)" : "transparent",
              color: dialect===d.k ? "#7db4ff" : "rgba(232,224,204,0.5)"
            }}>{d.n}</button>
          ))}
        </div>

        {/* ПОИСК */}
        <div style={{background:"rgba(80,160,80,0.05)", border:"1px solid rgba(80,160,80,0.2)", borderRadius:16, padding:"12px", marginBottom:15}}>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.ph} style={{
            width:"100%", background:"transparent", border:"none", color:"#e8e0cc", fontSize:16
          }}/>
        </div>

        {/* КАРТОЧКИ (Твой оригинальный дизайн со скриншота) */}
        <div style={{display:"flex", flexDirection:"column", gap:10}}>
          {results.map((entry, i) => {
            const hasDialects = !!entry.dialects;
            let activeDial = cardDialects[entry.meg];
            if (!activeDial && hasDialects) {
              activeDial = (dialect !== "all" && entry.dialects[dialect]) ? dialect : Object.keys(entry.dialects)[0];
            }
            const displayMeg = hasDialects ? (entry.dialects[activeDial]?.meg || entry.meg) : entry.meg;
            const displayTr  = hasDialects ? (entry.dialects[activeDial]?.tr  || entry.tr)  : entry.tr;

            return (
              <div key={i} style={{background:"rgba(255,255,255,0.04)", border:"1px solid rgba(80,160,80,0.15)", borderRadius:13, padding:"14px", position:"relative"}}>
                
                {/* Кнопки диалектов внутри карточки */}
                <div style={{position:"absolute", top:10, right:10, display:"flex", gap:3}}>
                  {hasDialects ? Object.keys(entry.dialects).map(d=>(
                    <button key={d} onClick={() => setCardDialects(p=>({...p,[entry.meg]:d}))} style={{
                      fontSize:9, padding:"2px 6px", borderRadius:6, border:"none", cursor:"pointer",
                      background: activeDial===d ? "rgba(125,180,255,0.3)" : "rgba(255,255,255,0.05)",
                      color: activeDial===d ? "#7db4ff" : "rgba(232,224,204,0.3)"
                    }}>{d === "sam" ? "сам." : "сен."}</button>
                  )) : entry.dialect && (
                    <div style={{fontSize:9, color: entry.dialect==="sam"?"#7db4ff":"#ffb47d"}}>{entry.dialect==="sam"?"сам.":"сен."}</div>
                  )}
                </div>

                <div style={{marginBottom:10}}>
                  <div style={{fontSize:26, fontWeight:"bold", color:"#7dcf7d"}}><HL text={displayMeg} q={query}/></div>
                  <div style={{fontSize:11, opacity:0.4, fontStyle:"italic"}}>[{displayTr}]</div>
                </div>

                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10}}>
                  <div>
                    <div style={{fontSize:9, opacity:0.3, textTransform:"uppercase"}}>ქართ.</div>
                    <div style={{fontSize:13}}><HL text={entry.geo} q={query}/></div>
                  </div>
                  <div>
                    <div style={{fontSize:9, opacity:0.3, textTransform:"uppercase"}}>Рус.</div>
                    <div style={{fontSize:13}}><HL text={entry.ru} q={query}/></div>
                  </div>
                  <div>
                    <div style={{fontSize:9, opacity:0.3, textTransform:"uppercase"}}>Eng.</div>
                    <div style={{fontSize:13}}><HL text={entry.en} q={query}/></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
