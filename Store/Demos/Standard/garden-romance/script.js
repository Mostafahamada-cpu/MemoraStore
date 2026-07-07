/* ===========================
   COLORFUL WEDDING INVITATION - SCRIPT
   =========================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDs1HJCTv-wnF238WvuQN45V2zZCZ9FNuA",
  authDomain: "ro-wedding-inv1.firebaseapp.com",
  projectId: "ro-wedding-inv1",
  storageBucket: "ro-wedding-inv1.firebasestorage.app",
  messagingSenderId: "181082894081",
  appId: "1:181082894081:web:a18ba3e75a101801767500",
  measurementId: "G-J4795J0HRW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================
// CONFIGURATION
// ============================
const CONFIG = {
    groomName: "Omar",
    brideName: "Rowan",
    weddingDate: "2026-10-07T17:00:00",  
    displayDate: "October 7th, 2026",
    ceremonyTime: "8:00 PM",
    ceremonyLocation: "La beau garden Sheikh Zayed, Giza",
    receptionTime: "7:00 PM",
    receptionLocation: "La beau garden Sheikh Zayed, Giza",
    googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3452.123!2d30.9876!3d30.0123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDAwJzQ0LjMiTiAzMMKwNTknMTUuNCJF!5e0!3m2!1sen!2seg!4v1600000000000",
    googleMapsLink: "https://maps.google.com/?q=La+beau+garden+Sheikh+Zayed+Giza",
    rsvpDeadline: "September 15, 2026"
};

// ============================
// POPULATE CONTENT
// ============================
function populateContent() {
    document.getElementById("groom-name").textContent = CONFIG.groomName;
    document.getElementById("bride-name").textContent = CONFIG.brideName;
    document.getElementById("wedding-date-display").textContent = CONFIG.displayDate;
    
    document.getElementById("ceremony-time").textContent = CONFIG.ceremonyTime;
    document.getElementById("ceremony-location").textContent = CONFIG.ceremonyLocation;
    
    document.getElementById("reception-time").textContent = CONFIG.receptionTime;
    document.getElementById("reception-location").textContent = CONFIG.receptionLocation;

    document.getElementById("google-map").src = CONFIG.googleMapsEmbed;
    document.getElementById("map-directions-link").href = CONFIG.googleMapsLink;

    const rsvpDeadlineEl = document.getElementById("rsvp-deadline-date");
    if(rsvpDeadlineEl) rsvpDeadlineEl.textContent = CONFIG.rsvpDeadline;

    document.title = `${CONFIG.groomName} & ${CONFIG.brideName} | Wedding Invitation`;
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
    openBtn.style.transform = "translateY(20px) scale(0.9)";
    openBtn.style.pointerEvents = "none";

    setTimeout(() => {
        envelopeWrapper.style.opacity = "0";
        setTimeout(() => {
            envelopeWrapper.style.display = "none";
            invitation.classList.remove("hidden");
            requestAnimationFrame(() => {
                initScrollReveal();
            });
        }, 1500);
    }, 1500);
}

if (openBtn) {
    openBtn.addEventListener("click", openEnvelope);
}
if (envelopeContainer) {
    envelopeContainer.addEventListener("click", openEnvelope);
}

// ============================
// COUNTDOWN TIMER
// ============================
function initCountdown() {
    const countDownDate = new Date(CONFIG.weddingDate).getTime();
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    if(!daysEl) return;

    const x = setInterval(function() {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        if (distance < 0) {
            clearInterval(x);
            daysEl.textContent = "00";
            hoursEl.textContent = "00";
            minutesEl.textContent = "00";
            secondsEl.textContent = "00";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysEl.textContent = days < 10 ? "0" + days : days;
        hoursEl.textContent = hours < 10 ? "0" + hours : hours;
        minutesEl.textContent = minutes < 10 ? "0" + minutes : minutes;
        secondsEl.textContent = seconds < 10 ? "0" + seconds : seconds;
    }, 1000);
}

// ============================
// SCROLL REVEAL
// ============================
function initScrollReveal() {
    const sections = document.querySelectorAll('.section-wrapper');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        observer.observe(section);
    });
}

// ============================
// RSVP FORM SUBMISSION
// ============================
const rsvpForm = document.getElementById('rsvp-form');
if (rsvpForm) {
    rsvpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = rsvpForm.querySelector('.submit-btn');
        const formMessage = document.getElementById('form-message');
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending... 💖';
        formMessage.classList.add('hidden');
        
        const formData = {
            name: document.getElementById('guest-name').value,
            attendance: document.getElementById('attendance').value,
            guestsCount: parseInt(document.getElementById('guests-count').value) || 1,
            dietary: document.getElementById('dietary').value || 'None',
            timestamp: new Date().toISOString()
        };

        try {
            await addDoc(collection(db, "rsvps"), formData);
            
            formMessage.textContent = 'Thank you! Can\'t wait to see you there! 🎉';
            formMessage.className = 'success';
            formMessage.classList.remove('hidden');
            rsvpForm.reset();
            
        } catch (error) {
            console.error("Error adding document: ", error);
            formMessage.textContent = 'Oops! Something went wrong. Please try again.';
            formMessage.className = 'error';
            formMessage.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send RSVP';
        }
    });
}

// Toggle guests count based on attendance
const attendanceSelect = document.getElementById('attendance');
const guestsGroup = document.getElementById('guests-group');
if(attendanceSelect && guestsGroup) {
    attendanceSelect.addEventListener('change', (e) => {
        if (e.target.value === 'not-attending') {
            guestsGroup.style.display = 'none';
        } else {
            guestsGroup.style.display = 'block';
        }
    });
}

// ============================
// INIT
// ============================
document.addEventListener("DOMContentLoaded", () => {
    populateContent();
    initCountdown();
});
