/* ===========================
   MEMORA DEMO — Omar & Nour — Gender Reveal
   Based on the Modern Minimal (Without RSVP) template.
   =========================== */

// ============================
// CONFIGURATION — EDIT ME
// ============================
const CONFIG = {
    nameA: "Omar",
    nameB: "Nour",
    eventDate: "2027-01-16T17:00:00",
    displayDate: "January 16, 2027",
    card1: { time: "5:00 PM", venue: "La Beau Garden", address: "Sheikh Zayed, Giza" },
    card2: { time: "6:30 PM", venue: "La Beau Garden", address: "Main Lawn, Sheikh Zayed" },
    googleMapsEmbed: "https://www.google.com/maps?q=La+beau+garden+Sheikh+Zayed+Giza&output=embed",
    googleMapsLink: "https://www.google.com/maps?q=La+beau+garden+Sheikh+Zayed+Giza",
    monogram: ["O", "N"],
    pageTitle: "Omar & Nour — Gender Reveal",
    footerText: "We can't wait to share the surprise — Omar & Nour",

    // Gender vote + reveal
    reveal: {
        answer: "girl",                    // "boy" | "girl" — stays hidden until the reveal
        at: "2027-01-16T18:30:00",         // the reveal unlocks on its own at this time
        displayAt: "January 16 · 6:30 PM"
    },
    voteSeed: { boy: 23, girl: 26 },       // votes already cast by other guests (demo)
    voteStorageKey: "memora-gender-vote-omar-nour"
};

// ============================
// POPULATE CONTENT FROM CONFIG
// ============================
function populateContent() {
    document.getElementById("groom-name").textContent = CONFIG.nameA;
    document.getElementById("bride-name").textContent = CONFIG.nameB;
    document.getElementById("wedding-date-display").textContent = CONFIG.displayDate;
    document.getElementById("ceremony-time").textContent = CONFIG.card1.time;
    document.getElementById("ceremony-venue").textContent = CONFIG.card1.venue;
    document.getElementById("ceremony-address").textContent = CONFIG.card1.address;
    document.getElementById("reception-time").textContent = CONFIG.card2.time;
    document.getElementById("reception-venue").textContent = CONFIG.card2.venue;
    document.getElementById("reception-address").textContent = CONFIG.card2.address;

    document.getElementById("google-map").src = CONFIG.googleMapsEmbed;
    document.getElementById("map-directions-link").href = CONFIG.googleMapsLink;

    document.getElementById("footer-text").textContent = CONFIG.footerText;
    document.getElementById("groom-initial").textContent = CONFIG.monogram[0];
    document.getElementById("bride-initial").textContent = CONFIG.monogram[1];

    document.title = CONFIG.pageTitle;
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
// GENDER VOTE
// ============================
const TEAM = {
    boy: { label: "Team Boy", badge: "💙" },
    girl: { label: "Team Girl", badge: "🩷" }
};
let myVote = null;

function readVote() {
    try {
        const v = localStorage.getItem(CONFIG.voteStorageKey);
        return v === "boy" || v === "girl" ? v : null;
    } catch (e) { return null; }
}

function saveVote(v) {
    try {
        if (v) localStorage.setItem(CONFIG.voteStorageKey, v);
        else localStorage.removeItem(CONFIG.voteStorageKey);
    } catch (e) { /* private mode: the vote still works for this visit */ }
}

function renderVote(animate) {
    const card = document.getElementById("vote-card");
    card.dataset.state = myVote ? "voted" : "open";
    card.dataset.choice = myVote || "";
    document.querySelectorAll(".vote-btn").forEach((btn) => {
        btn.setAttribute("aria-pressed", String(btn.dataset.choice === myVote));
    });

    const boy = CONFIG.voteSeed.boy + (myVote === "boy" ? 1 : 0);
    const girl = CONFIG.voteSeed.girl + (myVote === "girl" ? 1 : 0);
    const pctBoy = Math.round((boy / (boy + girl)) * 100);
    const pctGirl = 100 - pctBoy;

    if (myVote) {
        document.getElementById("vote-team").textContent = TEAM[myVote].label;
        document.getElementById("vote-badge").textContent = TEAM[myVote].badge;
    }
    document.getElementById("count-boy").textContent = boy;
    document.getElementById("count-girl").textContent = girl;
    document.getElementById("pct-boy").textContent = `💙 ${pctBoy}%`;
    document.getElementById("pct-girl").textContent = `${pctGirl}% 🩷`;
    document.getElementById("vote-bar").setAttribute("aria-label", `${pctBoy}% guessed boy, ${pctGirl}% guessed girl`);

    const barBoy = document.getElementById("bar-boy");
    const barGirl = document.getElementById("bar-girl");
    const setWidths = () => {
        barBoy.style.width = `${myVote ? pctBoy : 50}%`;
        barGirl.style.width = `${myVote ? pctGirl : 50}%`;
    };
    if (animate) {
        barBoy.style.width = "50%";
        barGirl.style.width = "50%";
        setTimeout(setWidths, 350);
    } else {
        setWidths();
    }

    const preview = document.getElementById("reveal-preview");
    preview.disabled = !myVote;
    document.getElementById("reveal-preview-hint").textContent = myVote
        ? "Demo only — at the party it opens on its own"
        : "Vote first to unlock the demo preview";
}

function initVote() {
    myVote = readVote();
    document.querySelectorAll(".vote-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            myVote = btn.dataset.choice;
            saveVote(myVote);
            btn.classList.add("picked");
            setTimeout(() => btn.classList.remove("picked"), 600);
            setTimeout(() => renderVote(true), 380);
        });
    });
    document.getElementById("vote-change").addEventListener("click", () => {
        myVote = null;
        saveVote(null);
        sealReveal();
        renderVote(false);
    });
    renderVote(false);
}

// ============================
// THE REVEAL
// ============================
function showReveal(fromPreview) {
    const box = document.getElementById("reveal-box");
    const answer = CONFIG.reveal.answer;
    box.dataset.state = "revealed";
    box.dataset.answer = answer;
    document.getElementById("reveal-headline").textContent = answer === "girl" ? "It's a Girl! 🩷" : "It's a Boy! 💙";

    let verdict = "";
    if (myVote === answer) verdict = `You guessed right — ${TEAM[answer].label} wins! 🎉`;
    else if (myVote) verdict = `So close! ${TEAM[myVote].label} will get the next one.`;
    document.getElementById("reveal-verdict").textContent = verdict;
    document.getElementById("reveal-replay").hidden = !fromPreview;

    burstConfetti(answer);
}

function sealReveal() {
    const box = document.getElementById("reveal-box");
    box.dataset.state = "locked";
    document.getElementById("reveal-confetti").innerHTML = "";
}

function burstConfetti(answer) {
    const layer = document.getElementById("reveal-confetti");
    layer.innerHTML = "";
    const colors = answer === "girl"
        ? ["#F48FB1", "#F8BBD0", "#E07A9B", "#FFFFFF", "#FCE4EC"]
        : ["#7EC8E3", "#A9D6EA", "#5BA9D6", "#FFFFFF", "#DDF1FA"];
    for (let i = 0; i < 70; i++) {
        const piece = document.createElement("i");
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.background = colors[i % colors.length];
        piece.style.animationDelay = `${Math.random() * 0.6}s`;
        piece.style.animationDuration = `${2.2 + Math.random() * 1.6}s`;
        piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 160}px`);
        piece.style.setProperty("--spin", `${(Math.random() - 0.5) * 1080}deg`);
        if (i % 3 === 0) piece.style.borderRadius = "50%";
        layer.appendChild(piece);
    }
}

function initReveal() {
    document.getElementById("reveal-at").textContent = CONFIG.reveal.displayAt;
    document.getElementById("reveal-preview").addEventListener("click", () => showReveal(true));
    document.getElementById("reveal-replay").addEventListener("click", sealReveal);
    // On the day, the reveal opens by itself.
    if (Date.now() >= new Date(CONFIG.reveal.at).getTime()) showReveal(false);
}

// ============================
// SCROLL REVEAL ANIMATION
// ============================
function initScrollReveal() {
    const revealTargets = document.querySelectorAll(
        ".section-title, .ornament-divider, .photo-frame, .photo-caption, .countdown-grid, .detail-card, .map-container, .map-link, .couple-monogram, .closing-footer, .vote-kicker, .vote-sub, .vote-card, .reveal-box"
    );

    revealTargets.forEach((el) => el.classList.add("reveal"));

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const parent = entry.target.closest(".details-grid, .countdown-grid");
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
    initVote();
    initReveal();
});
