/* ===========================
   MEMORA DEMO — Lina Turns Five — Birthday Invitation
   Based on the Modern Minimal (Without RSVP) template.
   =========================== */

// ============================
// CONFIGURATION — EDIT ME
// ============================
const CONFIG = {
    nameA: "Lina",
    nameB: "Five",
    eventDate: "2026-12-05T16:00:00",
    displayDate: "December 5, 2026",
    card1: { time: "4:00 PM", venue: "Family Park", address: "New Cairo" },
    card2: { time: "6:00 PM", venue: "Family Park", address: "Garden Pavilion, New Cairo" },
    googleMapsEmbed: "https://www.google.com/maps?q=Family+Park+New+Cairo&output=embed",
    googleMapsLink: "https://www.google.com/maps?q=Family+Park+New+Cairo",
    monogram: ["L", "5"],
    pageTitle: "Lina Turns Five — Birthday Invitation",
    footerText: "We can't wait to celebrate with you — Lina & Family"
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
// SCROLL REVEAL ANIMATION
// ============================
function initScrollReveal() {
    const revealTargets = document.querySelectorAll(
        ".section-title, .ornament-divider, .photo-frame, .photo-caption, .countdown-grid, .detail-card, .map-container, .map-link, .couple-monogram, .closing-footer"
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
});
