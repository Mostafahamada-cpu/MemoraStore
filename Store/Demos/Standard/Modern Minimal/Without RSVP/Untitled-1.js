/* ===========================
   WEDDING INVITATION - SCRIPT
   =========================== */

// ============================
// CONFIGURATION
// ============================
const CONFIG = {
    groomName: "Omar",
    brideName: "Rowan",
    weddingDate: "2026-10-07T17:00:00",  
    displayDate: "October 7, 2026",
    ceremonyTime: "8:00 PM",
    ceremonyVenue: "La beau garden",
    ceremonyAddress: "La beau garden Sheikh Zayed, Giza",
    receptionTime: "7:00 PM",
    receptionVenue: "La beau garden",
    receptionAddress: "La beau garden Sheikh Zayed, Giza",
    // FIXED: Clean Embed Link URL only! No iframe HTML tags here.
    googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3452.123!2d30.9876!3d30.0123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDAwJzQ0LjMiTiAzMMKwNTknMTUuNCJF!5e0!3m2!1sen!2seg!4v1600000000000",
    googleMapsLink: "https://maps.google.com/?q=La+beau+garden+Sheikh+Zayed+Giza"
};

// ============================
// POPULATE CONTENT FROM CONFIG
// ============================
function populateContent() {
    document.getElementById("groom-name").textContent = CONFIG.groomName;
    document.getElementById("bride-name").textContent = CONFIG.brideName;
    document.getElementById("wedding-date-display").textContent = CONFIG.displayDate;
    document.getElementById("ceremony-time").textContent = CONFIG.ceremonyTime;
    document.getElementById("ceremony-venue").textContent = CONFIG.ceremonyVenue;
    document.getElementById("ceremony-address").textContent = CONFIG.ceremonyAddress;
    document.getElementById("reception-time").textContent = CONFIG.receptionTime;
    document.getElementById("reception-venue").textContent = CONFIG.receptionVenue;
    document.getElementById("reception-address").textContent = CONFIG.receptionAddress;
    
    // Fixed assignment
    document.getElementById("google-map").src = CONFIG.googleMapsEmbed;
    document.getElementById("map-directions-link").href = CONFIG.googleMapsLink;

    // FIXED: Dynamic Footer Sync
    document.getElementById("groom-name-footer").textContent = CONFIG.groomName;
    document.getElementById("bride-name-footer").textContent = CONFIG.brideName;

    // Set monogram initials
    document.getElementById("groom-initial").textContent = CONFIG.groomName.charAt(0);
    document.getElementById("bride-initial").textContent = CONFIG.brideName.charAt(0);

    // Update page title
    document.title = `${CONFIG.groomName} & ${CONFIG.brideName} — Wedding Invitation`;
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

if(openBtn) openBtn.addEventListener("click", openEnvelope);
if(envelopeContainer) envelopeContainer.addEventListener("click", openEnvelope);

// ============================
// COUNTDOWN TIMER
// ============================
function updateCountdown() {
    const weddingDate = new Date(CONFIG.weddingDate).getTime();
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
        document.getElementById("days").textContent = "00";
        document.getElementById("hours").textContent = "00";
        document.getElementById("minutes").textContent = "00";
        document.getElementById("seconds").textContent = "00";
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
        ".section-title, .ornament-divider, .countdown-grid, .detail-card, .map-container, .map-link, .couple-monogram, .closing-footer"
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