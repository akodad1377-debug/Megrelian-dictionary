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

// Компонент для подсветки букв при поиске
function HL({ text, q }) {
  if (!q || !text) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return <>{text.slice(0,idx)}<mark style={{background:"rgba(244,160,35,0.45)",borderRadius:3,color:"inherit"}}>{text.slice(idx,idx+q.length)}</mark>{text.slice(idx+q.length)}</>;
}

// --- БАЗА ДАННЫХ ---
const DICT = [
  {topic:"pronouns", meg:"მა", tr:"ma", geo:"მე", ru:"я", en:"I"},
  {topic:"pronouns", meg:"სი", tr:"si", geo:"შენ", ru:"ты", en:"you"},
  {topic:"pronouns", meg:"თინა", tr:"tina", geo:"ის", ru:"он / она", en:"he / she"},
  {topic:"pronouns", meg:"ჩქი", tr:"čki", geo:"ჩვენ", ru:"мы", en:"we"},
  {topic:"pronouns", meg:"თქვა", tr:"tkva", geo:"თქვენ", ru:"вы", en:"you (pl.)"},
  {topic:"pronouns", meg:"თინეფი", tr:"tinepi", geo:"ისინი", ru:"они", en:"they"},
  {topic:"pronouns", meg:"ათე", tr:"ate", geo:"ეს", ru:"этот", en:"this"},
  {topic:"pronouns", meg:"ათეგვარი", tr:"ategvari", geo:"ამგვარი, ამნაირი", ru:"такой", en:"such, that kind"},
  {topic:"greetings", meg:"გომორძგუა", tr:"gomorʒgua", geo:"გამარჯობა", ru:"здравствуй", en:"hello"},
  {topic:"greetings", meg:"მარდობა", tr:"mardoba", geo:"მადლობა", ru:"спасибо", en:"thank you"},
  {topic:"greetings", meg:"ბოდიში", tr:"bodiši", geo:"ბოდიში", ru:"извините", en:"excuse me"},
  {topic:"family", meg:"მახორობა", tr:"maxoroba", geo:"ოჯახი", ru:"семья", en:"family"},
  {topic:"family", meg:"დიდა", tr:"dida", geo:"დედა", ru:"мать", en:"mother"},
  {topic:"family", meg:"მუმა", tr:"muma", geo:"მამა", ru:"отец", en:"father"},
  {topic:"family", meg:"ბაბა", tr:"baba", geo:"მამა", ru:"папаша", en:"papa"},
  {topic:"family", meg:"ჯიმა", tr:"ǯima", geo:"ძმა", ru:"брат", en:"brother"},
  {topic:"family", meg:"და", tr:"da", geo:"და", ru:"сестра", en:"sister"},
  {topic:"family", meg:"სკუა", tr:"skua", geo:"შვილი", ru:"ребёнок", en:"child"},
  {topic:"family", meg:"ბოში", tr:"boši", geo:"ბიჭი, ვაჟი", ru:"сын, мальчик", en:"boy, son"},
  {topic:"family", meg:"ოსურსკუა", tr:"osurskua", geo:"ქალიშვილი", ru:"дочь", en:"daughter"},
  {topic:"family", meg:"მოთა", tr:"mota", geo:"შვილიშვილი", ru:"внук / внучка", en:"grandchild"},
  {topic:"family", meg:"ბაბუ", tr:"babu", geo:"ბაბუა, პაპა", ru:"дедушка", en:"grandfather"},
  {topic:"family", meg:"ბები", tr:"bebi", geo:"ბებია", ru:"бабушка", en:"grandmother"},
  {topic:"family", meg:"ჯიმადი", tr:"ǯimadi", geo:"ბიძა", ru:"дядя", en:"uncle"},
  {topic:"family", meg:"დეიდა", tr:"deida", geo:"დეიდა", ru:"тётя (матери)", en:"aunt (m.)"},
  {topic:"family", meg:"მამიდა", tr:"mamida", geo:"მამიდა", ru:"тётя (отца)", en:"aunt (f.)"},
  {topic:"family", meg:"ბიძისკუა", tr:"biʒiskua", geo:"ბიძაშვილი", ru:"двоюродный брат/сестра", en:"cousin"},
  {topic:"family", meg:"ქომონჯი", tr:"komonǯi", geo:"ქმარი", ru:"муж", en:"husband"},
  {topic:"family", meg:"ოსური", tr:"osuri", geo:"ცოლი", ru:"жена", en:"wife"},
  {topic:"family", meg:"დიანთილი", tr:"diantili", geo:"დედამთილი", ru:"свекровь", en:"mother-in-law"},
  {topic:"family", meg:"მუანთილი", tr:"muantili", geo:"მამამთილი", ru:"свёкор", en:"father-in-law"},
  {topic:"family", meg:"ნათესე", tr:"natese", geo:"ნათესავი", ru:"родственник", en:"relative"},
  {topic:"family", meg:"ბაღანა", tr:"bağana", geo:"ბავშვი", ru:"ребёнок", en:"child"},
  {topic:"family", meg:"ბაღანობა", tr:"bağanoba", geo:"ბავშვობა", ru:"детство", en:"childhood"},
  {topic:"nature", meg:"ბალა", tr:"bala", geo:"ბორცვი", ru:"холм", en:"hill"},
  {topic:"nature", meg:"ბორია", tr:"boria", geo:"ქარი", ru:"ветер", en:"wind"},
  {topic:"nature", meg:"ბჟალამი", tr:"bžalami", geo:"მზიანი", ru:"солнечный", en:"sunny"},
  {topic:"nature", meg:"ბჟალარა", tr:"bžalara", geo:"მზის სხივი", ru:"солнечный луч", en:"sunbeam"},
  {topic:"nature", meg:"ბუნება", tr:"buneba", geo:"ბუნება", ru:"природа", en:"nature"},
  {topic:"nature", meg:"დაჩხირი", tr:"dačxiri", geo:"ცეცხლი", ru:"огонь", en:"fire"},
  {topic:"nature", meg:"ქუა", tr:"kua", geo:"ქვა", ru:"камень", en:"stone"},
  {topic:"nature", meg:"ატატია", tr:"atatia", geo:"თოვლი", ru:"мягкий снег", en:"soft snow"},
  {topic:"nature", meg:"ლანჯა", tr:"lanǯa", geo:"სპილენძი", ru:"медь", en:"copper"},
  {topic:"nature", meg:"წურწუფა", tr:"c̣urc̣upa", geo:"გოგირდი", ru:"сера", en:"sulfur", dialect:"sen"},
  {topic:"plants", meg:"აბუჩეჩი", tr:"abučeči", geo:"მცენარე", ru:"род травы", en:"plant type"},
  {topic:"plants", meg:"ასკილი", tr:"askili", geo:"ასკილი", ru:"шиповник", en:"wild rose"},
  {topic:"plants", meg:"ბамბე", tr:"bambe", geo:"ბამბა", ru:"хлопок", en:"cotton"},
  {topic:"plants", meg:"ბია", tr:"bia", geo:"კომში", ru:"айва", en:"quince"},
  {topic:"plants", meg:"ბინეხი", tr:"binexi", geo:"ვენახი", ru:"виноградник", en:"vineyard"},
  {topic:"plants", meg:"ბული", tr:"buli", geo:"ბალი", ru:"черешня", en:"cherry"},
  {topic:"plants", meg:"ოდიარე", tr:"odiare", geo:"ბალახი", ru:"трава", en:"grass"},
  {topic:"animals", meg:"გენი", tr:"geni", geo:"ხბო", ru:"телёнок", en:"calf"},
  {topic:"animals", meg:"გერი", tr:"geri", geo:"მგელი", ru:"волк", en:"wolf"},
  {topic:"animals", meg:"გირინი", tr:"girini", geo:"ვირი", ru:"осёл", en:"donkey"},
  {topic:"animals", meg:"ქოთომი", tr:"kotomi", geo:"ქათამი", ru:"курица", en:"hen"},
  {topic:"animals", meg:"ხოჯი", tr:"xoǯi", geo:"ხარი", ru:"бык", en:"bull"},
  {topic:"animals", meg:"არქემი", tr:"arḳemi", geo:"აქლემი", ru:"верблюд", en:"camel"},
  {topic:"animals", meg:"ბარტყი", tr:"barṭq̣i", geo:"ბარტყი", ru:"птенец", en:"chick"},
  {topic:"animals", meg:"ბათია", tr:"batia", geo:"ზაქი", ru:"буйволёнок", en:"young buffalo"},
  {topic:"animals", meg:"ბატკი", tr:"batki", geo:"ციკანი", ru:"козлёнок", en:"kid"},
  {topic:"animals", meg:"ბაღირია", tr:"bağiria", geo:"ბეღურა", ru:"воробышек", en:"sparrow"},
  {topic:"animals", meg:"კვატა", tr:"kvata", geo:"იხვი", ru:"утка", en:"duck"},
  {topic:"animals", meg:"კუ", tr:"ku", geo:"კუ", ru:"черепаха", en:"tortoise"},
  {topic:"animals", meg:"ლაკვი", tr:"lakvi", geo:"ლეკვი", ru:"щенок", en:"puppy"},
  {topic:"animals", meg:"ლომი", tr:"lomi", geo:"ლომი", ru:"лев", en:"lion"},
  {topic:"animals", meg:"ლოქორუა", tr:"loḳorua", geo:"ლოკოკინა", ru:"улитка", en:"snail", dialect:"sen"},
  {topic:"animals", meg:"маბარუუ", tr:"mabaruu", geo:"მუხლუხო", ru:"гусеница", en:"caterpillar"},
  {topic:"animals", meg:"ტი", tr:"ṭi", geo:"ტილი", ru:"вошь", en:"louse"},
  {topic:"animals", meg:"წყირი", tr:"c̣q̣iri", geo:"რწყილი", ru:"блоха", en:"flea"},
  {topic:"food", meg:"ატამა", tr:"atama", geo:"ატამი", ru:"персик", en:"peach"},
  {topic:"food", meg:"ბჟა", tr:"bža", geo:"რძე", ru:"молоко", en:"milk"},
  {topic:"food", meg:"ბურახი", tr:"buraxi", geo:"კვასი", ru:"квас", en:"kvass"},
  {topic:"food", meg:"გემო", tr:"gemo", geo:"გემო", ru:"вкус", en:"taste"},
  {topic:"food", meg:"გემუანი", tr:"gemuani", geo:"გემრიელი", ru:"вкусный", en:"tasty"},
  {topic:"food", meg:"ქობალი", tr:"kobali", geo:"პური", ru:"хлеб", en:"bread"},
  {topic:"food", meg:"სადილი", tr:"sadili", geo:"სადილი", ru:"обед", en:"lunch"},
  {topic:"society", meg:"აბაზი", tr:"abazi", geo:"აბაზი", ru:"двадцать копеек", en:"twenty kopecks"},
  {topic:"society", meg:"კოჩი", tr:"ḳoči", geo:"ადამიანი", ru:"человек", en:"person"},
  {topic:"society", meg:"ნოღა", tr:"noğa", geo:"ქალაქი", ru:"город", en:"city"},
  {topic:"society", meg:"სოფელი", tr:"sopeli", geo:"სოფელი", ru:"село", en:"village"},
  {topic:"society", meg:"ქიანა", tr:"kiana", geo:"ქვეყანა", ru:"страна", en:"country"},
  {topic:"society", meg:"ხარხი", tr:"xarxi", geo:"ხალხი", ru:"народ", en:"people"},
  {topic:"time_place", meg:"ამდღა", tr:"amdğa", geo:"დღეს", ru:"сегодня", en:"today"},
  {topic:"time_place", meg:"ასე", tr:"ase", geo:"ახლა", ru:"сейчас", en:"now"},
  {topic:"time_place", meg:"სო", tr:"so", geo:"სად", ru:"где", en:"where"},
  {topic:"home", meg:"აკოშკა", tr:"aḳošḳa", geo:"ფანჯარა", ru:"окно", en:"window"},
  {topic:"home", meg:"კარი", tr:"ḳari", geo:"კარი", ru:"дверь", en:"door"},
  {topic:"home", meg:"ჸუდე", tr:"ʼude", geo:"სახლი", ru:"дом", en:"house"},
  {topic:"body", meg:"დუდი", tr:"dudi", geo:"თავი", ru:"голова", en:"head"},
  {topic:"body", meg:"თოლი", tr:"toli", geo:"თვალი", ru:"глаз", en:"eye"},
  
  // ВОЛОСЫ - ТЕПЕРЬ ОНИ БУДУТ В ОДНОЙ КАРТОЧКЕ
  {topic:"body", meg:"თომა", tr:"toma", geo:"თმა", ru:"волосы", en:"hair", dialect:"sen"},
  {topic:"body", meg:"თუმა", tr:"tuma", geo:"თმა", ru:"волосы", en:"hair", dialect:"sam"},

  {topic:"body", meg:"კუჩხი", tr:"kučxi", geo:"ფეხი", ru:"нога", en:"leg"},
  {topic:"numbers", num:1, meg:"ართი", tr:"arti", geo:"ერთი", ru:"один", en:"one"},
  {topic:"numbers", num:2, meg:"ჟირი", tr:"žiri", geo:"ორი", ru:"два", en:"two"},
  {topic:"numbers", num:3, meg:"სუმი", tr:"sumi", geo:"სამი", ru:"три", en:"three"},
];

const TOPICS = [
  {key:"all", ru:"Все", ge:"ყველა", en:"All", icon:"📖"},
  {key:"family", ru:"Семья", ge:"ოჯახი", en:"Family", icon:"👨‍👩‍👧"},
  {key:"body", ru:"Тело", ge:"სხეული", en:"Body", icon:"🫀"},
  {key:"nature", ru:"Природа", ge:"ბუნება", en:"Nature", icon:"🌿"},
  {key:"animals", ru:"Животные", ge:"ცხოველები", en:"Animals", icon:"🐾"},
  {key:"food", ru:"Еда", ge:"საჭმელი", en:"Food", icon:"🍞"},
  {key:"numbers", ru:"Числа", ge:"რიცხვები", en:"Numbers", icon:"🔢"},
];

// --- КОМПОНЕНТ КАРТОЧКИ ---
function WordCard({ entry, q, uiLang }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const variants = entry.variants || [entry];
  const current = variants[activeIdx];
  const hasVariants = variants.length > 1;

  return (
    <div className="card" style={{background:"rgba(255,255,255,0.04)", border:"1px solid rgba(80,160,80,0.16)", borderRadius:13, padding:"12px 14px", position:"relative"}}>
      <div style={{position:"absolute", top:10, right:10, display:"flex", gap:4}}>
        {hasVariants ? (
          variants.map((v, idx) => (
            <button key={idx} onClick={() => setActiveIdx(idx)} style={{
              fontSize: 9, padding: "3px 7px", borderRadius: 6, fontWeight: "bold", border: "none", cursor: "pointer",
              background: activeIdx === idx ? "#7dcf7d" : "rgba(80,160,80,0.1)",
              color: activeIdx === idx ? "#0f1a12" : "rgba(180,220,180,0.5)",
            }}>
              {v.dialect === "sam" ? "сам." : v.dialect === "sen" ? "сен." : `вар ${idx+1}`}
            </button>
          ))
        ) : (
          entry.dialect && (
            <div style={{fontSize:9, padding:"2px 6px", borderRadius:6, fontWeight:"bold", background:entry.dialect==="sam"?"rgba(80,140,255,0.15)":"rgba(255,160,80,0.15)", color:entry.dialect==="sam"?"rgba(140,180,255,0.9)":"rgba(255,190,120,0.9)"}}>
              {entry.dialect==="sam"?"сам.":"сен."}
            </div>
          )
        )}
      </div>

      <div style={{marginBottom:9}}>
        <div style={{fontSize:27, fontWeight:"bold", color:"#7dcf7d", fontFamily:"'Noto Serif Georgian',serif", lineHeight:1.2}}>
          <HL text={current.meg} q={q}/>
        </div>
        <div style={{fontSize:11, color:"rgba(180,220,180,0.4)", fontStyle:"italic"}}>[{current.tr}]</div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"5px 10px"}}>
        <div>
          <div style={{fontSize:9, color:"rgba(232,224,204,0.27)"}}>ქართ.</div>
          <div style={{fontSize:13, color:"rgba(180,200,255,0.85)", fontFamily:"'Noto Serif Georgian',serif"}}><HL text={current.geo} q={q}/></div>
        </div>
        <div>
          <div style={{fontSize:9, color:"rgba(232,224,204,0.27)"}}>Рус.</div>
          <div style={{fontSize:13, color:"rgba(232,224,204,0.85)"}}><HL text={current.ru} q={q}/></div>
        </div>
        <div>
          <div style={{fontSize:9, color:"rgba(232,224,204,0.27)"}}>Eng.</div>
          <div style={{fontSize:13, color:"rgba(200,222,200,0.85)"}}><HL text={current.en} q={q}/></div>
        </div>
      </div>
    </div>
  );
}

// --- ОСНОВНОЕ ПРИЛОЖЕНИЕ ---
export default function App() {
  const [uiLang, setUiLang] = useState("ru");
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Сначала фильтруем
    let filtered = DICT.filter(e => {
      if (topic !== "all" && e.topic !== topic) return false;
      if (!q) return true;
      return (e.meg.toLowerCase().includes(q) || e.geo.toLowerCase().includes(q) || e.ru.toLowerCase().includes(q) || e.en.toLowerCase().includes(q));
    });

    // Теперь ГРУППИРУЕМ по переводу (чтобы склеить варианты диалектов)
    const grouped = [];
    filtered.forEach(entry => {
      const existing = grouped.find(g => g.ru === entry.ru && g.topic === entry.topic);
      if (existing) {
        if (!existing.variants) {
          const firstVariant = { ...existing };
          existing.variants = [firstVariant];
        }
        existing.variants.push(entry);
      } else {
        grouped.push({ ...entry });
      }
    });

    return grouped.sort((a, b) => compareGeorgian(a, b));
  }, [query, topic]);

  const UI = {
    ru:{title:"Мегрельский словарь", ph:"Поиск слова…", noR:"Ничего не найдено"},
    en:{title:"Mingrelian Dictionary", ph:"Search a word…", noR:"Nothing found"},
    ge:{title:"მეგრული ლექსიკონი", ph:"სიტყვის ძიება…", noR:"ვერ მოიძებნა"},
  };
  const t = UI[uiLang];

  return (
    <div style={{minHeight:"100vh", background:"#0f1a12", color:"#e8e0cc", fontFamily:"Georgia, serif"}}>
      <header style={{position:"sticky", top:0, zIndex:100, background:"rgba(8,14,9,0.93)", padding:"11px 16px", display:"flex", justifyContent:"space-between", borderBottom:"1px solid rgba(80,160,80,0.2)"}}>
        <div style={{fontWeight:"bold", color:"#7dcf7d"}}>{t.title}</div>
        <div style={{display:"flex", gap:5}}>
          {["ru", "en", "ge"].map(l => (
            <button key={l} onClick={() => setUiLang(l)} style={{background: uiLang===l?"#7dcf7d":"transparent", color: uiLang===l?"#0f1a12":"#e8e0cc", border:"1px solid #7dcf7d", borderRadius:4, fontSize:10, cursor:"pointer"}}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <div style={{maxWidth:600, margin:"0 auto", padding:16}}>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.ph} style={{width:"100%", padding:12, borderRadius:8, background:"rgba(255,255,255,0.05)", border:"1px solid #444", color:"#fff", marginBottom:15}}/>
        
        <div style={{display:"flex", gap:8, overflowX:"auto", marginBottom:20, paddingBottom:5}}>
          {TOPICS.map(tp => (
            <button key={tp.key} onClick={() => setTopic(tp.key)} style={{whiteSpace:"nowrap", padding:"6px 12px", borderRadius:15, border:"1px solid #7dcf7d", background: topic===tp.key?"#7dcf7d":"transparent", color: topic===tp.key?"#0f1a12":"#7dcf7d", cursor:"pointer"}}>
              {tp.icon} {uiLang==="ge"?tp.ge:uiLang==="en"?tp.en:tp.ru}
            </button>
          ))}
        </div>

        <div style={{display:"flex", flexDirection:"column", gap:10}}>
          {results.length === 0 ? <div style={{textAlign:"center", opacity:0.5}}>{t.noR}</div> : 
            results.map((entry, idx) => <WordCard key={idx} entry={entry} q={query} uiLang={uiLang} />)
          }
        </div>
      </div>
    </div>
  );
}
