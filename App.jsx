import { useState, useMemo } from "react";
// Импорт данных из data.js
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

// --- Основной компонент ---
export default function App() {
  const [uiLang, setUiLang]     = useState("ru");
  const [query, setQuery]       = useState("");
  const [searchIn, setSearchIn] = useState("all");
  const [topic, setTopic]       = useState("all");
  const [alpha, setAlpha]       = useState("all");
  const [dialect, setDialect]   = useState("all");
  const [cardDialects, setCardDialects] = useState({});

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
      if (dialect !== "all" && e.dialect && e.dialect !== dialect) return false;
      if (!q) return true;
      if (searchIn === "all") return (
        e.meg.toLowerCase().includes(q) ||
        e.geo.toLowerCase().includes(q) ||
        e.ru.toLowerCase().includes(q) ||
        e.en.toLowerCase().includes(q)
      );
      return e[searchIn]?.toLowerCase().includes(q);
    }).sort((a, b) => {
      if (a.topic === "numbers" && b.topic === "numbers") return (a.num ?? 0) - (b.num ?? 0);
      return compareGeorgian(a, b);
    });
  }, [query, searchIn, topic, alpha, dialect]);

  const UI = {
    ru:{title:"Мегрельский словарь", sub:"Климов & Каджаиа, 2026", ph:"Поиск слова…", noR:"Ничего не найдено", tot:"слов в базе", sin:"Искать в:", dial:"Диалект"},
    en:{title:"Mingrelian Dictionary", sub:"Klimov & Kadjaia, 2026", ph:"Search a word…", noR:"Nothing found", tot:"words", sin:"Search in:", dial:"Dialect"},
    ge:{title:"მეგრული ლექსიკონი", sub:"კლიმოვი & კაჯაია, 2026", ph:"სიტყვის ძიება…", noR:"ვერ მოიძებნა", tot:"სიტყვა", sin:"ძებნა:", dial:"დიალექტი"},
  };
  const t = UI[uiLang];
  const FLAG = {ru:"🇷🇺", en:"🇬🇧", ge:"🇬🇪"};
  const topLabel = tp => uiLang==="ge" ? tp.ge : uiLang==="en" ? tp.en : tp.ru;
  const allLabel = uiLang==="ge" ? "ყველა" : uiLang==="en" ? "All" : "Все";
  const q = query.trim();

  return (
    <div style={{minHeight:"100vh",background:"#0f1a12",fontFamily:"'Georgia','Noto Serif Georgian',serif",color:"#e8e0cc"}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse 80% 50% at 50% 0%,rgba(60,140,60,0.1) 0%,transparent 65%)"}}/>
      <style>{`
        @keyframes fadeUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
        .fu{animation:fadeUp 0.25s ease-out}
        input:focus{outline:none}
        .pill{border:none;border-radius:20px;font-family:Georgia,serif;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;}
        .pill:hover{transform:scale(1.02)}
        .card{transition:transform 0.15s,box-shadow 0.15s}
        .card:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(0,0,0,0.45)}
        .sc::-webkit-scrollbar{display:none}
        .sc{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      <header style={{position:"sticky",top:0,zIndex:100,background:"rgba(8,14,9,0.93)",backdropFilter:"blur(14px)",borderBottom:"1px solid rgba(80,160,80,0.18)",padding:"11px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <span style={{fontSize:22}}>📖</span>
          <div>
            <div style={{fontWeight:"bold",fontSize:16,color:"#7dcf7d",letterSpacing:.8}}>{t.title}</div>
            <div style={{fontSize:10,color:"rgba(232,224,204,0.38)"}}>{t.sub}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:4}}>
          {["ru","en","ge"].map(l=>(
            <button key={l} className="pill" onClick={()=>setUiLang(l)} style={{padding:"5px 11px",fontSize:12,background:uiLang===l?"#7dcf7d":"rgba(80,160,80,0.12)",color:uiLang===l?"#0f1a12":"#e8e0cc",fontWeight:uiLang===l?"bold":"normal",border:"1px solid rgba(80,160,80,0.24)"}}>
              {FLAG[l]}
            </button>
          ))}
        </div>
      </header>

      <div style={{maxWidth:700,margin:"0 auto",padding:"16px 14px 60px"}}>
        
        {/* АЛФАВИТ */}
        <div className="sc" style={{display:"flex",gap:3,overflowX:"auto",paddingBottom:8,marginBottom:8}}>
          {alphaList.map(l=>(
            <button key={l} className="pill" onClick={()=>setAlpha(l)} style={{
              whiteSpace:"nowrap", minWidth: l==="all"? "auto":34, padding: "5px 11px",
              fontSize: l==="all"? 12 : 20, fontFamily:"'Noto Serif Georgian',serif",
              background: alpha===l ? "#7dcf7d" : "rgba(80,160,80,0.1)", color: alpha===l ? "#0f1a12" : "#b8d8b8",
              border:"1px solid rgba(80,160,80,0.2)",
            }}>{l==="all" ? allLabel : l}</button>
          ))}
        </div>

        {/* КАТЕГОРИИ */}
        <div className="sc" style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:10,marginBottom:15}}>
          {TOPICS.map(tp=>(
            <button key={tp.key} className="pill" onClick={()=>setTopic(tp.key)} style={{
              whiteSpace:"nowrap",padding:"5px 11px",fontSize:12,
              background:topic===tp.key?"#7dcf7d":"rgba(80,160,80,0.1)",
              color:topic===tp.key?"#0f1a12":"#e8e0cc",
              border:"1px solid rgba(80,160,80,0.2)",
            }}>{tp.icon} {topLabel(tp)}</button>
          ))}
        </div>

        {/* ФИЛЬТР ДИАЛЕКТОВ (ОБНОВЛЕННЫЙ) */}
        <div style={{marginBottom:15, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap"}}>
          <span style={{fontSize:10, color:"rgba(232,224,204,0.3)", textTransform:"uppercase"}}>{t.dial}:</span>
          {[
            {k:"all", r:"Все", e:"All", g:"ყველა"},
            {k:"sam", r:"Самурзакано-зугдидский", e:"Samurzakan-Zugdidi", g:"სამურზაყანო-ზუგდიდური"},
            {k:"sen", r:"Сенакский", e:"Senaki", g:"სენაკური"}
          ].map(d=>(
            <button key={d.k} className="pill" onClick={()=>setDialect(d.k)} style={{
              padding:"6px 12px", fontSize:11,
              background: dialect===d.k ? "rgba(125,180,255,0.2)" : "rgba(80,160,80,0.05)",
              color: dialect===d.k ? "#7db4ff" : "rgba(232,224,204,0.5)",
              border: "1px solid rgba(80,160,80,0.15)"
            }}>
              {uiLang==="ge"?d.g : uiLang==="en"?d.e : d.r}
            </button>
          ))}
        </div>

        {/* ПОИСК */}
        <div className="fu" style={{background:"rgba(80,160,80,0.07)",border:"1px solid rgba(80,160,80,0.26)",borderRadius:16,padding:"12px 14px",marginBottom:12}}>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:17,opacity:0.4}}>🔍</span>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.ph}
              style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(80,160,80,0.26)",borderRadius:10,padding:"10px 34px 10px 37px",fontSize:16,color:"#e8e0cc",fontFamily:"Georgia,serif"}}/>
            {query && <button onClick={()=>setQuery("")} style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"rgba(232,224,204,0.4)",cursor:"pointer",fontSize:18}}>✕</button>}
          </div>
        </div>

        {/* КАРТОЧКИ */}
        <div style={{fontSize:11,color:"rgba(232,224,204,0.35)",marginBottom:10}}>{results.length} / {DICT.length} {t.tot}</div>
        
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {results.map((entry,i)=>{
            const hasDialects = !!entry.dialects;
            const ck = entry.meg;
            const activeDial = hasDialects ? (cardDialects[ck] || Object.keys(entry.dialects)[0]) : null;
            const displayMeg = hasDialects ? (entry.dialects[activeDial]?.meg || entry.meg) : entry.meg;
            const displayTr  = hasDialects ? (entry.dialects[activeDial]?.tr  || entry.tr)  : entry.tr;

            return (
              <div key={i} className="card" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(80,160,80,0.16)",borderRadius:13,padding:"12px 14px",position:"relative"}}>
                {/* В карточках оставляем сокращения */}
                <div style={{position:"absolute",top:10,right:10,display:"flex",gap:3}}>
                  {hasDialects ? Object.keys(entry.dialects).map(d=>(
                    <button key={d} onClick={()=>setCardDialects(prev=>({...prev,[ck]:d}))} style={{
                      fontSize:9,padding:"2px 6px",borderRadius:6,fontWeight:"bold",cursor:"pointer",border:"none",
                      background:activeDial===d?(d==="sam"?"rgba(80,140,255,0.35)":"rgba(255,160,80,0.35)"):"rgba(255,255,255,0.06)",
                      color:activeDial===d?(d==="sam"?"rgba(160,200,255,1)":"rgba(255,200,130,1)"):"rgba(232,224,204,0.3)",
                    }}>{d==="sam"?"сам.":"сен."}</button>
                  )) : entry.dialect && (
                    <div style={{fontSize:9,padding:"2px 6px",borderRadius:6,fontWeight:"bold",background:entry.dialect==="sam"?"rgba(80,140,255,0.15)":"rgba(255,160,80,0.15)",color:entry.dialect==="sam"?"rgba(140,180,255,0.9)":"rgba(255,190,120,0.9)"}}>{entry.dialect==="sam"?"сам.":"сен."}</div>
                  )}
                </div>

                <div style={{marginBottom:9}}>
                  <div style={{fontSize:27,fontWeight:"bold",color:"#7dcf7d",fontFamily:"'Noto Serif Georgian',serif",lineHeight:1.2}}>
                    <HL text={displayMeg} q={q}/>
                  </div>
                  <div style={{fontSize:11,color:"rgba(180,220,180,0.4)",fontStyle:"italic"}}>[{displayTr}]</div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"5px 10px"}}>
                  <div>
                    <div style={{fontSize:9,color:"rgba(232,224,204,0.27)",textTransform:"uppercase"}}>ქართ.</div>
                    <div style={{fontSize:13,color:"rgba(180,200,255,0.85)",fontFamily:"'Noto Serif Georgian',serif"}}><HL text={entry.geo} q={q}/></div>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:"rgba(232,224,204,0.27)",textTransform:"uppercase"}}>Рус.</div>
                    <div style={{fontSize:13,color:"rgba(232,224,204,0.85)"}}><HL text={entry.ru} q={q}/></div>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:"rgba(232,224,204,0.27)",textTransform:"uppercase"}}>Eng.</div>
                    <div style={{fontSize:13,color:"rgba(200,222,200,0.85)"}}><HL text={entry.en} q={q}/></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <footer style={{textAlign:"center",marginTop:40,color:"rgba(232,224,204,0.15)",fontSize:11}}>
          <div>✦ Климов Г.А., Каджаиа О.М. ✦</div>
          <div>2026</div>
        </footer>
      </div>
    </div>
  );
}
