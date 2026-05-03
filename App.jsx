import { useState, useMemo } from "react";

const GEO_ALPHA = ["ა","ბ","გ","დ","ე","ვ","ზ","თ","ი","კ","ლ","მ","ნ","ო","პ","ჟ","რ","ს","ტ","უ","ფ","ქ","ღ","ყ","შ","ჩ","ც","ძ","წ","ჭ","ხ","ჯ","ჰ","ჸ"];

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

import { DICT } from './dict.js';

const TOPICS = [
  {key:"all",          ru:"Все",           ge:"ყველა",        en:"All",           icon:"📖"},
  {key:"family",       ru:"Семья",         ge:"ოჯახი",        en:"Family",        icon:"👨‍👩‍👧"},
  {key:"greetings",    ru:"Приветствия",   ge:"მისალმება",    en:"Greetings",     icon:"👋"},
  {key:"pronouns",     ru:"Местоимения",   ge:"ნაცვალსახ.",   en:"Pronouns",      icon:"🗣️"},
  {key:"nature",       ru:"Природа",       ge:"ბუნება",       en:"Nature",        icon:"🌿"},
  {key:"plants",       ru:"Растения",      ge:"მცენარეები",   en:"Plants",        icon:"🌱"},
  {key:"animals",      ru:"Животные",      ge:"ცხოველები",    en:"Animals",       icon:"🐾"},
  {key:"food",         ru:"Еда",           ge:"საჭმელი",      en:"Food",          icon:"🍞"},
  {key:"society",      ru:"Общество",      ge:"საზოგადოება",  en:"Society",       icon:"🏙️"},
  {key:"time_place",   ru:"Время/место",   ge:"დრო/ადგილი",   en:"Time & Place",  icon:"🕐"},
  {key:"language",     ru:"Язык",          ge:"ენა",          en:"Language",      icon:"💬"},
  {key:"descriptions", ru:"Описания",      ge:"აღწერა",       en:"Descriptions",  icon:"✨"},
  {key:"home",         ru:"Дом",           ge:"სახლი",        en:"Home",          icon:"🏠"},
  {key:"body",         ru:"Тело",          ge:"სხეული",       en:"Body",          icon:"🫀"},
  {key:"numbers",      ru:"Числа",         ge:"რიცხვები",     en:"Numbers",       icon:"🔢"},
  {key:"culture",      ru:"Культура",      ge:"კულტურა",      en:"Culture",       icon:"🎭"},
  {key:"geography",    ru:"География",     ge:"გეოგრაფია",    en:"Geography",     icon:"🗺️"},
  {key:"time",         ru:"Время",         ge:"დრო",          en:"Time",          icon:"🕐"},
];

// Lookup topic by key
const TOPIC_MAP = Object.fromEntries(TOPICS.map(t => [t.key, t]));

export default function App() {
  const [uiLang, setUiLang]     = useState("ru");
  const [query, setQuery]       = useState("");
  const [searchIn, setSearchIn] = useState("all");
  const [topic, setTopic]       = useState("all");
  const [alpha, setAlpha]       = useState("all");
  const [dialect, setDialect]   = useState("all");
  const [cardDialects, setCardDialects] = useState({});

  // Visible topics for filter bar (excluding internal ones shown on cards)
  const FILTER_TOPICS = TOPICS.filter(t =>
    !["culture","geography","time"].includes(t.key)
  );

  const alphaList = useMemo(() => {
    const s = new Set();
    DICT.forEach(e => { const ch = firstLetter(e.meg); if (ch) s.add(ch); });
    return ["all", ...GEO_ALPHA.filter(l => s.has(l))];
  }, []);

  // Build synonyms map: meg -> list of other entries with same ru translation
  const synonymsMap = useMemo(() => {
    const byRu = {};
    DICT.forEach(e => {
      const key = e.ru.trim();
      if (!byRu[key]) byRu[key] = [];
      byRu[key].push(e);
    });
    const map = {};
    DICT.forEach(e => {
      const key = e.ru.trim();
      const group = byRu[key];
      if (group.length > 1) {
        map[e.meg] = group.filter(x => x.meg !== e.meg);
      }
    });
    return map;
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DICT.filter(e => {
      if (alpha !== "all" && firstLetter(e.meg) !== alpha) return false;

      if (topic !== "all") {
        if (topic === "time_place") {
          if (e.topic !== "time" && e.topic !== "geography") return false;
        } else {
          if (e.topic !== topic) return false;
        }
      }

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
    ru:{title:"Мегрельский словарь",   sub:"Климов & Каджаиа, 2023",  ph:"Поиск слова…",    noR:"Ничего не найдено", tot:"слов в базе", sin:"Искать в:", syn:"Синонимы / варианты"},
    en:{title:"Mingrelian Dictionary", sub:"Klimov & Kadjaia, 2023",   ph:"Search a word…",  noR:"Nothing found",     tot:"words",       sin:"Search in:", syn:"Synonyms / variants"},
    ge:{title:"მეგრული ლექსიკონი",    sub:"კლიმოვი & კაჯაია, 2023",  ph:"სიტყვის ძიება…", noR:"ვერ მოიძებნა",      tot:"სიტყვა",      sin:"ძებნა:",     syn:"სინონიმები"},
  };
  const t = UI[uiLang];
  const FLAG = {ru:"🇷🇺", en:"🇬🇧", ge:"🇬🇪"};
  const topLabel = tp => uiLang==="ge" ? tp.ge : uiLang==="en" ? tp.en : tp.ru;
  const allLabel = uiLang==="ge" ? "ყველა" : uiLang==="en" ? "All" : "Все";
  const q = query.trim();

  // Get topic label for a card's topic key
  const getTopicLabel = (topicKey) => {
    const tp = TOPIC_MAP[topicKey];
    if (!tp) return null;
    // For time_place we show both time and geography under same label
    return tp;
  };

  return (
    <div style={{minHeight:"100vh",background:"#0f1a12",fontFamily:"'Georgia','Noto Serif Georgian',serif",color:"#e8e0cc"}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse 80% 50% at 50% 0%,rgba(60,140,60,0.1) 0%,transparent 65%)"}}/>
      <style>{`@keyframes fadeUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}} .fu{animation:fadeUp 0.25s ease-out} input:focus{outline:none} .pill{border:none;border-radius:20px;font-family:Georgia,serif;cursor:pointer;transition:all 0.15s} .pill:hover{transform:scale(1.04)} .card{transition:transform 0.15s,box-shadow 0.15s} .card:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(0,0,0,0.45)} .sc::-webkit-scrollbar{display:none} .sc{-ms-overflow-style:none;scrollbar-width:none}`}</style>

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

        <div className="sc" style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:3,marginBottom:13}}>
          {FILTER_TOPICS.map(tp=>(
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

        <div style={{marginBottom:13,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
          <span style={{fontSize:10,color:"rgba(232,224,204,0.32)",letterSpacing:1.5,textTransform:"uppercase"}}>
            {uiLang==="ru"?"Диалект":uiLang==="en"?"Dialect":"დიალექტი"}
          </span>
          {[
            {key:"all", ru:"Все",            en:"All",       ge:"ყველა"},
            {key:"sam", ru:"Самурзакано-Зугдидский", en:"Samurz-Zugdidi", ge:"სამურზ.-ზუგდ."},
            {key:"sen", ru:"Сенакский",  en:"Senaki", ge:"სენ."},
          ].map(d=>(
            <button key={d.key} className="pill" onClick={()=>{setDialect(d.key);setCardDialects({});}} style={{
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

        <div className="fu" style={{background:"rgba(80,160,80,0.07)",border:"1px solid rgba(80,160,80,0.26)",borderRadius:16,padding:"12px 14px",marginBottom:12}}>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:17,opacity:0.4}}>🔍</span>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.ph}
              style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(80,160,80,0.26)",borderRadius:10,padding:"10px 34px 10px 37px",fontSize:16,color:"#e8e0cc",fontFamily:"Georgia,'Noto Serif Georgian',serif"}}/>
            {query && <button onClick={()=>setQuery("")} style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"rgba(232,224,204,0.4)",cursor:"pointer",fontSize:18}}>✕</button>}
          </div>
          <div style={{display:"flex",gap:4,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:10,color:"rgba(232,224,204,0.35)"}}>{t.sin}</span>
            {[["all",allLabel],["meg","მეგრ."],["ru","Рус."],["en","Eng."],["geo","ქარ."]].map(([k,lb])=>(
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

        <div style={{marginBottom:10,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
          <span style={{fontSize:11,color:"rgba(232,224,204,0.35)"}}>{results.length} / {DICT.length} {t.tot}</span>
          {alpha!=="all" && <span style={{fontSize:20,color:"#7dcf7d",fontFamily:"'Noto Serif Georgian',Georgia,serif",background:"rgba(80,160,80,0.12)",borderRadius:6,padding:"0 8px",border:"1px solid rgba(80,160,80,0.18)"}}>{alpha}</span>}
          {topic!=="all" && <span style={{fontSize:11,color:"rgba(180,220,180,0.5)",background:"rgba(80,160,80,0.07)",borderRadius:6,padding:"1px 7px",border:"1px solid rgba(80,160,80,0.13)"}}>{FILTER_TOPICS.find(tp=>tp.key===topic)?.icon} {topLabel(FILTER_TOPICS.find(tp=>tp.key===topic))}</span>}
        </div>

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
                ? (cardDialects[ck] !== undefined
                    ? cardDialects[ck]
                    : (dialect !== "all" && entry.dialects[dialect]
                        ? dialect
                        : Object.keys(entry.dialects)[0]))
                : null;
              const displayMeg = hasDialects ? (entry.dialects[activeDial]?.meg || entry.meg) : entry.meg;
              const displayTr  = hasDialects ? (entry.dialects[activeDial]?.tr  || entry.tr)  : entry.tr;
              const syns = synonymsMap[entry.meg] || [];
              const cardTopic = getTopicLabel(entry.topic);

              return (
              <div key={i} className="card" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(80,160,80,0.16)",borderRadius:13,padding:"12px 14px",position:"relative"}}>

                {/* Диалект и тема — правый верхний угол */}
                <div style={{position:"absolute",top:10,right:10,display:"flex",gap:3,alignItems:"center"}}>
                  {/* Тема */}
                  {cardTopic && (
                    <span style={{
                      fontSize:9,padding:"2px 6px",borderRadius:6,letterSpacing:.4,
                      background:"rgba(80,160,80,0.1)",
                      color:"rgba(180,220,180,0.5)",
                      border:"1px solid rgba(80,160,80,0.15)",
                    }}>{cardTopic.icon} {topLabel(cardTopic)}</span>
                  )}
                  {/* Диалект */}
                  {hasDialects ? (
                    Object.keys(entry.dialects).map(d=>(
                      <button key={d} onClick={()=>setCardDialects(prev=>({...prev,[ck]:d}))} style={{
                        fontSize:9,padding:"2px 6px",borderRadius:6,fontWeight:"bold",letterSpacing:.5,cursor:"pointer",fontFamily:"Georgia,serif",
                        background:activeDial===d?(d==="sam"?"rgba(80,140,255,0.15)":"rgba(255,160,80,0.15)"):"transparent",
                        color:activeDial===d?(d==="sam"?"rgba(140,180,255,0.9)":"rgba(255,190,120,0.9)"):"rgba(232,224,204,0.2)",
                        border:activeDial===d?(d==="sam"?"1px solid rgba(80,140,255,0.25)":"1px solid rgba(255,160,80,0.25)"):"1px solid transparent",
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

                {/* Мегрельское слово */}
                <div style={{marginBottom:9, paddingRight: cardTopic ? 120 : 60}}>
                  <div style={{fontSize:27,fontWeight:"bold",color:"#7dcf7d",letterSpacing:.8,fontFamily:"'Noto Serif Georgian',Georgia,serif",lineHeight:1.2}}>
                    <HL text={displayMeg} q={q}/>
                  </div>
                  <div style={{fontSize:11,color:"rgba(180,220,180,0.4)",fontStyle:"italic",marginTop:1}}>[{displayTr}]</div>
                </div>

                {/* Переводы */}
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

                {/* Синонимы / варианты */}
                {syns.length > 0 && (
                  <div style={{marginTop:9,paddingTop:7,borderTop:"1px solid rgba(80,160,80,0.1)"}}>
                    <div style={{fontSize:9,color:"rgba(232,224,204,0.28)",letterSpacing:1.2,textTransform:"uppercase",marginBottom:4}}>
                      {t.syn}
                    </div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {syns.map(s=>(
                        <span key={s.meg} style={{
                          display:"inline-flex",alignItems:"center",gap:4,
                          fontSize:12,
                          fontFamily:"'Noto Serif Georgian',Georgia,serif",
                          color:"#7dcf7d",
                          background:"rgba(80,160,80,0.08)",
                          border:"1px solid rgba(80,160,80,0.18)",
                          borderRadius:7,
                          padding:"2px 8px",
                        }}>
                          {s.meg}
                          {s.dialect && (
                            <span style={{fontSize:8,color:"rgba(140,180,255,0.7)",fontFamily:"Georgia,serif"}}>
                              {s.dialect==="sam"?"сам.":"сен."}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
              );
            })}
          </div>
        )}

        <div style={{textAlign:"center",marginTop:40,color:"rgba(232,224,204,0.15)",fontSize:11,lineHeight:2}}>
          <div>✦</div>
          <div>Климов Г.А., Каджаиа О.М.</div>
          <div>Мегрельско-русско-грузинский словарь. М.: Говорун, 2023.</div>
        </div>
      </div>
    </div>
  );
}