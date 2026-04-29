import { useState, useMemo } from "react";
// 1. ПОДКЛЮЧАЕМ ДАННЫЕ ИЗ ТВОЕГО НОВОГО ФАЙЛА
import { GEO_ALPHA, TOPICS, DICT } from "./data";

// 2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (Оставляем их здесь)
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

// 3. ОСНОВНОЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ
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
      if (a.topic === "numbers" && b.topic === "numbers") {
        return (a.num ?? 0) - (b.num ?? 0);
      }
      return compareGeorgian(a, b);
    });
  }, [query, searchIn, topic, alpha, dialect]);

  const UI = {
    ru:{title:"Мегрельский словарь",   sub:"Климов & Каджаиа, 2023",  ph:"Поиск слова…",    noR:"Ничего не найдено", tot:"слов в базе", sin:"Искать в:"},
    en:{title:"Mingrelian Dictionary", sub:"Klimov & Kadjaia, 2023",   ph:"Search a word…",  noR:"Nothing found",     tot:"words",       sin:"Search in:"},
    ge:{title:"მეგრული ლექსიკონი",    sub:"კლიმოვი & კაჯაია, 2023",  ph:"სიტყვის ძიება…", noR:"ვერ მოიძებნა",      tot:"სიტყვა",      sin:"ძებნა:"},
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
        .pill{border:none;border-radius:20px;font-family:Georgia,serif;cursor:pointer;transition:all 0.15s}
        .pill:hover{transform:scale(1.04)}
        .card{transition:transform 0.15s,box-shadow 0.15s}
        .card:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(0,0,0,0.45)}
        .sc::-webkit-scrollbar{display:none}
        .sc{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      {/* ШАПКА */}
      <header style={{position:"sticky",top:0,zIndex:100,background:"rgba(8,14,9,0.93)",backdropFilter:"blur(14px)",borderBottom:"1px solid rgba(80,160,80,0.18)",padding:"11px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <span style={{fontSize:22}}>📖</span>
          <div>
            <div style={{fontWeight:"bold",fontSize:16,color:"#7dcf7d",letterSpacing:.8}}>{t.title}</div>
            <div style={{fontSize:10,color:"rgba(232,224,204,0.38)"}}>{t.sub}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:4}}>
          {[["ru","Рус"],["en","Eng"],["ge","ქარ"]].map(([l,lb])=>(
            <button key={l} className="pill" onClick={()=>setUiLang(l)} style={{padding:"5px 11px",fontSize:12,background:uiLang===l?"#7dcf7d":"rgba(80,160,80,0.12)",color:uiLang===l?"#0f1a12":"#e8e0cc",fontWeight:uiLang===l?"bold":"normal",border:"1px solid rgba(80,160,80,0.24)"}}>
              {FLAG[l]} {lb}
            </button>
          ))}
        </div>
      </header>

      <div style={{maxWidth:700,margin:"0 auto",padding:"16px 14px 60px"}}>
        {/* АЛФАВИТ */}
        <div style={{marginBottom:10}}>
          <div style={{fontSize:10,color:"rgba(232,224,204,0.32)",marginBottom:5,letterSpacing:1.5,textTransform:"uppercase"}}>
            {uiLang==="ru"?"Алфавит":uiLang==="en"?"Alphabet":"ანბანი"}
          </div>
          <div className="sc" style={{display:"flex",gap:3,overflowX:"auto",paddingBottom:3}}>
            {alphaList.map(l=>{
              const isAll = l==="all";
              const active = alpha===l;
              return (
                <button key={l} className="pill" onClick={()=>setAlpha(l)} style={{
                  whiteSpace:"nowrap",
                  minWidth: isAll ? "auto" : 34,
                  padding: isAll ? "5px 11px" : "3px 5px",
                  fontSize: isAll ? 12 : 20,
                  fontFamily:"'Noto Serif Georgian',Georgia,serif",
                  background: active ? "#7dcf7d" : "rgba(80,160,80,0.1)",
                  color: active ? "#0f1a12" : "#b8d8b8",
                  fontWeight: active ? "bold" : "normal",
                  border:"1px solid rgba(80,160,80,0.2)",
                  lineHeight:1.2, textAlign:"center",
                }}>
                  {isAll ? allLabel : l}
                </button>
              );
            })}
          </div>
        </div>

        {/* КАТЕГОРИИ */}
        <div className="sc" style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:3,marginBottom:13}}>
          {TOPICS.map(tp=>(
            <button key={tp.key} className="pill" onClick={()=>setTopic(tp.key)} style={{
              whiteSpace:"nowrap",padding:"5px 11px",fontSize:12,
              background:topic===tp.key?"#7dcf7d":"rgba(80,160,80,0.1)",
              color:topic===tp.key?"#0f1a12":"#e8e0cc",
              fontWeight:topic===tp.key?"bold":"normal",
              border:"1px solid rgba(80,160,80,0.2)",
            }}>
              {tp.icon} {topLabel(tp)}
            </button>
          ))}
        </div>

        {/* ДИАЛЕКТЫ */}
        <div style={{marginBottom:13,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
          <span style={{fontSize:10,color:"rgba(232,224,204,0.32)",letterSpacing:1.5,textTransform:"uppercase"}}>
            {uiLang==="ru"?"Диалект":uiLang==="en"?"Dialect":"დიალექტი"}
          </span>
          {[
            {key:"all", ru:"Все",            en:"All",       ge:"ყველა"},
            {key:"sam", ru:"Самурзакано-Зугдидский", en:"Samurz-Zugdidi", ge:"სამურზ.-ზუგდ."},
            {key:"sen", ru:"Сенакско-Мартвильский",  en:"Senaki-Martvili", ge:"სენ.-მარტვ."},
          ].map(d=>(
            <button key={d.key} className="pill" onClick={()=>setDialect(d.key)} style={{
              whiteSpace:"nowrap",padding:"4px 10px",fontSize:11,
              background:dialect===d.key?"rgba(125,180,255,0.9)":"rgba(80,120,180,0.12)",
              color:dialect===d.key?"#0f1a12":"rgba(180,200,255,0.7)",
              fontWeight:dialect===d.key?"bold":"normal",
              border:"1px solid rgba(80,120,180,0.25)",
            }}>
              {uiLang==="ru"?d.ru:uiLang==="en"?d.en:d.ge}
            </button>
          ))}
        </div>

        {/* ПОИСК */}
        <div className="fu" style={{background:"rgba(80,160,80,0.07)",border:"1px solid rgba(80,160,80,0.26)",borderRadius:16,padding:"12px 14px",marginBottom:12}}>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:17,opacity:0.4}}>🔍</span>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.ph}
              style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(80,160,80,0.26)",borderRadius:10,padding:"10px 34px 10px 37px",fontSize:16,color:"#e8e0cc",fontFamily:"Georgia,'Noto Serif Georgian',serif"}}/>
            {query && <button onClick={()=>setQuery("")} style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"rgba(232,224,204,0.4)",cursor:"pointer",fontSize:18}}>✕</button>}
          </div>
          <div style={{display:"flex",gap:4,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:10,color:"rgba(232,224,204,0.35)"}}>{t.sin}</span>
            {[["all",allLabel],["meg","მეგр."],["ru","Рус."],["en","Eng."],["geo","ქარ."]].map(([k,lb])=>(
              <button key={k} onClick={()=>setSearchIn(k)} style={{
                border:"1px solid rgba(80,160,80,0.2)",borderRadius:12,padding:"2px 8px",fontSize:11,
                fontFamily:"Georgia,serif",cursor:"pointer",
                background:searchIn===k?"#7dcf7d":"rgba(80,160,80,0.1)",
                color:searchIn===k?"#0f1a12":"#e8e0cc",
                fontWeight:searchIn===k?"bold":"normal",
              }}>{lb}</button>
            ))}
          </div>
        </div>

        {/* СТАТИСТИКА */}
        <div style={{marginBottom:10,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
          <span style={{fontSize:11,color:"rgba(232,224,204,0.35)"}}>{results.length} / {DICT.length} {t.tot}</span>
          {alpha!=="all" && <span style={{fontSize:20,color:"#7dcf7d",fontFamily:"'Noto Serif Georgian',Georgia,serif",background:"rgba(80,160,80,0.12)",borderRadius:6,padding:"0 8px",border:"1px solid rgba(80,160,80,0.18)"}}>{alpha}</span>}
          {topic!=="all" && <span style={{fontSize:11,color:"rgba(180,220,180,0.5)",background:"rgba(80,160,80,0.07)",borderRadius:6,padding:"1px 7px",border:"1px solid rgba(80,160,80,0.13)"}}>{TOPICS.find(tp=>tp.key===topic)?.icon} {topLabel(TOPICS.find(tp=>tp.key===topic))}</span>}
        </div>

        {/* СПИСОК КАРТОЧЕК */}
        {results.length===0 ? (
          <div style={{textAlign:"center",padding:"55px 0",color:"rgba(232,224,204,0.3)",fontSize:15}}>
            <div style={{fontSize:36,marginBottom:10}}>🔎</div>{t.noR}
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {results.map((entry,i)=>{
              const hasDialects = !!entry.dialects;
              const ck = entry.meg;
              const activeDial = hasDialects
                ? (cardDialects[ck] || Object.keys(entry.dialects)[0])
                : null;
              const displayMeg = hasDialects ? (entry.dialects[activeDial]?.meg || entry.meg) : entry.meg;
              const displayTr  = hasDialects ? (entry.dialects[activeDial]?.tr  || entry.tr)  : entry.tr;
              return (
              <div key={i} className="card" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(80,160,80,0.16)",borderRadius:13,padding:"12px 14px",position:"relative"}}>
                <div style={{position:"absolute",top:10,right:10,display:"flex",gap:3}}>
                  {hasDialects ? (
                    Object.keys(entry.dialects).map(d=>(
                      <button key={d} onClick={()=>setCardDialects(prev=>({...prev,[ck]:d}))} style={{
                        fontSize:9,padding:"2px 6px",borderRadius:6,fontWeight:"bold",letterSpacing:.5,cursor:"pointer",border:"none",
                        background:activeDial===d?(d==="sam"?"rgba(80,140,255,0.35)":"rgba(255,160,80,0.35)"):"rgba(255,255,255,0.06)",
                        color:activeDial===d?(d==="sam"?"rgba(160,200,255,1)":"rgba(255,200,130,1)"):"rgba(232,224,204,0.3)",
                      }}>{d==="sam"?"сам.":"сен."}</button>
                    ))
                  ) : entry.dialect ? (
                    <div style={{fontSize:9,padding:"2px 6px",borderRadius:6,fontWeight:"bold",letterSpacing:.5,
                      background:entry.dialect==="sam"?"rgba(80,140,255,0.15)":"rgba(255,160,80,0.15)",
                      color:entry.dialect==="sam"?"rgba(140,180,255,0.9)":"rgba(255,190,120,0.9)",
                      border:entry.dialect==="sam"?"1px solid rgba(80,140,255,0.25)":"1px solid rgba(255,160,80,0.25)",
                    }}>{entry.dialect==="sam"?"сам.":"сен."}</div>
                  ) : null}
                </div>
                <div style={{marginBottom:9}}>
                  <div style={{fontSize:27,fontWeight:"bold",color:"#7dcf7d",letterSpacing:.8,fontFamily:"'Noto Serif Georgian',Georgia,serif",lineHeight:1.2}}>
                    <HL text={displayMeg} q={q}/>
                  </div>
                  <div style={{fontSize:11,color:"rgba(180,220,180,0.4)",fontStyle:"italic",marginTop:1}}>[{displayTr}]</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"5px 10px"}}>
                  {[
                    {lbl:"ქართ.", val:entry.geo, col:"rgba(180,200,255,0.85)"},
                    {lbl:"Рус.",  val:entry.ru,  col:"rgba(232,224,204,0.85)"},
                    {lbl:"Eng.",  val:entry.en,  col:"rgba(200,222,200,0.85)"},
                  ].map(({lbl,val,col})=>(
                    <div key={lbl}>
                      <div style={{fontSize:9,color:"rgba(232,224,204,0.27)",letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>{lbl}</div>
                      <div style={{fontSize:13,color:col,fontFamily:lbl==="ქართ."?"'Noto Serif Georgian',Georgia,serif":"inherit",lineHeight:1.35}}>
                        <HL text={val} q={q}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* ПОДВАЛ */}
        <footer style={{textAlign:"center",marginTop:40,color:"rgba(232,224,204,0.15)",fontSize:11,lineHeight:2}}>
          <div>✦</div>
          <div>Климов Г.А., Каджаиа О.М.</div>
          <div>Мегрельско-русско-грузинский словарь. М.: Говорун, 2026.</div>
        </footer>
      </div>
    </div>
  );
}
