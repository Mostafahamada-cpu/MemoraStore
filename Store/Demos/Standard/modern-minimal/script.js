/* ===========================
   WEDDING INVITATION - SCRIPT
   =========================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

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
    displayDate: "October 7, 2026",
    ceremonyTime: "8:00 PM",
    ceremonyVenue: "La beau garden",
    ceremonyAddress: "La beau garden Sheikh Zayed, Giza",
    receptionTime: "7:00 PM",
    receptionVenue: "La beau garden",
    receptionAddress: "La beau garden Sheikh Zayed, Giza",
    // FIXED: Clean Embed Link URL only! No iframe HTML tags here.
    googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3452.123!2d30.9876!3d30.0123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDAwJzQ0LjMiTiAzMMKwNTknMTUuNCJF!5e0!3m2!1sen!2seg!4v1600000000000",
    googleMapsLink: "https://maps.google.com/?q=La+beau+garden+Sheikh+Zayed+Giza",
    rsvpPassword: "love2026"
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
        ".section-title, .ornament-divider, .countdown-grid, .detail-card, .map-container, .map-link, .closing-ornament, .closing-message, .couple-monogram, .closing-footer"
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
// RSVP FORM HANDLING
// ============================
// ============================
// RSVP FORM HANDLING
// ============================
function initRsvpForm() {
    const form = document.getElementById("rsvp-form");
    if (!form) return;

    const nameInput = document.getElementById("rsvp-name");
    const guestsInput = document.getElementById("rsvp-guests");
    const messageInput = document.getElementById("rsvp-message");
    const feedback = document.getElementById("rsvp-feedback");
    const charCount = document.getElementById("rsvp-char-count");
    
    // New Elements
    const attendHidden = document.getElementById("rsvp-attend-hidden");
    const pillYes = document.getElementById("pill-yes");
    const pillNo = document.getElementById("pill-no");
    const pillSlider = document.getElementById("pill-slider");
    const submitBtn = document.getElementById("rsvp-submit");
    
    const successCard = document.getElementById("rsvp-success-card");
    const successTitle = document.getElementById("success-title");
    const successMessage = document.getElementById("success-message");
    const editBtn = document.getElementById("rsvp-edit-btn");

    // Load saved response
    const saved = localStorage.getItem("rsvp_response");
    if (saved) {
        try {
            const obj = JSON.parse(saved);
            if (obj.name) nameInput.value = obj.name;
            if (obj.guests) guestsInput.value = obj.guests;
            if (obj.message) messageInput.value = obj.message;
            if (obj.attend) {
                setAttendValue(obj.attend);
            }
            
            feedback.textContent = "We have your previous response saved. You may update it.";

            // If already submitted, hide form and show success card
            const savedDocId = localStorage.getItem("rsvp_doc_id");
            if (savedDocId) {
                form.style.display = "none";
                successCard.style.display = "block";
                
                if (obj.attend === "yes") {
                    successTitle.textContent = "We Can't Wait!";
                    successMessage.textContent = `Thank you, ${obj.name}. Your response is saved!`;
                } else {
                    successTitle.textContent = "You'll Be Missed";
                    successMessage.textContent = `Thank you for letting us know, ${obj.name}.`;
                }
            }
        } catch (e) {
            console.warn(e);
        }
    }

    function setAttendValue(val) {
        attendHidden.value = val;
        pillYes.classList.remove("selected");
        pillNo.classList.remove("selected");
        pillSlider.classList.add("active");
        
        if (val === "yes") {
            pillYes.classList.add("selected");
            pillSlider.classList.remove("slide-right");
            if(guestsInput) guestsInput.parentElement.parentElement.style.display = 'block';
        } else if (val === "no") {
            pillNo.classList.add("selected");
            pillSlider.classList.add("slide-right");
            if(guestsInput) guestsInput.parentElement.parentElement.style.display = 'none';
        }
    }

    if (pillYes) pillYes.addEventListener("click", () => setAttendValue("yes"));
    if (pillNo) pillNo.addEventListener("click", () => setAttendValue("no"));

    // Char count
    const MAX_CHARS = 300;
    if (charCount) {
        const updateCount = () => {
            const len = messageInput.value.length;
            charCount.textContent = `${len} / ${MAX_CHARS}`;
            charCount.style.color = len > MAX_CHARS ? "#D46B78" : "";
            if (len > MAX_CHARS) messageInput.classList.add("input-error");
            else messageInput.classList.remove("input-error");
        };
        messageInput.addEventListener("input", updateCount);
        updateCount();
    }

    // Edit button
    if (editBtn) {
        editBtn.addEventListener("click", () => {
            successCard.style.display = "none";
            form.style.display = "block";
            form.style.animation = "formReveal 0.6s ease forwards";
        });
    }

    form.addEventListener("submit", async (ev) => {
        ev.preventDefault();

        const name = nameInput.value.trim();
        const attend = attendHidden.value;
        const guests = guestsInput ? guestsInput.value.trim() : "";
        const message = messageInput.value.trim();

        let hasError = false;
        if (!name) {
            feedback.textContent = "Please enter your name.";
            nameInput.classList.add("input-error");
            nameInput.focus();
            hasError = true;
        } else {
            nameInput.classList.remove("input-error");
        }

        if (!attend) {
            if (!hasError) feedback.textContent = "Please select whether you'll attend.";
            document.getElementById("pill-toggle").style.boxShadow = "0 0 0 3px rgba(212, 107, 120, 0.3)";
            setTimeout(() => {
                const pt = document.getElementById("pill-toggle");
                if (pt) pt.style.boxShadow = "";
            }, 2000);
            hasError = true;
        }

        if (message.length > MAX_CHARS) {
            feedback.textContent = `Message is too long (max ${MAX_CHARS} characters).`;
            hasError = true;
        }

        if (attend === "yes" && guestsInput && (!guests || guests < 1)) {
            feedback.textContent = "Please enter a valid number of guests.";
            guestsInput.classList.add("input-error");
            guestsInput.focus();
            hasError = true;
        } else if (guestsInput) {
            guestsInput.classList.remove("input-error");
        }

        if (hasError) return;

        const payload = {
            name,
            attend,
            guests: attend === "yes" ? guests : 0,
            message,
            timestamp: new Date().toISOString(),
        };

        submitBtn.disabled = true;
        submitBtn.classList.add("loading");
        feedback.textContent = "";

        // Save request
        try {
            // Save locally so the guest remembers their response
            localStorage.setItem("rsvp_response", JSON.stringify(payload));
            
            const savedDocId = localStorage.getItem("rsvp_doc_id");
            if (savedDocId) {
                // Update existing Firestore document
                await setDoc(doc(db, "rsvps", savedDocId), payload);
            } else {
                // Save to Firestore as new document
                const docRef = await addDoc(collection(db, "rsvps"), payload);
                localStorage.setItem("rsvp_doc_id", docRef.id);
            }

            // Show success UI
            form.style.display = "none";
            successCard.style.display = "block";
            
            if (attend === "yes") {
                successTitle.textContent = "We Can't Wait!";
                successMessage.textContent = `Thank you, ${name}. We're thrilled to celebrate with you!`;
                triggerConfetti();
            } else {
                successTitle.textContent = "You'll Be Missed";
                successMessage.textContent = `Thank you for letting us know, ${name}. We'll miss you!`;
            }
            
        } catch (e) {
            console.error("Error adding document: ", e);
            feedback.textContent = "Sorry — could not save your response. Please try again.";
        } finally {
            // Reset form state slightly
            submitBtn.classList.remove("loading");
            submitBtn.disabled = false;
        }
    });
}

// ============================
// CONFETTI SYSTEM
// ============================
function triggerConfetti() {
    const container = document.getElementById("confetti-container");
    if (!container) return;
    
    container.innerHTML = "";
    container.setAttribute("aria-hidden", "false");
    
    const colors = ["#FFC857", "#FF9DA0", "#6EC1E4", "#D4A39A", "#FFFDF7"];
    const pieces = 70;
    
    for (let i = 0; i < pieces; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti-piece";
        
        // Random properties
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100 + "vw";
        const delay = Math.random() * 0.5 + "s";
        const duration = Math.random() * 2 + 2 + "s";
        const rotation = Math.random() * 720 - 360 + "deg";
        
        piece.style.backgroundColor = color;
        piece.style.left = left;
        piece.style.setProperty('--delay', delay);
        piece.style.setProperty('--duration', duration);
        piece.style.setProperty('--rotation', rotation);
        
        // Random shapes
        if (Math.random() > 0.5) piece.style.borderRadius = "50%";
        if (Math.random() > 0.8) {
            piece.style.width = "6px";
            piece.style.height = "16px";
        }
        
        container.appendChild(piece);
    }
    
    // Clean up after animation
    setTimeout(() => {
        container.innerHTML = "";
        container.setAttribute("aria-hidden", "true");
    }, 4000);
}

// ============================
// RSVP MANAGER
// ============================
function initRsvpManager() {
    const modal = document.getElementById("rsvp-modal");
    const closeBtn = document.getElementById("rsvp-modal-close");
    const pwSubmit = document.getElementById("rsvp-password-submit");
    const pwInput = document.getElementById("rsvp-manager-password");
    const pwFeedback = document.getElementById("rsvp-password-feedback");
    const submissionsList = document.getElementById("submissions-list");
    const submissionsView = document.getElementById("submissions-view");
    const passwordArea = document.getElementById("rsvp-password-area");
    const exportBtn = document.getElementById("export-csv");

    function openModal() {
        if (!modal) return;
        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");
        pwInput.focus();
    }

    function closeModal() {
        if (!modal) return;
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
        pwInput.value = "";
        pwFeedback.textContent = "";
        submissionsView.style.display = "none";
        passwordArea.style.display = "block";
        submissionsList.innerHTML = "";
    }

    async function getSubmissions() {
        try {
            const q = query(collection(db, "rsvps"), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);
            const submissions = [];
            querySnapshot.forEach((doc) => {
                submissions.push({ id: doc.id, ...doc.data() });
            });
            return submissions;
        } catch (e) {
            console.error("Error fetching submissions: ", e);
            return [];
        }
    }

    function updateStats(all) {
        const elTotal = document.getElementById("stat-total");
        const elAttending = document.getElementById("stat-attending");
        const elDeclined = document.getElementById("stat-declined");
        
        if (!elTotal) return;
        
        let attending = 0;
        let declined = 0;
        
        all.forEach(s => {
            if (s.attend === "yes") {
                attending++;
            } else {
                declined++;
            }
        });
        
        elTotal.textContent = all.length;
        elAttending.textContent = attending;
        elDeclined.textContent = declined;
    }

    async function renderSubmissions() {
        submissionsList.innerHTML = "<div style='text-align:center; padding: 20px; color: var(--color-taupe);'>Loading...</div>";
        const all = await getSubmissions();
        submissionsList.innerHTML = "";
        
        updateStats(all);
        
        if (all.length === 0) {
            submissionsList.innerHTML = "<div style='text-align:center; padding: 20px; color: var(--color-taupe);'>No submissions yet.</div>";
            return;
        }
        
        all.forEach((s) => {
            const card = document.createElement("div");
            card.className = "rsvp-card";
            
            const meta = document.createElement("div");
            meta.className = "meta";
            meta.innerHTML = `<div><strong>${escapeHtml(s.name)}</strong></div><div style="font-size:0.8rem;color:var(--color-taupe)">${new Date(s.timestamp).toLocaleString()}</div>`;
            
            const right = document.createElement("div");
            right.style.display = "flex";
            right.style.alignItems = "center";
            
            const isAttending = s.attend === 'yes';
            let html = `<div class="attend ${isAttending ? 'attending' : 'declined'}">${isAttending ? `Attending (${s.guests || 1})` : 'Declined'}</div>`;
            right.innerHTML = html;
            
            card.appendChild(meta);
            card.appendChild(right);
            
            if (s.message) {
                const note = document.createElement("div");
                note.style.width = "100%";
                note.style.marginTop = "8px";
                note.style.paddingTop = "8px";
                note.style.borderTop = "1px solid rgba(0,0,0,0.05)";
                note.style.fontSize = "0.9rem";
                note.style.color = "var(--color-charcoal-light)";
                note.textContent = s.message;
                card.appendChild(note);
            }
            submissionsList.appendChild(card);
        });
    }

    async function exportCSV() {
        const rows = await getSubmissions();
        if (!rows || rows.length === 0) return;
        const hdr = ["name", "attend", "guests", "message", "timestamp"];
        const csvRows = [hdr.join(",")];
        rows.forEach(r => {
            const cols = [
                r.name, 
                r.attend,
                r.guests,
                r.message, 
                r.timestamp
            ].map(c => `"${String(c||"").replace(/"/g,'""')}"`);
            csvRows.push(cols.join(","));
        });
        const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rsvp_submissions_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    const manageBtn = document.getElementById('manage-rsvps-btn');
    if (manageBtn) manageBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (pwSubmit) pwSubmit.addEventListener('click', (e) => {
        e.preventDefault();
        if (pwInput.value === CONFIG.rsvpPassword) {
            passwordArea.style.display = 'none';
            submissionsView.style.display = 'block';
            renderSubmissions();
            pwFeedback.textContent = '';
        } else {
            pwFeedback.textContent = 'Incorrect password.';
        }
    });
    
    // Add Enter key support for password
    if (pwInput) pwInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') pwSubmit.click();
    });
    
    if (exportBtn) exportBtn.addEventListener('click', exportCSV);
}

function escapeHtml(s) { 
    return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[m]); 
}

// ============================
// INITIALIZATION
// ============================
document.addEventListener("DOMContentLoaded", () => {
    populateContent();
    initRsvpForm();
    initRsvpManager();
});