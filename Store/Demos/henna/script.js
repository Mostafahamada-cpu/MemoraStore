/* ===========================
   MEMORA DEMO — Salma's Henna Night — Invitation
   Based on the Modern Minimal (Without RSVP) template.
   Three Egyptian henna concepts share one page: Shaabi Night, Sa'idi and Nubian.
   A customer picks one; the switcher is only part of the demo.
   =========================== */

// ============================
// CONFIGURATION — EDIT ME
// ============================
const CONFIG = {
    name: "Salma",
    eventDate: "2026-10-22T20:00:00",
    displayDate: "Thursday · October 22, 2026",
    monogram: ["S", "H"],
    pageTitle: "Salma's Henna Night — Invitation",
    footerText: "Join Salma and her family for a night to remember",
    defaultConcept: "shaabi",

    concepts: {
        shaabi: {
            themeColor: "#3A0A14",
            eyebrow: "A Shaabi henna night in Cairo",
            nameLine: "Salma's Henna Night",
            tagline: "Tabla, zaghareet and henna until the early hours",
            ornament: "✦ ✦ ✦",
            motif: "✦",
            sceneCaption: "The henna tray, candles lit",
            program: [
                { time: "8:00 PM", title: "The Zaffa", text: "Tabla and mizmar lead the bride in, with zaghareet all the way.", icon: "drum" },
                { time: "9:00 PM", title: "The Henna Tray", text: "Candles lit, rose petals scattered and a dab of henna for every guest.", icon: "tray" },
                { time: "10:00 PM", title: "The Sahra", text: "Shaabi classics, a live band and dancing until late.", icon: "lights" }
            ],
            dressCode: "Red, gold & a little sparkle",
            closing: "Come ready to dance",
            venue: { name: "Al Azhar Park", address: "Salah Salem St, Cairo", query: "Al+Azhar+Park+Cairo" }
        },
        saidi: {
            themeColor: "#8E3A22",
            eyebrow: "An Upper Egyptian henna night",
            nameLine: "Salma's Henna Night",
            tagline: "Mizmar, tahtib and the warmth of the south",
            ornament: "◆ ◆ ◆",
            motif: "◆",
            sceneCaption: "Under the palms of the south",
            program: [
                { time: "7:30 PM", title: "Mizmar Welcome", text: "Guests arrive to the mizmar and the beat of the tabl baladi.", icon: "mizmar" },
                { time: "8:30 PM", title: "Tahtib & Zaghareet", text: "A stick-dance performance before the henna is brought out.", icon: "sticks" },
                { time: "9:30 PM", title: "Henna & the Feast", text: "The bride's henna, then a southern dinner for the whole family.", icon: "qulla" }
            ],
            dressCode: "Galabeyas & warm earthy tones",
            closing: "The whole family is expected",
            venue: { name: "The Family House", address: "Corniche El Nil, Luxor", query: "Corniche+El+Nil+Luxor" }
        },
        nubian: {
            themeColor: "#1F9AA0",
            eyebrow: "A Nubian henna night by the Nile",
            nameLine: "Salma's Henna Night",
            tagline: "Daff drums, Nile breeze and colour on every wall",
            ornament: "▲ ▲ ▲",
            motif: "▲",
            sceneCaption: "Painted doors, open houses",
            program: [
                { time: "7:30 PM", title: "Daff & Clapping Songs", text: "Nubian songs on the daff drums as the guests gather.", icon: "daff" },
                { time: "8:30 PM", title: "The Bride's Henna", text: "The henna ritual, with the women of the family singing along.", icon: "bowl" },
                { time: "9:30 PM", title: "Dancing by the Nile", text: "A Nubian dance circle under the lights of Gharb Soheil.", icon: "circle" }
            ],
            dressCode: "Bold colours & Nubian prints",
            closing: "Come dressed in colour",
            venue: { name: "Gharb Soheil Guest House", address: "Gharb Soheil, Aswan", query: "Gharb+Soheil+Aswan" }
        }
    }
};

// Line icons for the programme (stroke = currentColor).
const ICONS = {
    drum: '<ellipse cx="24" cy="9" rx="11" ry="3.5"/><path d="M13 9c0 10 7 14 7 19l-2 12h12l-2-12c0-5 7-9 7-19"/><path d="M16 17h16M19 34h10"/>',
    tray: '<ellipse cx="24" cy="36" rx="19" ry="5"/><path d="M13 35V23M20 34V19M28 34V19M35 35V23"/><path d="M13 19c-2-2-1-4 0-6 1 2 2 4 0 6zM20 15c-2-2-1-4 0-6 1 2 2 4 0 6zM28 15c-2-2-1-4 0-6 1 2 2 4 0 6zM35 19c-2-2-1-4 0-6 1 2 2 4 0 6z"/>',
    lights: '<path d="M3 10q21 16 42 0"/><path d="M11 15v4M24 18v4M37 15v4"/><circle cx="11" cy="22" r="3"/><circle cx="24" cy="25" r="3"/><circle cx="37" cy="22" r="3"/><path d="M8 34l2 2M24 36v3M40 34l-2 2"/>',
    mizmar: '<path d="M12 36L32 16"/><path d="M32 16l6-6"/><path d="M6 42l3-9 6 6z"/><circle cx="18" cy="30" r="1.3"/><circle cx="22" cy="26" r="1.3"/><circle cx="26" cy="22" r="1.3"/>',
    sticks: '<path d="M10 40L38 8M38 40L10 8"/><circle cx="10" cy="40" r="2.5"/><circle cx="38" cy="40" r="2.5"/><path d="M36 6l4 4M8 10l4-4"/>',
    qulla: '<path d="M20 7h8"/><path d="M21 7v4c0 3-10 6-10 17 0 8 6 13 13 13s13-5 13-13c0-11-10-14-10-17V7"/><path d="M13 25h22"/>',
    daff: '<circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="11"/><circle cx="24" cy="6" r="1.6"/><circle cx="42" cy="24" r="1.6"/><circle cx="24" cy="42" r="1.6"/><circle cx="6" cy="24" r="1.6"/>',
    bowl: '<path d="M7 24h34c0 9-7 15-17 15S7 33 7 24z"/><path d="M13 24c2-5 6-7 11-7s9 2 11 7"/><path d="M24 10v4M18 12l1 3M30 12l-1 3"/>',
    circle: '<circle cx="24" cy="26" r="13" stroke-dasharray="3 4"/><circle cx="24" cy="9" r="3"/><circle cx="39" cy="33" r="3"/><circle cx="9" cy="33" r="3"/>'
};

let currentConcept = null;

// ============================
// POPULATE CONTENT FROM CONFIG
// ============================
function populateContent() {
    document.getElementById("wedding-date-display").textContent = CONFIG.displayDate;
    document.getElementById("footer-text").textContent = CONFIG.footerText;
    document.getElementById("groom-initial").textContent = CONFIG.monogram[0];
    document.getElementById("bride-initial").textContent = CONFIG.monogram[1];
    document.title = CONFIG.pageTitle;
}

function applyConcept(key) {
    const c = CONFIG.concepts[key];
    if (!c || key === currentConcept) return;
    currentConcept = key;

    document.body.dataset.concept = key;
    document.querySelector('meta[name="theme-color"]').setAttribute("content", c.themeColor);

    document.getElementById("concept-eyebrow").textContent = c.eyebrow;
    document.getElementById("groom-name").textContent = c.nameLine;
    document.getElementById("concept-tagline").textContent = c.tagline;
    document.getElementById("hero-ornament").textContent = c.ornament;
    document.getElementById("monogram-motif").textContent = c.motif;
    document.querySelectorAll(".petal, .ornament-divider .diamond").forEach((el) => { el.textContent = c.motif; });
    document.getElementById("scene-caption").textContent = c.sceneCaption;
    document.getElementById("dress-code").textContent = c.dressCode;
    document.getElementById("closing-line").textContent = c.closing;

    document.getElementById("program-list").innerHTML = c.program.map((item) => `
        <li class="detail-card program-card">
            <svg class="program-icon" viewBox="0 0 48 48" aria-hidden="true">${ICONS[item.icon]}</svg>
            <div class="detail-info">${item.time}</div>
            <div class="detail-title">${item.title}</div>
            <div class="detail-address">${item.text}</div>
        </li>`).join("");

    document.getElementById("venue-name").textContent = c.venue.name;
    document.getElementById("venue-address").textContent = c.venue.address;
    document.getElementById("google-map").src = `https://www.google.com/maps?q=${c.venue.query}&output=embed`;
    document.getElementById("map-directions-link").href = `https://www.google.com/maps?q=${c.venue.query}`;

    document.querySelectorAll(".concept-switch button").forEach((btn) => {
        btn.setAttribute("aria-pressed", String(btn.dataset.concept === key));
    });

    // New programme cards need the scroll reveal once the invitation is open.
    if (envelopeOpened) {
        document.querySelectorAll(".program-card").forEach((el) => el.classList.add("reveal", "visible"));
    }

    try {
        const url = new URL(window.location.href);
        url.searchParams.set("concept", key);
        history.replaceState(null, "", url);
    } catch (e) { /* file:// or sandboxed frame */ }
}

function switchConcept(key) {
    if (key === currentConcept) return;
    document.body.classList.add("concept-switching");
    setTimeout(() => {
        applyConcept(key);
        requestAnimationFrame(() => document.body.classList.remove("concept-switching"));
    }, 260);
}

function initConceptSwitch() {
    document.querySelectorAll(".concept-switch button").forEach((btn) => {
        btn.addEventListener("click", () => switchConcept(btn.dataset.concept));
    });
    let initial = CONFIG.defaultConcept;
    try {
        const fromUrl = new URLSearchParams(window.location.search).get("concept");
        if (fromUrl && CONFIG.concepts[fromUrl]) initial = fromUrl;
    } catch (e) { /* ignore */ }
    applyConcept(initial);
}

// ============================
// SHAABI STRING LIGHTS (bulbs placed along the wires)
// ============================
function hangBulbs() {
    const svg = document.querySelector(".string-lights");
    if (!svg) return;
    const group = svg.querySelector(".bulbs");
    const halos = svg.querySelector(".halos");
    const ns = "http://www.w3.org/2000/svg";
    // The wires are two quadratic curves each (see the .wire paths); computed directly because
    // the invitation is display:none when this runs, so SVG geometry APIs are unavailable.
    const wires = [
        [[-20, 20], [300, 150], [600, 40], [900, 150], [1220, 20]],
        [[-20, 70], [300, 170], [600, 95], [900, 170], [1220, 70]]
    ];
    const quad = (a, b, c, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
    wires.forEach((pts, w) => {
        const perSegment = 13;
        for (let s = 0; s < 2; s++) {
            const [p0, p1, p2] = [pts[s * 2], pts[s * 2 + 1], pts[s * 2 + 2]];
            for (let i = 0; i < perSegment; i++) {
                const t = (i + (w ? 0.75 : 0.25)) / perSegment;
                const cx = quad(p0[0], p1[0], p2[0], t).toFixed(1);
                const cy = (quad(p0[1], p1[1], p2[1], t) + 7).toFixed(1);
                const halo = document.createElementNS(ns, "circle");
                halo.setAttribute("cx", cx);
                halo.setAttribute("cy", cy);
                halo.setAttribute("r", w ? "11" : "13");
                halos.appendChild(halo);
                const bulb = document.createElementNS(ns, "circle");
                bulb.setAttribute("cx", cx);
                bulb.setAttribute("cy", cy);
                bulb.setAttribute("r", w ? "4.5" : "5.5");
                bulb.style.animationDelay = `${((i * 7 + s * 5 + w * 3) % 11) * 0.23}s`;
                group.appendChild(bulb);
            }
        }
    });
}

// ============================
// ENVELOPE ANIMATION
// ============================
let envelopeOpened = false;
const envelopeWrapper = document.getElementById("envelope-wrapper");
const envelopeContainer = document.querySelector(".envelope");
const openBtn = document.getElementById("open-btn");
const invitation = document.getElementById("invitation");

function openEnvelope() {
    if (envelopeOpened) return;
    envelopeOpened = true;

    envelopeContainer.classList.add("open");

    openBtn.style.opacity = "0";
    openBtn.style.transform = "translateY(10px)";
    openBtn.style.pointerEvents = "none";

    setTimeout(() => {
        envelopeWrapper.classList.add("fade-out");

        setTimeout(() => {
            envelopeWrapper.style.display = "none";
            invitation.classList.remove("hidden");
            requestAnimationFrame(() => {
                initScrollReveal();
            });
        }, 800);
    }, 1800);
}

if (openBtn) openBtn.addEventListener("click", openEnvelope);
if (envelopeContainer) envelopeContainer.addEventListener("click", openEnvelope);

// ============================
// COUNTDOWN TIMER
// ============================
function updateCountdown() {
    const eventDate = new Date(CONFIG.eventDate).getTime();
    const now = new Date().getTime();
    const distance = eventDate - now;

    if (distance < 0) {
        ["days", "hours", "minutes", "seconds"].forEach((id) => { document.getElementById(id).textContent = "00"; });
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").textContent = String(days).padStart(2, "0");
    document.getElementById("hours").textContent = String(hours).padStart(2, "0");
    document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
    document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ============================
// SCROLL REVEAL ANIMATION
// ============================
function initScrollReveal() {
    const revealTargets = document.querySelectorAll(
        ".section-kicker, .section-title, .ornament-divider, .photo-frame, .photo-caption, .countdown-grid, .program-card, .dress-note, .venue-line, .map-container, .map-link, .couple-monogram, .closing-footer"
    );

    revealTargets.forEach((el) => el.classList.add("reveal"));

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const parent = entry.target.closest(".program-grid, .countdown-grid");
                    if (parent) {
                        const siblings = Array.from(parent.querySelectorAll(".reveal"));
                        const index = siblings.indexOf(entry.target);
                        entry.target.style.transitionDelay = `${index * 0.15}s`;
                    }
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    revealTargets.forEach((el) => observer.observe(el));
}

// ============================
// SMOOTH PARALLAX ON HERO
// ============================
window.addEventListener("scroll", () => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const scrollY = window.scrollY;
    const heroHeight = hero.offsetHeight;

    if (scrollY < heroHeight) {
        hero.style.opacity = 1 - scrollY / heroHeight;
    }
});

// ============================
// INITIALIZATION
// ============================
document.addEventListener("DOMContentLoaded", () => {
    populateContent();
    initConceptSwitch();
    hangBulbs();
});
