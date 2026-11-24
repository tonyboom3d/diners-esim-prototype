/* ============================================================
   Sample data. Field names follow the CMS collection described
   in the client deck (PLAN TYPE, PLAN CODE, TOPUP Y/N, SITE
   LOCATION, COUNTRY LIST, POPULAR, ON SALE, LIVE ...), so this
   block can later be swapped for the Wix CMS query.
   ============================================================ */
const COUNTRIES = {
  AT: ["Austria", ["A1", "Magenta"], "5G"],
  BE: ["Belgium", ["Proximus", "Orange"], "5G"],
  BG: ["Bulgaria", ["A1", "Vivacom"], "4G"],
  HR: ["Croatia", ["HT", "A1"], "5G"],
  CY: ["Cyprus", ["Cyta", "Epic"], "4G"],
  CZ: ["Czechia", ["O2", "T-Mobile"], "5G"],
  DK: ["Denmark", ["TDC", "Telia"], "5G"],
  EE: ["Estonia", ["Telia", "Elisa"], "5G"],
  FI: ["Finland", ["Elisa", "DNA"], "5G"],
  FR: ["France", ["Orange", "Bouygues Telecom"], "5G"],
  DE: ["Germany", ["Telekom", "O2"], "5G"],
  GR: ["Greece", ["Cosmote", "Vodafone"], "5G"],
  VA: ["Vatican City", ["TIM", "Vodafone"], "4G"],
  HU: ["Hungary", ["Magyar Telekom", "Yettel"], "5G"],
  IS: ["Iceland", ["Siminn", "Nova"], "4G"],
  IE: ["Ireland", ["Three", "Vodafone"], "5G"],
  IT: ["Italy", ["TIM", "Vodafone"], "5G"],
  LV: ["Latvia", ["LMT", "Tele2"], "5G"],
  LI: ["Liechtenstein", ["Telecom Liechtenstein"], "4G"],
  LT: ["Lithuania", ["Telia", "Tele2"], "5G"],
  LU: ["Luxembourg", ["POST", "Tango"], "5G"],
  MT: ["Malta", ["GO", "Epic"], "5G"],
  NL: ["Netherlands", ["KPN", "Vodafone"], "5G"],
  NO: ["Norway", ["Telenor", "Telia"], "5G"],
  PL: ["Poland", ["Orange", "Play"], "5G"],
  PT: ["Portugal", ["MEO", "NOS"], "5G"],
  RO: ["Romania", ["Orange", "Vodafone"], "5G"],
  SM: ["San Marino", ["TIM San Marino"], "4G"],
  SK: ["Slovakia", ["Orange", "O2"], "5G"],
  SI: ["Slovenia", ["A1", "Telekom Slovenije"], "5G"],
  ES: ["Spain", ["Movistar", "Orange"], "5G"],
  SE: ["Sweden", ["Telia", "Tele2"], "5G"],
  CH: ["Switzerland", ["Swisscom", "Sunrise"], "5G"],
  TR: ["Turkey", ["Turkcell", "Vodafone"], "4G"],
  GB: ["United Kingdom", ["EE", "Vodafone"], "5G"],
  US: ["United States", ["T-Mobile", "AT&T"], "5G"],
  CA: ["Canada", ["Rogers", "Bell"], "5G"],
  MX: ["Mexico", ["Telcel", "AT&T"], "4G"],
  JP: ["Japan", ["SoftBank", "KDDI"], "5G"],
  TH: ["Thailand", ["AIS", "TrueMove H"], "5G"],
  SG: ["Singapore", ["Singtel", "StarHub"], "5G"],
  KR: ["South Korea", ["SK Telecom", "KT"], "5G"],
  CN: ["China", ["China Unicom", "China Mobile"], "5G"],
  HK: ["Hong Kong", ["CSL", "3"], "5G"],
  IN: ["India", ["Airtel", "Jio"], "4G"],
  ID: ["Indonesia", ["Telkomsel", "XL"], "4G"],
  VN: ["Vietnam", ["Viettel", "Vinaphone"], "4G"],
  MY: ["Malaysia", ["Maxis", "Celcom"], "4G"],
  PH: ["Philippines", ["Globe", "Smart"], "4G"],
  AE: ["United Arab Emirates", ["e&", "du"], "5G"],
  SA: ["Saudi Arabia", ["STC", "Mobily"], "5G"],
  QA: ["Qatar", ["Ooredoo", "Vodafone"], "5G"],
  EG: ["Egypt", ["Vodafone", "Orange"], "4G"],
  AU: ["Australia", ["Telstra", "Optus"], "5G"],
  NZ: ["New Zealand", ["Spark", "One NZ"], "5G"],
  BR: ["Brazil", ["Vivo", "Claro"], "4G"],
  AR: ["Argentina", ["Personal", "Claro"], "4G"],
  ZA: ["South Africa", ["Vodacom", "MTN"], "4G"]
};
const G_EUROPE = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","VA","HU","IS","IE","IT","LV","LI","LT","LU","MT","NL","NO","PL","PT","RO","SM","SK","SI","ES","SE","CH","TR","GB"];
const G_NAMERICA = ["US","CA","MX"];
const G_ASIA = ["JP","TH","SG","KR","CN","HK","IN","ID","VN","MY","PH"];
const G_GLOBAL = Object.keys(COUNTRIES);

const REGIONS = [
  { key: "europe", label: "Europe" },
  { key: "usa", label: "USA" },
  { key: "asia", label: "Asia" },
  { key: "mideast", label: "Middle East" },
  { key: "global", label: "Global" }
];
const SECTIONS = [
  { key: "sale", title: "Now on sale", all: "/plans?section=sale" },
  { key: "year", title: "1-year plans", all: "/plans?validity=365" },
  { key: "europe", title: "Europe", all: "/plans?region=europe" },
  { key: "usa", title: "USA", all: "/plans?region=usa" },
  { key: "world", title: "Rest of the world", all: "/plans?section=world" }
];

/* id = PLAN CODE · title = SITE TITLE · icon = COUNTRY ICON · price = PRICE (to customer) */
const P = (id, title, region, icon, dataGB, days, price, siteLocations, countries, o = {}) => ({
  id, planType: "NEW", provider: "mobimatter", title, region, icon, dataGB, days, price,
  siteLocations, countries, topup: !!o.topup, popular: !!o.popular, onSale: !!o.was, compareAt: o.was || null,
  family: o.family || null, live: true
});
const PLANS = [
  P("EU-5-30", "Europe", "europe", "EU", 5, 30, 11, ["sale", "europe"], G_EUROPE, { topup: true, was: 14, family: "europe" }),
  P("EU-10-30", "Europe", "europe", "EU", 10, 30, 15, ["europe"], G_EUROPE, { topup: true, popular: true, family: "europe" }),
  P("EU-20-30", "Europe", "europe", "EU", 20, 30, 24, ["europe"], G_EUROPE, { topup: true, family: "europe" }),
  P("FR-5-30", "France", "europe", "FR", 5, 30, 8, ["europe"], ["FR"]),
  P("IT-10-30", "Italy", "europe", "IT", 10, 30, 12, ["europe"], ["IT"]),
  P("GB-10-30", "United Kingdom", "europe", "GB", 10, 30, 12, ["europe"], ["GB"]),
  P("EU-50-365", "Europe", "europe", "EU", 50, 365, 79, ["year"], G_EUROPE, { topup: true, family: "europe" }),
  P("US-5-30", "USA", "usa", "US", 5, 30, 11, ["sale", "usa"], ["US"], { topup: true, was: 13, family: "usa" }),
  P("US-10-30", "USA", "usa", "US", 10, 30, 17, ["usa"], ["US"], { topup: true, popular: true, family: "usa" }),
  P("US-20-30", "USA", "usa", "US", 20, 30, 28, ["usa"], ["US"], { topup: true, family: "usa" }),
  P("NA-10-30", "USA, Canada & Mexico", "usa", "GLOBE", 10, 30, 22, ["usa"], G_NAMERICA),
  P("US-30-365", "USA", "usa", "US", 30, 365, 69, ["year"], ["US"], { topup: true, family: "usa" }),
  P("AS-10-30", "Asia", "asia", "GLOBE", 10, 30, 18, ["sale", "world"], G_ASIA, { topup: true, was: 22, family: "asia" }),
  P("JP-5-30", "Japan", "asia", "JP", 5, 30, 10, ["world"], ["JP"]),
  P("TH-15-30", "Thailand", "asia", "TH", 15, 30, 12, ["world"], ["TH"]),
  P("TR-10-30", "Turkey", "mideast", "TR", 10, 30, 11, ["sale", "world"], ["TR"], { was: 14 }),
  P("AE-3-30", "United Arab Emirates", "mideast", "AE", 3, 30, 13, ["world"], ["AE"]),
  P("AU-10-30", "Australia", "other", "AU", 10, 30, 14, ["world"], ["AU"]),
  P("GL-5-30", "Global", "global", "GLOBE", 5, 30, 29, ["world"], G_GLOBAL, { topup: true, family: "global" }),
  P("GL-20-365", "Global", "global", "GLOBE", 20, 365, 99, ["year"], G_GLOBAL, { topup: true, popular: true, family: "global" }),
  /* More data sizes for the same destinations. They appear in the plan list and in the data selector at checkout. */
  P("FR-10-30", "France", "europe", "FR", 10, 30, 12, [], ["FR"], { was: 15 }),
  P("FR-20-30", "France", "europe", "FR", 20, 30, 19, [], ["FR"]),
  P("IT-5-30", "Italy", "europe", "IT", 5, 30, 8, [], ["IT"]),
  P("IT-20-30", "Italy", "europe", "IT", 20, 30, 19, [], ["IT"]),
  P("GB-5-30", "United Kingdom", "europe", "GB", 5, 30, 8, [], ["GB"]),
  P("GB-20-30", "United Kingdom", "europe", "GB", 20, 30, 19, [], ["GB"], { was: 24 }),
  P("NA-5-30", "USA, Canada & Mexico", "usa", "GLOBE", 5, 30, 14, [], G_NAMERICA),
  P("NA-20-30", "USA, Canada & Mexico", "usa", "GLOBE", 20, 30, 36, [], G_NAMERICA),
  P("AS-5-30", "Asia", "asia", "GLOBE", 5, 30, 11, [], G_ASIA, { topup: true, family: "asia" }),
  P("AS-20-30", "Asia", "asia", "GLOBE", 20, 30, 30, [], G_ASIA, { topup: true, family: "asia" }),
  P("JP-10-30", "Japan", "asia", "JP", 10, 30, 16, [], ["JP"], { was: 19 }),
  P("JP-20-30", "Japan", "asia", "JP", 20, 30, 26, [], ["JP"]),
  P("TH-5-30", "Thailand", "asia", "TH", 5, 30, 6, [], ["TH"]),
  P("TH-30-30", "Thailand", "asia", "TH", 30, 30, 19, [], ["TH"]),
  P("TR-5-30", "Turkey", "mideast", "TR", 5, 30, 7, [], ["TR"]),
  P("TR-20-30", "Turkey", "mideast", "TR", 20, 30, 18, [], ["TR"]),
  P("AE-5-30", "United Arab Emirates", "mideast", "AE", 5, 30, 19, [], ["AE"], { was: 23 }),
  P("AE-10-30", "United Arab Emirates", "mideast", "AE", 10, 30, 32, [], ["AE"]),
  P("AU-5-30", "Australia", "other", "AU", 5, 30, 9, [], ["AU"]),
  P("AU-20-30", "Australia", "other", "AU", 20, 30, 24, [], ["AU"]),
  P("GL-10-30", "Global", "global", "GLOBE", 10, 30, 49, [], G_GLOBAL, { topup: true, family: "global" }),
  P("GL-50-365", "Global", "global", "GLOBE", 50, 365, 189, [], G_GLOBAL, { topup: true, family: "global" }),
  P("EU-100-365", "Europe", "europe", "EU", 100, 365, 129, [], G_EUROPE, { topup: true, family: "europe" }),
  P("US-60-365", "USA", "usa", "US", 60, 365, 109, [], ["US"], { topup: true, family: "usa" })
];
/* Destinations pinned on the home page coverage map */
const DESTS = [
  { code: "US", city: "New York", pos: "above", rot: -3 },
  { code: "FR", city: "Paris", pos: "below", rot: 2 },
  { code: "AE", city: "Dubai", pos: "above", rot: 3 },
  { code: "TH", city: "Bangkok", pos: "below", rot: -2 },
  { code: "JP", city: "Tokyo", pos: "above", rot: -2 }
];
/* Destination photos: set a URL or data URI per country code to replace the illustration (4:3 works best) */
const DEST_PHOTOS = { US: "", FR: "", AE: "", TH: "", JP: "" };
/* PLAN TYPE = TOPUP: shown only on the Top up tab */
const T = (id, family, title, dataGB, days, price) => ({ id, planType: "TOPUP", family, title, dataGB, days, price });
const TOPUPS = [
  T("TU-EU-5", "europe", "Europe top-up", 5, 30, 10), T("TU-EU-10", "europe", "Europe top-up", 10, 30, 14), T("TU-EU-20", "europe", "Europe top-up", 20, 30, 22),
  T("TU-US-5", "usa", "USA top-up", 5, 30, 10), T("TU-US-10", "usa", "USA top-up", 10, 30, 16),
  T("TU-AS-10", "asia", "Asia top-up", 10, 30, 17),
  T("TU-GL-5", "global", "Global top-up", 5, 30, 27), T("TU-GL-20", "global", "Global top-up", 20, 365, 95)
];
const COUPONS = { FLY25: 0.25 };
const SEED_ORDERS = [
  { id: "SFL-24695828", planId: "EU-10-30", qty: 1, date: "2026-11-02", usedMB: 5535, totalMB: 10000, daysLeft: 19, iccid: "8948010020004667489", apn: "plus", paid: 15 },
  { id: "SFL-10384471", planId: "JP-5-30", qty: 1, date: "2026-10-21", usedMB: 1210, totalMB: 5000, daysLeft: 6, iccid: "8948010020007713024", apn: "plus", paid: 10 },
  { id: "SFL-30917726", planId: "US-10-30", qty: 1, date: "2026-09-14", usedMB: 8840, totalMB: 10000, daysLeft: 3, iccid: "8948010020003390175", apn: "plus", paid: 17 }
];
const DEVICES = {
  Apple: ["iPhone XR", "iPhone XS", "iPhone XS Max", "iPhone 11", "iPhone 11 Pro", "iPhone SE (2nd generation)", "iPhone 12", "iPhone 12 mini", "iPhone 12 Pro", "iPhone 13", "iPhone 13 mini", "iPhone 13 Pro", "iPhone SE (3rd generation)", "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max", "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max", "iPad Pro 11-inch (cellular)", "iPad Air (cellular)", "iPad mini (cellular)"],
  Samsung: ["Galaxy S20", "Galaxy S21", "Galaxy S22", "Galaxy S23", "Galaxy S23 Ultra", "Galaxy S24", "Galaxy S24 Ultra", "Galaxy S25", "Galaxy S25 Ultra", "Galaxy Note20", "Galaxy Z Flip4", "Galaxy Z Flip5", "Galaxy Z Flip6", "Galaxy Z Fold4", "Galaxy Z Fold5", "Galaxy Z Fold6", "Galaxy A54 5G", "Galaxy A55 5G"],
  Google: ["Pixel 4", "Pixel 5", "Pixel 6", "Pixel 6 Pro", "Pixel 7", "Pixel 7 Pro", "Pixel 8", "Pixel 8 Pro", "Pixel 9", "Pixel 9 Pro", "Pixel Fold"],
  Other: ["Motorola Razr 40", "Motorola Edge 40", "Xiaomi 13", "Xiaomi 13T Pro", "Xiaomi 14", "OPPO Find X5", "OPPO Reno 9A", "Huawei P40", "Sony Xperia 1 V", "OnePlus 12", "Nothing Phone (2a)"]
};
const FAQS = [
  ["Before you buy", [
    ["What is a travel eSIM?", "An eSIM is a digital SIM that is built into your phone. You buy a data plan online, scan a QR code, and your phone connects to a local network at your destination. There is no physical card to swap."],
    ["Will my phone work with an eSIM?", "Most phones released since 2019 support eSIM, as long as the phone is not locked to a carrier. Use the device check page to look up your model."],
    ["How many eSIMs can I buy in one order?", "Up to five eSIMs of the same plan in a single order. Each traveller needs their own eSIM."],
    ["Do I keep my regular phone number?", "Yes. The travel eSIM is data only and sits next to your home SIM, so calls and texts to your regular number still arrive if you leave your home line switched on."]
  ]],
  ["Installing and activating", [
    ["When should I install my eSIM?", "Install it before you leave, while you have a stable Wi-Fi connection. The validity period starts only when the eSIM first connects to a network at your destination."],
    ["How do I install it?", "Open the confirmation email and tap the quick-install link, or scan the QR code from your phone settings. Step-by-step instructions are on the How it works page."],
    ["I installed the eSIM but have no internet. What should I check?", "Make sure the travel eSIM is switched on, selected for mobile data, and that data roaming is turned on for that line."]
  ]],
  ["Using your plan", [
    ["How do I check how much data is left?", "Open the Balance page and enter your order ID (it starts with SFL-). You can also see usage per app in your phone settings."],
    ["Can I add more data?", "Plans marked as rechargeable can be topped up from the Top up page with your order ID. The new data pack is added to your existing eSIM and starts a new validity period."],
    ["My plan is not rechargeable. What now?", "Buy a new eSIM and install it in place of the current one."]
  ]],
  ["Payment", [
    ["Which cards are accepted?", "Diners Club cards only."],
    ["Will I get an invoice?", "Yes. An invoice and a confirmation email with your QR code and installation instructions are sent right after payment."],
    ["Do you offer discount codes?", "If you have a coupon code, enter it on the details step before payment."]
  ]]
];

/* Version 2: photos behind featured plan cards, keyed by COUNTRY ICON (embedded at build time from src/cards) */
