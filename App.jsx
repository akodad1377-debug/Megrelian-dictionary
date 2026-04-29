import { useState, useMemo } from "react";
import { GEO_ALPHA, TOPICS, DICT } from "./data";

// --- Логика ---
function firstLetter(meg) {
  for (const ch of meg) if (GEO_ALPHA.includes(ch)) return ch;
  return "";
}

function compareGeorgian(a, b) {
  const aw = a.meg, bw = b.meg;
  const len = Math.max(aw.length, bw.length);
  for (let i = 0; i < len; i++) {
    const ai = GEO_ALPHA.indexOf(aw[i] ?? ""), bi = GEO_ALPHA.indexOf(bw[i] ?? "");
    const an = ai === -1 ? 999 : ai, bn = bi === -1 ? 999 : bi;
    if (an !== bn) return an - bn;
  }
  return 0;
}

function HL({ text, q }) {
  if (!q || !text) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return <>{text.slice(0,idx)}<mark style={{background:"rgba(125,207,125,0.3)",borderRadius:2,color:"inherit"}}>{text.slice(idx,idx+q.length)}</mark>{text.slice(idx+q.length)}</>;
}

export default function App() {
  const [uiLang, setUiLang] = useState("ru");
  const [query, setQuery] = useState("");
  const [searchIn, setSearchIn] = useState("all");
  const [topic, setTopic] = useState("all");
  const [alpha, setAlpha] = useState("all");
  const [dialect, setDialect] = useState("all");
  const [cardDialects, setCardDialects] = useState({});

  const handleGlobalDialectChange = (newDial) => {
    setDialect(newDial);
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
      if (searchIn === "all") return ["meg","geo","ru","en"].some(k => e[k]?.toLowerCase().includes(q));
      return e[searchIn]?.toLowerCase().includes(q);
    }).sort((a, b) => a.topic === "numbers" && b.topic === "numbers" ? (a.num||0)-(b.num||0) : compareGeorgian(a, b));
  }, [query, searchIn, topic, alpha, dialect]);

  const UI = {
    ru:{title:"Мегрельский словарь", sub:"Климов & Каджаиа, 2026", ph:"Поиск слова...", dial:"ДИАЛЕКТ", alf:"АЛФАВИТ", tot:"слов в базе", s1:"Самурзакано-зугдидский", s2:"Сенакский"},
    en:{title:"Mingrelian Dictionary", sub:"Klimov & Kadjaia, 2026", ph:"Search...", dial:"DIALECT", alf:"ALPHABET", tot:"words", s1:"Samurzakano-Zugdidian", s2:"Senaki"},
    ge:{title:"მეგრული ლექსიკონი", sub:"კლიმოვი & კაჯაია, 2026", ph:"ძიება...", dial:"დიალექტი", alf:"ანბანი", tot:"სიტყვა", s1:"სამურზაყანო-ზუგდიდური", s2:"სენაკური"}
  };
  const t = UI[uiLang];
  const allLabel = uiLang==="ge" ? "ყველა" : uiLang==="en" ? "All" : "Все";

  return (
    <div style={{minHeight:"100vh",background:"#0f1a12",fontFamily:"Georgia,serif",color:"#e8e0cc",paddingBottom:40}}>
      <style>{`.sc::-webkit-scrollbar{display:none}.sc{scrollbar-width:none}`}</style>

      <header style={{position:"sticky",top:0,zIndex:100,background:"#0f1a12",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center", borderBottom:"1px solid rgba(125,207,125,0.1)"}}>
        <div>
          <div style={{fontWeight:"bold",fontSize:18,color:"#7dcf7d"}}>📖 {t.title}</div>
          <div style={{fontSize:10,opacity:0.4}}>{t.sub}</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {["ru","en","ge"].map(l=>(
            <button key={l} onClick={()=>setUiLang(l)} style={{background:uiLang===l?"#7dcf7d":"#1a261c",border:"none",borderRadius:12,padding:"6px 10px",color:uiLang===l?"#0f1a12":"#e8e0cc",fontSize:11,cursor:"pointer"}}>
              {l==="ru"?"🇷🇺 Рус":l==="en"?"🇬🇧 Eng":"🇬🇪 ქар"}
            </button>
          ))}
        </div>
      </header>

      <div style={{maxWidth:600,margin:"0 auto",padding:"16px 16px"}}>
        <div style={{fontSize:10,opacity:0.3,marginBottom:8,letterSpacing:1}}>{t.alf}</div>
        <div className="sc" style={{display:"flex",gap:6,overflowX:"auto",marginBottom:16,paddingBottom:4}}>
          {alphaList.map(l=>(
            <button key={l} onClick={()=>setAlpha(l)} style={{
              minWidth:36,height:36,borderRadius:18,border:"none",
              background:alpha===l?"#7dcf7d":"#1a261c", color:alpha===l?"#0f1a12":"#e8e0cc",
              fontSize:l==="all"?12:18,cursor:"pointer"
            }}>{l==="all"?allLabel:l}</button>
          ))}
        </div>

        <div className="sc" style={{display:"flex",gap:8,overflowX:"auto",marginBottom:20}}>
          {TOPICS.map(tp=>(
            <button key={tp.key} onClick={()=>setTopic(tp.key)} style={{
              whiteSpace:"nowrap",padding:"8px 14px",borderRadius:15,border:"none",
              background:topic===tp.key?"#7dcf7d":"#1a261c", color:topic===tp.key?"#0f1a12":"#e8e0cc", fontSize:13,cursor:"pointer"
            }}>{tp.icon} {uiLang==="ge"?tp.ge:uiLang==="en"?tp.en:tp.ru}</button>
          ))}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
          <span style={{fontSize:10,opacity:0.3,letterSpacing:1}}>{t.dial}:</span>
          <div style={{display:"flex", gap:6}}>
            {[
              {k:"all", n:allLabel},
              {k:"sam", n:t.s1},
              {k:"sen", n:t.s2}
            ].map(d=>(
              <button key={d.k} onClick={()=>handleGlobalDialectChange(d.k)} style={{
                padding:"6px 14px",borderRadius:15,border:"1px solid rgba(125,207,125,0.15)",
                background:dialect===d.k?"rgba(125,207,125,0.2)":"#1a261c", 
                color:dialect===d.k?"#7dcf7d":"#e8e0cc", 
                fontSize:12,cursor:"pointer"
              }}>{d.n}</button>
            ))}
          </div>
        </div>

        <div style={{background:"#162218",borderRadius:16,padding:14,border:"1px solid #223324",marginBottom:16}}>
          <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:10}}>
            <span style={{opacity:0.3}}>🔍</span>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.ph} style={{width:"100%",background:"none",border:"none",color:"#e8e0cc",fontSize:18}}/>
          </div>
          <div style={{display:"flex",gap:8,fontSize:11, borderTop:"1px solid rgba(125,207,125,0.05)", paddingTop:10}}>
            <span style={{opacity:0.4}}>Искать в:</span>
            {[["all","Все"],["meg","მეგ."],["ru","Рус."],["en","Eng."],["geo","ქар."]].map(([k,v])=>(
              <button key={k} onClick={()=>setSearchIn(k)} style={{background:searchIn===k?"#7dcf7d":"#223324",color:searchIn===k?"#000":"#7dcf7d",border:"none",borderRadius:8,padding:"2px 8px",cursor:"pointer"}}>{v}</button>
            ))}
          </div>
        </div>

        <div style={{fontSize:11,opacity:0.4,marginBottom:12}}>{results.length} / {DICT.length} {t.tot}</div>

        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {results.map((e,i)=>{
            const hasD = !!e.dialects;
            let act = cardDialects[e.meg] || (hasD ? (dialect!=="all" && e.dialects[dialect] ? dialect : Object.keys(e.dialects)[0]) : null);
            const dMeg = hasD ? (e.dialects[act]?.meg || e.meg) : e.meg;
            const dTr = hasD ? (e.dialects[act]?.tr || e.tr) : e.tr;

            return (
              <div key={i} style={{background:"#162218",borderRadius:16,padding:16,position:"relative",border:"1px solid #223324"}}>
                {hasD ? (
                  <div style={{position:"absolute",top:12,right:12,display:"flex",gap:4}}>
                    {Object.keys(e.dialects).map(dk=>(
                      <button key={dk} onClick={()=>setCardDialects(p=>({...p,[e.meg]:dk}))} style={{fontSize:9,padding:"2px 6px",borderRadius:6,border:"none",background:act===dk?"#3a5a40":"#0f1a12",color:act===dk?"#7dcf7d":"#444",fontWeight:"bold", cursor:"pointer"}}>{dk==="sam"?"сам.":"сен."}</button>
                    ))}
                  </div>
                ) : e.dialect && (
                  <div style={{position:"absolute",top:12,right:12,fontSize:9,padding:"2px 6px",background:"#0f1a12",color:"#3a5a40",borderRadius:6, fontWeight:"bold"}}>{e.dialect==="sam"?"сам.":"сен."}</div>
                )}
                <div style={{fontSize:28,fontWeight:"bold",color:"#7dcf7d",marginBottom:2}}><HL text={dMeg} q={query}/></div>
                <div style={{fontSize:12,opacity:0.4,marginBottom:12}}>[{dTr}]</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                  {[{l:"ქართ.",v:e.geo},{l:"РУС.",v:e.ru},{l:"ENG.",v:e.en}].map((c,idx)=>(
                    <div key={idx}><div style={{fontSize:9,opacity:0.3,marginBottom:2}}>{c.l}</div><div style={{fontSize:13}}><HL text={c.v} q={query}/></div></div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
