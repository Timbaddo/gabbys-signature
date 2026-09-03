/* ============================================================
   APP — routing + rendering. Plain JS, event delegation, no
   framework and no build step, so it can be edited directly in
   Spck Editor on mobile.
   ============================================================ */

const DEV = { name: "HeisTimo Tech🤍", role: "Web Developer & Website Designer", whatsapp: "2349162539689", email: "timothydabere@gmail.com", bio: "I design & build websites that convert visitors to customers. Business sites • E-commerce • Landing Pages", photo: "https://i.postimg.cc/Wz1DMZdf/IMG-20260903-123506.jpg" };
function devMarkHtml(sizePx) {
  if (DEV.photo) return `<img src="${esc(DEV.photo)}" alt="${esc(DEV.name)} photo" style="width:${sizePx}px;height:${sizePx}px;border-radius:50%;object-fit:cover;" />`;
  return `<div style="width:${sizePx}px;height:${sizePx}px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--terracotta));display:inline-flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:${Math.round(sizePx * 0.36)}px;color:var(--cream);">H</div>`;
}

const NAV_LINKS = [["home", "Home"], ["about", "About"], ["services", "Services"], ["gallery", "Gallery"], ["posts", "Posts"], ["appointment", "Book Appointment"]];
const PAGE_LABELS = { about: "About", services: "Services", gallery: "Gallery", posts: "Posts", appointment: "Book Appointment", contact: "Contact", account: "My Account", admin: "Admin Dashboard", developer: "Developer" };

let currentPage = "home";
let galleryFilter = "All";
let authMode = "login";
let adminTab = "overview";
let lightboxIds = [];
let lightboxIndex = 0;
let myAppointmentsCache = [];

/* ---------- helpers ---------- */
function esc(s) { return (s || "").toString().replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function waLink(number, message) { return `https://wa.me/${number}?text=${encodeURIComponent(message)}`; }
function firstName(name) { return (name || "").split(" ")[0]; }

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2600);
}

const waIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#0b3d1f"><path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm0 1.8a8.2 8.2 0 016.9 12.6l-.3.5.5 2.4-2.4-.6-.5.3A8.2 8.2 0 1112 3.8zm-3.4 4.1c-.2 0-.5 0-.7.3-.3.3-1 .9-1 2.3s1 2.6 1.1 2.8c.1.2 2 3.1 4.9 4.2 2.4 1 2.9.8 3.4.7.5 0 1.6-.6 1.8-1.3.2-.6.2-1.2.1-1.3-.1-.2-.3-.3-.6-.4l-1.9-.9c-.3-.1-.5-.2-.7.1l-.7 1c-.1.2-.3.2-.5.1-.3-.1-1.2-.5-2.3-1.5-.9-.8-1.5-1.7-1.6-2-.1-.3 0-.4.1-.6l.5-.6c.1-.2.2-.3.2-.5.1-.2 0-.4 0-.5l-.9-2.1c-.2-.5-.4-.5-.6-.5h-.6z"/></svg>`;

function tileHtml(opts) {
  // opts: { seed, label, image, flat }
  const pal = (opts.seed || 0) % 4;
  if (opts.image) {
    return `<div class="tile has-photo ${opts.flat ? "flat" : ""}"><img src="${esc(opts.image)}" alt="${esc(opts.label || "Fashion design")}" loading="lazy" /><div class="scrim"></div></div>`;
  }
  return `<div class="tile pal-${pal} ${opts.flat ? "flat" : ""}">
    <div class="scrim"></div>
    <svg class="tile-icon" width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M9 3l3 2 3-2 2 3-2 2v11a1 1 0 01-1 1H8a1 1 0 01-1-1V8L5 6l2-3z" stroke="#F7EFDD" stroke-width="1.3" stroke-linejoin="round"/></svg>
    <span class="tile-label">${esc(opts.label || "Photo pending — add in Admin")}</span>
  </div>`;
}

function socialIconsHtml(size) {
  size = size || 18;
  const s = Data.settings;
  const items = [
    [s.facebook, "Facebook", "M13 22v-8h2.7l.4-3.3H13V8.6c0-.96.27-1.6 1.65-1.6H16V4.14C15.7 4.1 14.68 4 13.5 4 11 4 9.3 5.5 9.3 8.3v2.4H6.6V14H9.3v8H13z"],
    [s.instagram, "Instagram", "M12 2.2c2.7 0 3 0 4.1.06 1.1.05 1.8.22 2.2.37.6.23 1 .5 1.4.9.4.4.68.85.9 1.4.16.4.33 1.1.37 2.2.06 1.2.06 1.5.06 4.1s0 3-.06 4.1c-.05 1.1-.22 1.8-.37 2.2-.23.6-.5 1-.9 1.4-.4.4-.85.68-1.4.9-.4.16-1.1.33-2.2.37-1.2.06-1.5.06-4.1.06s-3 0-4.1-.06c-1.1-.05-1.8-.22-2.2-.37a3.8 3.8 0 01-1.4-.9 3.8 3.8 0 01-.9-1.4c-.16-.4-.33-1.1-.37-2.2C2.2 15 2.2 14.7 2.2 12s0-3 .06-4.1c.05-1.1.22-1.8.37-2.2.23-.6.5-1 .9-1.4.4-.4.85-.68 1.4-.9.4-.16 1.1-.33 2.2-.37C8 2.2 8.3 2.2 12 2.2zm0 1.8c-2.66 0-2.97 0-4.02.06-.9.04-1.4.19-1.72.32-.43.17-.74.37-1.06.7-.32.32-.52.63-.7 1.06-.13.32-.28.82-.32 1.72C4.13 9.03 4.13 9.34 4.13 12s0 2.97.05 4.02c.04.9.19 1.4.32 1.72.17.43.38.74.7 1.06.32.32.63.53 1.06.7.32.13.82.28 1.72.32 1.05.05 1.36.06 4.02.06s2.97 0 4.02-.06c.9-.04 1.4-.19 1.72-.32.43-.17.74-.38 1.06-.7.32-.32.53-.63.7-1.06.13-.32.28-.82.32-1.72.05-1.05.06-1.36.06-4.02s0-2.97-.06-4.02c-.04-.9-.19-1.4-.32-1.72a2.8 2.8 0 00-.7-1.06 2.8 2.8 0 00-1.06-.7c-.32-.13-.82-.28-1.72-.32C14.97 4 14.66 4 12 4zm0 3.4a4.6 4.6 0 110 9.2 4.6 4.6 0 010-9.2zm0 1.8a2.8 2.8 0 100 5.6 2.8 2.8 0 000-5.6zm4.8-2a1.08 1.08 0 110 2.15 1.08 1.08 0 010-2.15z"],
    [s.tiktok, "TikTok", "M14.5 2h2.6c.16 1.4.86 2.6 2 3.4.87.62 1.9.96 3 1v2.7a7.2 7.2 0 01-4-1.2v6.6c0 3.4-2.7 6.1-6.1 6.1S6 17.9 6 14.5c0-3.2 2.4-5.8 5.6-6.1v2.8a3.3 3.3 0 00-2.6 3.3 3.3 3.3 0 003.3 3.3 3.3 3.3 0 003.3-3.3V2z"],
  ];
  return items.map(([href, label, path]) => `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="${label}" class="focus-ring"><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="${path}"/></svg></a>`).join("");
}

/* ---------- header / nav / footer ---------- */
function logoMarkHtml(sizeClass) {
  const s = Data.settings;
  if (s.logoUrl) return `<img src="${esc(s.logoUrl)}" alt="${esc(s.businessName)} logo" class="${sizeClass}" style="border-radius:50%;object-fit:cover;" />`;
  return `G`;
}

function renderChrome() {
  document.getElementById("nav-desktop").innerHTML = NAV_LINKS.map(([k, l]) => `<button data-nav="${k}" class="${currentPage === k ? "active" : ""}">${l}</button>`).join("");
  document.getElementById("mobile-menu").innerHTML = `<div class="wrap">
    ${[...NAV_LINKS, ["account", "My Account"], ["contact", "Contact"], ...(Data.isAdmin ? [["admin", "Admin Dashboard"]] : []), ["developer", "Need a Website?"]].map(([k, l]) => `<button class="link ${currentPage === k ? "active" : ""}" data-nav="${k}">${l}</button>`).join("")}
    <div id="mobile-social">${socialIconsHtml(20)}</div>
  </div>`;
  document.getElementById("acct-dot").setAttribute("fill", Auth.user ? "#C9A24E33" : "none");
  document.getElementById("brand-mark").innerHTML = logoMarkHtml("mark-img");

  const bar = document.getElementById("back-bar");
  if (currentPage === "home") { bar.classList.add("hidden"); }
  else { bar.classList.remove("hidden"); document.getElementById("back-bar-label").textContent = PAGE_LABELS[currentPage] ? "· " + PAGE_LABELS[currentPage] : ""; }

  const s = Data.settings;
  document.getElementById("site-footer").innerHTML = `<div class="wrap">
    <div class="top"><span class="mark">${logoMarkHtml("mark-img")}</span><span class="name">${esc(s.businessName)}</span></div>
    <p class="about">${esc((s.about || "").slice(0, 140))}…</p>
    <div class="cols">
      <div class="col"><div class="col-title">Quick links</div>${["home", "about", "services", "gallery", "appointment"].map((p) => `<button data-nav="${p}">${p === "appointment" ? "Book Appointment" : p}</button>`).join("")}</div>
      <div class="col"><div class="col-title">Contact</div><div style="font-size:13px;margin-bottom:4px;">${esc(s.phone)}</div><div style="font-size:13px;margin-bottom:4px;">${esc(s.email)}</div><div style="font-size:13px;">${esc(s.address)}</div></div>
      <div class="col"><div class="col-title">Follow</div><div class="social-row">${socialIconsHtml(19)}</div></div>
    </div>
    <div class="bottom"><span>© ${new Date().getFullYear()} ${esc(s.businessName)}. All rights reserved.</span><button data-nav="developer">Website designed &amp; developed by HeisTimo Tech🤍</button></div>
  </div>`;
}

/* ---------- section builders ---------- */
function sectionHeading({ eyebrow, title, sub }) {
  return `<div class="section-heading">${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ""}<h2>${title}</h2>${sub ? `<p>${sub}</p>` : ""}</div>`;
}
function designCardHtml(d, idx) {
  const fav = Auth.isFavorite(d.id);
  return `<div class="design-card">
    <button class="tile-btn focus-ring" data-open-lightbox="${d.id}" aria-label="View ${esc(d.name)}">
      ${tileHtml({ seed: idx, image: d.image, label: d.image ? undefined : `Photo pending — ${d.name}` })}
      <button class="fav-btn ${fav ? "active" : ""}" data-fav="${d.id}" aria-label="Save design">${fav ? "♥" : "♡"}</button>
    </button>
    <h4>${esc(d.name)}</h4><span class="cat">${esc(d.category)}</span>
  </div>`;
}

/* ---------- HOME ---------- */
function renderHome() {
  const s = Data.settings;
  const featured = Data.designs.filter((d) => d.published && d.featured);
  const posts = Data.posts.filter((p) => p.published).slice(0, 2);
  const testimonials = Data.testimonials.filter((t) => t.approved);

  return `
  <section class="hero">
    <div class="inner">
      <div class="tagline"><span class="dot"></span><span>${esc(s.tagline)}</span></div>
      <h1>Clothing made to fit your life, not the other way around.</h1>
      <p>${esc(s.businessName)} designs and tailors custom womenswear and children's wear — bridal, aso-ebi, corporate and everyday pieces, built around you from the first measurement.</p>
      <div class="cta-row">
        <button class="btn btn-gold" data-nav="gallery">Explore Designs</button>
        <a class="btn btn-whatsapp" href="${waLink(s.whatsapp, `Hello ${s.businessName}, I'd like to chat about a design.`)}" target="_blank" rel="noopener noreferrer">${waIcon}Chat on WhatsApp</a>
        <button class="btn btn-outline" data-nav="appointment">Book Appointment</button>
      </div>
    </div>
  </section>

  <section class="section"><div class="wrap">
    ${sectionHeading({ eyebrow: "From the atelier", title: "Featured designs", sub: "A selection of recent pieces — each one made to order." })}
    <div class="card-scroll">${featured.map((d, i) => designCardHtml(d, i)).join("") || `<div class="empty-state">No featured designs yet.</div>`}</div>
    <div style="margin-top:22px;"><button class="btn btn-ghost" data-nav="gallery">View all designs →</button></div>
  </div></section>

  <section class="section tint"><div class="wrap">
    <div class="about-grid">
      ${tileHtml({ seed: 2, image: s.aboutPhotoUrl, label: "Designer at work — add studio photo in Admin" })}
      <div>
        ${sectionHeading({ eyebrow: "Our story", title: "Built on craftsmanship, not shortcuts", sub: esc(s.about.slice(0, 220)) + "…" })}
        <button class="btn btn-ghost" data-nav="about">Learn more →</button>
      </div>
    </div>
  </div></section>

  <section class="section"><div class="wrap">
    ${sectionHeading({ eyebrow: "What we do", title: "Services", sub: "Every piece is made to order — nothing here is off the rack." })}
    <div class="grid-auto">${SERVICES.slice(0, 6).map((sv) => `<div><h3 class="serif" style="font-size:19px;margin:0 0 8px;">${esc(sv.name)}</h3><p style="font-size:14px;line-height:1.55;color:var(--muted);margin:0;">${esc(sv.desc)}</p></div>`).join("")}</div>
    <div style="margin-top:22px;"><button class="btn btn-ghost" data-nav="services">See all services →</button></div>
  </div></section>

  <section class="section dark"><div class="wrap">
    ${sectionHeading({ eyebrow: "Behind the scenes", title: "Inside the workshop", sub: "Every garment passes through measuring, pattern-making, cutting and hand-finishing before it reaches you." })}
    ${s.workshopVideoUrl
      ? `<video src="${esc(s.workshopVideoUrl)}" controls preload="metadata" style="width:100%;border-radius:4px;background:#000;"></video>`
      : `<div style="border-radius:4px;overflow:hidden;background:#0000002e;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;border:1px solid #F7EFDD22;">
      <div style="text-align:center;color:#F7EFDDaa;"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" style="margin:0 auto;"><circle cx="12" cy="12" r="10.5" stroke="#F7EFDF88" stroke-width="1.2"/><path d="M10 8.5l6 3.5-6 3.5v-7z" fill="#F7EFDF88"/></svg><div style="font-size:13px;margin-top:10px;">Workshop video — add in Admin → Website Settings</div></div>
    </div>`}
  </div></section>

  <section class="section"><div class="wrap">
    ${sectionHeading({ eyebrow: "Why Gabby's Signature", title: "What sets our tailoring apart" })}
    <div class="grid-auto" style="background:transparent;">
      ${[["Made for you", "Every pattern is drafted to your measurements — nothing generic, nothing off the shelf."], ["Quality craftsmanship", "Hand-finished details and reinforced seams built to hold their shape."], ["Personal service", "You work directly with the designer from concept to final fitting."], ["Dependable delivery", "Clear timelines, and finished pieces delivered when we say they will be."]]
        .map(([t, d]) => `<div style="background:transparent;padding:0;"><div style="width:34px;height:2px;background:var(--gold);margin-bottom:14px;"></div><h3 class="serif" style="font-size:18px;margin:0 0 8px;">${t}</h3><p style="font-size:14px;line-height:1.55;color:var(--muted);margin:0;">${d}</p></div>`).join("")}
    </div>
  </div></section>

  ${testimonials.length ? `<section class="section tint"><div class="wrap">
    ${sectionHeading({ eyebrow: "Customer words", title: "What clients are saying" })}
    <div class="grid-auto" style="background:transparent;">${testimonials.map((t) => `<div style="background:var(--cream);border:1px solid var(--line);padding:22px;"><p class="serif" style="font-style:italic;font-size:16.5px;line-height:1.5;margin:0 0 14px;">"${esc(t.text)}"</p><span style="font-size:13px;color:var(--muted);">— ${esc(t.name)}</span></div>`).join("")}</div>
  </div></section>` : ""}

  <section class="section"><div class="wrap">
    <div style="background:var(--charcoal);color:var(--cream);padding:32px 24px;border-radius:4px;display:flex;flex-wrap:wrap;gap:20px;align-items:center;justify-content:space-between;">
      <div><h3 class="serif" style="font-size:22px;margin:0 0 6px;">⭐ See what our customers say</h3><p style="font-size:14px;color:#F7EFDDaa;margin:0;">Verified reviews on our Google Business Profile.</p></div>
      <a class="btn btn-gold" href="${esc(s.googleReviewLink)}" target="_blank" rel="noopener noreferrer">View us on Google</a>
    </div>
  </div></section>

  <section class="section tint"><div class="wrap">
    ${sectionHeading({ eyebrow: "Visit us", title: "📍 Visit our studio", sub: esc(s.address) })}
    <div style="display:flex;flex-wrap:wrap;gap:12px;"><a class="btn btn-solid" href="${esc(s.mapLink)}" target="_blank" rel="noopener noreferrer">Get Directions</a><button class="btn btn-outline-dark" data-nav="contact">Full contact details</button></div>
    <p style="font-size:13.5px;color:var(--muted);margin-top:14px;">${esc(s.hours)}</p>
  </div></section>

  <section class="section"><div class="wrap">
    ${sectionHeading({ eyebrow: "Follow along", title: "See new designs first", sub: "Fresh pieces and behind-the-scenes moments, posted regularly." })}
    <div class="social-row" style="gap:18px;">${socialIconsHtml(26)}</div>
  </div></section>

  ${devPromoBlockHtml()}
  `;
}

function devPromoBlockHtml() {
  return `<section class="section dark"><div class="wrap">
    <div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;">
      <div style="flex-shrink:0;">${devMarkHtml(56)}</div>
      <div style="flex:1;min-width:220px;"><div class="serif" style="font-size:18px;color:var(--cream);">${DEV.name}</div><div style="font-size:13px;color:var(--gold);margin-bottom:6px;">${DEV.role}</div><p style="font-size:13.5px;color:#F7EFDDaa;margin:0;line-height:1.5;">${DEV.bio}</p></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;"><a class="btn btn-whatsapp" href="${waLink(DEV.whatsapp, "Hello HeisTimo Tech, I'd like to talk about getting a website.")}" target="_blank" rel="noopener noreferrer">${waIcon}WhatsApp</a><a class="btn btn-outline" href="mailto:${DEV.email}">Email</a></div>
    </div>
  </div></section>`;
}

/* ---------- ABOUT ---------- */
function renderAbout() {
  const s = Data.settings;
  return `<section class="section dark"><div class="wrap">${sectionHeading({ eyebrow: "About us", title: esc(s.businessName) })}</div></section>
  <section class="section"><div class="wrap"><div class="about-grid">
    ${tileHtml({ seed: 1, image: s.aboutPhotoUrl, label: "Designer portrait — add in Admin" })}
    <div>
      <p style="font-size:16px;line-height:1.75;color:var(--ink);">${esc(s.about)}</p>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-top:26px;">
        ${[["Focus", "Women's & children's fashion"], ["Specialty", "Bridal, Aso-Ebi & custom design"], ["Approach", "Made-to-measure, every piece"], ["Studio", "Nnewi, Anambra State"]].map(([k, v]) => `<div><div style="font-size:12px;color:var(--gold);margin-bottom:4px;">${k}</div><div style="font-size:14.5px;">${v}</div></div>`).join("")}
      </div>
      <div style="margin-top:28px;display:flex;gap:12px;flex-wrap:wrap;"><button class="btn btn-solid" data-nav="gallery">See our work</button><button class="btn btn-outline-dark" data-nav="appointment">Book an appointment</button></div>
    </div>
  </div></div></section>`;
}

/* ---------- SERVICES ---------- */
function renderServices() {
  const s = Data.settings;
  return `<section class="section dark"><div class="wrap">${sectionHeading({ eyebrow: "Services", title: "What we make", sub: "Every service below is made to order for women and children — no ready-made stock, no fixed sizes." })}</div></section>
  <section class="section"><div class="wrap"><div class="grid-auto">
    ${SERVICES.map((sv, i) => `<div style="display:flex;flex-direction:column;gap:14px;">
      ${tileHtml({ seed: i, label: `${sv.name} — add photo` })}
      <div><h3 class="serif" style="font-size:19px;margin:0 0 8px;">${esc(sv.name)}</h3><p style="font-size:14px;line-height:1.55;color:var(--muted);margin:0 0 16px;">${esc(sv.desc)}</p></div>
      <a class="btn btn-whatsapp" href="${waLink(s.whatsapp, `Hello ${s.businessName}, I'd like to discuss ${sv.name.toLowerCase()}.`)}" target="_blank" rel="noopener noreferrer">${waIcon}Discuss on WhatsApp</a>
    </div>`).join("")}
  </div></div></section>`;
}

/* ---------- GALLERY ---------- */
function renderGallery() {
  const published = Data.designs.filter((d) => d.published);
  const filtered = galleryFilter === "All" ? published : published.filter((d) => d.category === galleryFilter);
  return `<section class="section dark"><div class="wrap">${sectionHeading({ eyebrow: "Lookbook", title: "Gallery", sub: "Browse recent work by category. Tap any piece to see it full-screen and start a conversation on WhatsApp." })}</div></section>
  <section class="section"><div class="wrap">
    <div class="pill-row">${["All", ...Data.categories].map((c) => `<button class="pill ${galleryFilter === c ? "active" : ""}" data-gallery-filter="${esc(c)}">${esc(c)}</button>`).join("")}</div>
    ${filtered.length ? `<div class="gallery-grid">${filtered.map((d, i) => designCardHtml(d, i)).join("")}</div>` : `<div class="empty-state">No designs in this category yet. Check back soon or ask us directly on WhatsApp.</div>`}
  </div></section>`;
}

/* ---------- POSTS ---------- */
function renderPosts() {
  const posts = Data.posts.filter((p) => p.published).slice().reverse();
  return `<section class="section dark"><div class="wrap">${sectionHeading({ eyebrow: "Latest", title: "Posts & Announcements" })}</div></section>
  <section class="section"><div class="wrap">
    ${posts.length ? `<div style="display:flex;flex-direction:column;gap:2px;background:var(--line);">${posts.map((p, i) => `<div style="background:var(--cream);padding:22px;display:grid;grid-template-columns:100px 1fr;gap:18px;align-items:start;">${tileHtml({ seed: i, image: p.image, label: "", flat: true })}<div><span style="font-size:12px;color:var(--gold);">${esc(p.date || "")}</span><h3 class="serif" style="font-size:19px;margin:4px 0 8px;">${esc(p.title)}</h3><p style="font-size:14px;line-height:1.55;color:var(--muted);margin:0;">${esc(p.description)}</p></div></div>`).join("")}</div>` : `<div class="empty-state">No announcements yet — check back soon.</div>`}
  </div></section>`;
}

/* ---------- APPOINTMENT ---------- */
let apptConfirmed = null;
function renderAppointment() {
  const s = Data.settings;
  if (apptConfirmed) {
    return `<section class="section dark"><div class="wrap">${sectionHeading({ eyebrow: "Let's talk", title: "Book an appointment" })}</div></section>
    <section class="section"><div class="wrap">
      <div style="max-width:480px;margin:0 auto;text-align:center;background:var(--tint);padding:32px;border-radius:4px;">
        <div style="font-size:34px;margin-bottom:10px;">🕒</div>
        <h3 class="serif" style="font-size:22px;margin:0 0 10px;">Request Received</h3>
        <p style="font-size:14.5px;color:var(--muted);margin-bottom:4px;">${esc(apptConfirmed.date)} at ${esc(apptConfirmed.time)}</p>
        <p style="font-size:13.5px;color:var(--muted);margin-bottom:22px;">We'll confirm your slot shortly — status updates appear in My Account.</p>
        <a class="btn btn-whatsapp" href="${waLink(s.whatsapp, `Hello, I booked an appointment through your website for ${apptConfirmed.date} at ${apptConfirmed.time}. I'd like to discuss the details with you.`)}" target="_blank" rel="noopener noreferrer">${waIcon}Continue on WhatsApp</a>
      </div>
    </div></section>`;
  }
  const name = Auth.profile ? Auth.profile.fullName : "";
  return `<section class="section dark"><div class="wrap">${sectionHeading({ eyebrow: "Let's talk", title: "Book an appointment", sub: "Tell us when works for you. We'll confirm and follow up on WhatsApp with the details." })}</div></section>
  <section class="section"><div class="wrap">
    <form id="appt-form" style="max-width:480px;margin:0 auto;">
      <div class="field"><label>Full name</label><input name="name" value="${esc(name)}" required /></div>
      <div class="field"><label>Phone number</label><input name="phone" type="tel" required /></div>
      <div class="form-row-2">
        <div class="field"><label>Preferred date</label><input name="date" type="date" required /></div>
        <div class="field"><label>Preferred time</label><input name="time" type="time" required /></div>
      </div>
      <div class="field"><label>Reason for appointment</label>
        <select name="reason"><option value="">Select one</option><option>Consultation / new design</option><option>Fitting</option><option>Measurement</option><option>Fabric selection</option><option>Collection / delivery</option><option>Other</option></select>
      </div>
      <div class="field"><label>Note (optional)</label><textarea name="note" rows="3"></textarea></div>
      <button class="btn btn-solid full">Request Appointment</button>
    </form>
  </div></section>`;
}

/* ---------- CONTACT ---------- */
function renderContact() {
  const s = Data.settings;
  const row = (label, value, action) => `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;border-bottom:1px solid var(--line);padding-bottom:14px;"><div><div style="font-size:12px;color:var(--gold);margin-bottom:3px;">${label}</div><div style="font-size:14.5px;">${esc(value)}</div></div>${action || ""}</div>`;
  return `<section class="section dark"><div class="wrap">${sectionHeading({ eyebrow: "Get in touch", title: "Contact" })}</div></section>
  <section class="section"><div class="wrap"><div class="about-grid">
    <div style="display:flex;flex-direction:column;gap:20px;">
      ${row("WhatsApp", s.phone, `<a class="btn btn-whatsapp" href="${waLink(s.whatsapp, `Hello ${s.businessName}, I have a question.`)}" target="_blank" rel="noopener noreferrer">${waIcon}Message</a>`)}
      ${row("Phone", s.phone, `<a class="btn btn-outline-dark" href="tel:${esc(s.phone)}">Call</a>`)}
      ${row("Email", s.email, `<a class="btn btn-outline-dark" href="mailto:${esc(s.email)}">Email</a>`)}
      ${row("Studio address", s.address, `<a class="btn btn-outline-dark" href="${esc(s.mapLink)}" target="_blank" rel="noopener noreferrer">Directions</a>`)}
      ${row("Hours", s.hours)}
      <div><div style="font-size:12px;color:var(--gold);margin-bottom:10px;">Follow us</div><div class="social-row" style="gap:16px;">${socialIconsHtml(24)}</div></div>
    </div>
    <div>
      <div style="border-radius:4px;overflow:hidden;margin-bottom:26px;aspect-ratio:4/3;background:var(--tint);display:flex;align-items:center;justify-content:center;"><a href="${esc(s.mapLink)}" target="_blank" rel="noopener noreferrer" style="text-align:center;font-size:13.5px;color:var(--terracotta);text-decoration:underline;">📍 Open studio location in Google Maps</a></div>
      <h3 class="serif" style="font-size:19px;margin-bottom:12px;">Share your experience</h3>
      <form id="testi-form">
        <div class="field"><input name="name" placeholder="Your name" required /></div>
        <div class="field"><textarea name="text" placeholder="Tell us about your experience" rows="3" required></textarea></div>
        <button class="btn btn-solid">Submit review</button>
        <span style="font-size:12px;color:var(--muted-2);margin-top:8px;display:block;">Reviews are checked before appearing publicly.</span>
      </form>
    </div>
  </div></div></section>`;
}

/* ---------- ACCOUNT ---------- */
async function renderAccount() {
  if (!Auth.user) {
    return `<section class="section dark"><div class="wrap">${sectionHeading({ eyebrow: "My account", title: authMode === "login" ? "Log in" : "Create your account" })}</div></section>
    <section class="section"><div class="wrap">
      <div style="max-width:420px;margin:0 auto;">
        <div style="display:flex;gap:8px;margin-bottom:22px;">
          <button class="tab ${authMode === "login" ? "active" : ""}" style="flex:1;" data-auth-mode="login">Log In</button>
          <button class="tab ${authMode === "signup" ? "active" : ""}" style="flex:1;" data-auth-mode="signup">Sign Up</button>
        </div>
        ${authMode === "signup" ? `
        <form id="signup-form">
          <div class="field"><label>Full name</label><input name="fullName" required /></div>
          <div class="field"><label>Email</label><input name="email" type="email" required /></div>
          <div class="field"><label>Password</label><input name="password" type="password" required minlength="6" /></div>
          <div class="field"><label>Confirm password</label><input name="confirm" type="password" required minlength="6" /></div>
          <button class="btn btn-solid full">Create account</button>
        </form>` : `
        <form id="login-form">
          <div class="field"><label>Email</label><input name="email" type="email" required /></div>
          <div class="field"><label>Password</label><input name="password" type="password" required /></div>
          <button type="button" id="forgot-btn" style="background:none;border:none;color:var(--terracotta);font-size:13px;text-align:left;cursor:pointer;padding:0;margin-bottom:14px;">Forgot password?</button>
          <button class="btn btn-solid full">Log in</button>
        </form>`}
        <p style="font-size:12.5px;color:var(--muted-2);margin-top:18px;">Browsing, saving favorites and requesting an appointment don't require an account — but signing in keeps your saved designs and appointments together.</p>
      </div>
    </div></section>`;
  }

  myAppointmentsCache = await Data.loadMyAppointments();
  const favs = Data.designs.filter((d) => Auth.isFavorite(d.id));
  return `<section class="section dark"><div class="wrap">${sectionHeading({ eyebrow: "My account", title: `Hi, ${esc(firstName(Auth.profile.fullName))}` })}</div></section>
  <section class="section"><div class="wrap"><div style="display:flex;flex-direction:column;gap:40px;">
    <div><h3 class="serif" style="font-size:19px;margin-bottom:10px;">My Profile</h3><div style="font-size:14px;line-height:1.8;color:var(--ink);"><div>${esc(Auth.profile.fullName)}</div><div>${esc(Auth.profile.email)}</div></div></div>

    <div><h3 class="serif" style="font-size:19px;margin-bottom:14px;">Saved Designs</h3>
      ${favs.length ? `<div class="gallery-grid">${favs.map((d, i) => designCardHtml(d, i)).join("")}</div>` : `<div class="empty-state">Nothing saved yet — tap the heart on any design to keep it here.</div>`}
    </div>

    <div><h3 class="serif" style="font-size:19px;margin-bottom:14px;">My Appointments</h3>
      ${myAppointmentsCache.length ? `<div style="display:flex;flex-direction:column;gap:10px;">${myAppointmentsCache.map((a) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:14px;border:1px solid var(--line);"><div><div style="font-size:14.5px;">${esc(a.date)} at ${esc(a.time)}</div><div style="font-size:12.5px;color:var(--muted-2);">${esc(a.reason || "General")}</div></div><span class="status ${a.status}">${a.status}</span></div>`).join("")}</div>` : `<div class="empty-state">No appointments yet.</div>`}
    </div>

    <div><h3 class="serif" style="font-size:19px;margin-bottom:10px;">Notifications</h3>
      <div style="padding:18px;background:var(--tint);">
        <p style="font-size:14px;margin:0 0 12px;">🔔 Get new design notifications — stay updated whenever we post new designs and announcements.</p>
        <button class="btn ${Notification && Notification.permission === "granted" ? "btn-outline-dark" : "btn-solid"}" id="notif-btn">${Notification && Notification.permission === "granted" ? "Notifications on" : "Enable notifications"}</button>
      </div>
    </div>

    <div><h3 class="serif" style="font-size:19px;margin-bottom:10px;">Settings</h3><button class="btn btn-outline-dark" id="logout-btn">Log out</button></div>
  </div></div></section>`;
}

/* ---------- ADMIN ---------- */
function statCard(label, value) { return `<div class="stat-card"><div class="num">${value}</div><div class="lbl">${label}</div></div>`; }

async function renderAdmin() {
  if (!Auth.user) {
    return `<section class="section"><div class="wrap"><div style="max-width:360px;margin:60px auto;text-align:center;">
      <h2 class="serif" style="font-size:22px;margin-bottom:6px;">Admin Access</h2>
      <p style="font-size:13px;color:var(--muted-2);margin-bottom:20px;">Log in with your admin account to manage the website.</p>
      <button class="btn btn-solid full" data-nav="account">Go to Log In</button>
    </div></div></section>`;
  }
  if (!Data.isAdmin) {
    return `<section class="section"><div class="wrap"><div style="max-width:360px;margin:60px auto;text-align:center;">
      <h2 class="serif" style="font-size:22px;margin-bottom:6px;">Not an admin account</h2>
      <p style="font-size:13px;color:var(--muted-2);">This email isn't on the admin list yet. Add it under the <code>admins</code> collection in the Firebase console — see the README.</p>
    </div></div></section>`;
  }
  Data.appointments = await Data.loadAllAppointments();
  const tabs = ["overview", "designs", "posts", "appointments", "testimonials", "settings"];
  return `<section class="section dark"><div class="wrap">${sectionHeading({ eyebrow: "Private", title: "Admin Dashboard" })}</div></section>
  <section class="section"><div class="wrap">
    <div class="tab-row">${tabs.map((t) => `<button class="tab ${adminTab === t ? "active" : ""}" data-admin-tab="${t}">${t}</button>`).join("")}</div>
    <div id="admin-body">${renderAdminTab()}</div>
  </div></section>`;
}

function renderAdminTab() {
  if (adminTab === "overview") {
    return `<div class="grid-auto" style="background:transparent;">
      ${statCard("Designs", Data.designs.length)}${statCard("Posts", Data.posts.length)}${statCard("Appointments", Data.appointments.length)}
      ${statCard("Pending Appts", Data.appointments.filter((a) => a.status === "Pending").length)}
      ${statCard("Testimonials", Data.testimonials.length)}${statCard("Awaiting review", Data.testimonials.filter((t) => !t.approved).length)}
    </div>`;
  }
  if (adminTab === "designs") return renderDesignsAdmin();
  if (adminTab === "posts") return renderPostsAdmin();
  if (adminTab === "appointments") return renderApptsAdmin();
  if (adminTab === "testimonials") return renderTestiAdmin();
  if (adminTab === "settings") return renderSettingsAdmin();
  return "";
}

function renderDesignsAdmin() {
  return `<div style="background:var(--tint);padding:20px;margin-bottom:24px;">
    <h4 class="serif" style="margin:0 0 12px;">Add design</h4>
    <form id="design-form">
      <div class="field"><input name="name" placeholder="Design name" required /></div>
      <div class="field"><select name="category">${Data.categories.map((c) => `<option>${esc(c)}</option>`).join("")}</select></div>
      <div class="field"><textarea name="description" placeholder="Description" rows="2"></textarea></div>
      <div class="field"><label>Photo</label><input type="file" accept="image/*" data-upload-into="design-image-url" data-upload-folder="designs" /><input type="text" id="design-image-url" name="image" placeholder="or paste an image URL" style="margin-top:8px;" /></div>
      <div style="display:flex;gap:16px;font-size:13.5px;margin-bottom:14px;"><label><input type="checkbox" name="featured" /> Featured</label><label><input type="checkbox" name="published" checked /> Published</label></div>
      <button class="btn btn-solid">Add design</button>
    </form>
  </div>
  <div style="display:flex;flex-direction:column;gap:10px;">
    ${Data.designs.map((d) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:14px;border:1px solid var(--line);flex-wrap:wrap;gap:10px;">
      <div><div style="font-size:14.5px;">${esc(d.name)} <span style="color:var(--muted-2);font-size:12px;">· ${esc(d.category)}</span></div><div style="font-size:12px;color:var(--muted-2);">${d.published ? "Published" : "Unpublished"} ${d.featured ? "· Featured" : ""}</div></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        <button class="btn btn-outline-dark" data-design-toggle="${d.id}:published">${d.published ? "Unpublish" : "Publish"}</button>
        <button class="btn btn-outline-dark" data-design-toggle="${d.id}:featured">${d.featured ? "Unfeature" : "Feature"}</button>
        <button class="btn btn-ghost" data-design-delete="${d.id}">Delete</button>
      </div>
    </div>`).join("") || `<div class="empty-state">No designs yet.</div>`}
  </div>`;
}

function renderPostsAdmin() {
  return `<div style="background:var(--tint);padding:20px;margin-bottom:24px;">
    <h4 class="serif" style="margin:0 0 12px;">New post</h4>
    <form id="post-form">
      <div class="field"><input name="title" placeholder="Title" required /></div>
      <div class="field"><textarea name="description" placeholder="Description" rows="2"></textarea></div>
      <div class="field"><label>Photo (optional)</label><input type="file" accept="image/*" data-upload-into="post-image-url" data-upload-folder="posts" /><input type="text" id="post-image-url" name="image" placeholder="or paste an image URL" style="margin-top:8px;" /></div>
      <button class="btn btn-solid">Publish post</button>
    </form>
  </div>
  <div style="display:flex;flex-direction:column;gap:10px;">
    ${Data.posts.map((p) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:14px;border:1px solid var(--line);flex-wrap:wrap;gap:10px;">
      <div><div style="font-size:14.5px;">${esc(p.title)}</div><div style="font-size:12px;color:var(--muted-2);">${p.published ? "Published" : "Draft"}</div></div>
      <div style="display:flex;gap:6px;"><button class="btn btn-outline-dark" data-post-toggle="${p.id}">${p.published ? "Unpublish" : "Publish"}</button><button class="btn btn-ghost" data-post-delete="${p.id}">Delete</button></div>
    </div>`).join("") || `<div class="empty-state">No posts yet.</div>`}
  </div>`;
}

function renderApptsAdmin() {
  if (!Data.appointments.length) return `<div class="empty-state">No appointment requests yet.</div>`;
  return `<div style="display:flex;flex-direction:column;gap:10px;">
    ${Data.appointments.map((a) => `<div style="padding:16px;border:1px solid var(--line);">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <div><div style="font-size:14.5px;">${esc(a.name)} · ${esc(a.phone)}</div><div style="font-size:13px;">${esc(a.date)} at ${esc(a.time)} — ${esc(a.reason || "General")}</div>${a.note ? `<div style="font-size:12.5px;color:var(--muted-2);margin-top:4px;">"${esc(a.note)}"</div>` : ""}</div>
        <span class="status ${a.status}">${a.status}</span>
      </div>
      <div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap;">${["Confirmed", "Declined", "Completed", "Cancelled"].map((st) => `<button class="btn ${a.status === st ? "btn-solid" : "btn-outline-dark"}" data-appt-status="${a.id}:${st}">${st}</button>`).join("")}</div>
    </div>`).join("")}
  </div>`;
}

function renderTestiAdmin() {
  if (!Data.testimonials.length) return `<div class="empty-state">No testimonials submitted yet.</div>`;
  return `<div style="display:flex;flex-direction:column;gap:10px;">
    ${Data.testimonials.map((t) => `<div style="padding:16px;border:1px solid var(--line);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;">
      <div><div style="font-size:14.5px;">${esc(t.name)} ${t.approved ? `<span style="font-size:11px;color:var(--ok);">· Approved</span>` : ""}</div><div style="font-size:13px;color:var(--muted);margin-top:4px;">"${esc(t.text)}"</div></div>
      <div style="display:flex;gap:6px;">${!t.approved ? `<button class="btn btn-solid" data-testi-approve="${t.id}">Approve</button>` : ""}<button class="btn btn-ghost" data-testi-delete="${t.id}">Delete</button></div>
    </div>`).join("")}
  </div>`;
}

function mediaFieldHtml(key, folder, label, accept, current) {
  const isVideo = accept.indexOf("video") === 0;
  return `<div class="field">
    <label>${label}</label>
    ${current ? (isVideo ? `<video src="${esc(current)}" style="width:100%;max-width:240px;border-radius:4px;margin-bottom:8px;" controls></video>` : `<img src="${esc(current)}" style="width:84px;height:84px;object-fit:cover;border-radius:6px;margin-bottom:8px;" />`) : ""}
    <input type="text" name="${key}" value="${esc(current || "")}" placeholder="Paste a direct ${isVideo ? "video" : "image"} URL (e.g. from postimages.org)" />
    <div style="display:flex;align-items:center;gap:8px;margin-top:8px;">
      <input type="file" accept="${accept}" data-media-upload="${key}:${folder}" style="flex:1;" />
    </div>
    <span style="font-size:11.5px;color:var(--muted-2);margin-top:4px;display:block;">Paste a URL above (works now), or use "Choose file" once Firebase Storage is on a paid plan.</span>
  </div>`;
}

function renderSettingsAdmin() {
  const s = Data.settings;
  const fields = [["businessName", "Business name"], ["tagline", "Tagline"], ["whatsapp", "WhatsApp number (digits only, with country code)"], ["phone", "Phone"], ["email", "Email"], ["address", "Studio address"], ["mapLink", "Google Maps link"], ["hours", "Opening hours"], ["facebook", "Facebook URL"], ["instagram", "Instagram URL"], ["tiktok", "TikTok URL"], ["googleReviewLink", "Google Reviews link"]];
  return `
  <form id="settings-form" style="max-width:520px;">
    <div style="background:var(--tint);padding:20px;margin-bottom:24px;">
      <h4 class="serif" style="margin:0 0 4px;">Media</h4>
      <p style="font-size:12.5px;color:var(--muted);margin:0 0 14px;">Paste an image/video URL, then tap "Save settings" below to apply it.</p>
      ${mediaFieldHtml("logoUrl", "logos", "Business logo", "image/*", s.logoUrl)}
      ${mediaFieldHtml("aboutPhotoUrl", "about", "Studio / designer photo", "image/*", s.aboutPhotoUrl)}
      ${mediaFieldHtml("workshopVideoUrl", "workshop", "Workshop video", "video/*", s.workshopVideoUrl)}
    </div>
    ${fields.map(([k, l]) => `<div class="field"><label>${l}</label><input name="${k}" value="${esc(s[k] || "")}" /></div>`).join("")}
    <div class="field"><label>About text</label><textarea name="about" rows="4">${esc(s.about || "")}</textarea></div>
    <button class="btn btn-solid" type="submit">Save settings</button>
  </form>
  <div style="margin-top:28px;max-width:520px;">
    <h4 class="serif">Gallery categories</h4>
    <div id="cat-list" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">${Data.categories.map((c) => `<span style="background:var(--tint);padding:6px 12px;font-size:13px;display:inline-flex;align-items:center;gap:6px;">${esc(c)} <button data-cat-remove="${esc(c)}" style="background:none;border:none;cursor:pointer;color:var(--danger);">×</button></span>`).join("")}</div>
    <form id="cat-form" style="display:flex;gap:8px;"><input name="cat" placeholder="New category" style="flex:1;padding:12px 14px;border:1px solid #1C171233;" /><button class="btn btn-outline-dark">Add</button></form>
  </div>
  <p style="font-size:11.5px;color:var(--muted-2);margin-top:22px;max-width:520px;">Admin access is granted by adding your login email to the <code>admins</code> collection in Firestore — see the README for the exact steps.</p>`;
}

/* ---------- DEVELOPER PAGE ---------- */
function renderDeveloper() {
  return `<section class="section dark"><div class="wrap">${sectionHeading({ eyebrow: "Site developer", title: "Need a website like this?", sub: "This site was designed and built by HeisTimo Tech🤍." })}</div></section>
  <section class="section"><div class="wrap"><div style="max-width:480px;text-align:center;margin:0 auto;">
    <div style="margin:0 auto 18px;">${devMarkHtml(84)}</div>
    <h3 class="serif" style="font-size:22px;margin:0 0 4px;">${DEV.name}</h3>
    <div style="font-size:13.5px;color:var(--terracotta);margin-bottom:14px;">${DEV.role}</div>
    <p style="font-size:14.5px;line-height:1.6;color:var(--ink);margin-bottom:26px;">${DEV.bio}</p>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;"><a class="btn btn-solid" href="${waLink(DEV.whatsapp, "Hello HeisTimo Tech, I'd like to talk about getting a website.")}" target="_blank" rel="noopener noreferrer">${waIcon}WhatsApp Me</a><a class="btn btn-outline-dark" href="mailto:${DEV.email}">Email Me</a></div>
  </div></div></section>`;
}

/* ---------- lightbox ---------- */
function openLightbox(id) {
  const list = Data.designs.filter((d) => d.published);
  lightboxIds = list.length ? list : Data.designs;
  lightboxIndex = Math.max(0, lightboxIds.findIndex((d) => d.id === id));
  renderLightbox();
  document.getElementById("lightbox").classList.remove("hidden");
}
function closeLightbox() { document.getElementById("lightbox").classList.add("hidden"); }
function lightboxGo(delta) { lightboxIndex = (lightboxIndex + delta + lightboxIds.length) % lightboxIds.length; renderLightbox(); }
function renderLightbox() {
  const d = lightboxIds[lightboxIndex];
  if (!d) return;
  const fav = Auth.isFavorite(d.id);
  document.getElementById("lightbox").innerHTML = `
    <div class="lb-top"><span class="lb-count">${lightboxIndex + 1} / ${lightboxIds.length}</span><button class="lb-close focus-ring" id="lb-close-btn" aria-label="Close">×</button></div>
    <div class="lb-body">
      <button class="lb-nav lb-prev focus-ring" id="lb-prev-btn" aria-label="Previous design">‹</button>
      <div class="lb-media">${tileHtml({ seed: lightboxIndex, image: d.image, label: d.image ? undefined : `Photo pending — ${d.name}` })}</div>
      <button class="lb-nav lb-next focus-ring" id="lb-next-btn" aria-label="Next design">›</button>
    </div>
    <div class="lb-info">
      <div class="lb-info-top"><div><h3>${esc(d.name)}</h3><span class="cat">${esc(d.category)}</span></div><button class="lb-fav ${fav ? "active" : ""} focus-ring" data-fav="${d.id}" aria-label="Save design">${fav ? "♥" : "♡"}</button></div>
      <p>${esc(d.description)}</p>
      <a class="btn btn-whatsapp full" href="${waLink(Data.settings.whatsapp, `Hello, I saw "${d.name}" on your website and I'm interested in making something similar. I'd like to discuss the design, fabric, customization and price.`)}" target="_blank" rel="noopener noreferrer">${waIcon}Discuss This Design on WhatsApp</a>
    </div>`;
}

/* ---------- router ---------- */
const PAGE_RENDERERS = { home: renderHome, about: renderAbout, services: renderServices, gallery: renderGallery, posts: renderPosts, appointment: renderAppointment, contact: renderContact, account: renderAccount, admin: renderAdmin, developer: renderDeveloper };

async function navigate(page) {
  currentPage = page;
  location.hash = "#" + page;
  document.getElementById("mobile-menu").classList.add("hidden");
  document.getElementById("burger-btn").setAttribute("aria-expanded", "false");
  await renderPage();
  window.scrollTo({ top: 0 });
}

async function renderPage() {
  const root = document.getElementById("page-root");
  const fn = PAGE_RENDERERS[currentPage] || renderHome;
  const html = await fn();
  root.innerHTML = html;
  renderChrome();
  attachPageHandlers();
}

/* ---------- event handlers attached after each render ---------- */
function attachPageHandlers() {
  const form = (id) => document.getElementById(id);

  // Settings → Media: upload immediately and save straight to settings.
  document.querySelectorAll("[data-media-upload]").forEach((input) => {
    input.addEventListener("change", async () => {
      const file = input.files[0];
      if (!file) return;
      const [key, folder] = input.dataset.mediaUpload.split(":");
      toast("Uploading…");
      try {
        const url = await uploadToStorage(file, folder);
        await Data.saveSettings({ [key]: url });
        toast("Uploaded");
        renderPage();
      } catch (err) { toast(err.message || "Upload failed"); }
    });
  });

  // Design / Post forms: upload a photo and drop the URL into the paired text field.
  document.querySelectorAll("[data-upload-into]").forEach((input) => {
    input.addEventListener("change", async () => {
      const file = input.files[0];
      if (!file) return;
      const targetId = input.dataset.uploadInto;
      const folder = input.dataset.uploadFolder || "uploads";
      toast("Uploading…");
      try {
        const url = await uploadToStorage(file, folder);
        document.getElementById(targetId).value = url;
        toast("Photo uploaded");
      } catch (err) { toast(err.message || "Upload failed"); }
    });
  });

  const apptForm = form("appt-form");
  if (apptForm) apptForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(apptForm);
    const appt = { name: fd.get("name"), phone: fd.get("phone"), date: fd.get("date"), time: fd.get("time"), reason: fd.get("reason"), note: fd.get("note") };
    await Data.createAppointment(appt);
    apptConfirmed = appt;
    toast("Appointment request sent");
    renderPage();
  });

  const testiForm = form("testi-form");
  if (testiForm) testiForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(testiForm);
    await Data.addTestimonial({ name: fd.get("name"), text: fd.get("text") });
    toast("Thank you — your review is awaiting approval");
    testiForm.reset();
  });

  const signupForm = form("signup-form");
  if (signupForm) signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(signupForm);
    if (fd.get("password") !== fd.get("confirm")) { toast("Passwords don't match"); return; }
    try {
      await Auth.signup(fd.get("fullName"), fd.get("email"), fd.get("password"));
      toast(`Welcome, ${firstName(fd.get("fullName"))}`);
      renderPage();
    } catch (err) { toast(err.message); }
  });

  const loginForm = form("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(loginForm);
      try { await Auth.login(fd.get("email"), fd.get("password")); toast("Logged in"); renderPage(); }
      catch (err) { toast(err.message); }
    });
    const forgot = form("forgot-btn");
    if (forgot) forgot.addEventListener("click", async () => {
      const email = new FormData(loginForm).get("email");
      if (!email) { toast("Enter your email first"); return; }
      try { await Auth.resetPassword(email); toast("Password reset email sent"); } catch (err) { toast(err.message); }
    });
  }

  const logoutBtn = form("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", async () => { await Auth.logout(); toast("Logged out"); renderPage(); });

  const notifBtn = form("notif-btn");
  if (notifBtn) notifBtn.addEventListener("click", async () => {
    if (!("Notification" in window)) { toast("Notifications aren't supported on this device"); return; }
    const perm = await Notification.requestPermission();
    if (perm === "granted") { toast("You're subscribed to design alerts"); try { new Notification("Gabby's Signature", { body: "You'll now hear about new designs first." }); } catch (e) {} }
    else toast("Notifications weren't enabled");
    renderPage();
  });

  const designForm = form("design-form");
  if (designForm) designForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(designForm);
    await Data.addDesign({ name: fd.get("name"), category: fd.get("category"), description: fd.get("description"), image: fd.get("image") || "", featured: !!fd.get("featured"), published: !!fd.get("published") });
    toast("Design added");
    renderPage();
  });

  const postForm = form("post-form");
  if (postForm) postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(postForm);
    await Data.addPost({ title: fd.get("title"), description: fd.get("description"), image: fd.get("image") || "", published: true, date: new Date().toISOString().slice(0, 10) });
    toast("Post published");
    renderPage();
  });

  const settingsForm = form("settings-form");
  if (settingsForm) settingsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(settingsForm);
    const next = {};
    fd.forEach((v, k) => (next[k] = v));
    await Data.saveSettings(next);
    toast("Settings saved");
    renderPage();
  });

  const catForm = form("cat-form");
  if (catForm) catForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(catForm);
    const val = (fd.get("cat") || "").trim();
    if (!val) return;
    await Data.saveCategories([...Data.categories, val]);
    renderPage();
  });
}

/* ---------- global click delegation (survives re-renders) ---------- */
document.addEventListener("click", async (e) => {
  const navEl = e.target.closest("[data-nav]");
  if (navEl) { e.preventDefault(); navigate(navEl.dataset.nav); return; }

  const favEl = e.target.closest("[data-fav]");
  if (favEl) {
    e.preventDefault();
    if (!Auth.user) { toast("Sign in to save designs"); navigate("account"); return; }
    await Auth.toggleFavorite(favEl.dataset.fav);
    if (!document.getElementById("lightbox").classList.contains("hidden")) renderLightbox();
    renderPage();
    return;
  }

  const openEl = e.target.closest("[data-open-lightbox]");
  if (openEl) { e.preventDefault(); openLightbox(openEl.dataset.openLightbox); return; }

  const filterEl = e.target.closest("[data-gallery-filter]");
  if (filterEl) { galleryFilter = filterEl.dataset.galleryFilter; renderPage(); return; }

  const authModeEl = e.target.closest("[data-auth-mode]");
  if (authModeEl) { authMode = authModeEl.dataset.authMode; renderPage(); return; }

  const adminTabEl = e.target.closest("[data-admin-tab]");
  if (adminTabEl) { adminTab = adminTabEl.dataset.adminTab; document.getElementById("admin-body").innerHTML = renderAdminTab(); renderChrome(); attachPageHandlers(); document.querySelectorAll("[data-admin-tab]").forEach((b) => b.classList.toggle("active", b.dataset.adminTab === adminTab)); return; }

  const dToggle = e.target.closest("[data-design-toggle]");
  if (dToggle) { const [id, field] = dToggle.dataset.designToggle.split(":"); const d = Data.designs.find((x) => x.id === id); await Data.updateDesign(id, { [field]: !d[field] }); renderPage(); return; }
  const dDelete = e.target.closest("[data-design-delete]");
  if (dDelete) { await Data.deleteDesign(dDelete.dataset.designDelete); toast("Design deleted"); renderPage(); return; }

  const pToggle = e.target.closest("[data-post-toggle]");
  if (pToggle) { const id = pToggle.dataset.postToggle; const p = Data.posts.find((x) => x.id === id); await Data.updatePost(id, { published: !p.published }); renderPage(); return; }
  const pDelete = e.target.closest("[data-post-delete]");
  if (pDelete) { await Data.deletePost(pDelete.dataset.postDelete); toast("Post deleted"); renderPage(); return; }

  const aStatus = e.target.closest("[data-appt-status]");
  if (aStatus) { const [id, status] = aStatus.dataset.apptStatus.split(":"); await Data.setAppointmentStatus(id, status); toast(`Marked ${status}`); renderPage(); return; }

  const tApprove = e.target.closest("[data-testi-approve]");
  if (tApprove) { await Data.approveTestimonial(tApprove.dataset.testiApprove); toast("Approved"); renderPage(); return; }
  const tDelete = e.target.closest("[data-testi-delete]");
  if (tDelete) { await Data.deleteTestimonial(tDelete.dataset.testiDelete); toast("Removed"); renderPage(); return; }

  const catRemove = e.target.closest("[data-cat-remove]");
  if (catRemove) { await Data.saveCategories(Data.categories.filter((c) => c !== catRemove.dataset.catRemove)); renderPage(); return; }

  if (e.target.closest("#burger-btn")) {
    const menu = document.getElementById("mobile-menu");
    const willOpen = menu.classList.contains("hidden");
    menu.classList.toggle("hidden");
    document.getElementById("burger-btn").setAttribute("aria-expanded", String(willOpen));
    return;
  }
  if (e.target.closest("#lb-close-btn") || e.target === document.getElementById("lightbox")) { closeLightbox(); return; }
  if (e.target.closest("#lb-prev-btn")) { lightboxGo(-1); return; }
  if (e.target.closest("#lb-next-btn")) { lightboxGo(1); return; }

  if (e.target.closest("#dev-fab")) { document.getElementById("dev-panel").classList.toggle("hidden"); return; }
});

/* swipe support for lightbox on touch devices */
(function () {
  let startX = null;
  const lb = document.getElementById("lightbox");
  lb.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (dx > 50) lightboxGo(-1);
    if (dx < -50) lightboxGo(1);
    startX = null;
  }, { passive: true });
})();

function onAuthChanged() {
  // Called by Auth whenever sign-in state changes; keep chrome + current
  // page in sync (e.g. the account icon and admin gate).
  if (document.getElementById("page-root").innerHTML) renderPage();
}

/* ---------- boot ---------- */
document.getElementById("dev-panel").innerHTML = `
  <h4>Need a Professional Website? 🚀</h4>
  <p>Get your business online with</p>
  <p class="brand-name">${DEV.name}</p>
  <div class="role">${DEV.role}</div>
  <div class="actions">
    <a class="btn btn-gold" href="${waLink(DEV.whatsapp, "Hello HeisTimo Tech, I'd like to talk about getting a website.")}" target="_blank" rel="noopener noreferrer">💬 WhatsApp Me</a>
    <a class="btn btn-outline" href="mailto:${DEV.email}">📧 Email Me</a>
  </div>`;

(async function boot() {
  try {
    await Data.init();
  } catch (err) {
    console.error("Failed to load site data from Firebase:", err);
    document.getElementById("page-root").innerHTML = `<div class="section"><div class="wrap"><div class="empty-state">Couldn't connect to Firebase. Check firebase-init.js and your project's Firestore rules.</div></div></div>`;
  }
  await Auth.init();
  currentPage = (location.hash || "#home").replace("#", "") || "home";
  if (!PAGE_RENDERERS[currentPage]) currentPage = "home";
  await renderPage();
})();

window.addEventListener("hashchange", () => {
  const page = (location.hash || "#home").replace("#", "") || "home";
  if (PAGE_RENDERERS[page] && page !== currentPage) { currentPage = page; renderPage(); window.scrollTo({ top: 0 }); }
});
