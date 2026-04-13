import { useState, useMemo } from “react”;

// ─── СЛОВАРЬ ────────────────────────────────────────────────────────────────
// Источник: Georgian-Megrelian-Laz-Svan-English Dictionary, 2015
// Структура: { geo, meg, ru, en, topic }

const DICT = [
// ── МЕСТОИМЕНИЯ ─────────────────────────────────────────────────────────
{ geo:“მე”,      meg:“მა”,       ru:“я”,            en:“I”,            topic:“pronouns” },
{ geo:“შენ”,     meg:“სი”,       ru:“ты”,           en:“you”,          topic:“pronouns” },
{ geo:“ის”,      meg:“თინა”,     ru:“он / она”,     en:“he / she”,     topic:“pronouns” },
{ geo:“ჩვენ”,    meg:“ჩქი”,      ru:“мы”,           en:“we”,           topic:“pronouns” },
{ geo:“თქვენ”,   meg:“თქვა”,     ru:“вы”,           en:“you (pl.)”,    topic:“pronouns” },
{ geo:“ისინი”,   meg:“თინეფი”,   ru:“они”,          en:“they”,         topic:“pronouns” },

// ── ПРИВЕТСТВИЯ ─────────────────────────────────────────────────────────
{ geo:“გამარჯობა”,  meg:“გომორდგუა”,  ru:“здравствуй”,  en:“hello”,       topic:“greetings” },
{ geo:“მადლობა”,    meg:“მარდობა”,    ru:“спасибо”,      en:“thank you”,   topic:“greetings” },
{ geo:“ბოდიში”,     meg:“ბოდიში”,     ru:“извините”,     en:“excuse me”,   topic:“greetings” },

// ── СЕМЬЯ ───────────────────────────────────────────────────────────────
{ geo:“ოჯახი”,       meg:“მახორობა”,   ru:“семья”,              en:“family”,                   topic:“family” },
{ geo:“დედა”,        meg:“დიდა”,       ru:“мать”,               en:“mother”,                   topic:“family” },
{ geo:“მამა”,        meg:“მუმა”,       ru:“отец”,               en:“father”,                   topic:“family” },
{ geo:“ძმა”,         meg:“ჯიმა”,       ru:“брат”,               en:“brother”,                  topic:“family” },
{ geo:“და”,          meg:“და”,         ru:“сестра”,             en:“sister”,                   topic:“family” },
{ geo:“შვილი”,       meg:“სქუა”,       ru:“ребёнок, дитя”,      en:“child”,                    topic:“family” },
{ geo:“ვაჟი”,        meg:“ბოში”,       ru:“сын”,                en:“son”,                      topic:“family” },
{ geo:“ქალიშვილი”,   meg:“ოსურსქუა”,  ru:“дочь”,               en:“daughter”,                 topic:“family” },
{ geo:“შვილიშვილი”,  meg:“მოთა”,       ru:“внук / внучка”,      en:“grandchild”,               topic:“family” },
{ geo:“ბაბუა”,       meg:“ბაბუ”,       ru:“дедушка”,            en:“grandfather”,              topic:“family” },
{ geo:“ბებია”,       meg:“ბები”,       ru:“бабушка”,            en:“grandmother”,              topic:“family” },
{ geo:“ბიძა”,        meg:“ჯიმადი”,     ru:“дядя”,               en:“uncle”,                    topic:“family” },
{ geo:“დეიდა”,       meg:“დეიდა”,      ru:“тётя (сестра матери)”, en:“aunt (mother’s sister)”, topic:“family” },
{ geo:“მამიდა”,      meg:“მამიდა”,     ru:“тётя (сестра отца)”, en:“aunt (father’s sister)”,   topic:“family” },
{ geo:“ბიძაშვილი”,   meg:“ბიძისქუა”,  ru:“двоюродный брат/сестра”, en:“cousin”,              topic:“family” },
{ geo:“ქმარი”,       meg:“ქომოჯი”,     ru:“муж”,                en:“husband”,                  topic:“family” },
{ geo:“ცოლი”,        meg:“ოსური”,      ru:“жена”,               en:“wife”,                     topic:“family” },
{ geo:“დედამთილი”,   meg:“დიანთილი”,   ru:“свекровь”,           en:“mother-in-law”,            topic:“family” },
{ geo:“მამამთილი”,   meg:“მუანთილი”,   ru:“свёкор”,             en:“father-in-law”,            topic:“family” },
{ geo:“ნათესავი”,    meg:“ნათესე”,     ru:“родственник”,        en:“relative”,                 topic:“family” },

// ── ПРИРОДА ─────────────────────────────────────────────────────────────
{ geo:“ბალახი”,  meg:“ოდიარე”,    ru:“трава”,        en:“grass”,        topic:“nature” },
{ geo:“ქარი”,    meg:“ბორნია”,    ru:“ветер”,        en:“wind”,         topic:“nature” },
{ geo:“ხანძარი”, meg:“დაჰხირი”,   ru:“огонь, пожар”, en:“fire”,         topic:“nature” },
{ geo:“ქვა”,     meg:“ქუა”,       ru:“камень”,       en:“stone”,        topic:“nature” },
{ geo:“ბალი”,    meg:“ბული”,      ru:“вишня”,        en:“cherry”,       topic:“nature” },

// ── ЖИВОТНЫЕ ────────────────────────────────────────────────────────────
{ geo:“ქათამი”,  meg:“ქოთომი”,    ru:“курица”,       en:“hen”,          topic:“animals” },
{ geo:“ხარი”,    meg:“ბოჯო”,      ru:“бык”,          en:“bull”,         topic:“animals” },
{ geo:“ვირი”,    meg:“გირინი”,    ru:“осёл”,         en:“donkey”,       topic:“animals” },

// ── ЕДА ─────────────────────────────────────────────────────────────────
{ geo:“პური”,    meg:“ქობალი”,    ru:“хлеб”,         en:“bread”,        topic:“food” },
{ geo:“სადილი”,  meg:“სადილი”,    ru:“обед”,         en:“dinner”,       topic:“food” },

// ── ГОРОД И ОБЩЕСТВО ────────────────────────────────────────────────────
{ geo:“ადამიანი”, meg:“ადამიანი”,  ru:“человек”,      en:“human”,        topic:“society” },
{ geo:“ხალხი”,    meg:“ხარხი”,     ru:“народ, люди”,  en:“people”,       topic:“society” },
{ geo:“ქალაქი”,   meg:“ნოღა”,      ru:“город”,        en:“city”,         topic:“society” },
{ geo:“სოფელი”,   meg:“სოფელი”,    ru:“село”,         en:“village”,      topic:“society” },
{ geo:“ქვეყანა”,  meg:“ქიანა”,     ru:“страна”,       en:“country”,      topic:“society” },
{ geo:“სახლი”,    meg:“ოდა”,       ru:“дом”,          en:“house”,        topic:“society” },

// ── ВРЕМЯ И МЕСТО ───────────────────────────────────────────────────────
{ geo:“ადგილი”,  meg:“არდგილი”,   ru:“место”,           en:“place”,        topic:“time_place” },
{ geo:“სად”,     meg:“სო”,        ru:“где”,             en:“where”,        topic:“time_place” },
{ geo:“საათი”,   meg:“სათი”,      ru:“час, часы”,       en:“hour, clock”,  topic:“time_place” },
{ geo:“ადრე”,    meg:“ადრე”,      ru:“рано”,            en:“early”,        topic:“time_place” },

// ── ЯЗЫК И ОБЩЕНИЕ ──────────────────────────────────────────────────────
{ geo:“ენა”,      meg:“ნინა”,     ru:“язык”,      en:“language”,    topic:“language” },
{ geo:“სახელი”,   meg:“სახელი”,   ru:“имя”,       en:“name”,        topic:“language” },
{ geo:“გვარი”,    meg:“გვარი”,    ru:“фамилия”,   en:“surname”,     topic:“language” },
{ geo:“სწავლა”,   meg:“გურაფა”,   ru:“учёба”,     en:“study”,       topic:“language” },
];

// ─── ТЕМЫ ───────────────────────────────────────────────────────────────────
const TOPICS = [
{ key:“all”,        ru:“Все”,          ge:“ყველა”,       en:“All”,         icon:“📖” },
{ key:“family”,     ru:“Семья”,        ge:“ოჯახი”,       en:“Family”,      icon:“👨‍👩‍👧” },
{ key:“greetings”,  ru:“Приветствия”,  ge:“მისალმება”,   en:“Greetings”,   icon:“👋” },
{ key:“pronouns”,   ru:“Местоимения”,  ge:“ნაცვალსახ.”,  en:“Pronouns”,    icon:“🗣️” },
{ key:“nature”,     ru:“Природа”,      ge:“ბუნება”,      en:“Nature”,      icon:“🌿” },
{ key:“animals”,    ru:“Животные”,     ge:“ცხოველები”,   en:“Animals”,     icon:“🐾” },
{ key:“food”,       ru:“Еда”,          ge:“საჭმელი”,     en:“Food”,        icon:“🍞” },
{ key:“society”,    ru:“Общество”,     ge:“საზოგადოება”, en:“Society”,     icon:“🏙️” },
{ key:“time_place”, ru:“Время и место”,ge:“დრო/ადგილი”,  en:“Time & Place”,icon:“🕐” },
{ key:“language”,   ru:“Язык”,         ge:“ენა”,         en:“Language”,    icon:“💬” },
];

// ─── ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ─────────────────────────────────────────────────
function highlight(text, query) {
if (!query) return text;
const idx = text.toLowerCase().indexOf(query.toLowerCase());
if (idx === -1) return text;
return (
<>
{text.slice(0, idx)}
<mark style={{ background:“rgba(244,160,35,0.45)”, borderRadius:3, color:“inherit” }}>
{text.slice(idx, idx + query.length)}
</mark>
{text.slice(idx + query.length)}
</>
);
}

// ─── КОМПОНЕНТ ───────────────────────────────────────────────────────────────
export default function App() {
const [uiLang, setUiLang]     = useState(“ru”);
const [query, setQuery]        = useState(””);
const [searchIn, setSearchIn]  = useState(“all”);
const [topic, setTopic]        = useState(“all”);

const UI = {
ru: { title:“Мегрельский словарь”, sub:“Перевод на мегрельский язык”, ph:“Поиск слова…”,
all:“Все языки”, noResult:“Ничего не найдено”, total:“слов в базе”, searchIn:“Искать в:” },
en: { title:“Mingrelian Dictionary”, sub:“Translation into Mingrelian”, ph:“Search a word…”,
all:“All languages”, noResult:“Nothing found”, total:“words in database”, searchIn:“Search in:” },
ge: { title:“მეგრული ლექსიკონი”, sub:“მეგრულ ენაზე თარგმანი”, ph:“სიტყვის ძიება…”,
all:“ყველა ენა”, noResult:“არაფერი არ მოიძებნა”, total:“სიტყვა ბაზაში”, searchIn:“ძებნა:” },
};
const t = UI[uiLang] || UI.ru;
const FLAG = { ru:“🇷🇺”, en:“🇬🇧”, ge:“🇬🇪” };

const topicLabel = (tp) => tp[uiLang === “ge” ? “ge” : uiLang === “en” ? “en” : “ru”];

const results = useMemo(() => {
const q = query.trim().toLowerCase();
return DICT.filter(entry => {
const matchTopic = topic === “all” || entry.topic === topic;
if (!matchTopic) return false;
if (!q) return true;
if (searchIn === “all”) {
return (
entry.meg.toLowerCase().includes(q) ||
entry.geo.toLowerCase().includes(q) ||
entry.ru.toLowerCase().includes(q) ||
entry.en.toLowerCase().includes(q)
);
}
return entry[searchIn]?.toLowerCase().includes(q);
});
}, [query, searchIn, topic]);

return (
<div style={{
minHeight:“100vh”,
background:”#0f1a12”,
fontFamily:”‘Georgia’,‘Noto Serif Georgian’,serif”,
color:”#e8e0cc”,
}}>
<div style={{ position:“fixed”, inset:0, pointerEvents:“none”,
background:“radial-gradient(ellipse 80% 50% at 50% 0%, rgba(60,140,60,0.1) 0%, transparent 65%)” }} />

```
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
    .topic-scroll::-webkit-scrollbar { display:none; }
    .topic-scroll { -ms-overflow-style:none; scrollbar-width:none; }
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
        <button key={l} className="pill" onClick={() => setUiLang(l)}
          style={{
            background: uiLang===l ? "#7dcf7d" : "rgba(80,160,80,0.12)",
            color: uiLang===l ? "#0f1a12" : "#e8e0cc",
            fontWeight: uiLang===l ? "bold" : "normal",
            border: "1px solid rgba(80,160,80,0.25)",
          }}>
          {FLAG[l] || "🇬🇪"} {lb}
        </button>
      ))}
    </div>
  </header>

  <div style={{ maxWidth:680, margin:"0 auto", padding:"24px 16px 60px" }}>

    {/* ── ТЕМЫ ── */}
    <div className="topic-scroll" style={{
      display:"flex", gap:8, overflowX:"auto",
      paddingBottom:4, marginBottom:16,
    }}>
      {TOPICS.map(tp => (
        <button key={tp.key} className="pill"
          onClick={() => setTopic(tp.key)}
          style={{
            whiteSpace:"nowrap",
            background: topic===tp.key ? "#7dcf7d" : "rgba(80,160,80,0.1)",
            color: topic===tp.key ? "#0f1a12" : "#e8e0cc",
            fontWeight: topic===tp.key ? "bold" : "normal",
            border: "1px solid rgba(80,160,80,0.25)",
            padding:"7px 14px", fontSize:13,
          }}>
          {tp.icon} {topicLabel(tp)}
        </button>
      ))}
    </div>

    {/* ── ПОИСК ── */}
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

    {/* ── СЧЁТЧИК ── */}
    <div style={{ marginBottom:14 }}>
      <span style={{ fontSize:12, color:"rgba(232,224,204,0.4)" }}>
        {results.length} / {DICT.length} {t.total}
      </span>
    </div>

    {/* ── КАРТОЧКИ ── */}
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
          }}>
            <div style={{ fontSize:30, fontWeight:"bold", color:"#7dcf7d",
              letterSpacing:1.5, marginBottom:10,
              fontFamily:"'Noto Serif Georgian',Georgia,serif" }}>
              {highlight(entry.meg, query)}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px 14px" }}>
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

    <div style={{ textAlign:"center", marginTop:40,
      color:"rgba(232,224,204,0.2)", fontSize:12, lineHeight:1.8 }}>
      <div>✦</div>
      <div>Georgian-Megrelian-Laz-Svan-English Dictionary, 2015</div>
    </div>
  </div>
</div>
```

);
}