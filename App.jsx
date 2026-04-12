import { useState, useMemo } from "react";

// ─── DICTIONARY ────────────────────────────────────────────────────────────
// Источники:
// [1] Georgian-Megrelian-Laz-Svan-English Dictionary, 2015
// [2] Русско-мегрельский разговорник, Цаава / Басария, 2012
//
// Структура: { geo, meg, ru, en, src }
// geo = грузинский, meg = мегрельский (мхедрули), ru = русский, en = английский

const DICT = [
  // ── МЕСТОИМЕНИЯ [2] стр. 5 ──────────────────────────────────────────────
  { geo:"მე",      meg:"მა",       ru:"я",            en:"I",            src:2 },
  { geo:"შენ",     meg:"სი",       ru:"ты",           en:"you",          src:2 },
  { geo:"ის",      meg:"თინა",     ru:"он / она",     en:"he / she",     src:2 },
  { geo:"ჩვენ",    meg:"ჩქი",      ru:"мы",           en:"we",           src:2 },
  { geo:"თქვენ",   meg:"თქვა",     ru:"вы",           en:"you (pl.)",    src:2 },
  { geo:"ისინი",   meg:"თინეფი",   ru:"они",          en:"they",         src:2 },

  // ── ПРИВЕТСТВИЯ [2] стр. 5–8 ────────────────────────────────────────────
  { geo:"გამარჯობა",  meg:"გომორდგუა",  ru:"здравствуй",        en:"hello",          src:2 },
  { geo:"მადლობა",    meg:"მარდობა",    ru:"спасибо",           en:"thank you",      src:1 },
  { geo:"ბოდიში",     meg:"ბოდიში",     ru:"извините",          en:"excuse me",      src:2 },

  // ── СЕМЬЯ [1] стр. 20, 66–67, 139–140, 208 ──────────────────────────────
  { geo:"მამა",        meg:"მუმა",       ru:"отец",        en:"father",       src:1 },
  { geo:"ბაბუა",       meg:"ბაბე",       ru:"дедушка",     en:"grandfather",  src:1 },
  { geo:"და",          meg:"და",         ru:"сестра",      en:"sister",       src:1 },
  { geo:"ქალი",        meg:"ოსური",      ru:"женщина",     en:"woman",        src:1 },
  { geo:"ქალიშვილი",  meg:"ოსურსქუა",  ru:"дочь",        en:"daughter",     src:1 },
  { geo:"ბავშვი",      meg:"ბაჭანა",     ru:"ребёнок",     en:"child",        src:1 },
  { geo:"მამიდა",      meg:"მამიდა",     ru:"тётя (по отцу)", en:"aunt (father's sister)", src:1 },

  // ── ПРИРОДА [1] стр. 20–21, 208, 237 ────────────────────────────────────
  { geo:"ბალახი",  meg:"ოდიარე",    ru:"трава",        en:"grass",        src:1 },
  { geo:"ქარი",    meg:"ბორნია",    ru:"ветер",        en:"wind",         src:1 },
  { geo:"ხანძარი", meg:"დაჰხირი",   ru:"огонь, пожар", en:"fire",         src:1 },
  { geo:"ქვა",     meg:"ქუა",       ru:"камень",       en:"stone",        src:1 },
  { geo:"ბალი",    meg:"ბული",      ru:"вишня",        en:"cherry",       src:1 },

  // ── ЖИВОТНЫЕ [1] стр. 208, 237 ──────────────────────────────────────────
  { geo:"ქათამი",  meg:"ქოთომი",    ru:"курица",       en:"hen",          src:1 },
  { geo:"ხარი",    meg:"ბოჯო",      ru:"бык",          en:"bull",         src:1 },
  { geo:"ვირი",    meg:"გირინი",    ru:"осёл",         en:"donkey",       src:1 },

  // ── ЕДА [1] стр. 178–179; [2] стр. 41 ──────────────────────────────────
  { geo:"პური",    meg:"ქობალი",    ru:"хлеб",         en:"bread",        src:1 },
  { geo:"პირი",    meg:"ბინჯო",     ru:"рот",          en:"mouth",        src:1 },
  { geo:"სადილი",  meg:"სადილი",    ru:"обед",         en:"dinner",       src:1 },

  // ── ЧЕЛОВЕК И ОБЩЕСТВО [1] стр. 15, 237 ─────────────────────────────────
  { geo:"ადამიანი", meg:"ადამიანი",  ru:"человек",      en:"human",        src:1 },
  { geo:"ხალხი",    meg:"ხარხი",     ru:"народ, люди",  en:"people",       src:1 },
  { geo:"ქალაქი",   meg:"ნოღა",      ru:"город",        en:"city",         src:2 },
  { geo:"სოფელი",   meg:"სოფელი",    ru:"село",         en:"village",      src:2 },
  { geo:"ქვეყანა",  meg:"ქიანა",     ru:"страна",       en:"country",      src:2 },

  // ── МЕСТО И ВРЕМЯ [1] стр. 15, 183 ─────────────────────────────────────
  { geo:"ადგილი",  meg:"არდგილი",   ru:"место",           en:"place",        src:1 },
  { geo:"სად",     meg:"სო",        ru:"где",             en:"where",        src:1 },
  { geo:"საათი",   meg:"სათი",      ru:"час, часы",       en:"hour, clock",  src:1 },
  { geo:"ხანი",    meg:"ხანი",      ru:"время",           en:"time",         src:1 },
  { geo:"ადრე",    meg:"ადრე",      ru:"рано",            en:"early",        src:1 },

  // ── ПОНЯТИЯ [1] стр. 15, 32, 110, 139 ──────────────────────────────────
  { geo:"ავადმყოფობა", meg:"ლახალა",   ru:"болезнь",            en:"illness",          src:1 },
  { geo:"გაგება",       meg:"გაგება",   ru:"понимание",          en:"understanding",    src:1 },
  { geo:"მადლი",        meg:"მარდი",    ru:"доброта, благодать", en:"kindness, grace",  src:1 },
  { geo:"მაგარი",       meg:"მანგარი",  ru:"твёрдый",            en:"hard",             src:1 },
  { geo:"ვრცელი",       meg:"ფართო",    ru:"большой, широкий",   en:"large, wide",      src:1 },
  { geo:"ხატი",         meg:"ხატი",     ru:"икона",              en:"icon",             src:1 },
  { geo:"ბამბა",        meg:"ბამბე",    ru:"хлопок",             en:"cotton",           src:1 },

  // ── ЧИСЛА [1] стр. 15 ───────────────────────────────────────────────────
  { geo:"ათი",    meg:"ვითი",    ru:"десять",   en:"ten",      src:1 },
  { geo:"ათასი",  meg:"ანთასი",  ru:"тысяча",   en:"thousand", src:1 },

  // ── ЯЗЫК И ОБЩЕНИЕ [1] стр. 15; [2] стр. 9–10 ──────────────────────────
  { geo:"ენა",      meg:"ნინა",     ru:"язык",      en:"language", src:2 },
  { geo:"სახელი",   meg:"სახელი",   ru:"имя",       en:"name",     src:2 },
  { geo:"გვარი",    meg:"გვარი",    ru:"фамилия",   en:"surname",  src:2 },
  { geo:"სამუშაო",  meg:"სამუშა",   ru:"работа",    en:"work",     src:2 },
  { geo:"სწავლა",   meg:"გურაფა",   ru:"учёба",     en:"study",    src:2 },
];

// ─── UI ────────────────────────────────────────────────────────────────────
const LANGS = [
  { key:"meg", label:"მარგ.", full:"მეგრული" },
  { key:"geo", label:"ქართ.", full:"ქართული" },
  { key:"ru",  label:"Рус",   full:"Русский" },
  { key:"en",  label:"Eng",   full:"English" },
];

const FLAG = { ru:"🇷🇺", en:"🇬🇧", ge:"🇬🇪" };

function highlight(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background:"rgba(244,160,35,0.45)", borderRadius:3, color:"inherit" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function App() {
  const [uiLang, setUiLang]   = useState("ru");      // interface language
  const [query, setQuery]      = useState("");
  const [searchIn, setSearchIn] = useState("all");   // all | meg | geo | ru | en

  const UI = {
    ru: { title:"Мегрельский словарь", sub:"Перевод на мегрельский язык", ph:"Поиск слова...", all:"Все языки", noResult:"Ничего не найдено", src:"Источник", dict1:"Словарь 2015", dict2:"Разговорник 2012", total:"слов в базе", searchIn:"Искать в:" },
    en: { title:"Mingrelian Dictionary", sub:"Translation into Mingrelian", ph:"Search a word...", all:"All languages", noResult:"Nothing found", src:"Source", dict1:"Dictionary 2015", dict2:"Phrasebook 2012", total:"words in database", searchIn:"Search in:" },
    ge: { title:"მეგრული ლექსიკონი", sub:"მეგრულ ენაზე თარგმანი", ph:"სიტყვის ძიება...", all:"ყველა ენა", noResult:"არაფერი არ მოიძებნა", src:"წყარო", dict1:"ლექსიკონი 2015", dict2:"საუბარნი 2012", total:"სიტყვა ბაზაში", searchIn:"ძებნა:" },
  };
  const t = UI[uiLang] || UI.ru;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DICT;
    return DICT.filter(entry => {
      if (searchIn === "all") {
        return (
          entry.meg.toLowerCase().includes(q) ||
          entry.geo.toLowerCase().includes(q) ||
          entry.ru.toLowerCase().includes(q) ||
          entry.en.toLowerCase().includes(q)
        );
      }
      return entry[searchIn]?.toLowerCase().includes(q);
    });
  }, [query, searchIn]);

  return (
    <div style={{
      minHeight:"100vh",
      background:"#0f1a12",
      fontFamily:"'Georgia','Noto Serif Georgian',serif",
      color:"#e8e0cc",
    }}>
      {/* ambient */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none",
        background:"radial-gradient(ellipse 80% 50% at 50% 0%, rgba(60,140,60,0.1) 0%, transparent 65%)" }} />

      <style>{`
        @keyframes up { from{transform:translateY(18px);opacity:0} to{transform:translateY(0);opacity:1} }
        .up { animation: up 0.3s ease-out; }
        input:focus { outline:none; }
        .pill { border:none; border-radius:20px; padding:5px 13px; font-size:12px;
          font-family:Georgia,serif; cursor:pointer; transition:all 0.15s; }
        .pill:hover { transform:scale(1.04); }
        .card { transition: transform 0.15s, box-shadow 0.15s; }
        .card:hover { transform:translateY(-2px); box-shadow:0 6px 24px rgba(0,0,0,0.4); }
        .tag { display:inline-block; border-radius:6px; padding:2px 8px; font-size:11px; }
        .search-pill { border:none; border-radius:14px; padding:4px 11px; font-size:12px;
          font-family:Georgia,serif; cursor:pointer; transition:background 0.15s; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        position:"sticky", top:0, zIndex:100,
        background:"rgba(8,14,9,0.92)", backdropFilter:"blur(14px)",
        borderBottom:"1px solid rgba(80,160,80,0.2)",
        padding:"12px 18px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <span style={{ fontSize:24 }}>📖</span>
          <div>
            <div style={{ fontWeight:"bold", fontSize:17, color:"#7dcf7d", letterSpacing:1 }}>
              {t.title}
            </div>
            <div style={{ fontSize:11, color:"rgba(232,224,204,0.45)" }}>{t.sub}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:5 }}>
          {[["ru","Рус"],["en","Eng"],["ge","ქარ"]].map(([l,lb]) => (
            <button key={l} className="pill" onClick={() => setUiLang(l==="ge"?"ge":l)}
              style={{
                background: uiLang===(l==="ge"?"ge":l) ? "#7dcf7d" : "rgba(80,160,80,0.12)",
                color: uiLang===(l==="ge"?"ge":l) ? "#0f1a12" : "#e8e0cc",
                fontWeight: uiLang===(l==="ge"?"ge":l) ? "bold" : "normal",
                border: "1px solid rgba(80,160,80,0.25)",
              }}>
              {FLAG[l] || "🇬🇪"} {lb}
            </button>
          ))}
        </div>
      </header>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"24px 16px 60px" }}>

        {/* ── SEARCH BOX ── */}
        <div className="up" style={{
          background:"rgba(80,160,80,0.08)",
          border:"1px solid rgba(80,160,80,0.3)",
          borderRadius:18, padding:"16px 18px", marginBottom:16,
        }}>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:18, opacity:0.5 }}>🔍</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t.ph}
              style={{
                width:"100%", boxSizing:"border-box",
                background:"rgba(255,255,255,0.06)",
                border:"1px solid rgba(80,160,80,0.3)",
                borderRadius:12, padding:"12px 14px 12px 40px",
                fontSize:17, color:"#e8e0cc",
                fontFamily:"Georgia,'Noto Serif Georgian',serif",
              }}
            />
            {query && (
              <button onClick={() => setQuery("")}
                style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", color:"rgba(232,224,204,0.5)",
                  cursor:"pointer", fontSize:18 }}>✕</button>
            )}
          </div>

          {/* filter pills */}
          <div style={{ display:"flex", gap:6, marginTop:10, flexWrap:"wrap", alignItems:"center" }}>
            <span style={{ fontSize:11, color:"rgba(232,224,204,0.45)", marginRight:2 }}>{t.searchIn}</span>
            {[["all",t.all],["meg","მეგრული"],["geo","ქართული"],["ru","Русский"],["en","English"]].map(([k,lb]) => (
              <button key={k} className="search-pill" onClick={() => setSearchIn(k)}
                style={{
                  background: searchIn===k ? "#7dcf7d" : "rgba(80,160,80,0.1)",
                  color: searchIn===k ? "#0f1a12" : "#e8e0cc",
                  fontWeight: searchIn===k ? "bold" : "normal",
                  border:"1px solid rgba(80,160,80,0.25)",
                }}>
                {lb}
              </button>
            ))}
          </div>
        </div>

        {/* ── STATS ── */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <span style={{ fontSize:12, color:"rgba(232,224,204,0.4)" }}>
            {results.length} / {DICT.length} {t.total}
          </span>
          <div style={{ display:"flex", gap:8 }}>
            <span className="tag" style={{ background:"rgba(80,160,80,0.15)", color:"#7dcf7d", border:"1px solid rgba(80,160,80,0.25)" }}>
              [1] {t.dict1}
            </span>
            <span className="tag" style={{ background:"rgba(244,160,35,0.12)", color:"#f4a023", border:"1px solid rgba(244,160,35,0.25)" }}>
              [2] {t.dict2}
            </span>
          </div>
        </div>

        {/* ── RESULTS ── */}
        {results.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:"rgba(232,224,204,0.35)", fontSize:15 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔎</div>
            {t.noResult}
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {results.map((entry, i) => (
              <div key={i} className="card" style={{
                background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(80,160,80,0.18)",
                borderRadius:15, padding:"16px 18px",
                position:"relative",
              }}>
                {/* source badge */}
                <span className="tag" style={{
                  position:"absolute", top:12, right:14,
                  background: entry.src===1 ? "rgba(80,160,80,0.15)" : "rgba(244,160,35,0.12)",
                  color: entry.src===1 ? "#7dcf7d" : "#f4a023",
                  border: `1px solid ${entry.src===1 ? "rgba(80,160,80,0.3)" : "rgba(244,160,35,0.3)"}`,
                }}>
                  [{entry.src}]
                </span>

                {/* Megrelian — main word */}
                <div style={{ fontSize:30, fontWeight:"bold", color:"#7dcf7d",
                  letterSpacing:1.5, marginBottom:10,
                  fontFamily:"'Noto Serif Georgian',Georgia,serif" }}>
                  {highlight(entry.meg, query)}
                </div>

                {/* Translation grid */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
                  gap:"8px 14px" }}>
                  {[
                    { lang:"ქართ.", val:entry.geo, color:"rgba(180,200,255,0.85)" },
                    { lang:"Рус",   val:entry.ru,  color:"rgba(232,224,204,0.85)" },
                    { lang:"Eng",   val:entry.en,  color:"rgba(200,220,200,0.85)" },
                  ].map(({ lang, val, color }) => (
                    <div key={lang}>
                      <div style={{ fontSize:10, color:"rgba(232,224,204,0.35)",
                        letterSpacing:1, textTransform:"uppercase", marginBottom:2 }}>
                        {lang}
                      </div>
                      <div style={{ fontSize:15, color, fontFamily:"'Noto Serif Georgian',Georgia,serif" }}>
                        {highlight(val, query)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* footer */}
        <div style={{ textAlign:"center", marginTop:40,
          color:"rgba(232,224,204,0.2)", fontSize:12, lineHeight:1.8 }}>
          <div>✦</div>
          <div>[1] Georgian-Megrelian-Laz-Svan-English Dictionary, 2015</div>
          <div>[2] Русско-мегрельский разговорник, Цаава / Басария, 2012</div>
        </div>
      </div>
    </div>
  );
}
