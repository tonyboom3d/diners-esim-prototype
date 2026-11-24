/* ============================================================
   Travel eSIM prototype: single-file, no network calls.
   Views are plain functions returning HTML; state lives in S.
   ============================================================ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = n => "$" + (Number.isInteger(n) ? n : n.toFixed(2));
const planById = id => PLANS.find(p => p.id === id);
const cName = c => COUNTRIES[c][0];
const validity = d => (d >= 365 ? "1 year" : d + " days");
const hash = s => [...String(s)].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7) >>> 0;
const rng = seed => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const today = () => new Date().toISOString().slice(0, 10);

const ic = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  search: ic('<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5 21 21"/>'),
  calendar: ic('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  globe: ic('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>'),
  signal: ic('<path d="M4 20v-4M9 20v-8M14 20V8M19 20V4"/>'),
  check: ic('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  plus: ic('<path d="M12 5v14M5 12h14"/>'),
  minus: ic('<path d="M5 12h14"/>'),
  arrow: ic('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  user: ic('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6"/>'),
  chat: ic('<path d="M4 5h16v11H9l-5 4z"/>'),
  bubble: ic('<path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.7-5.2A8.5 8.5 0 1 1 21 12z"/>'),
  mail: ic('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/>'),
  phone: ic('<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>'),
  close: ic('<path d="M6 6l12 12M18 6 6 18"/>'),
  menu: ic('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  info: ic('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'),
  refresh: ic('<path d="M20 11a8 8 0 1 0-2.3 6.7M20 4v7h-7"/>'),
  gauge: ic('<path d="M4 18a8 8 0 1 1 16 0M12 18l4-6"/>'),
  doc: ic('<path d="M6 3h9l4 4v14H6zM15 3v4h4"/>'),
  card: ic('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>'),
  bolt: ic('<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>'),
  lock: ic('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>')
};
/* Brand logo: point LOGO_SRC at the official logo file (path, URL or data URI). Empty keeps the placeholder slot. */
const LOGO_SRC = "";
const logo = () => LOGO_SRC ? `<img class="logo-img" src="${LOGO_SRC}" alt="Brand logo">` : `<span class="logo-slot">Logo</span>`;
const flag = (code, s) => `<span class="flag"${s ? ` style="--s:${s}px"` : ""}>${FLAGS[code] ? `<img src="${FLAGS[code]}" alt="">` : I.globe}</span>`;
const go_ = path => `href="#${path}" data-go="${path}"`;

/* Placeholder artwork for the photo slot (COUNTRY PIC in the CMS) */
function art(p) {
  const r = rng(hash(p.id || p)), tint = ["asia", "mideast", "other"].includes(p.region) ? "#F7F7F7" : "#C5EDF9";
  const cx = 70 + r() * 180, cy = 46 + r() * 26, rad = 22 + r() * 14, y1 = 104 + r() * 22, y2 = 128 + r() * 22;
  return `<svg class="art" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="320" height="180" fill="${tint}"/><circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${rad.toFixed(0)}" fill="#fff"/><path d="M0 ${y1.toFixed(0)}C80 ${(y1 - 34).toFixed(0)} 170 ${(y1 + 26).toFixed(0)} 320 ${(y1 - 18).toFixed(0)}V180H0Z" fill="#041E42" opacity=".1"/><path d="M0 ${y2.toFixed(0)}C100 ${(y2 + 22).toFixed(0)} 210 ${(y2 - 30).toFixed(0)} 320 ${(y2 + 6).toFixed(0)}V180H0Z" fill="#041E42" opacity=".18"/></svg>`;
}
function globe() {
  const lat = [-120, -60, 0, 60, 120].map(y => { const w = Math.sqrt(180 * 180 - y * y); return `<path d="M${200 - w} ${200 + y}H${200 + w}"/>`; }).join("");
  return `<svg viewBox="0 0 400 400" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><g opacity=".45"><circle cx="200" cy="200" r="180"/><ellipse cx="200" cy="200" rx="60" ry="180"/><ellipse cx="200" cy="200" rx="125" ry="180"/><path d="M200 20v360"/>${lat}</g><path d="M108 252C150 150 250 110 304 148" stroke-width="1.5" stroke-dasharray="2 7" stroke-linecap="round"/><circle cx="108" cy="252" r="6" fill="currentColor" stroke="none"/><circle cx="304" cy="148" r="6" fill="currentColor" stroke="none"/><circle cx="304" cy="148" r="13" opacity=".6"/></svg>`;
}
function qr(seed) {
  const n = 29, r = rng(hash(seed)); let d = "";
  const zone = (x, y) => (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!zone(x, y) && r() > 0.52) d += `M${x} ${y}h1v1h-1z`;
  [[0, 0], [n - 7, 0], [0, n - 7]].forEach(([x, y]) => { d += `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`; });
  return `<svg viewBox="-1 -1 ${n + 2} ${n + 2}" role="img" aria-label="Sample QR code"><path fill="currentColor" fill-rule="evenodd" d="${d}"/></svg>`;
}

/* ---------- State ---------- */
const S = { user: null, orders: SEED_ORDERS.map(o => ({ ...o })), qty: 1, co: null, justPaid: null, chat: false, chatStage: "intro", howTab: "iphone", devBrand: "All", seg: "", esim: {}, howStep: 0, howAuto: true, heroIdx: 0, menu: false, ver: 1 };
try { const v = new URLSearchParams(location.search).get("v") || localStorage.getItem("esim-ver"); S.ver = v === "2" ? 2 : 1; } catch (e) {}
const V2 = () => S.ver === 2;
/* Version 2: destination of the photo card at the start of the first home section */
const FEATURED = "US";
const REDUCED = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
const orderById = id => S.orders.find(o => o.id.toUpperCase() === String(id).toUpperCase());
const orderPlan = o => planById(o.planId);
const normId = v => { const d = String(v || "").toUpperCase().replace(/^SFL-?/, "").replace(/[^0-9]/g, ""); return d ? "SFL-" + d : ""; };
function totals(co) {
  const item = co.kind === "topup" ? TOPUPS.find(t => t.id === co.itemId) : planById(co.itemId);
  const sub = item.price * co.qty, disc = co.coupon ? Math.round(sub * COUPONS[co.coupon] * 100) / 100 : 0;
  return { item, sub, disc, total: Math.round((sub - disc) * 100) / 100 };
}

/* ---------- Shared pieces ---------- */
/* Destination search: pick one or more countries as tags. live=true applies each change right away (plan list page). */
const pickChip = c => `<span class="pick">${flag(c, 20)}<span>${esc(cName(c))}</span><button type="button" data-act="unpick" data-c="${c}" aria-label="Remove ${esc(cName(c))}">${I.close}</button></span>`;
const pickHolder = n => n ? "Add another country" : "Where are you travelling?";
const searchBar = (picks = [], live = false) => `<div class="search" data-picks="${picks.join(",")}"${live ? " data-live" : ""}><div class="search-field">${picks.map(pickChip).join("")}<input type="text" placeholder="${pickHolder(picks.length)}" aria-label="Search plans by country. You can choose more than one." autocomplete="off"></div><button type="button" class="search-btn" data-act="searchGo" aria-label="Show plans">${I.search}</button><ul class="search-list" hidden></ul></div>`;
const listNames = codes => { const n = codes.map(cName); return n.length < 2 ? n.join("") : n.slice(0, -1).join(", ") + " and " + n[n.length - 1]; };
const getPicks = box => (box.dataset.picks || "").split(",").filter(c => COUNTRIES[c]);
function setPicks(box, picks) {
  if (box.hasAttribute("data-live")) { go(picks.length ? "/plans?country=" + picks.join(",") : "/plans"); const b = $(".page-head .search"); if (b) $("input", b).focus(); return; }
  box.dataset.picks = picks.join(",");
  const input = $("input", box);
  $$(".pick", box).forEach(n => n.remove());
  input.insertAdjacentHTML("beforebegin", picks.map(pickChip).join(""));
  input.placeholder = pickHolder(picks.length); input.value = ""; input.focus(); searchUpdate(box);
}
function searchSubmit(box) {
  const input = $("input", box), first = $(".search-list [data-c], .search-list [data-go]", box);
  if (input.value.trim() && first) { if (first.dataset.c) setPicks(box, [...getPicks(box), first.dataset.c]); else go(first.dataset.go); return; }
  const picks = getPicks(box);
  go(picks.length ? "/plans?country=" + picks.join(",") : "/plans");
}
/* Version 2 card: name, data and price on one line; Countries & info left, Buy now right under the price.
   photo=true puts the destination photo behind the card with a fade under the details. */
function planCard2(p, photo) {
  const cover = p.countries.length === 1 ? `${COUNTRIES[p.countries[0]][2]} network` : `${p.countries.length} countries`;
  const img = photo && CARD_PHOTOS[p.icon];
  return `<article class="plan plan2${photo ? " plan-photo" : ""}">${img ? `<img class="plan-bg" src="${img}" alt="">` : ""}
    <div class="plan2-body${photo ? " on-dark" : ""}">
      <div class="plan2-top">${flag(p.icon, 32)}<span class="plan-tags">${p.onSale ? '<span class="tag tag-sale">On sale</span>' : ""}${p.popular ? '<span class="tag tag-line">Popular</span>' : ""}</span></div>
      <div class="plan2-row">
        <h3 class="plan2-name"><a ${go_("/plan/" + p.id)}>${esc(p.title)}</a></h3>
        <span class="plan2-gb">${p.dataGB} GB</span>
        <span class="plan2-price">${p.compareAt ? `<s>$${p.compareAt}</s>` : ""}$${p.price}</span>
      </div>
      <p class="plan2-meta">${validity(p.days)}, ${cover}</p>
      <div class="plan2-actions"><a class="link link-sm" ${go_("/plan/" + p.id)}>Countries &amp; info</a><a class="btn btn-primary btn-sm" ${go_("/checkout/" + p.id)}>Buy now</a></div>
    </div></article>`;
}
function planCard(p, photo) {
  if (V2()) return planCard2(p, photo === true);
  const cover = p.countries.length === 1 ? `<li>${I.signal}${COUNTRIES[p.countries[0]][2]} network</li>` : `<li>${I.globe}${p.countries.length} countries</li>`;
  return `<article class="plan">
    <div class="plan-body">
      <div class="plan-top">${flag(p.icon, 44)}<span class="plan-tags">${p.onSale ? '<span class="tag tag-sale">On sale</span>' : ""}${p.popular ? '<span class="tag tag-line">Popular</span>' : ""}</span></div>
      <div class="stack" style="--g:8px"><h3 class="plan-name"><a ${go_("/plan/" + p.id)}>${esc(p.title)}</a></h3>
      <ul class="meta"><li>${I.calendar}${validity(p.days)}</li>${cover}</ul></div>
      <div class="figures"><span class="fig">${p.dataGB}<small>GB</small></span><span class="fig">${p.compareAt ? `<s>$${p.compareAt}</s>` : ""}$${p.price}</span></div>
      <div class="plan-actions"><a class="btn btn-primary btn-sm" ${go_("/checkout/" + p.id)}>Buy now</a><a class="link link-sm" ${go_("/plan/" + p.id)}>Countries &amp; info</a></div>
    </div></article>`;
}
const stepper = n => `<ol class="stepper">${["Your details", "Payment", "Your eSIM"].map((t, i) => `<li${i + 1 === n ? ' aria-current="step"' : i + 1 < n ? ' class="done"' : ""}>${t}</li>`).join("")}</ol>`;
function summary(co) {
  const t = totals(co), it = t.item;
  return `<h5>Order summary</h5>
    <div class="row" style="margin:18px 0;flex-wrap:nowrap">${co.kind === "topup" ? `<span class="flag" style="--s:44px">${I.refresh}</span>` : flag(it.icon, 44)}<div><p class="strong">${esc(it.title)} ${it.dataGB} GB</p><p class="small muted">${validity(it.days)}${co.kind === "topup" ? " · added to " + esc(co.orderId) : ""}</p></div></div>
    <dl class="kv"><dt>Price per eSIM</dt><dd>${money(it.price)}</dd><dt>Number of eSIMs</dt><dd>${co.qty}</dd>${t.disc ? `<dt>Coupon ${esc(co.coupon)}</dt><dd>-${money(t.disc)}</dd>` : ""}</dl>
    <div class="total"><span class="strong">Final cost</span><span class="fig">${money(t.total)}</span></div>`;
}
const refreshSummary = () => { const el = $("#summary"); if (el && S.co) el.innerHTML = summary(S.co); };
function installSteps(tab) {
  const d = tab === "android"
    ? [["Install the eSIM", "Tap the quick-install link in your confirmation email, or save the QR code as a screenshot and add it from your settings.", "Settings > Connections > SIM manager > Add eSIM"],
       ["Activate before you fly", "Turn off your home plan and switch on the travel eSIM. It is the last one in the list.", "Settings > Connections > SIM manager"],
       ["Turn on data roaming", "Data roaming must be on for the travel eSIM. Check that Mobile data is also on under Data usage.", "Settings > Connections > Mobile networks > Data roaming"]]
    : [["Install the eSIM", "Tap the quick-install link in your confirmation email, or scan the QR code from your settings.", "Settings > Cellular > Add eSIM"],
       ["Activate before you fly", "Turn off your home plan (the first plan) and turn on the travel eSIM. It is the last one in the list.", "Settings > Cellular > SIMs"],
       ["Turn on data roaming", "Tap the travel eSIM name and switch on Data Roaming. Make sure Mobile Data points to the travel eSIM.", "Settings > Cellular > travel eSIM > Data Roaming"]];
  return d;
}
const howTabs = () => `<div class="tabs" role="tablist"><button role="tab" data-act="howTab" data-tab="iphone" aria-selected="${S.howTab === "iphone"}">iPhone</button><button role="tab" data-act="howTab" data-tab="android" aria-selected="${S.howTab === "android"}">Android</button></div>`;
function howBlock(mode) {
  const steps = installSteps(S.howTab);
  if (mode === "compact") return `<div class="stack">${howTabs()}<ol class="steps">${steps.map(s => `<li><div><p class="strong">${s[0]}</p><p class="small muted">${s[1]}</p><p class="path" style="margin-top:8px">${s[2]}</p></div></li>`).join("")}</ol></div>`;
  return `<div class="stack-lg">${howTabs()}<div class="howto">${steps.map((s, i) => `<div class="panel"><span class="num">${i + 1}</span><h4>${s[0]}</h4><p class="muted" style="font-size:16px">${s[1]}</p><p class="path">${s[2]}</p><div class="phone" aria-hidden="true"><b class="on"></b><b></b><b></b><b style="width:70%"></b><span class="muted">Screenshot placeholder</span></div></div>`).join("")}</div></div>`;
}
function esimBlock(o) {
  const p = orderPlan(o), n = o.qty || 1, i = Math.min(S.esim[o.id] || 0, n - 1);
  const iccid = (BigInt(o.iccid) + BigInt(i)).toString();
  const tabs = n > 1 ? `<div class="row" style="margin-bottom:20px"><span class="small muted">${n} eSIMs in this order</span>${Array.from({ length: n }, (_, k) => `<button type="button" class="chip chip-light" data-act="esim" data-id="${o.id}" data-i="${k}" aria-current="${k === i}">eSIM ${k + 1}</button>`).join("")}</div>` : "";
  return `<div data-esim="${o.id}">${tabs}<div class="esim"><figure class="qr">${qr(o.id + ":" + i)}<figcaption>Sample QR code${n > 1 ? `, eSIM ${i + 1} of ${n}` : ""}</figcaption></figure>
    <dl class="kv"><dt>Order ID</dt><dd>${o.id}</dd><dt>Plan name</dt><dd>${esc(p.title)} ${p.dataGB} GB</dd><dt>Validity</dt><dd>${validity(p.days)}</dd><dt>Top-up</dt><dd>${p.topup ? "Yes, rechargeable" : "No"}</dd><dt>APN</dt><dd>${o.apn}</dd><dt>ICCID (eSIM number)</dt><dd>${iccid}</dd></dl></div></div>`;
}
const TEST_CARDS = { diners: "3622 720627 1667", other: "4242 4242 4242 4242" };
const wordCount = t => (t.trim().match(/\S+/g) || []).length;
const demoNote = t => `<p class="demo-note">${I.info}<span>${t}</span></p>`;
const notFound = (t = "We couldn't find that page") => `<section class="band"><div class="wrap stack"><h2>${t}</h2><p><a class="link" ${go_("/")}>Back to all plans ${I.arrow}</a></p></div></section>`;

/* ---------- Views ---------- */
const V = {};
/* Illustration shown in a destination card until a real photo is set in DEST_PHOTOS */
function scene(code) {
  const T = "#041E42", sky = { US: "#C5EDF9", FR: "#F5F3C4", AE: "#C5EDF9", TH: "#F5F3C4", JP: "#C5EDF9", AU: "#F5F3C4" }[code] || "#C5EDF9";
  const body = {
    US: `<circle cx="94" cy="22" r="10" fill="#fff"/><path fill="${T}" opacity=".5" d="M6 90V54h14v36zM23 90V42h12v48zM84 90V48h14v42zM101 90V60h13v30z"/><path fill="${T}" d="M38 90V36h6l3-16 3 16h6v54zM60 90V50h9v-9h7v9h6v40z"/>`,
    FR: `<circle cx="24" cy="24" r="9" fill="#fff"/><path fill="${T}" d="M60 8l3 26c1 14 6 30 20 48H71c-3-9-7-13-11-13s-8 4-11 13H37c14-18 19-34 20-48z"/><path fill="${T}" d="M50 34h20v4H50zM44 54h32v4H44z"/><path fill="${T}" opacity=".3" d="M0 82h120v8H0z"/>`,
    AE: `<circle cx="26" cy="24" r="10" fill="#F5F3C4"/><path fill="${T}" opacity=".5" d="M20 90V62h10v28zM33 90V52h8v38zM80 90V56h9v34zM92 90V66h10v24z"/><path fill="${T}" d="M59 6h2l1 20h3v14h3v16h4v34H48V56h4V40h3V26h3z"/><path fill="${T}" opacity=".3" d="M0 84q30-8 60 0t60 0v6H0z"/>`,
    TH: `<circle cx="96" cy="22" r="9" fill="#fff"/><path fill="${T}" opacity=".55" d="M18 90l4-14-2-1 5-13 1-8 1 8 5 13-2 1 4 14zM86 90l4-14-2-1 5-13 1-8 1 8 5 13-2 1 4 14z"/><path fill="${T}" d="M59 8h2l1 14 4 8-2 2 6 14-3 2 7 16-3 2 5 24H43l5-24-3-2 7-16-3-2 6-14-2-2 4-8z"/>`,
    JP: `<circle cx="92" cy="22" r="10" fill="#fff"/><path fill="${T}" d="M6 90L50 36q10-6 20 0l44 54z"/><path fill="#fff" d="M50 36q10-6 20 0l9 11-7-4-5 6-7-6-7 6-5-6-7 4z"/>`,
    AU: `<circle cx="24" cy="20" r="9" fill="#fff"/><path fill="none" stroke="${T}" stroke-width="3" d="M14 62Q60 12 106 62"/><path stroke="${T}" stroke-width="1.3" d="M30 62V46M45 62V37M60 62V34M75 62V37M90 62V46"/><path stroke="${T}" stroke-width="3" d="M2 62h116"/><path fill="${T}" d="M8 50h8v30H8zM104 50h8v30h-8z"/><path fill="${T}" opacity=".25" d="M0 76h120v14H0z"/>`
  }[code] || "";
  return `<svg viewBox="0 0 120 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="120" height="90" fill="${sky}"/>${body}</svg>`;
}

/* Illustration for the hero image slot: traveller on a call at the airport, plane taking off */
function heroArt() {
  return `<svg viewBox="0 0 800 560" preserveAspectRatio="xMidYMid slice">
    <rect width="800" height="560" fill="#0B2D5E"/>
    <rect y="0" width="800" height="430" fill="#123E7A"/>
    <circle cx="700" cy="120" r="64" fill="#F5F3C4"/>
    <g fill="#C5EDF9" opacity=".28"><rect x="250" y="250" width="210" height="34" rx="17"/><rect x="330" y="222" width="130" height="34" rx="17"/><rect x="600" y="300" width="180" height="30" rx="15"/></g>
    <path d="M120 410C250 330 350 230 440 130" fill="none" stroke="#C5EDF9" stroke-width="3" stroke-dasharray="3 12" stroke-linecap="round" opacity=".8"/>
    <g transform="translate(440 130) rotate(-40) scale(.9)" fill="#F7F7F7"><path d="M-70 -9h118q22 0 22 9t-22 9H-70q-12 0-12-9t12-9z"/><path d="M-6 0l-34-52h18l48 52zM-6 0l-34 52h18l48-52z"/><path d="M-66-6l-16-30h12l22 30z"/></g>
    <g stroke="#F7F7F7" stroke-width="2" opacity=".14"><path d="M210 0v430M430 0v430M650 0v430M0 430h800"/></g>
    <rect y="430" width="800" height="130" fill="#082650"/>
    <rect x="452" y="392" width="62" height="96" rx="8" fill="#C5EDF9"/><path d="M483 392v-66" stroke="#F7F7F7" stroke-width="5" stroke-linecap="round"/><path d="M468 410v60M498 410v60" stroke="#041E42" stroke-width="3" opacity=".25"/>
    <path d="M532 350h56l8 150h-24l-12-104-12 104h-24z" fill="#C5EDF9"/>
    <path d="M522 232q38-22 76 0l6 128h-88z" fill="#F5F3C4"/>
    <path d="M528 240l-36 88" stroke="#F5F3C4" stroke-width="20" stroke-linecap="round"/>
    <path d="M594 240l30 40-26-76" fill="none" stroke="#F5F3C4" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="560" cy="186" r="30" fill="#F7F7F7"/>
    <rect x="588" y="166" width="13" height="40" rx="4" fill="#041E42" stroke="#C5EDF9" stroke-width="2"/>
    <g fill="none" stroke="#C5EDF9" stroke-width="4" stroke-linecap="round"><path d="M616 170q12 16 0 32"/><path d="M632 158q22 28 0 56"/></g>
  </svg>`;
}
function coverage() {
  const n = Object.keys(COUNTRIES).length, pts = DESTS.map(d => MAP.pins[d.code]);
  const route = pts.map((p, i) => {
    if (!i) return `M${p[0]} ${p[1]}`;
    const a = pts[i - 1], lift = Math.abs(p[0] - a[0]) * 0.3 + 14;
    return `Q${((a[0] + p[0]) / 2).toFixed(1)} ${(Math.min(a[1], p[1]) - lift).toFixed(1)} ${p[0]} ${p[1]}`;
  }).join("");
  const plane = REDUCED ? "" : `<g fill="#041E42"><path d="M9 0-3 -2.2-7-8h-2.6l2.4 6.2-4.6.4-1.6-2.2h-1.8l1 3.8-1 3.8h1.8l1.6-2.2 4.6.4L-9.6 8H-7l4-5.8z"/><animateMotion dur="30s" repeatCount="indefinite" rotate="auto"><mpath href="#cov-route"/></animateMotion></g>`;
  const pins = pts.map((p, i) => `<g style="--d:${(i * 0.45).toFixed(2)}s"><circle class="pin-ring" cx="${p[0]}" cy="${p[1]}" r="6"/><circle cx="${p[0]}" cy="${p[1]}" r="5.5" fill="#041E42" stroke="#fff" stroke-width="2.2"/></g>`).join("");
  const cards = DESTS.map((d, i) => {
    const [x, y] = MAP.pins[d.code], from = Math.min(...PLANS.filter(p => p.live && p.countries.includes(d.code)).map(p => p.price));
    const img = DEST_PHOTOS[d.code] ? `<img src="${DEST_PHOTOS[d.code]}" alt="">` : scene(d.code);
    return `<a class="postcard ${d.pos}" style="left:${((x - MAP.x) / MAP.w * 100).toFixed(2)}%;top:${((y - MAP.y) / MAP.h * 100).toFixed(2)}%;--r:${d.rot}deg;--r0:${d.rot}deg" ${go_("/plans?country=" + d.code)}><span class="postcard-img">${img}</span><span class="postcard-cap"><b>${flag(d.code, 16)}${d.city}</b><i>from $${from}</i></span></a>`;
  }).join("");
  return `<div class="wrap"><section class="coverage" aria-labelledby="cov-h">
    <div class="coverage-main bg-meridian">
      <div class="coverage-copy stack"><p class="small strong">Global coverage</p><h2 id="cov-h">One eSIM for ${n} countries</h2>
        <p>Visiting more than one country? A Global plan keeps you online across all of them, with no new plan at each border.</p>
        <div class="row" style="gap:24px"><a class="btn btn-primary" ${go_("/plans?region=global")}>See Global plans</a><a class="link" ${go_("/plans")}>All destinations ${I.arrow}</a></div></div>
      <div class="map-wrap"><svg class="map" viewBox="${MAP.x} ${MAP.y} ${MAP.w} ${MAP.h}" aria-hidden="true"><path d="${MAP.land}" fill="#fff" opacity=".78"/><path id="cov-route" class="route" d="${route}" fill="none" stroke="#041E42" stroke-width="1.6" stroke-dasharray="2 8" stroke-linecap="round"/>${plane}${pins}</svg>${cards}</div>
    </div>
    <div class="coverage-side">
      <div class="panel">${I.card}<h4>No subscription, no contract</h4><p class="muted">Buy a prepaid plan for the trip you're taking. If you need more data on the way, top up online.</p></div>
      <div class="panel">${I.bolt}<h4>Connected when you land</h4><p class="muted">Install the eSIM at home in a few minutes. Switch it on after landing and your data works right away.</p></div>
    </div>
  </section></div>`;
}

const HOW_STEPS = [
  ["Choose a plan", "Pick your destination, the amount of data and how long you need it."],
  ["Scan your QR code", "Pay with your Diners Club card. Your QR code appears on screen and arrives by email."],
  ["Land and connect", "Switch on the travel eSIM when you land. No SIM shop, no roaming charges."]
];
function setHowStep(i) {
  S.howStep = i;
  $$("[data-howhome] [data-act='howStep']").forEach(b => b.setAttribute("aria-current", +b.dataset.i === i));
  $$("[data-howhome] .scr").forEach((el, k) => el.classList.toggle("on", k === i));
}
function howHome() {
  const on = i => (S.howStep === i ? " on" : "");
  return `<section class="bg-twilight on-dark"><div class="wrap how-home" data-howhome>
    <div class="device" aria-hidden="true">
      <div class="scr${on(0)}"><h6>Travel eSIM</h6><div class="mini-search"><span>Where are you travelling?</span>${I.search}</div>
        <div class="mini">${flag("EU", 34)}<div><b>Europe 10 GB</b><span>30 days</span></div><em>$15</em><div class="mini-btn">Buy now</div></div>
        <div class="mini" style="opacity:.55">${flag("US", 34)}<div><b>USA 10 GB</b><span>30 days</span></div><em>$17</em></div>
        <div class="mini" style="opacity:.3">${flag("JP", 34)}<div><b>Japan 5 GB</b><span>30 days</span></div><em>$10</em></div></div>
      <div class="scr scr-center${on(1)}"><h6>Your eSIM is ready</h6><p class="muted">Scan to install</p><div class="scr-qr">${qr("home-demo")}</div><p class="muted">Order SFL-24695828</p><div class="mini-btn" style="width:100%">Quick install</div></div>
      <div class="scr scr-center${on(2)}"><div class="scr-badge">${I.signal}</div><h6>Connected</h6><p class="muted">Travel eSIM, 5G</p><div class="usage-bar" style="width:100%;margin-top:14px"><i style="width:4%"></i></div><p class="muted">9.6 GB left, 29 days remaining</p></div>
    </div>
    <div class="stack-lg">
      <div class="stack"><h2>How it works</h2><p class="big">Install once before you fly. Connect when you land.</p></div>
      <ol class="how-steps">${HOW_STEPS.map(([t, d], i) => `<li><button type="button" data-act="howStep" data-i="${i}" aria-current="${S.howStep === i}"><span class="n">${i + 1}</span><h5>${t}</h5><p>${d}</p><span class="how-bar"><i></i></span></button></li>`).join("")}</ol>
      <div class="row"><a class="btn btn-primary" ${go_("/how-it-works")}>Installation guide</a><a class="btn btn-secondary" ${go_("/devices")}>Check your device</a></div>
    </div>
  </div></section>`;
}

V[""] = () => {
  const v2 = V2();
  const sec = (s, si) => {
    const list = PLANS.filter(p => p.live && p.siteLocations.includes(s.key)).slice(0, 4);
    /* version 2: no carousel on mobile, every card is listed and View all opens the catalog */
    if (v2) {
      /* plans placed in this section in the CMS first, then more plans that match the section, up to 8 */
      const match = { sale: p => p.onSale, year: p => p.days >= 365, europe: p => p.region === "europe", usa: p => p.region === "usa", world: p => !["europe", "usa"].includes(p.region) }[s.key] || (() => false);
      let more = PLANS.filter(p => p.live && p.siteLocations.includes(s.key));
      more = [...more, ...PLANS.filter(p => p.live && match(p) && !more.includes(p))].slice(0, 8);
      if (si === 0) more.sort((a, b) => (b.icon === FEATURED) - (a.icon === FEATURED));
      return `<section class="home-section"><div class="section-head"><h3>${s.title}</h3><a class="link" ${go_(s.all)}>View all ${I.arrow}</a></div><div class="grid-4">${more.map((p, i) => planCard(p, si === 0 && i === 0 && p.icon === FEATURED)).join("")}</div>
      <a class="btn btn-secondary btn-block m-only" ${go_(s.all)}>View all</a></section>`;
    }
    return `<section class="home-section"><div class="section-head"><h3>${s.title}</h3><a class="link" ${go_(s.all)}>View all ${I.arrow}</a></div><div class="grid-4 carousel" data-carousel>${list.map(p => planCard(p)).join("")}</div>
      <div class="car-nav"><button type="button" data-act="car" data-d="-1" aria-label="Previous plans" disabled>${I.arrow}</button><button type="button" data-act="car" data-d="1" aria-label="Next plans">${I.arrow}</button></div>
      <a class="btn btn-secondary btn-block m-only" ${go_(s.all)}>View all</a></section>`;
  };
  return `
  <section class="hero on-dark"><div class="hero-media" aria-hidden="true">${HERO_PHOTOS.length ? HERO_PHOTOS.map((u, i) => `<img src="${u}" alt=""${i === S.heroIdx ? ' class="on"' : ""}>`).join("") : heroArt()}</div><div class="wrap">
    <div class="hero-copy stack-lg">
      <div class="stack"><h1>Stay connected wherever you travel</h1>
      <p class="big measure">Prepaid travel data for Diners Club cardmembers. Choose a destination, pay with your Diners Club card and install your eSIM by scanning a QR code.</p></div>
      ${v2 ? "" : searchBar()}
      <div class="quick"><span class="small">Popular regions</span>${REGIONS.map(r => `<a class="chip" ${go_("/plans?region=" + r.key)}>${r.label}</a>`).join("")}</div>
      ${v2 ? `<div class="quick quick-btns"><span class="small">Already have an eSIM?</span><a class="btn btn-secondary btn-sm" ${go_("/balance")}>Check balance</a><a class="btn btn-secondary btn-sm" ${go_("/topup")}>Top up</a><a class="btn btn-secondary btn-sm" ${go_("/devices")}>Check your device</a></div>`
      : `<div class="quick" style="gap:24px"><span class="small">Already have an eSIM?</span><a class="link" ${go_("/balance")}>Check balance ${I.arrow}</a><a class="link" ${go_("/topup")}>Top up ${I.arrow}</a><a class="link" ${go_("/devices")}>Check your device ${I.arrow}</a></div>`}
    </div>
    <div></div>
  </div></section>
  <div class="notice"><span>Travelling often? 1-year plans are now available.</span><a class="link" ${go_("/plans?validity=365")}>See 1-year plans ${I.arrow}</a></div>
  ${v2 ? `<section class="search-band"><div class="wrap"><div class="search-band-in"><p class="strong">Find a plan for your trip</p>${searchBar()}</div></div></section>` : ""}
  <div class="wrap">${SECTIONS.slice(0, 2).map(sec).join("")}</div>
  ${coverage()}
  <div class="wrap">${SECTIONS.slice(2).map((s, i) => sec(s, i + 2)).join("")}</div>
  ${howHome()}`;
};

const qs = o => { const s = Object.entries(o).filter(([, v]) => v).map(([k, v]) => k + "=" + encodeURIComponent(v)).join("&"); return "/plans" + (s ? "?" + s : ""); };
const setQ = (q, k, v) => { const n = { ...q }; if (v == null) delete n[k]; else n[k] = v; return qs(n); };
V.plans = (seg, q) => {
  let list = PLANS.filter(p => p.live);
  const picks = (q.country || "").split(",").filter(c => COUNTRIES[c]);
  if (picks.length) list = list.filter(p => picks.every(c => p.countries.includes(c)));
  if (q.region) list = list.filter(p => p.region === q.region);
  if (q.section) list = list.filter(p => p.siteLocations.includes(q.section));
  if (q.validity) list = list.filter(p => String(p.days) === q.validity);
  if (q.topup) list = list.filter(p => p.topup);
  if (q.sort === "price") list.sort((a, b) => a.price - b.price);
  else if (q.sort === "data") list.sort((a, b) => b.dataGB - a.dataGB);
  else if (picks.length) list.sort((a, b) => a.countries.length - b.countries.length || a.price - b.price);
  const country = picks.length ? listNames(picks) : "";
  const title = country ? "eSIM plans for " + country : q.region ? (REGIONS.find(r => r.key === q.region) || { label: "" }).label + " plans" : q.section === "sale" ? "Plans on sale" : q.section === "world" ? "Rest of the world" : q.validity === "365" ? "1-year plans" : "All plans";
  const radio = (k, v, label) => `<li><a ${go_(setQ(q, k, v))} aria-current="${(q[k] || null) == v}">${label}</a></li>`;
  const active = Object.keys(q).filter(k => k !== "sort").length;
  return `<section class="page-head"><div class="wrap stack-lg"><div class="stack"><h2>${esc(title)}</h2><p class="muted">${list.length} plan${list.length === 1 ? "" : "s"} available${picks.length > 1 ? `, each covering all ${picks.length} countries` : ""}. All plans are prepaid and data only.</p></div>${searchBar(picks, true)}</div></section>
  <section class="band-tight"><div class="wrap cols-filters">
    <aside class="filters" aria-label="Filters">
      <h6>Region</h6><ul>${radio("region", null, "All regions")}${REGIONS.map(r => radio("region", r.key, r.label)).join("")}</ul>
      <h6>Validity</h6><ul>${radio("validity", null, "Any length")}${radio("validity", "30", "30 days")}${radio("validity", "365", "1 year")}</ul>
      <h6>Top-up</h6><ul><li><a class="box" ${go_(setQ(q, "topup", q.topup ? null : "1"))} aria-current="${!!q.topup}">Rechargeable plans only</a></li></ul>
      ${active ? `<a class="link link-sm" ${go_("/plans")}>Clear all filters</a>` : ""}
    </aside>
    <div class="stack-lg">
      <div class="row" style="justify-content:flex-end"><span class="small muted">Sort by</span>${[["", "Recommended"], ["price", "Price"], ["data", "Most data"]].map(([v, l]) => `<a class="chip chip-light" ${go_(setQ(q, "sort", v || null))} aria-current="${(q.sort || "") === v}">${l}</a>`).join("")}</div>
      ${list.length ? `<div class="grid-auto">${list.map(planCard).join("")}</div>` : (picks.length > 1 && Object.keys(q).filter(k => k !== "sort" && k !== "country").length === 0
        ? `<div class="empty-state stack"><h4>No single plan covers ${esc(country)}</h4><p class="muted">A Global plan works in all ${Object.keys(COUNTRIES).length} countries, or remove a country to see more plans.</p><p><a class="btn btn-primary" ${go_("/plans?region=global")}>See Global plans</a></p></div>`
        : `<div class="empty-state stack"><h4>No plans match these filters</h4><p class="muted">Remove a filter or search for another destination.</p><p><a class="btn btn-secondary" ${go_("/plans")}>Clear all filters</a></p></div>`)}
    </div>
  </div></section>`;
};

V.plan = seg => {
  const p = planById(seg[1]); if (!p) return notFound("We couldn't find that plan");
  const fact = (icon, k, v) => `<div class="fact">${icon}<div><dt>${k}</dt><dd>${v}</dd></div></div>`;
  const has5g = p.countries.some(c => COUNTRIES[c][2] === "5G");
  return `<section class="page-head"><div class="wrap"><p class="crumb"><a ${go_("/plans")}>All plans</a><span>/</span><span>${esc(p.title)}</span></p>
    <div class="row" style="gap:20px;flex-wrap:nowrap">${flag(p.icon, 64)}<div><h2>${esc(p.title)} ${p.dataGB} GB</h2><p class="muted">${validity(p.days)} · ${p.countries.length === 1 ? cName(p.countries[0]) : p.countries.length + " countries"}${p.onSale ? ' · <span class="tag tag-sale">On sale</span>' : ""}</p></div></div></div></section>
  <section class="band-tight"><div class="wrap cols">
    <div class="stack-lg">
      <div class="stack"><h4>Plan details</h4>
      <dl class="facts" style="margin:16px 0 0">
        ${fact(I.signal, "Network", has5g ? "5G / 4G / LTE" : "4G / LTE")}
        ${fact(I.doc, "Plan type", "Prepaid, data only")}
        ${fact(I.gauge, "Speed", has5g ? "High speed, 5G where available" : "High speed")}
        ${fact(I.refresh, "Top-up", p.topup ? "Available" : "Not available")}
        ${fact(I.calendar, "Validity", validity(p.days) + " from first connection")}
        ${fact(I.check, "Balance", "Check online with your order ID")}
      </dl></div>
      <div class="stack"><div class="row-between"><h4>Countries and providers</h4>${p.countries.length > 8 ? `<input class="input" style="max-width:260px;height:42px" type="text" placeholder="Filter countries" aria-label="Filter countries" data-cfilter>` : ""}</div>
      <div class="table-scroll"><table class="table" id="ctable"><thead><tr><th>Country</th><th>Providers</th><th>Network</th></tr></thead><tbody>
        ${p.countries.map(c => `<tr data-name="${esc(cName(c).toLowerCase())}"><td><span class="c-name">${flag(c, 26)}${esc(cName(c))}</span></td><td>${COUNTRIES[c][1].map(esc).join(", ")}</td><td><span class="pill">${COUNTRIES[c][2]}</span></td></tr>`).join("")}
      </tbody></table></div></div>
    </div>
    <aside class="panel panel-sticky stack">
      <div class="row-between" style="align-items:baseline"><span class="fig">${p.compareAt ? `<s>$${p.compareAt}</s>` : ""}${money(p.price)}</span><span class="small muted">per eSIM</span></div>
      ${variants(p).length > 1 ? `<div class="stack" style="--g:8px"><span class="small strong">Data per eSIM</span><div class="seg">${variants(p).map(x => `<a ${go_("/plan/" + x.id)} aria-pressed="${x.id === p.id}"><b>${x.dataGB} GB</b><span>${money(x.price)}</span></a>`).join("")}</div></div>` : ""}
      <div class="row-between" style="align-items:center"><span class="small strong">Number of eSIMs</span><span class="qty"><button type="button" data-act="qty" data-d="-1" aria-label="Fewer">${I.minus}</button><output id="qty">${S.qty}</output><button type="button" data-act="qty" data-d="1" aria-label="More">${I.plus}</button></span></div>
      <p class="hint">Up to 5 eSIMs of this plan per order. Each traveller needs their own eSIM.</p>
      <div class="total" style="margin-top:0"><span class="strong">Total</span><span class="fig" id="ptotal">${money(p.price * S.qty)}</span></div>
      <a class="btn btn-primary btn-block" ${go_("/checkout/" + p.id)}>Buy now</a>
      <p class="hint row" style="gap:8px;flex-wrap:nowrap">${I.lock.replace("<svg", '<svg style="width:16px;height:16px;flex:none"')}<span>Payment with Diners Club cards only.</span></p>
    </aside>
  </div></section>`;
};

/* Same destination and validity, different data sizes */
const variants = p => PLANS.filter(x => x.live && x.title === p.title && x.days === p.days).sort((a, b) => a.dataGB - b.dataGB);
function coSummary(co) {
  const t = totals(co), p = t.item, cover = p.countries.length === 1 ? cName(p.countries[0]) : p.countries.length + " countries";
  return `<section class="co-summary" id="co-summary" aria-label="Order summary">
    <div class="co-plan">${flag(p.icon, 64)}<div><h4>${esc(p.title)}</h4><p class="small muted">${validity(p.days)}, ${cover}, ${p.topup ? "top-up available" : "no top-up"}</p></div></div>
    <div class="co-opt"><span class="co-label">Data per eSIM</span><div class="seg" role="group" aria-label="Data per eSIM">${variants(p).map(x => `<button type="button" data-act="coGb" data-id="${x.id}" aria-pressed="${x.id === p.id}"><b>${x.dataGB} GB</b><span>${money(x.price)}</span></button>`).join("")}</div></div>
    <div class="co-opt"><span class="co-label">Number of eSIMs</span><span class="qty"><button type="button" data-act="coQty" data-d="-1" aria-label="Remove one eSIM"${co.qty <= 1 ? " disabled" : ""}>${I.minus}</button><output aria-live="polite">${co.qty}</output><button type="button" data-act="coQty" data-d="1" aria-label="Add one eSIM"${co.qty >= 5 ? " disabled" : ""}>${I.plus}</button></span></div>
    <div class="co-total"><span class="co-label">Final cost</span><span class="fig">${money(t.total)}</span><span class="small muted">${co.qty} x ${money(p.price)}${t.disc ? `, coupon ${esc(co.coupon)} -${money(t.disc)}` : ""}</span></div>
  </section>`;
}
function refreshCo(focusSel) {
  const el = $("#co-summary"); if (!el || !S.co) return;
  el.outerHTML = coSummary(S.co);
  if (focusSel) { const b = $(focusSel); if (b && !b.disabled) b.focus(); }
}
function couponArea(co) {
  if (!(co.couponOpen || co.coupon)) return `<button type="button" class="link link-sm" data-act="couponOpen">I have a coupon code</button>`;
  return `<div class="field" style="max-width:420px"><label for="f-coupon">Coupon code</label><div class="inline-form"><input class="input" id="f-coupon" name="couponInput" value="${esc(co.coupon || co.form.couponInput || "")}" autocomplete="off"><button type="button" class="btn btn-secondary btn-sm" data-act="coupon">Apply</button></div><p class="hint" id="coupon-msg">${co.coupon ? `Coupon ${esc(co.coupon)} applied: ${COUPONS[co.coupon] * 100}% off.` : "Prototype: try the code FLY25."}</p></div>`;
}
V.checkout = seg => {
  const p = planById(seg[1]); if (!p) return notFound("We couldn't find that plan");
  if (!S.co || S.co.kind !== "new" || S.co.itemId !== p.id) S.co = { kind: "new", itemId: p.id, qty: S.qty, coupon: null, couponOpen: false, form: {} };
  const f = S.co.form, v = k => esc(f[k] || "");
  if (S.user) ["first", "last", "email"].forEach(k => { if (!f[k]) f[k] = S.user[k]; });
  const account = S.user
    ? `<p class="msg">${I.check}<span>Signed in as <span class="strong">${esc(S.user.email)}</span>. This eSIM will be saved under My eSIMs.</span></p>`
    : `<p class="msg">${I.user}<span>Already have an account? <a class="inline-link" ${go_("/signin?next=" + encodeURIComponent("/checkout/" + p.id))}>Sign in</a> to fill in your details and keep this eSIM under My eSIMs.</span></p>`;
  return `<section class="band-tight"><div class="wrap">${stepper(1)}${coSummary(S.co)}<div class="cols">
    <form class="stack-lg" data-form="details" novalidate>
      <div class="stack"><h3>Your details</h3><p class="muted">We send the QR code, installation instructions and invoice to this email address.</p>${account}</div>
      <div class="form-grid">
        <div class="field"><label for="f-first">First name</label><input class="input" id="f-first" name="first" value="${v("first")}" autocomplete="given-name" data-req></div>
        <div class="field"><label for="f-last">Last name</label><input class="input" id="f-last" name="last" value="${v("last")}" autocomplete="family-name" data-req></div>
        <div class="field"><label for="f-phone">Mobile phone</label><input class="input" id="f-phone" name="phone" type="tel" value="${v("phone")}" placeholder="+44 7700 900123" autocomplete="tel" data-req></div>
        <div class="field"><label for="f-email">Email</label><input class="input" id="f-email" name="email" type="email" value="${v("email")}" autocomplete="email" data-req="email"></div>
        <div class="field"><label for="f-dep">Departure date <span class="opt">(optional)</span></label><input class="input" id="f-dep" name="depart" type="date" min="${today()}" value="${v("depart")}"></div>
        <div class="field"><label for="f-ret">Return date <span class="opt">(optional)</span></label><input class="input" id="f-ret" name="ret" type="date" min="${today()}" value="${v("ret")}"></div>
      </div>
      <div id="coupon-area">${couponArea(S.co)}</div>
      <div class="stack">
        <label class="check"><input type="checkbox" name="privacy"${f.privacy ? " checked" : ""} data-req="check"><span>I have read the <a class="inline-link" ${go_("/privacy")}>Privacy Policy</a>.</span></label>
        <label class="check"><input type="checkbox" name="terms"${f.terms ? " checked" : ""} data-req="check"><span>I accept the <a class="inline-link" ${go_("/terms")}>Terms &amp; Conditions</a>.</span></label>
      </div>
      <div class="row"><button class="btn btn-primary" type="button" data-submit>Continue to payment</button><a class="link" ${go_("/plan/" + p.id)}>Back to plan</a></div>
    </form>
    <aside class="panel panel-sticky stack"><h5>After you pay</h5>
      <ul class="after-pay"><li>${I.check}<span>Your QR code appears on screen right away.</span></li><li>${I.mail}<span>We email the QR code, a quick-install link and your invoice.</span></li><li>${I.phone}<span>Install before you fly and switch the eSIM on when you land.</span></li><li>${I.lock}<span>Payment with Diners Club cards only.</span></li></ul>
    </aside>
  </div></div></section>`;
};

V.pay = () => {
  if (!S.co) return notFound("There is nothing to pay for yet");
  const t = totals(S.co), back = S.co.kind === "topup" ? "/topup?id=" + S.co.orderId : "/checkout/" + S.co.itemId;
  return `<section class="band-tight"><div class="wrap">${S.co.kind === "new" ? stepper(2) : ""}<div class="cols">
    <form class="stack-lg" data-form="pay" novalidate style="max-width:560px">
      <div class="stack"><h3>Payment</h3><p class="muted">Diners Club cards only.</p></div>
      <div class="field" id="card-field"><span class="label">Card information</span>
        <div class="card-box"><input class="input" name="card" readonly aria-label="Card number" value="${TEST_CARDS.diners}">
        <div class="card-row"><input class="input" name="exp" readonly aria-label="Expiry date" value="12 / ${String(new Date().getFullYear() + 3).slice(2)}"><input class="input" name="cvc" readonly aria-label="Security code" value="123"></div></div>
      </div>
      <div class="field" id="name-field"><label for="p-name">Name on card</label><input class="input" id="p-name" name="name" autocomplete="off" value="${esc(S.co.form.first ? S.co.form.first + " " + (S.co.form.last || "") : S.user ? S.user.first + " " + S.user.last : "Dan Martin")}"></div>
      <div class="stack"><button class="btn btn-primary btn-block" type="button" data-submit>Pay ${money(t.total)}</button>
      <p class="hint" style="text-align:center">We email your invoice and installation instructions right after payment. Powered by Stripe.</p></div>
      <a class="link" ${go_(back)}>Back</a>
    </form>
    <aside class="panel panel-sticky" id="summary">${summary(S.co)}</aside>
  </div></div></section>`;
};

function thanks(o, kind) {
  const p = orderPlan(o);
  if (kind === "topup") return `<div class="stack-lg"><div class="stack"><h3>Top-up complete</h3><p class="big">Your eSIM is ready to use again. Turn flight mode on and off once to reconnect.</p></div>
    <dl class="kv"><dt>Order ID</dt><dd>${o.id}</dd><dt>Plan</dt><dd>${esc(p.title)} top-up</dd><dt>Data available</dt><dd>${((o.totalMB - o.usedMB) / 1000).toFixed(1)} GB</dd><dt>Validity</dt><dd>${o.daysLeft} days</dd></dl>
    <p class="msg">${I.mail}<span>We sent the invoice to your email address.</span></p>
    <div class="row"><button class="btn btn-primary" data-act="closeModal">View my eSIM</button><a class="btn btn-secondary" ${go_("/balance?id=" + o.id)}>Check balance</a></div></div>`;
  return `<div class="stack-lg"><div class="stack"><h3>Your travel eSIM is ready</h3><p class="msg">${I.mail}<span>We sent an email with all the details, your invoice and a quick-install link for iPhone and Android.</span></p></div>
    ${esimBlock(o)}
    <div class="stack"><h5>Installation instructions</h5><div data-how="compact">${howBlock("compact")}</div></div>
    <div class="row"><button class="btn btn-primary" data-act="closeModal">Done</button><a class="link" ${go_("/how-it-works")}>Full installation guide ${I.arrow}</a></div></div>`;
}
V.order = seg => {
  const o = orderById(seg[1]); if (!o) return notFound("We couldn't find that order");
  const p = orderPlan(o), left = o.totalMB - o.usedMB;
  return `<section class="page-head"><div class="wrap"><p class="crumb"><a ${go_("/account")}>My eSIMs</a><span>/</span><span>${o.id}</span></p><h2>${esc(p.title)} ${p.dataGB} GB</h2><p class="muted">Order ${o.id} · purchased ${o.date}</p></div></section>
  <section class="band-tight"><div class="wrap cols">
    <div class="stack-lg"><div class="panel">${esimBlock(o)}</div>
      <div class="stack"><h4>Installation instructions</h4><div data-how="compact">${howBlock("compact")}</div></div></div>
    <aside class="panel panel-sticky stack"><h5>Data balance</h5><p><span class="fig">${(left / 1000).toFixed(1)}<small>GB left of ${(o.totalMB / 1000).toFixed(0)} GB</small></span></p>
      <div class="usage-bar"><i style="width:${Math.round(o.usedMB / o.totalMB * 100)}%"></i></div><p class="small muted">${o.daysLeft} days remaining</p>
      ${p.topup ? `<a class="btn btn-primary btn-block" ${go_("/topup?id=" + o.id)}>Top up</a>` : `<p class="small muted">This plan is not rechargeable.</p><a class="btn btn-secondary btn-block" ${go_("/plans")}>Buy a new eSIM</a>`}
      <button type="button" class="link link-sm" data-act="soon" data-msg="Downloads the invoice PDF. The same invoice is emailed after payment through Wix Triggered Emails.">Download invoice</button>
    </aside></div></section>`;
};

const idForm = (form, id, cta) => `<form class="stack" data-form="${form}" novalidate><div class="field" id="id-field"><label for="oid">Order ID</label><div class="prefix-input"><span>SFL-</span><input id="oid" name="oid" inputmode="numeric" placeholder="XXXXXXXX" value="${esc((id || "").replace("SFL-", ""))}" autocomplete="off"></div></div>
  <p class="hint">You'll find the order ID in your confirmation email. Prototype: try SFL-24695828 (rechargeable) or SFL-10384471.</p>
  ${S.user && S.orders.length && form !== "topup" ? `<div class="row"><span class="small muted">Your eSIMs</span>${S.orders.slice(0, 4).map(o => `<a class="chip chip-light" ${go_("/" + form + "?id=" + o.id)}>${o.id}</a>`).join("")}</div>` : ""}
  <div><button class="btn btn-primary" type="button" data-submit>${cta}</button></div></form>`;
V.thanks = seg => {
  const o = orderById(seg[1]), lp = S.lastPay;
  if (!o) return notFound("We couldn't find that order");
  if (!lp || lp.id !== o.id) return V.order(seg);
  const p = orderPlan(o), top = lp.kind === "topup", left = o.totalMB - o.usedMB;
  const tips = [
    ["Install on Wi-Fi before you leave", "Scanning the QR code needs an internet connection. The validity period starts only when the eSIM first connects at your destination."],
    ["Switch it on when you land", "Turn on the travel eSIM line and enable data roaming for it. Keep your regular SIM for calls if you like."],
    ["Keep the eSIM on your phone", "Don't delete it after installing. A QR code can be used only once."]
  ];
  return `<section class="thanks-head bg-twilight on-dark"><div class="wrap stack"><span class="thanks-check">${I.check}</span>
      <h2>${top ? "Top-up complete" : `Thank you${lp.first ? ", " + esc(lp.first) : ""}. Your eSIM is ready`}</h2>
      <p class="big measure">${top ? `We added ${lp.dataGB} GB to your eSIM. Turn flight mode on and off once to reconnect.` : "Scan the QR code below to install it."} ${lp.email ? `We sent the ${top ? "invoice" : "QR code, installation instructions and invoice"} to ${esc(lp.email)}.` : "We sent the details and invoice to your email address."}</p>
      <p class="small">Order ${o.id}</p></div></section>
  <section class="band-tight"><div class="wrap cols">
    <div class="stack-lg">
      ${top ? `<div class="panel stack"><h4>Your balance now</h4><p><span class="fig">${(left / 1000).toFixed(1)}<small>GB left</small></span></p><div class="usage-bar"><i style="width:${Math.round(o.usedMB / o.totalMB * 100)}%"></i></div><p class="small muted">${o.daysLeft} days remaining. No reinstall needed.</p></div>`
      : `<div class="panel stack-lg"><div class="stack"><h4>Scan to install</h4><p class="muted">Open your phone's camera, or go to Settings and add an eSIM, then scan the code.${lp.qty > 1 ? " Each eSIM has its own code, one per phone." : ""}</p></div>${esimBlock(o)}</div>
      <div class="stack"><h4>Installation steps</h4><div data-how="compact">${howBlock("compact")}</div></div>
      <div class="stack"><h4>Good to know</h4><div class="tips">${tips.map(([t, d]) => `<div class="panel"><h5>${t}</h5><p class="muted small">${d}</p></div>`).join("")}</div></div>`}
    </div>
    <aside class="panel panel-sticky stack"><h5>Order summary</h5>
      <div class="sum-item">${flag(p.icon, 44)}<div><span class="strong">${esc(lp.title)}</span><br><span class="small muted">${lp.dataGB} GB, ${validity(lp.days)}</span></div></div>
      <dl class="kv"><dt>Order ID</dt><dd>${o.id}</dd><dt>Date</dt><dd>${today()}</dd>${top ? "" : `<dt>Number of eSIMs</dt><dd>${lp.qty}</dd>`}<dt>${top ? "Top-up price" : "Price per eSIM"}</dt><dd>${money(lp.unit)}</dd>${lp.disc ? `<dt>Coupon ${esc(lp.coupon)}</dt><dd>-${money(lp.disc)}</dd>` : ""}<dt>Paid with</dt><dd>Diners Club ending ${lp.card}</dd></dl>
      <div class="sum-total"><span>Total paid</span><span class="fig">${money(lp.total)}</span></div>
      <a class="btn btn-primary btn-block" ${go_(S.user ? "/account" : "/order/" + o.id)}>${S.user ? "Go to My eSIMs" : "View eSIM details"}</a>
      <a class="btn btn-secondary btn-block" ${go_("/balance?id=" + o.id)}>Check balance</a>
      <button type="button" class="link link-sm" data-act="soon" data-msg="Downloads the invoice PDF. The same invoice is emailed after payment through Wix Triggered Emails.">Download invoice</button>
    </aside>
  </div></section>`;
};
V.balance = (seg, q) => {
  const id = normId(q.id), o = id && orderById(id), p = o && orderPlan(o);
  const result = !id ? "" : !o ? `<p class="msg">${I.info}<span><span class="strong">We couldn't find order ${esc(id)}.</span> Check the number in your confirmation email and try again.</span></p>` : `<div class="panel stack-lg"><div class="row-between"><div><h4>Usage data</h4><p class="muted small">Order ${o.id}</p></div><span class="fig">${((o.totalMB - o.usedMB) / 1000).toFixed(1)}<small>GB left</small></span></div>
      <div class="stack"><div class="usage-bar"><i style="width:${Math.round(o.usedMB / o.totalMB * 100)}%"></i></div><p class="small muted">Used ${o.usedMB.toLocaleString("en-US")} MB out of ${o.totalMB.toLocaleString("en-US")} MB</p></div>
      <dl class="kv"><dt>Pack name</dt><dd>${esc(p.title)}</dd><dt>Size</dt><dd>${o.totalMB / 1000} GB</dd><dt>Rechargeable</dt><dd>${p.topup ? "Yes" : "No"}</dd><dt>Validity</dt><dd>${validity(p.days)}</dd><dt>Days remaining</dt><dd>${o.daysLeft}</dd></dl>
      <div class="row">${p.topup ? `<a class="btn btn-primary" ${go_("/topup?id=" + o.id)}>Top up this eSIM</a>` : `<a class="btn btn-secondary" ${go_("/plans")}>Buy a new eSIM</a>`}<a class="link" ${go_("/order/" + o.id)}>View eSIM details ${I.arrow}</a></div></div>`;
  return `<section class="page-head"><div class="wrap stack"><h2>Check your balance</h2><p class="muted measure">Enter your order ID to see how much data is left. You can also see usage per app in your phone's mobile data settings.</p></div></section>
  <section class="band-tight"><div class="wrap cols" style="grid-template-columns:minmax(0,420px) minmax(0,1fr)">${idForm("balance", id, "Check balance")}<div>${result}</div></div></section>`;
};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = d => { const [y, m, dd] = String(d).split("-"); return y && m ? `${+dd} ${MONTHS[+m - 1]} ${y}` : d; };
V.topup = (seg, q) => {
  /* signed in: rechargeable eSIMs, newest purchase first; the newest is selected when no order is chosen */
  const mine = S.user ? S.orders.filter(x => orderPlan(x).topup).sort((a, b) => b.date.localeCompare(a.date)) : [];
  const id = normId(q.id) || (mine[0] ? mine[0].id : ""), o = id && orderById(id), p = o && orderPlan(o);
  let result = "";
  if (id && !o) result = `<p class="msg">${I.info}<span><span class="strong">We couldn't find order ${esc(id)}.</span> Check the number in your confirmation email and try again.</span></p>`;
  else if (o && !p.topup) result = `<div class="panel stack"><h4>This eSIM can't be topped up</h4><p class="muted">${esc(p.title)} ${p.dataGB} GB is not a rechargeable plan. Buy a new eSIM and install it in place of the current one.</p><div><a class="btn btn-primary" ${go_("/plans?region=" + p.region)}>Find a new plan</a></div></div>`;
  else if (o) result = `<div class="stack-lg"><div class="stack"><h4>Choose a top-up for ${esc(p.title)} ${p.dataGB} GB (${o.id})</h4><p class="muted">The new data pack is added to your current eSIM and starts a new validity period. No reinstall needed.</p></div>
    <div class="grid-auto">${TOPUPS.filter(t => t.family === p.family).map(t => `<article class="plan"><div class="plan-body" style="padding-top:22px"><div><h3 class="plan-name">${esc(t.title)}</h3><ul class="meta"><li>${I.calendar}${validity(t.days)}</li></ul></div><div class="figures"><span class="fig">${t.dataGB}<small>GB</small></span><span class="fig">$${t.price}</span></div><button class="btn btn-primary btn-sm" data-act="chooseTopup" data-id="${t.id}" data-order="${o.id}">Choose</button></div></article>`).join("")}</div></div>`;
  const picker = !S.user ? idForm("topup", id, "Find top-up plans") : `<div class="stack-lg">
      <div class="stack"><h4>Your rechargeable eSIMs</h4>
      ${mine.length ? `<p class="muted small">Choose the eSIM you want to add data to.</p><div class="esim-pick">${mine.map(x => { const xp = orderPlan(x); return `<a ${go_("/topup?id=" + x.id)} aria-current="${x.id === id}">${flag(xp.icon, 40)}<span><b>${esc(xp.title)} ${xp.dataGB} GB</b><i>Purchased ${fmtDate(x.date)}</i><i>${x.id}</i>${x === mine[0] ? '<span class="tag tag-sale">Last purchase</span>' : ""}</span><span class="esim-pick-left"><b>${((x.totalMB - x.usedMB) / 1000).toFixed(1)} GB left</b><i>${x.daysLeft} days</i></span></a>`; }).join("")}</div>`
        : `<p class="msg">${I.info}<span>None of the eSIMs in your account can be topped up. <a class="inline-link" ${go_("/plans")}>Buy a new eSIM</a> instead.</span></p>`}</div>
      <details class="other-id"${id && !mine.some(x => x.id === id) ? " open" : ""}><summary>Top up an eSIM that isn't in your account</summary>${idForm("topup", mine.some(x => x.id === id) ? "" : id, "Find top-up plans")}</details></div>`;
  if (S.user && !id && mine.length) result = `<div class="empty-state stack"><h4>Choose an eSIM to see its top-up plans</h4><p class="muted">The new data is added to the eSIM that is already on your phone.</p></div>`;
  return `<section class="page-head"><div class="wrap stack"><h2>Top up your eSIM</h2><p class="muted measure">Add data to a rechargeable plan and keep using the eSIM that is already on your phone.${S.user ? "" : ` Top-ups need your order ID. <a class="inline-link" ${go_("/signin?next=" + encodeURIComponent("/topup"))}>Sign in</a> to pick from the eSIMs in your account.`}</p></div></section>
  <section class="band-tight"><div class="wrap cols" style="grid-template-columns:minmax(0,440px) minmax(0,1fr)">${picker}<div>${result}</div></div></section>`;
};

V["how-it-works"] = () => `<section class="page-head"><div class="wrap stack"><h2>How it works</h2><p class="muted measure">Install your eSIM before you leave, while you have Wi-Fi. The validity period starts only when the eSIM first connects at your destination.</p></div></section>
  <section class="band-tight"><div class="wrap stack-lg"><div data-how="full">${howBlock("full")}</div>
  <div class="cta bg-meridian"><div class="stack"><h4>Not sure your phone supports eSIM?</h4><p>Look up your model before you buy.</p></div><a class="btn btn-primary" ${go_("/devices")}>Check your device</a></div></div></section>`;

function devList() {
  const q = (($("[data-devsearch]") || {}).value || "").trim().toLowerCase();
  const groups = Object.entries(DEVICES).filter(([b]) => S.devBrand === "All" || S.devBrand === b)
    .map(([b, list]) => [b, list.filter(d => !q || (b + " " + d).toLowerCase().includes(q))]).filter(([, l]) => l.length);
  if (!groups.length) return `<div class="empty-state stack"><h4>No supported device matches "${esc(q)}"</h4><p class="muted measure" style="margin-inline:auto">Check the spelling, or dial *#06# on your phone. If an EID number appears, your phone supports eSIM.</p></div>`;
  return groups.map(([b, l]) => `<div class="stack"><h5>${b}</h5><ul class="device-list">${l.map(d => `<li>${I.check}${esc(d)}</li>`).join("")}</ul></div>`).join("");
}
V.devices = () => `<section class="page-head"><div class="wrap stack-lg"><div class="stack"><h2>Check your device</h2><p class="muted measure">Type your phone model to see whether it supports eSIM. Your phone must also be unlocked from your carrier.</p></div>
    <div class="search"><input type="text" data-devsearch placeholder="For example, iPhone 15 or Galaxy S24" aria-label="Device model" autocomplete="off"><span class="search-btn" aria-hidden="true">${I.search}</span></div>
    <div class="row" id="devbrands">${["All", ...Object.keys(DEVICES)].map(b => `<button class="chip chip-light" data-act="devBrand" data-b="${b}" aria-current="${S.devBrand === b}">${b}</button>`).join("")}</div></div></section>
  <section class="band-tight"><div class="wrap stack-lg"><div class="stack-lg" id="devlist">${devList()}</div><p class="hint">Sample list for the prototype. Some regional models of these phones ship without eSIM.</p></div></section>`;

V.faq = () => `<section class="page-head"><div class="wrap stack"><h2>Frequently asked questions</h2><p class="muted">Can't find an answer? <a class="inline-link" ${go_("/contact")}>Contact us</a>.</p></div></section>
  <section class="band-tight bg-sand"><div class="wrap stack-lg" style="max-width:1100px">${FAQS.map(([g, items]) => `<div class="acc"><h5>${g}</h5>${items.map(([qn, a]) => `<div class="acc-item"><button type="button" data-act="acc" aria-expanded="false"><span>${esc(qn)}</span><span class="i-plus">${I.plus}</span><span class="i-minus">${I.minus}</span></button><div class="acc-body" hidden>${esc(a)}</div></div>`).join("")}</div>`).join("")}</div></section>`;

const legal = (title, sections) => () => `<section class="page-head"><div class="wrap stack"><h2>${title}</h2><p class="muted">Placeholder structure. Final legal copy to be supplied.</p></div></section>
  <section class="band-tight"><div class="wrap prose">${sections.map(([h, t]) => `<h4>${h}</h4><p>${t}</p>`).join("")}</div></section>`;
V.terms = legal("Terms &amp; Conditions", [["1. The service", "Describes the travel eSIM service, who provides it and who can buy it."], ["2. Plans, validity and activation", "Explains data allowances, validity periods, when a plan starts and what happens when it ends."], ["3. Payment and invoices", "Covers pricing in US dollars, accepted cards, coupons and invoicing."], ["4. Top-ups", "Sets out which plans can be topped up and how a top-up changes the validity period."], ["5. Refunds and cancellations", "States when an unused eSIM can be refunded and how to ask."], ["6. Fair use and liability", "Covers acceptable use, network coverage and limits of liability."]]);
V.privacy = legal("Privacy Policy", [["Information we collect", "Lists the details collected at checkout: name, email, mobile number and optional travel dates."], ["How we use it", "Explains order fulfilment, support, invoicing and internal statistics on travel destinations."], ["Who we share it with", "Names the eSIM network partner, the payment processor and the email service."], ["How long we keep it", "States retention periods for orders and invoices."], ["Your rights", "Explains how to access, correct or delete personal data and who to contact."]]);

V.about = () => `<section class="band"><div class="wrap stack-lg" style="text-align:center"><div class="stack" style="max-width:820px;margin-inline:auto"><h2>Travel data, arranged before you leave</h2><p class="big">Travel eSIM is a cardmember service operated by SIMTOGO. It gives Diners Club cardmembers prepaid mobile data abroad without roaming charges or a physical SIM card.</p></div>
  <div class="row" style="justify-content:center"><a class="btn btn-primary" ${go_("/plans")}>Browse plans</a><a class="btn btn-secondary" ${go_("/contact")}>Contact us</a></div></div></section>
  <section class="band bg-sand"><div class="wrap"><div class="split"><div class="split-copy bg-twilight on-dark stack"><h3>What you get</h3><p>Regional, single-country and global data plans for 30 days or one year. Your QR code arrives on screen and by email as soon as you pay.</p><p>Rechargeable plans can be topped up online, and you can check your balance at any time with your order ID.</p></div><div class="bg-meridian" style="min-height:320px">${art({ id: "about", region: "europe" }).replace('class="art"', 'style="width:100%;height:100%"')}</div></div></div></section>`;

V.contact = () => `<section class="page-head"><div class="wrap stack"><h2>Contact us</h2><p class="muted measure">Have your order ID ready if your question is about an eSIM you already bought.</p></div></section>
  <section class="band-tight"><div class="wrap stack-lg">
    <div class="contact-grid">
      <div class="panel">${I.chat}<h4>Leave a message</h4><p class="muted small">Send us your details and a representative will get back to you.</p><div><button class="btn btn-secondary btn-sm" data-act="chatOpen">Start a conversation</button></div></div>
      <div class="panel">${I.bubble}<h4>WhatsApp</h4><p class="muted small">Message us and reply when it suits you.</p><div><button class="btn btn-secondary btn-sm" data-act="soon" data-msg="Opens WhatsApp with the support number (to be supplied).">Open WhatsApp</button></div></div>
      <div class="panel">${I.mail}<h4>Email</h4><p class="muted small">We reply within one business day.</p><div><button class="btn btn-secondary btn-sm" data-act="soon" data-msg="Opens the visitor's email app with the support address (to be supplied).">Send an email</button></div></div>
    </div>
    <form class="panel stack-lg" data-form="contact" novalidate style="max-width:820px"><h4>Send us a message</h4>
      <div class="form-grid"><div class="field"><label for="c-name">Name</label><input class="input" id="c-name" name="name" data-req></div><div class="field"><label for="c-email">Email</label><input class="input" id="c-email" name="email" type="email" data-req="email"></div>
      <div class="field full"><label for="c-order">Order ID <span class="opt">(optional)</span></label><input class="input" id="c-order" name="order" placeholder="SFL-" style="max-width:300px"></div>
      <div class="field full"><label for="c-msg">How can we help?</label><textarea class="textarea" id="c-msg" name="msg" data-req></textarea></div></div>
      <div><button class="btn btn-primary" type="button" data-submit>Send message</button></div></form>
  </div></section>`;

V.signin = (seg, q) => {
  const reg = q.tab === "register", next = q.next || "/account";
  return `<section class="band bg-sand"><div class="wrap"><div class="panel stack-lg" style="max-width:520px;margin-inline:auto;padding:44px">
    <div class="tabs" style="display:flex"><a ${go_("/signin?next=" + encodeURIComponent(next))} aria-selected="${!reg}" style="flex:1;text-align:center">Sign in</a><a ${go_("/signin?tab=register&next=" + encodeURIComponent(next))} aria-selected="${reg}" style="flex:1;text-align:center">Create account</a></div>
    <div class="stack"><h3>${reg ? "Create your account" : "Welcome back"}</h3><p class="muted small">${reg ? "Keep your eSIMs, balances and invoices in one place." : "Sign in to see your eSIMs and check balances without typing an order ID."}</p></div>
    <form class="stack" data-form="signin" data-next="${esc(next)}" novalidate>
      ${reg ? `<div class="form-grid"><div class="field"><label for="s-first">First name</label><input class="input" id="s-first" name="first" data-req></div><div class="field"><label for="s-last">Last name</label><input class="input" id="s-last" name="last" data-req></div></div>` : ""}
      <div class="field"><label for="s-email">Email</label><input class="input" id="s-email" name="email" type="email" value="${reg ? "" : "dan.martin@example.com"}" data-req="email"></div>
      <div class="field"><label for="s-pass">Password</label><input class="input" id="s-pass" name="pass" type="password" value="${reg ? "" : "prototype"}" data-req></div>
      <button class="btn btn-primary btn-block" type="button" data-submit>${reg ? "Create account" : "Sign in"}</button>
      ${reg ? "" : `<p style="text-align:center"><button type="button" class="link link-sm" data-act="soon" data-msg="Sends a password reset email.">Forgot your password?</button></p>`}
    </form></div></div></section>`;
};
V.account = () => {
  if (!S.user) return V.signin([], { next: "/account" });
  return `<section class="page-head"><div class="wrap row-between"><div class="stack"><h2>Hello, ${esc(S.user.first)}</h2><p class="muted">${esc(S.user.email)}</p></div><a class="btn btn-primary" ${go_("/plans")}>Buy a new eSIM</a></div></section>
  <section class="band-tight"><div class="wrap stack"><h4>My eSIMs</h4>
    ${S.orders.length ? `<table class="table table-cards"><thead><tr><th>Plan</th><th>Order ID</th><th>Purchased</th><th>Data left</th><th>Days left</th><th></th></tr></thead><tbody>${S.orders.map(o => { const p = orderPlan(o); return `<tr><td><span class="c-name">${flag(p.icon, 30)}${esc(p.title)} ${p.dataGB} GB</span></td><td data-l="Order ID">${o.id}</td><td data-l="Purchased">${o.date}</td><td data-l="Data left" style="min-width:180px"><div class="usage-bar" style="margin-bottom:6px"><i style="width:${Math.round(o.usedMB / o.totalMB * 100)}%"></i></div><span class="small muted">${((o.totalMB - o.usedMB) / 1000).toFixed(1)} of ${(o.totalMB / 1000).toFixed(0)} GB</span></td><td data-l="Days left">${o.daysLeft}</td><td class="t-actions"><div class="row" style="justify-content:flex-end;flex-wrap:nowrap"><a class="link link-sm" ${go_("/order/" + o.id)}>Details</a>${p.topup ? `<a class="btn btn-secondary btn-sm" ${go_("/topup?id=" + o.id)}>Top up</a>` : ""}</div></td></tr>`; }).join("")}</tbody></table>` : `<div class="empty-state stack"><h4>You have no eSIMs yet</h4><p><a class="btn btn-primary" ${go_("/plans")}>Browse plans</a></p></div>`}
  </div></section>`;
};

/* ---------- Chrome ---------- */
function renderHeader(seg) {
  const nav = [["/plans", "Plans", ["plans", "plan", "checkout", "pay"]], ["/how-it-works", "How it works", ["how-it-works"]], ["/devices", "Device check", ["devices"]], ["/balance", "Balance", ["balance"]], ["/topup", "Top up", ["topup"]], ["/faq", "FAQs", ["faq"]]];
  document.documentElement.classList.toggle("menu-open", S.menu);
  $("#header").innerHTML = `<div class="wrap on-dark"><a class="brand" ${go_("/")} aria-label="Travel eSIM home">${logo()}<span class="brand-name">Travel eSIM</span></a>
    <nav class="nav" aria-label="Main">${nav.map(([h, l, m]) => `<a ${go_(h)}${m.includes(seg) ? ' aria-current="page"' : ""}>${l}</a>`).join("")}</nav>
    <div class="header-actions">${S.user ? `<a class="hello" ${go_("/account")}>${I.user}<span>Hello, ${esc(S.user.first)}</span></a><button class="textbtn" data-act="signout">Sign out</button>` : `<a class="btn btn-secondary btn-sm" ${go_("/signin")}>Sign in</a>`}</div>
    <button type="button" class="menu-btn" data-act="menu" aria-label="${S.menu ? "Close menu" : "Open menu"}" aria-expanded="${S.menu}">${S.menu ? I.close : I.menu}</button></div>
  ${S.menu ? `<div class="m-menu on-dark"><div class="m-actions">${S.user ? `<p class="small">Hello, ${esc(S.user.first)}</p><a class="btn btn-primary btn-block" ${go_("/account")}>My eSIMs</a><button type="button" class="btn btn-secondary btn-block" data-act="signout">Sign out</button>` : `<a class="btn btn-primary btn-block" ${go_("/signin")}>Sign in</a><a class="btn btn-secondary btn-block" ${go_("/signin?tab=register")}>Create account</a>`}</div>
    <nav aria-label="Menu">${nav.concat([["/contact", "Contact us", ["contact"]]]).map(([h, l, m]) => `<a ${go_(h)}${m.includes(seg) ? ' aria-current="page"' : ""}>${l}</a>`).join("")}</nav></div>` : ""}`;
}
function renderFooter() {
  const col = (t, links) => `<div><h6>${t}</h6><ul>${links.map(([h, l]) => `<li><a ${go_(h)}>${l}</a></li>`).join("")}</ul></div>`;
  $("#footer").innerHTML = `<div class="wrap"><div class="footer-grid">
    ${col("Plans", [["/plans?region=europe", "Europe"], ["/plans?region=usa", "USA"], ["/plans?region=asia", "Asia"], ["/plans?region=global", "Global"], ["/plans?validity=365", "1-year plans"]])}
    ${col("Your eSIM", [["/balance", "Balance"], ["/topup", "Top up"], ["/account", "My eSIMs"]])}
    ${col("Support", [["/how-it-works", "How it works"], ["/devices", "Device check"], ["/faq", "FAQs"], ["/contact", "Contact us"]])}
    ${col("Company", [["/about", "About us"], ["/terms", "Terms &amp; Conditions"], ["/privacy", "Privacy Policy"]])}
    <div>${logo()}</div></div>
    <div class="footer-base"><span>Prototype with sample data</span></div></div>`;
}
function renderChat() {
  const body = {
    intro: `<div class="chat-body stack"><p>Hi, how can we help with your travel eSIM? Leave us a message and a representative will get back to you.</p><button type="button" class="btn btn-primary btn-block" data-act="chatStart">Start a conversation</button></div>`,
    form: `<form class="chat-body stack" data-form="lead" novalidate>
      <div class="field"><label for="l-name">Full name</label><input class="input" id="l-name" name="name" autocomplete="name" data-req></div>
      <div class="field"><label for="l-phone">Phone</label><input class="input" id="l-phone" name="phone" type="tel" autocomplete="tel" data-req></div>
      <div class="field"><label for="l-email">Email</label><input class="input" id="l-email" name="email" type="email" autocomplete="email" data-req="email"></div>
      <div class="field"><label for="l-msg">Message</label><textarea class="textarea" id="l-msg" name="msg" data-req></textarea><p class="hint" id="l-count">0 / 1000 words</p></div>
      <label class="check"><input type="checkbox" name="consent" data-req="check"><span>I agree to receive a reply by email.</span></label>
      <button class="btn btn-primary btn-block" type="button" data-submit>Send</button></form>`,
    done: `<div class="chat-body stack"><h5>Thank you</h5><p>We received your message. A representative will get back to you shortly.</p><button type="button" class="btn btn-secondary btn-block" data-act="chatToggle">Close</button></div>`
  }[S.chatStage];
  $("#chat").innerHTML = (S.chat ? `<div class="chat" role="dialog" aria-label="Contact us"><header><span>Contact us</span><button type="button" data-act="chatToggle" aria-label="Close">${I.close}</button></header>${body}</div>` : "")
    + `<button type="button" class="chat-fab" data-act="chatToggle" aria-expanded="${S.chat}">${I.chat}<span>Contact us</span></button>`;
}

function openModal(html) { $("#modal").innerHTML = `<div class="modal" role="dialog" aria-modal="true"><div class="modal-card"><button class="modal-close" data-act="closeModal" aria-label="Close">${I.close}</button>${html}</div></div>`; const b = $("#modal .modal-close"); if (b) b.focus(); }
function closeModal() { $("#modal").innerHTML = ""; }

/* ---------- Router ---------- */
let cur = null;
function render(path) {
  closeModal(); S.menu = false;
  const [pathname, query = ""] = path.split("?");
  const seg = pathname.split("/").filter(Boolean), q = {};
  query.split("&").filter(Boolean).forEach(kv => { const [k, v = ""] = kv.split("="); q[k] = decodeURIComponent(v); });
  const key = seg[0] || "", view = V[key] || (() => notFound()), same = key === S.seg && ["plans", "plan", "checkout"].includes(key);
  $("#view").innerHTML = view(seg, q);
  S.seg = key; renderHeader(key);
  if (!same) window.scrollTo(0, 0);
}
/* replace=true swaps the current history entry. history.replaceState is used instead of location.replace,
   which reloads the host page when this file runs inside a srcdoc iframe. */
function go(path, replace) { cur = path; try { if (replace) history.replaceState(null, "", "#" + path); else location.hash = path; } catch (e) {} render(path); }
window.addEventListener("hashchange", () => { const p = location.hash.slice(1) || "/"; if (p !== cur) { cur = p; closeModal(); render(p); } });

/* ---------- Search dropdown ---------- */
const planCount = c => PLANS.filter(p => p.live && p.countries.includes(c)).length;
function searchUpdate(box) {
  const input = $("input", box), list = $(".search-list", box); if (!list) return;
  const q = input.value.trim().toLowerCase();
  const reg = REGIONS.filter(r => q && r.label.toLowerCase().startsWith(q));
  const picks = getPicks(box);
  let codes = Object.keys(COUNTRIES).filter(c => !picks.includes(c));
  codes = q ? [...codes.filter(c => cName(c).toLowerCase().startsWith(q)), ...codes.filter(c => !cName(c).toLowerCase().startsWith(q) && cName(c).toLowerCase().includes(q))].slice(0, 7) : ["FR", "IT", "ES", "US", "GB", "JP", "TH"].filter(c => !picks.includes(c));
  const rows = [...reg.map(r => `<li><a ${go_("/plans?region=" + r.key)}><span class="flag">${I.globe}</span>${r.label}<span class="count">Region</span></a></li>`),
    ...codes.map(c => `<li><a href="#" data-act="pick" data-c="${c}">${flag(c)}${esc(cName(c))}<span class="count">${planCount(c)} plans</span></a></li>`)];
  const goRow = picks.length && !box.hasAttribute("data-live") ? `<li class="search-go"><button type="button" class="btn btn-primary btn-block btn-sm" data-act="searchGo">Show plans for ${esc(listNames(picks))}</button></li>` : "";
  list.innerHTML = (rows.length ? (q ? "" : `<li class="empty">${picks.length ? "Add another country" : "Popular destinations. You can choose more than one."}</li>`) + rows.join("") : `<li class="empty">No destination matches "${esc(input.value.trim())}". Try a country name.</li>`) + goRow;
  list.hidden = false;
}

/* ---------- Validation ---------- */
function fieldError(el, msg) {
  const wrap = el.closest(".field") || el.closest(".check"); if (!wrap) return;
  wrap.classList.add("invalid");
  const e = document.createElement("span"); e.className = "field-error"; e.textContent = msg;
  if (wrap.classList.contains("check")) wrap.insertAdjacentElement("afterend", e); else wrap.appendChild(e);
}
function clearErrors(form) { $$(".field-error", form).forEach(e => e.remove()); $$(".invalid", form).forEach(e => e.classList.remove("invalid")); }
function validate(form) {
  clearErrors(form); let first = null;
  $$("[data-req]", form).forEach(el => {
    const kind = el.dataset.req, label = (el.closest(".field") && $("label", el.closest(".field")) || { textContent: "This field" }).textContent.replace(/\(optional\)/, "").trim();
    let msg = "";
    if (kind === "check") { if (!el.checked) msg = "Tick this box to continue."; }
    else if (!el.value.trim()) msg = `Enter your ${label.toLowerCase()}.`;
    else if (kind === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())) msg = "Enter an email address like name@example.com.";
    if (msg) { fieldError(el, msg); first = first || el; }
  });
  if (first) first.focus();
  return !first;
}

/* ---------- Actions ---------- */
const A = {
  searchGo(el) { const box = el.closest(".search"); searchUpdate(box); searchSubmit(box); },
  pick(el) { const box = el.closest(".search"); setPicks(box, [...getPicks(box), el.dataset.c]); },
  unpick(el) { const box = el.closest(".search"); setPicks(box, getPicks(box).filter(c => c !== el.dataset.c)); },
  qty(el) { S.qty = Math.min(5, Math.max(1, S.qty + +el.dataset.d)); $("#qty").textContent = S.qty; const p = planById(location.hash.split("/")[2]) || planById((cur || "").split("/")[2]); if (p) $("#ptotal").textContent = money(p.price * S.qty); },
  couponOpen() { S.co.couponOpen = true; $("#coupon-area").innerHTML = couponArea(S.co); $("#f-coupon").focus(); },
  coQty(el) { S.co.qty = S.qty = Math.min(5, Math.max(1, S.co.qty + +el.dataset.d)); refreshCo(`#co-summary [data-act="coQty"][data-d="${el.dataset.d}"]`); },
  coGb(el) { if (el.dataset.id === S.co.itemId) return; S.co.itemId = el.dataset.id; go("/checkout/" + el.dataset.id, true); const b = $('#co-summary [aria-pressed="true"]'); if (b) b.focus(); },
  howStep(el) { setHowStep(+el.dataset.i); },
  coupon() {
    const input = $("#f-coupon"), code = input.value.trim().toUpperCase(), msg = $("#coupon-msg");
    if (!code) { S.co.coupon = null; msg.textContent = "Enter a coupon code first."; }
    else if (COUPONS[code]) { S.co.coupon = code; input.value = code; msg.textContent = `Coupon ${code} applied: ${COUPONS[code] * 100}% off.`; }
    else { S.co.coupon = null; msg.textContent = `The code ${code} isn't valid. Check it and try again.`; }
    refreshCo();
  },
  testCard(el) { const f = $('[data-form="pay"]'); f.card.value = TEST_CARDS[el.dataset.card]; clearErrors(f); $$('[data-act="testCard"]').forEach(b => b.setAttribute("aria-current", b === el)); },
  chooseTopup(el) { S.co = { kind: "topup", itemId: el.dataset.id, orderId: el.dataset.order, qty: 1, coupon: null, form: {} }; go("/pay"); },
  howTab(el) { S.howTab = el.dataset.tab; $$("[data-how]").forEach(h => { h.innerHTML = howBlock(h.dataset.how); }); },
  devBrand(el) { S.devBrand = el.dataset.b; $$("#devbrands .chip").forEach(c => c.setAttribute("aria-current", c.dataset.b === S.devBrand)); $("#devlist").innerHTML = devList(); },
  acc(el) { const item = el.closest(".acc-item"), open = item.classList.toggle("open"); el.setAttribute("aria-expanded", open); $(".acc-body", item).hidden = !open; },
  esim(el) { S.esim[el.dataset.id] = +el.dataset.i; const o = orderById(el.dataset.id); $$(`[data-esim="${o.id}"]`).forEach(n => { n.outerHTML = esimBlock(o); }); },
  closeModal,
  signout() { S.user = null; go("/"); },
  menu() { S.menu = !S.menu; renderHeader(S.seg); },
  car(el) { const c = $("[data-carousel]", el.closest("section")), card = c.firstElementChild; c.scrollBy({ left: +el.dataset.d * (card.offsetWidth + 14), behavior: REDUCED ? "auto" : "smooth" }); },
  chatToggle() { S.chat = !S.chat; if (S.chat && S.chatStage === "done") S.chatStage = "intro"; renderChat(); },
  chatOpen() { S.chat = true; if (S.chatStage === "done") S.chatStage = "intro"; renderChat(); },
  chatStart() { S.chatStage = "form"; renderChat(); $("#l-name").focus(); },
  soon(el) { openModal(`<div class="stack"><h4>Not connected in the prototype</h4><p class="muted">${esc(el.dataset.msg)}</p><div><button class="btn btn-primary" data-act="closeModal">Close</button></div></div>`); }
};
const F = {
  details(form) { if (!validate(form)) return; go("/pay"); },
  pay(form) {
    clearErrors(form);
    const digits = form.card.value.replace(/\D/g, ""), exp = form.exp.value.replace(/\D/g, ""), mm = +exp.slice(0, 2), yy = +exp.slice(2, 4), now = new Date();
    let err = "";
    if (!digits) err = "Enter your card number.";
    else if (!/^(36|38|39|30[0-5]|3095)/.test(digits)) err = "Only Diners Club cards are accepted. This card number belongs to another network.";
    else if (digits.length < 14) err = "The card number is too short.";
    else if (exp.length < 4 || mm < 1 || mm > 12 || 2000 + yy < now.getFullYear() || (2000 + yy === now.getFullYear() && mm < now.getMonth() + 1)) err = "Enter a valid expiry date that is in the future.";
    else if (form.cvc.value.replace(/\D/g, "").length < 3) err = "Enter the 3-digit security code.";
    if (err) { fieldError(form.card, err); return; }
    if (!form.name.value.trim()) { fieldError(form.name, "Enter the name on the card."); return; }
    const btn = $("[data-submit]", form); btn.disabled = true; btn.textContent = "Processing payment";
    setTimeout(() => {
      const co = S.co, t = totals(co); let id;
      if (co.kind === "topup") { const o = orderById(co.orderId); o.totalMB += t.item.dataGB * 1000; o.daysLeft = t.item.days; id = o.id; }
      else {
        const r = rng(Date.now()); id = "SFL-" + String(Math.floor(10000000 + r() * 89999999));
        S.orders.unshift({ id, planId: co.itemId, qty: co.qty, date: today(), usedMB: 0, totalMB: t.item.dataGB * 1000, daysLeft: t.item.days, iccid: "89480100" + String(Math.floor(1e10 + r() * 8.9e10)), apn: "plus", paid: t.total });
      }
      S.lastPay = { id, kind: co.kind, title: t.item.title, dataGB: t.item.dataGB, days: t.item.days, qty: co.qty, unit: t.item.price, disc: t.disc, coupon: co.coupon, total: t.total, email: co.form.email || (S.user && S.user.email) || "", first: co.form.first || (S.user && S.user.first) || "", card: digits.slice(-4) };
      S.co = null; S.qty = 1; go("/thanks/" + id, true);
    }, 900);
  },
  balance(form) { const id = normId(form.oid.value); if (!id) { clearErrors(form); fieldError(form.oid, "Enter your order ID."); return; } go("/balance?id=" + id); },
  topup(form) { const id = normId(form.oid.value); if (!id) { clearErrors(form); fieldError(form.oid, "Enter your order ID."); return; } go("/topup?id=" + id); },
  contact(form) { if (!validate(form)) return; form.outerHTML = `<div class="panel stack" style="max-width:820px"><h4>Message sent</h4><p class="muted">Thanks, ${esc(form.name.value.trim())}. We'll reply to ${esc(form.email.value.trim())} within one business day.</p></div>`; },
  signin(form) {
    if (!validate(form)) return;
    const email = form.email.value.trim(), guess = email.split("@")[0].split(/[._-]/)[0] || "Dan";
    S.user = { first: form.first ? form.first.value.trim() : guess.charAt(0).toUpperCase() + guess.slice(1), last: form.last ? form.last.value.trim() : "Martin", email };
    go(form.dataset.next || "/account");
  },
  lead(form) {
    if (!validate(form)) return;
    if (wordCount(form.msg.value) > 1000) { fieldError(form.msg, "Keep the message to 1000 words or fewer."); return; }
    S.chatStage = "done"; renderChat();
  }
};

/* ---------- Events ---------- */
document.addEventListener("click", e => {
  const g = e.target.closest("[data-go]");
  if (g) { e.preventDefault(); closeModal(); go(g.dataset.go); return; }
  const sb = e.target.closest("[data-submit]");
  if (sb) { e.preventDefault(); if (!sb.disabled) submitForm(sb.closest("[data-form]")); return; }
  const a = e.target.closest("[data-act]");
  if (a) { if (a.tagName === "A") e.preventDefault(); const fn = A[a.dataset.act]; if (fn) fn(a, e); return; }
  if (e.target.classList.contains("modal")) closeModal();
  const fld = e.target.closest(".search-field"); if (fld) $("input", fld).focus();
  if (!e.target.closest(".search")) $$(".search-list").forEach(l => { l.hidden = true; });
});
document.addEventListener("input", e => {
  const t = e.target;
  const bad = t.closest(".field.invalid, .check.invalid");
  if (bad) { bad.classList.remove("invalid"); const er = bad.classList.contains("check") ? bad.nextElementSibling : $(".field-error", bad); if (er && er.classList.contains("field-error")) er.remove(); }
  if (t.id === "l-msg") { const n = wordCount(t.value), c = $("#l-count"); c.textContent = n + " / 1000 words"; c.classList.toggle("strong", n > 1000); }
  if (t.matches("[data-devsearch]")) { $("#devlist").innerHTML = devList(); return; }
  if (t.closest(".search")) return searchUpdate(t.closest(".search"));
  if (t.matches("[data-cfilter]")) { const q = t.value.trim().toLowerCase(); $$("#ctable tbody tr").forEach(tr => { tr.hidden = !!q && !tr.dataset.name.includes(q); }); return; }
  if (t.name === "card") { const d = t.value.replace(/\D/g, "").slice(0, 19); t.value = /^3[068]/.test(d) && d.length <= 14 ? [d.slice(0, 4), d.slice(4, 10), d.slice(10)].filter(Boolean).join(" ") : d.replace(/(.{4})(?=.)/g, "$1 "); return; }
  if (t.name === "exp") { const d = t.value.replace(/\D/g, "").slice(0, 4); t.value = d.length > 2 ? d.slice(0, 2) + " / " + d.slice(2) : d; return; }
  const f = t.closest('[data-form="details"]');
  if (f && S.co && t.name) { S.co.form[t.name] = t.type === "checkbox" ? t.checked : t.value; if (t.name === "qty") { S.co.qty = S.qty = +t.value; refreshSummary(); } }
});
document.addEventListener("focusin", e => { const s = e.target.closest(".search"); if (s && e.target.tagName === "INPUT" && !e.target.matches("[data-devsearch]")) searchUpdate(s); });
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeModal(); $$(".search-list").forEach(l => { l.hidden = true; }); }
  if (e.key === "Enter" && e.target.id === "f-coupon") { e.preventDefault(); A.coupon(); return; }
  if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type !== "checkbox" && e.target.closest("[data-form]")) { e.preventDefault(); submitForm(e.target.closest("[data-form]")); return; }
  const box = e.target.closest && e.target.closest(".search");
  if (box && e.target.tagName === "INPUT" && !e.target.matches("[data-devsearch]")) {
    if (e.key === "Enter") { e.preventDefault(); searchUpdate(box); searchSubmit(box); }
    else if (e.key === "Backspace" && !e.target.value && getPicks(box).length) { e.preventDefault(); setPicks(box, getPicks(box).slice(0, -1)); }
  }
});
function submitForm(f) { const fn = f && F[f.dataset.form]; if (fn) fn(f); }
document.addEventListener("submit", e => { e.preventDefault(); });

/* How it works: when the active step's progress bar finishes, move to the next step */
document.addEventListener("animationend", e => { if (e.animationName === "howfill" && e.target.closest("[data-howhome]")) setHowStep((S.howStep + 1) % 3); });

/* Carousel arrows: an arrow is greyed out only when there is nothing more to scroll to in that direction */
document.addEventListener("scroll", e => {
  const c = e.target; if (!c.matches || !c.matches("[data-carousel]")) return;
  const nav = c.parentElement.querySelector(".car-nav"); if (!nav) return;
  nav.children[0].disabled = c.scrollLeft <= 2; nav.children[1].disabled = c.scrollLeft >= c.scrollWidth - c.clientWidth - 2;
}, true);

/* Hero slideshow: cross-fade to the next photo every 6 seconds */
setInterval(() => { const imgs = $$(".hero-media img"); if (REDUCED || document.hidden || imgs.length < 2) return; S.heroIdx = (S.heroIdx + 1) % imgs.length; imgs.forEach((im, i) => im.classList.toggle("on", i === S.heroIdx)); }, 6000);

function renderVer() {
  document.documentElement.classList.toggle("v2", V2());
  let el = $("#ver-switch");
  if (!el) { el = document.createElement("div"); el.id = "ver-switch"; el.className = "ver-switch"; el.setAttribute("role", "group"); el.setAttribute("aria-label", "Design version"); document.body.appendChild(el); }
  el.innerHTML = [1, 2].map(n => `<button type="button" data-act="setVer" data-v="${n}" aria-pressed="${S.ver === n}">Version ${n}</button>`).join("");
}
A.setVer = el => {
  const n = +el.dataset.v; if (n === S.ver) return;
  S.ver = n; const y = window.scrollY;
  try { localStorage.setItem("esim-ver", String(n)); } catch (e) {}
  try { const u = new URL(location.href); if (n === 2) u.searchParams.set("v", "2"); else u.searchParams.delete("v"); history.replaceState(null, "", u.pathname + u.search + u.hash); } catch (e) {}
  renderVer(); render(cur); window.scrollTo(0, y);
};

renderVer(); renderFooter(); renderChat();
cur = (location.hash || "").slice(1) || "/";
render(cur);
