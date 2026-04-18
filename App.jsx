import { useState, useMemo } from "react";

const GEO_ALPHA = ["ა","ბ","გ","დ","ე","ვ","ზ","თ","ი","კ","ლ","მ","ნ","ო","პ","ჟ","რ","ს","ტ","უ","ფ","ქ","ღ","ყ","შ","ჩ","ც","ძ","წ","ჭ","ხ","ჯ","ჰ","ჸ"];

function firstLetter(meg) {
  for (const ch of meg) if (GEO_ALPHA.includes(ch)) return ch;
  return "";
}

function HL({ text, q }) {
  if (!q || !text) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return <>{text.slice(0,idx)}<mark style={{background:"rgba(244,160,35,0.45)",borderRadius:3,color:"inherit"}}>{text.slice(idx,idx+q.length)}</mark>{text.slice(idx+q.length)}</>;
}

// ─── СЛОВАРЬ ─────────────────────────────────────────────────────────────────
// Источник: Климов Г.А., Каджаиа О.М.
// Мегрельско-русско-грузинский словарь. М.: Говорун, 2023.
//
// Транслитерация:
// ა=a  ბ=b  გ=g  დ=d  ე=e  ვ=v  ზ=z  თ=t  ი=i  კ=ḳ  ლ=l  მ=m  ნ=n  ო=o
// პ=p̣  ჟ=ž  რ=r  ს=s  ტ=ṭ  უ=u  ფ=p  ქ=k  ღ=ğ  ყ=q̣  შ=š  ჩ=č  ც=c
// ძ=ʒ  წ=c̣  ჭ=č̣  ხ=x  ჯ=ǯ  ჰ=h  ჷ=ǝ  ჸ=ʼ

const DICT = [
  // ── МЕСТОИМЕНИЯ ─────────────────────────────────────────────────
  {topic:"pronouns",
    meg:"მა",         tr:"ma",          geo:"მე",                ru:"я",                            en:"I"},
  {topic:"pronouns",
    meg:"სი",         tr:"si",          geo:"შენ",               ru:"ты",                           en:"you"},
  {topic:"pronouns",
    meg:"თინა",       tr:"tina",        geo:"ის",                ru:"он / она",                     en:"he / she"},
  {topic:"pronouns",
    meg:"ჩქი",        tr:"čki",         geo:"ჩვენ",              ru:"мы",                           en:"we"},
  {topic:"pronouns",
    meg:"თქვა",       tr:"tkva",        geo:"თქვენ",             ru:"вы",                           en:"you (pl.)"},
  {topic:"pronouns",
    meg:"თინეფი",     tr:"tinepi",      geo:"ისინი",             ru:"они",                          en:"they"},
  {topic:"pronouns",
    meg:"ათე",        tr:"ate",         geo:"ეს",                ru:"этот",                         en:"this"},
  {topic:"pronouns",
    meg:"ათეგვარი",   tr:"ategvari",    geo:"ამგვარი, ამნაირი",  ru:"такой",                        en:"such, that kind"},

  // ── ПРИВЕТСТВИЯ ──────────────────────────────────────────────────
  {topic:"greetings",
    meg:"გომორძგუა",  tr:"gomorʒgua",   geo:"გამარჯობა",         ru:"здравствуй",                   en:"hello"},
  {topic:"greetings",
    meg:"მარდობა",    tr:"mardoba",     geo:"მადლობა",           ru:"спасибо",                      en:"thank you"},
  {topic:"greetings",
    meg:"ბოდიში",     tr:"bodiši",      geo:"ბოდიში",            ru:"извините",                     en:"excuse me"},

  // ── СЕМЬЯ ────────────────────────────────────────────────────────
  {topic:"family",
    meg:"მახორობა",   tr:"maxoroba",    geo:"ოჯახი",             ru:"семья",                        en:"family"},
  {topic:"family",
    meg:"დიდა",       tr:"dida",        geo:"დედა",              ru:"мать",                         en:"mother"},
  {topic:"family",
    meg:"მუმა",       tr:"muma",        geo:"მამა",              ru:"отец",                         en:"father"},
  {topic:"family",
    meg:"ბაბა",       tr:"baba",        geo:"მამა",              ru:"папаша; обращение отца к сыну",en:"papa; daddy"},
  {topic:"family",
    meg:"ჯიმა",       tr:"ǯima",        geo:"ძმა",               ru:"брат",                         en:"brother"},
  {topic:"family",
    meg:"და",         tr:"da",          geo:"და",                ru:"сестра",                       en:"sister"},
  {topic:"family",
    meg:"სკუა",       tr:"skua",        geo:"შვილი",             ru:"ребёнок, дитя",                en:"child"},
  {topic:"family",
    meg:"ბოში",       tr:"boši",        geo:"ბიჭი, ვაჟი",        ru:"мальчик, юноша; сын",          en:"boy, young man; son"},
  {topic:"family",
    meg:"ოსურსკუა",   tr:"osurskua",    geo:"ქალიშვილი",         ru:"дочь",                         en:"daughter"},
  {topic:"family",
    meg:"მოთა",       tr:"mota",        geo:"შვილიშვილი",        ru:"внук / внучка",                en:"grandchild"},
  {topic:"family",
    meg:"ბაბუ",       tr:"babu",        geo:"ბაბუა, პაპა",       ru:"дедушка; предок",              en:"grandfather; ancestor"},
  {topic:"family",
    meg:"ბები",       tr:"bebi",        geo:"ბებია",             ru:"бабушка",                      en:"grandmother"},
  {topic:"family",
    meg:"ჯიმადი",     tr:"ǯimadi",      geo:"ბიძა",              ru:"дядя",                         en:"uncle"},
  {topic:"family",
    meg:"დეიდა",      tr:"deida",       geo:"დეიდა",             ru:"тётя (сестра матери)",         en:"aunt (mother's sister)"},
  {topic:"family",
    meg:"მამიდა",     tr:"mamida",      geo:"მამიდა",            ru:"тётя (сестра отца)",           en:"aunt (father's sister)"},
  {topic:"family",
    meg:"ბიძისკუა",   tr:"biʒiskua",    geo:"ბიძაშვილი",         ru:"двоюродный брат/сестра",       en:"cousin"},
  {topic:"family",
    meg:"ქომონჯი",    tr:"komonǯi",     geo:"ქმარი",             ru:"муж",                          en:"husband"},
  {topic:"family",
    meg:"ოსური",      tr:"osuri",       geo:"ცოლი",              ru:"жена",                         en:"wife"},
  {topic:"family",
    meg:"დიანთილი",   tr:"diantili",    geo:"დედამთილი",         ru:"свекровь",                     en:"mother-in-law"},
  {topic:"family",
    meg:"მუანთილი",   tr:"muantili",    geo:"მამამთილი",         ru:"свёкор",                       en:"father-in-law"},
  {topic:"family",
    meg:"ნათესე",     tr:"natese",      geo:"ნათესავი",          ru:"родственник",                  en:"relative"},
  {topic:"family",
    meg:"ბაღანა",     tr:"bağana",      geo:"ბავშვი, ბალღი",     ru:"ребёнок",                      en:"child, infant"},
  {topic:"family",
    meg:"ბაღანობა",   tr:"bağanoba",    geo:"ბავშვობა",          ru:"детство",                      en:"childhood"},

  // ── ПРИРОДА ──────────────────────────────────────────────────────
  {topic:"nature",
    meg:"ოდიარე",     tr:"odiare",      geo:"ბალახი",             ru:"трава",                        en:"grass"},
  {topic:"nature",
    meg:"ბორია",      tr:"boria",       geo:"ქარი; ქარიშხალი",   ru:"ветер; буря",                  en:"wind; storm"},
  {topic:"nature",
    meg:"დაჩხირი",    tr:"dačxiri",     geo:"ცეცხლი; ხანძარი",   ru:"огонь, пожар",                 en:"fire"},
  {topic:"nature",
    meg:"ქუა",        tr:"kua",         geo:"ქვა",                ru:"камень",                       en:"stone"},
  {topic:"nature",
    meg:"ბული",       tr:"buli",        geo:"ბალი",               ru:"черешня",                      en:"cherry"},
  {topic:"nature",
    meg:"ბუნება",     tr:"buneba",      geo:"ბუნება",             ru:"природа",                      en:"nature"},
  {topic:"nature",
    meg:"ასკილი",     tr:"askili",      geo:"ასკილი",             ru:"шиповник, дикая роза",         en:"wild rose, briar"},
  {topic:"nature",
    meg:"ბინეხი",     tr:"binexi",      geo:"ვენახი, ვაზი",       ru:"виноградник, виноградная лоза",en:"vineyard; grapevine"},
  {topic:"nature",
    meg:"ბჟალამი",    tr:"bžalami",     geo:"მზიანი",             ru:"солнечный (день)",             en:"sunny (day)"},
  {topic:"nature",
    meg:"ბჟალარა",    tr:"bžalara",     geo:"მზის სხივი",         ru:"солнечный луч",                en:"sunbeam; sunny side"},
  {topic:"nature",
    meg:"ბია",        tr:"bia",         geo:"კომში",              ru:"айва",                         en:"quince"},
  {topic:"nature",
    meg:"ბამბე",      tr:"bambe",       geo:"ბამბა",              ru:"хлопок, вата",                 en:"cotton, wadding"},
  {topic:"nature",
    meg:"ბალა",       tr:"bala",        geo:"ბორცვი",             ru:"холм",                         en:"hill"},

  // ── ЖИВОТНЫЕ ─────────────────────────────────────────────────────
  {topic:"animals",
    meg:"ქოთომი",     tr:"kotomi",      geo:"ქათამი",             ru:"курица",                       en:"hen"},
  {topic:"animals",
    meg:"ხოჯი",       tr:"xoǯi",        geo:"ხარი",               ru:"бык",                          en:"bull"},
  {topic:"animals",
    meg:"გირინი",     tr:"girini",      geo:"ვირი",               ru:"осёл",                         en:"donkey"},
  {topic:"animals",
    meg:"გერი",       tr:"geri",        geo:"მგელი",              ru:"волк",                         en:"wolf"},
  {topic:"animals",
    meg:"გენი",       tr:"geni",        geo:"ხბო",                ru:"телёнок",                      en:"calf"},

  // ── ЕДА ──────────────────────────────────────────────────────────
  {topic:"food",
    meg:"ქობალი",     tr:"kobali",      geo:"პური",               ru:"хлеб",                         en:"bread"},
  {topic:"food",
    meg:"სადილი",     tr:"sadili",      geo:"სადილი",             ru:"обед",                         en:"lunch, dinner"},
  {topic:"food",
    meg:"ბჟა",        tr:"bža",         geo:"რძე",                ru:"молоко",                       en:"milk"},
  {topic:"food",
    meg:"გემო",       tr:"gemo",        geo:"გემო",               ru:"вкус",                         en:"taste, flavour"},
  {topic:"food",
    meg:"გემუანი",    tr:"gemuani",     geo:"გემრიელი",           ru:"вкусный",                      en:"tasty, delicious"},
  {topic:"food",
    meg:"ატამა",      tr:"atama",       geo:"ატამი",              ru:"персик",                       en:"peach"},
  {topic:"food",
    meg:"ბურახი",     tr:"buraxi",      geo:"კვასი",              ru:"квас",                         en:"kvass"},

  // ── ОБЩЕСТВО ─────────────────────────────────────────────────────
  {topic:"society",
    meg:"კოჩი",       tr:"ḳoči",        geo:"ადამიანი",           ru:"человек",                      en:"person"},
  {topic:"society",
    meg:"ადამიანი",   tr:"adamiani",    geo:"ადამიანი",           ru:"человек; нормальный, порядочный",en:"person; decent person"},
  {topic:"society",
    meg:"ხარხი",      tr:"xarxi",       geo:"ხალხი",              ru:"народ, люди",                  en:"people, folk"},
  {topic:"society",
    meg:"ნოღა",       tr:"noğa",        geo:"ქალაქი",             ru:"город",                        en:"city"},
  {topic:"society",
    meg:"სოფელი",     tr:"sopeli",      geo:"სოფელი",             ru:"село",                         en:"village"},
  {topic:"society",
    meg:"ქიანა",      tr:"kiana",       geo:"ქვეყანა",            ru:"страна",                       en:"country"},
  {topic:"society",
    meg:"ბაზარი",     tr:"bazari",      geo:"ბაზარი",             ru:"базар",                        en:"market, bazaar"},
  {topic:"society",
    meg:"გემი",       tr:"gemi",        geo:"გემი",               ru:"корабль",                      en:"ship"},
  {topic:"society",
    meg:"ბოშიკათა",   tr:"bošiḳata",    geo:"ახალგაზრდობა",       ru:"молодёжь",                     en:"youth (collective)"},
  {topic:"society",
    meg:"ბობოხი",     tr:"boboxi",      geo:"ხმამაღალი ლაპარაკი", ru:"громкий разговор",             en:"loud talk"},
  {topic:"society",
    meg:"ბობოხია",    tr:"bobobia",     geo:"მხვეწარი, ამპარტავანი",ru:"хвастун",                   en:"boaster, braggart"},
  {topic:"society",
    meg:"ბერი",       tr:"beri",        geo:"ბერი",               ru:"монах",                        en:"monk"},

  // ── ВРЕМЯ И МЕСТО ────────────────────────────────────────────────
  {topic:"time_place",
    meg:"არდგილი",    tr:"ardgili",     geo:"ადგილი",             ru:"место",                        en:"place"},
  {topic:"time_place",
    meg:"სო",         tr:"so",          geo:"სად",                ru:"где",                          en:"where"},
  {topic:"time_place",
    meg:"სათი",       tr:"sati",        geo:"საათი",              ru:"час, часы",                    en:"hour, clock"},
  {topic:"time_place",
    meg:"ადრე",       tr:"adre",        geo:"ადრე",               ru:"рано",                         en:"early"},
  {topic:"time_place",
    meg:"გაზაფხული",  tr:"gazapxuli",   geo:"გაზაფხული",          ru:"весна",                        en:"spring"},
  {topic:"time_place",
    meg:"ასე",        tr:"ase",         geo:"ახლა",               ru:"теперь, ныне",                 en:"now"},
  {topic:"time_place",
    meg:"ამდღა",      tr:"amdğa",       geo:"დღეს",               ru:"сегодня",                      en:"today"},
  {topic:"time_place",
    meg:"ართო",       tr:"arto",        geo:"ერთად",              ru:"вместе",                       en:"together"},
  {topic:"time_place",
    meg:"ბჟადალი",    tr:"bžadali",     geo:"დასავლეთი",          ru:"запад",                        en:"west"},
  {topic:"time_place",
    meg:"ბჟაიოლუ",    tr:"bžaiolu",     geo:"აღმოსავლეთი",        ru:"восток",                       en:"east"},
  {topic:"time_place",
    meg:"ამნიჯი",     tr:"amniǯi",      geo:"ამ საღამოს",         ru:"этим вечером",                 en:"this evening"},
  {topic:"time_place",
    meg:"ართიშა",     tr:"artiša",      geo:"ერთხელ",             ru:"однажды, один раз",            en:"once, one time"},
  {topic:"time_place",
    meg:"ართიალამო",  tr:"artialamo",   geo:"ერთბაშად",           ru:"сразу",                        en:"at once, immediately"},
  {topic:"time_place",
    meg:"არგუსო",     tr:"arguso",      geo:"აგვისტო",            ru:"август",                       en:"August"},
  {topic:"time_place",
    meg:"აპრილი",     tr:"aprili",      geo:"აპრილი",             ru:"апрель",                       en:"April"},

  // ── ЯЗЫК И ОБЩЕНИЕ ───────────────────────────────────────────────
  {topic:"language",
    meg:"ნინა",       tr:"nina",        geo:"ენა",                ru:"язык",                         en:"language"},
  {topic:"language",
    meg:"სახელი",     tr:"saxeli",      geo:"სახელი",             ru:"имя",                          en:"name"},
  {topic:"language",
    meg:"გვარი",      tr:"gvari",       geo:"გვარი",              ru:"фамилия",                      en:"surname"},
  {topic:"language",
    meg:"გურაფა",     tr:"gurapa",      geo:"სწავლა",             ru:"учёба",                        en:"study"},
  {topic:"language",
    meg:"არიკი",      tr:"ariki",       geo:"ზღაპარი",            ru:"сказка",                       en:"fairy tale"},
  {topic:"language",
    meg:"ანგელოზი",   tr:"angelozi",    geo:"ანგელოზი",           ru:"ангел",                        en:"angel"},
  {topic:"language",
    meg:"ამბე",       tr:"ambe",        geo:"ამბავი",             ru:"весть, история, известие",     en:"news, tidings"},

  // ── ОПИСАНИЯ ─────────────────────────────────────────────────────
  {topic:"descriptions",
    meg:"ჰამო",       tr:"hamo",        geo:"სასიამოვნო, ტკბილი", ru:"приятный, сладкий",            en:"pleasant, sweet"},
  {topic:"descriptions",
    meg:"ამუნათი",    tr:"amunati",     geo:"ლამაზი, საუკეთესო",  ru:"прекрасный",                   en:"beautiful, wonderful"},
  {topic:"descriptions",
    meg:"ადვილო",     tr:"advilo",      geo:"ადვილად",            ru:"легко (нареч.)",               en:"easily"},
  {topic:"descriptions",
    meg:"ბედნიერი",   tr:"bednieri",    geo:"ბედნიერი",           ru:"счастливый",                   en:"happy, fortunate"},
  {topic:"descriptions",
    meg:"ბედნიერება", tr:"bedniereba",  geo:"ბედნიერება",         ru:"счастье",                      en:"happiness"},
  {topic:"descriptions",
    meg:"ბედი",       tr:"bedi",        geo:"ბედი",               ru:"судьба, счастье, участь",      en:"fate, destiny"},
  {topic:"descriptions",
    meg:"ბრელი",      tr:"breli",       geo:"ბევრი",              ru:"много",                        en:"many, much"},
  {topic:"descriptions",
    meg:"ბოლო",       tr:"bolo",        geo:"ბოლო",               ru:"конец",                        en:"end"},
  {topic:"descriptions",
    meg:"ბეჯითი",     tr:"beǯiti",      geo:"ბეჯითი, მუყაითი",   ru:"прилежный",                    en:"diligent, assiduous"},
  {topic:"descriptions",
    meg:"ბეხვერია",   tr:"bexveria",    geo:"ფუმფულა, ფუნჩულა",  ru:"пухлый, пышный",               en:"chubby, plump"},
  {topic:"descriptions",
    meg:"ბონი",       tr:"boni",        geo:"პირდაპირი, სწორი",   ru:"прямой; ровный",               en:"straight; level, even"},

  // ── ДОМ ──────────────────────────────────────────────────────────
  {topic:"home",
    meg:"ჸუდე",       tr:"ʼude",        geo:"სახლი",              ru:"дом",                          en:"house"},
  {topic:"home",
    meg:"კარი",       tr:"ḳari",        geo:"კარი",               ru:"дверь",                        en:"door"},
  {topic:"home",
    meg:"აკოშკა",     tr:"aḳošḳa",     geo:"ფანჯარა",            ru:"окно",                         en:"window"},
  {topic:"home",
    meg:"კიდალა",     tr:"ḳidala",      geo:"კედელი",             ru:"стена",                        en:"wall"},
  {topic:"home",
    meg:"პროლი",      tr:"p̣roli",      geo:"იატაკი",             ru:"пол",                          en:"floor"},
  {topic:"home",
    meg:"ორთვალი",    tr:"ortvali",     geo:"სახურავი",           ru:"крыша",                        en:"roof"},
  {topic:"home",
    meg:"ტყვა",       tr:"ṭq̣va",       geo:"კიბე",               ru:"лестница",                     en:"staircase"},
  {topic:"home",
    meg:"სტოლი",      tr:"stoli",       geo:"მაგიდა",             ru:"стол",                         en:"table"},
  {topic:"home",
    meg:"კრესლო",     tr:"ḳreslo",      geo:"სავარძელი",          ru:"кресло",                       en:"armchair"},
  {topic:"home",
    meg:"ონჯირალი",   tr:"onǯirali",    geo:"საძინებელი",         ru:"спальня",                      en:"bedroom"},
  {topic:"home",
    meg:"ღობერი",     tr:"ğoberi",      geo:"ღობე",               ru:"забор",                        en:"fence"},
  {topic:"home",
    meg:"ბალიში",     tr:"bališi",      geo:"ბალიში",             ru:"подушка",                      en:"pillow"},
  {topic:"home",
    meg:"ბოთოლი",     tr:"botoli",      geo:"ბოთლი",              ru:"бутылка",                      en:"bottle"},
  {topic:"home",
    meg:"ბუხარი",     tr:"buxari",      geo:"ბუხარი",             ru:"камин",                        en:"fireplace"},
  {topic:"home",
    meg:"ბურთი",      tr:"burti",       geo:"ბურთი",              ru:"мяч, шарик",                   en:"ball"},
  {topic:"home",
    meg:"ბუმბული",    tr:"bumbuli",     geo:"ბუმბული",            ru:"перина, пуховик",              en:"feather duvet"},
  {topic:"home",
    meg:"ბარგი",      tr:"bargi",       geo:"სამოსი, ბარგი",      ru:"одежда; вещи, багаж",          en:"clothes; belongings"},
  {topic:"home",
    meg:"ბიგა",       tr:"biga",        geo:"ჯოხი",               ru:"палка",                        en:"stick, rod"},
  {topic:"home",
    meg:"ბარბალი",    tr:"barbali",     geo:"ბორბალი",            ru:"колесо",                       en:"wheel"},

  // ── ЧИСЛА ────────────────────────────────────────────────────────
  {topic:"numbers",
    meg:"ართი",       tr:"arti",        geo:"ერთი",               ru:"один",                         en:"one"},
  {topic:"numbers",
    meg:"ჟირი",       tr:"žiri",        geo:"ორი",                ru:"два",                          en:"two"},
  {topic:"numbers",
    meg:"სუმი",       tr:"sumi",        geo:"სამი",               ru:"три",                          en:"three"},
  {topic:"numbers",
    meg:"ოთხი",       tr:"otxi",        geo:"ოთხი",               ru:"четыре",                       en:"four"},
  {topic:"numbers",
    meg:"ხუთი",       tr:"xuti",        geo:"ხუთი",               ru:"пять",                         en:"five"},
  {topic:"numbers",
    meg:"ამშვი",      tr:"amšvi",       geo:"ექვსი",              ru:"шесть",                        en:"six"},
  {topic:"numbers",
    meg:"შკვითი",     tr:"škviti",      geo:"შვიდი",              ru:"семь",                         en:"seven"},
  {topic:"numbers",
    meg:"რუო",        tr:"ruo",         geo:"რვა",                ru:"восемь",                       en:"eight"},
  {topic:"numbers",
    meg:"ჩხორო",      tr:"čxoro",       geo:"ცხრა",               ru:"девять",                       en:"nine"},
  {topic:"numbers",
    meg:"ვითი",       tr:"viti",        geo:"ათი",                ru:"десять",                       en:"ten"},
  {topic:"numbers",
    meg:"ეჩი",        tr:"eči",         geo:"ოცი",                ru:"двадцать",                     en:"twenty"},
  {topic:"numbers",
    meg:"ეჩდოვითი",   tr:"ečdoviti",    geo:"ოცდაათი",            ru:"тридцать",                     en:"thirty"},
  {topic:"numbers",
    meg:"ოში",        tr:"oši",         geo:"ასი",                ru:"сто",                          en:"hundred"},
  {topic:"numbers",
    meg:"ანთასი",     tr:"antasi",      geo:"ათასი",              ru:"тысяча",                       en:"thousand"},
];

// ─── ТЕМЫ ────────────────────────────────────────────────────────────────────
const TOPICS = [
  {key:"all",          ru:"Все",           ge:"ყველა",        en:"All",           icon:"📖"},
  {key:"family",       ru:"Семья",         ge:"ოჯახი",        en:"Family",        icon:"👨‍👩‍👧"},
  {key:"greetings",    ru:"Приветствия",   ge:"მისალმება",    en:"Greetings",     icon:"👋"},
  {key:"pronouns",     ru:"Местоимения",   ge:"ნაცვალსახ.",   en:"Pronouns",      icon:"🗣️"},
  {key:"nature",       ru:"Природа",       ge:"ბუნება",       en:"Nature",        icon:"🌿"},
  {key:"animals",      ru:"Животные",      ge:"ცხოველები",    en:"Animals",       icon:"🐾"},
  {key:"food",         ru:"Еда",           ge:"საჭმელი",      en:"Food",          icon:"🍞"},
  {key:"society",      ru:"Общество",      ge:"საზოგადოება",  en:"Society",       icon:"🏙️"},
  {key:"time_place",   ru:"Время/место",   ge:"დრო/ადგილი",   en:"Time & Place",  icon:"🕐"},
  {key:"language",     ru:"Язык",          ge:"ენა",          en:"Language",      icon:"💬"},
  {key:"descriptions", ru:"Описания",      ge:"აღწერა",       en:"Descriptions",  icon:"✨"},
  {key:"home",         ru:"Дом",           ge:"სახლი",        en:"Home",          icon:"🏠"},
  {key:"numbers",      ru:"Числа",         ge:"რიცხვები",     en:"Numbers",       icon:"🔢"},
];

export default function App() {
  const [uiLang, setUiLang]     = useState("ru");
  const [query, setQuery]       = useState("");
  const [searchIn, setSearchIn] = useState("all");
  const [topic, setTopic]       = useState("all");
  const [alpha, setAlpha]       = useState("all");

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
      if (!q) return true;
      if (searchIn === "all") return (
        e.meg.toLowerCase().includes(q) ||
        e.geo.toLowerCase().includes(q) ||
        e.ru.toLowerCase().includes(q) ||
        e.en.toLowerCase().includes(q)
      );
      return e[searchIn]?.toLowerCase().includes(q);
    });
  }, [query, searchIn, topic, alpha]);

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

        {/* ТЕМЫ */}
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

        {/* СЧЁТЧИК */}
        <div style={{marginBottom:10,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
          <span style={{fontSize:11,color:"rgba(232,224,204,0.35)"}}>{results.length} / {DICT.length} {t.tot}</span>
          {alpha!=="all" && <span style={{fontSize:20,color:"#7dcf7d",fontFamily:"'Noto Serif Georgian',Georgia,serif",background:"rgba(80,160,80,0.12)",borderRadius:6,padding:"0 8px",border:"1px solid rgba(80,160,80,0.18)"}}>{alpha}</span>}
          {topic!=="all" && <span style={{fontSize:11,color:"rgba(180,220,180,0.5)",background:"rgba(80,160,80,0.07)",borderRadius:6,padding:"1px 7px",border:"1px solid rgba(80,160,80,0.13)"}}>{TOPICS.find(tp=>tp.key===topic)?.icon} {topLabel(TOPICS.find(tp=>tp.key===topic))}</span>}
        </div>

        {/* КАРТОЧКИ */}
        {results.length===0 ? (
          <div style={{textAlign:"center",padding:"55px 0",color:"rgba(232,224,204,0.3)",fontSize:15}}>
            <div style={{fontSize:36,marginBottom:10}}>🔎</div>{t.noR}
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {results.map((entry,i)=>(
              <div key={i} className="card" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(80,160,80,0.16)",borderRadius:13,padding:"12px 14px"}}>

                {/* МЕГРЕЛЬСКОЕ + ТРАНСЛИТЕРАЦИЯ */}
                <div style={{marginBottom:9}}>
                  <div style={{fontSize:27,fontWeight:"bold",color:"#7dcf7d",letterSpacing:.8,fontFamily:"'Noto Serif Georgian',Georgia,serif",lineHeight:1.2}}>
                    <HL text={entry.meg} q={q}/>
                  </div>
                  <div style={{fontSize:11,color:"rgba(180,220,180,0.4)",fontStyle:"italic",marginTop:1}}>[{entry.tr}]</div>
                </div>

                {/* 3 КОЛОНКИ */}
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
            ))}
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