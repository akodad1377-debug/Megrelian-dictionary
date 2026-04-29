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
  return <>{text.slice(0,idx)}<mark style={{background:"rgba(125,207,125,0.3)",borderRadius:3,color:"inherit"}}>{text.slice(idx,idx+q.length)}</mark>{text.slice(idx+q.length)}</>;
}

export default function App() {
  const [uiLang, setUiLang]     = useState("ru");
  const [query, setQuery]       = useState("");
  const [topic, setTopic]       = useState("all");
  const [alpha, setAlpha]       = useState("all");
  const [dialect, setDialect]   = useState("all"); 
  const [cardDialects, setCardDialects] = useState({}); 

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
    ru:{title:"Мегрельский словарь", sub:"Климов & Каджаиа, 2026", ph:"Поиск слова...", tot:"слов", dial:"Диалект"},
    en:{title:"Mingrelian Dictionary", sub:"Klimov & Kadjaia, 2026", ph:"Search...", tot:"words", dial:"Dialect"},
    ge:{title:"მეგრული ლექსიკონი", sub:"კლიმოვი & კაჯაია, 2026", ph:"ძიება...", tot:"სიტყვა", dial:"დიალექტი"},
  };
  const t = UI[uiLang];
  const FLAG = {ru:"🇷🇺", en:"🇬🇧", ge:"🇬🇪"};
  const topLabel = tp => uiLang==="ge" ? tp.ge : uiLang==="en" ? tp.en : tp.ru;
  const allLabel = uiLang==="ge" ? "ყველა" : uiLang==="en" ? "All" : "Все";

  return (
    <div style={{
      minHeight:"100vh",
      background:"#0a110b",
      color:"#e8e0cc",
      fontFamily:"system-ui, -apple-system, sans-serif",
      paddingTop: "env(safe-area-inset-top)" // Для iPhone
    }}>
      <style>{`
        @font-face { font-family: 'Mtavruli'; src: local('BPG Nateli Mtavruli'), local('Arial'); }
        .sc::-webkit-scrollbar { display: none; }
        .pill { border: none; cursor: pointer; transition: transform 0.1s, opacity 0.2s; -webkit-tap-highlight-color: transparent; }
        .pill:active { transform: scale(0.95); opacity: 0.8; }
        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(125,207,125,0.15); border-radius: 18px; padding: 16px; position: relative; }
        input::placeholder { color: rgba(232,224,204,0.3); }
      `}</style>

      {/* HEADER */}
      <header style={{
        position:"sticky", top:0, zIndex:100, 
        background:"rgba(10,17,11,0.9)", backdropFilter:"blur(12px)",
        padding:"12px 16px", borderBottom:"1px solid rgba(125,207,125,0.1)"
      }}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", maxWidth:600, margin:"0 auto"}}>
          <div>
            <div style={{fontWeight:"800", fontSize:18, color:"#7dcf7d"}}>{t.title}</div>
            <div style={{fontSize:10, opacity:0.5}}>{t.sub}</div>
          </div>
          <div style={{display:"flex", gap:6}}>
            {["ru","en","ge"].map(l=>(
              <button key={l} onClick={()=>setUiLang(l)} className="pill" style={{
                background: uiLang===l ? "#7dcf7d" : "rgba(255,255,255,0.05)",
                color: uiLang===l ? "#0a110b" : "#e8e0cc",
                padding:"6px 10px", borderRadius:10, fontSize:12, fontWeight:"bold"
              }}>{FLAG[l]}</button>
            ))}
          </div>
        </div>
      </header>

      <main style={{maxWidth:600, margin:"0 auto", padding:"16px"}}>
        
        {/* FILTERS */}
        <div className="sc" style={{display:"flex", gap:6, overflowX:"auto", marginBottom:12}}>
          {alphaList.map(l=>(
            <button key={l} onClick={()=>setAlpha(l)} className="pill" style={{
              minWidth:40, height:40, borderRadius:12, flexShrink:0,
              background: alpha===l ? "#7dcf7d" : "rgba(255,255,255,0.05)",
              color: alpha===l ? "#0a110b" : "#7dcf7d",
              fontSize: l==="all" ? 12 : 18, fontWeight:"bold"
            }}>{l==="all" ? allLabel : l}</button>
          ))}
        </div>

        <div className="sc" style={{display:"flex", gap:8, overflowX:"auto", marginBottom:16}}>
          {TOPICS.map(tp=>(
            <button key={tp.key} onClick={()=>setTopic(tp.key)} className="pill" style={{
              whiteSpace:"nowrap", padding:"8px 14px", borderRadius:12, fontSize:13,
              background: topic===tp.key ? "rgba(125,207,125,0.2)" : "rgba(255,255,255,0.05)",
              color: topic===tp.key ? "#7dcf7d" : "#e8e0cc",
              border: topic===tp.key ? "1px solid #7dcf7d" : "1px solid transparent"
            }}>{tp.icon} {topLabel(tp)}</button>
          ))}
        </div>

        {/* DIALECT SELECTOR */}
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:20, fontSize:11}}>
          <span style={{opacity:0.4, textTransform:"uppercase"}}>{t.dial}:</span>
          <div style={{display:"flex", background:"rgba(255,255,255,0.03)", padding:3, borderRadius:12}}>
            {[{k:"all",n:allLabel},{k:"sam",n:"Сам."},{k:"sen",n:"Сен."}].map(d=>(
              <button key={d.k} onClick={()=>handleDialectChange(d.k)} className="pill" style={{
                padding:"6px 14px", borderRadius:9, fontSize:12,
                background: dialect===d.k ? "rgba(125,207,125,0.15)" : "transparent",
                color: dialect===d.k ? "#7dcf7d" : "rgba(232,224,204,0.5)",
              }}>{d.n}</button>
            ))}
          </div>
        </div>

        {/* SEARCH */}
        <div style={{position:"relative", marginBottom:20}}>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.ph} style={{
            width:"100%", padding:"14px 16px 14px 44px", borderRadius:16, border:"1px solid rgba(125,207,125,0.2)",
            background:"rgba(255,255,255,0.02)", color:"#fff", fontSize:16, boxSizing:"border-box"
          }}/>
          <span style={{position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", opacity:0.3}}>🔍</span>
        </div>

        {/* LIST */}
        <div style={{marginBottom:10, fontSize:12, opacity:0.4}}>{results.length} {t.tot}</div>
        
        <div style={{display:"flex", flexDirection:"column", gap:12}}>
          {results.map((entry, i) => {
            const hasDialects = !!entry.dialects;
            let activeDial = cardDialects[entry.meg];
            if (!activeDial && hasDialects) {
              activeDial = (dialect !== "all" && entry.dialects[dialect]) ? dialect : Object.keys(entry.dialects)[0];
            }
            const displayMeg = hasDialects ? (entry.dialects[activeDial]?.meg || entry.meg) : entry.meg;
            const displayTr  = hasDialects ? (entry.dialects[activeDial]?.tr  || entry.tr)  : entry.tr;

            return (
              <div key={i} className="card">
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12}}>
                  <div>
                    <div style={{fontSize:28, fontWeight:"bold", color:"#7dcf7d", fontFamily:"'Noto Serif Georgian', serif"}}><HL text={displayMeg} q={query}/></div>
                    <div style={{fontSize:12, opacity:0.4, fontStyle:"italic"}}>[{displayTr}]</div>
                  </div>
                  {/* Переключатель диалекта внутри карточки */}
                  {hasDialects && (
                    <div style={{display:"flex", gap:4, background:"rgba(0,0,0,0.2)", padding:3, borderRadius:8}}>
                      {Object.keys(entry.dialects).map(d=>(
                        <button key={d} onClick={()=>setCardDialects(p=>({...p,[entry.meg]:d}))} style={{
                          border:"none", padding:"2px 6px", borderRadius:5, fontSize:9, fontWeight:"bold", cursor:"pointer",
                          background: activeDial===d ? "#7dcf7d" : "transparent",
                          color: activeDial===d ? "#0a110b" : "rgba(232,224,204,0.4)"
                        }}>{d.toUpperCase()}</button>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{display:"flex", flexWrap:"wrap", gap:"10px 20px"}}>
                  <div style={{minWidth:80}}>
                    <div style={{fontSize:9, opacity:0.3, textTransform:"uppercase", marginBottom:2}}>ქართული</div>
                    <div style={{fontSize:14, color:"#a3c3ff"}}><HL text={entry.geo} q={query}/></div>
                  </div>
                  <div style={{minWidth:80}}>
                    <div style={{fontSize:9, opacity:0.3, textTransform:"uppercase", marginBottom:2}}>Русский</div>
                    <div style={{fontSize:14}}><HL text={entry.ru} q={query}/></div>
                  </div>
                  <div style={{minWidth:80}}>
                    <div style={{fontSize:9, opacity:0.3, textTransform:"uppercase", marginBottom:2}}>English</div>
                    <div style={{fontSize:14, color:"#b0ccb0"}}><HL text={entry.en} q={query}/></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
