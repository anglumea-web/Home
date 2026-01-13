/* ==========================================================
   JSON DATA LOADER
========================================================== */
let CARD_CONFIG = null;

fetch("links.json")
  .then(res => res.json())
  .then(data => {
    CARD_CONFIG = data;
    buildCards();
  })
  .catch(() => {
    console.warn("links.json not found — using HTML fallback");
  });

function buildCards() {
  renderGroup("tools", "tools-slider");
  renderGroup("projects", "projects-slider");
  renderGroup("games", "games-slider");
}

function renderGroup(group, targetId) {
  const wrap = document.getElementById(targetId);
  if (!wrap || !CARD_CONFIG[group]) return;

  wrap.innerHTML = "";

  CARD_CONFIG[group].forEach((item, i) => {
    const card = document.createElement("div");
    card.className = "card" + (i === 0 ? " active" : "");
    card.textContent = item.title;
    card.dataset.link = item.url;
    wrap.appendChild(card);
  });
}

/* ==========================================================
   CORE ELEMENTS
========================================================== */
const panels = document.querySelectorAll(".panel");
const buttons = document.querySelectorAll(".core-nav button");
const track = document.querySelector(".track");
const viewport = document.querySelector(".viewport");
const arrowLeft = document.querySelector(".arrow-left");
const arrowRight = document.querySelector(".arrow-right");
const modal = document.getElementById("modal");
const modalBox = document.getElementById("modal-box");

let active = false;
let currentIndex = null;
let currentSlide = 0;

/* ==========================================================
   STATIC COPY
========================================================== */
const copy = {
  about: "Anglumea is a quiet archive of independent systems.",
  support: "Support keeps the systems alive.",
  follow: `
<div class="pen-slider">
  <div class="pen-card active">
    <div class="hologram"></div>
    <div class="pen-avatar"><img src="images/zhie.jpg"></div>
    <div class="pen-header"><span>PEN IDENTITY</span><span>ID-ZH01</span></div>
    <div class="pen-body">
      <div class="row"><span>Name</span><span>Zhie</span></div>
      <div class="row"><span>Gender</span><span>Male</span></div>
      <div class="row"><span>Occupation</span><span>Transportation</span></div>
      <div class="row"><span>Hobby</span><span>Sports</span></div>
      <div class="row"><span>Interest</span><span>Technology</span></div>
      <div class="row"><span>Location</span><span>Indonesia</span></div>
    </div>
  </div>

  <div class="pen-card">
    <div class="hologram"></div>
    <div class="pen-avatar"><img src="images/angyta.jpg"></div>
    <div class="pen-header"><span>PEN IDENTITY</span><span>ID-ANG02</span></div>
    <div class="pen-body">
      <div class="row"><span>Name</span><span>Angyta</span></div>
      <div class="row"><span>Gender</span><span>Female</span></div>
      <div class="row"><span>Occupation</span><span>Accountant</span></div>
      <div class="row"><span>Hobby</span><span>Writing</span></div>
      <div class="row"><span>Interest</span><span>Artificial Intelligence</span></div>
      <div class="row"><span>Location</span><span>Indonesia</span></div>
    </div>
  </div>
</div>

<div class="pen-nav">
  <span class="pen-dot active"></span>
  <span class="pen-dot"></span>
</div>
`
};

/* ==========================================================
   ARROWS
========================================================== */
function updateArrows() {
  const visible = active && panels[currentIndex]?.querySelectorAll(".card").length > 1;
  arrowLeft.style.display = visible ? "flex" : "none";
  arrowRight.style.display = visible ? "flex" : "none";
}

/* ==========================================================
   PANEL SYSTEM
========================================================== */
function showPanel(index) {
  currentIndex = index;
  active = true;

  panels.forEach((p, i) => {
    p.style.display = i === index ? "flex" : "none";
  });

  viewport.classList.add("active");
  viewport.style.pointerEvents = "auto";
  gsap.to(track, { opacity: 1, duration: 0.4 });

  currentSlide = 0;
  updateSlide();
  updateArrows();
}

function updateSlide() {
  const panel = panels[currentIndex];
  if (!panel) return;

  const cards = panel.querySelectorAll(".card");
  cards.forEach((c, i) => {
    const on = i === currentSlide;
    c.classList.toggle("active", on);
    gsap.to(c, {
      opacity: on ? 1 : 0,
      scale: on ? 1 : 0.92,
      duration: 0.25
    });
  });
}

function moveSlide(dir) {
  const cards = panels[currentIndex]?.querySelectorAll(".card");
  if (!cards || cards.length < 2) return;

  currentSlide = (currentSlide + dir + cards.length) % cards.length;
  updateSlide();
}

/* ==========================================================
   NAV BUTTONS
========================================================== */
buttons.forEach((btn, i) => {
  btn.addEventListener("click", e => {
    e.stopPropagation();
    showPanel(i);
  });
});

/* ==========================================================
   CLOSE PANEL
========================================================== */
document.addEventListener("click", () => {
  if (!active) return;

  active = false;
  currentIndex = null;

  viewport.classList.remove("active");
  viewport.style.pointerEvents = "none";
  panels.forEach(p => p.style.display = "none");
  gsap.to(track, { opacity: 0, duration: 0.3 });

  updateArrows();
});

panels.forEach(p => p.addEventListener("click", e => e.stopPropagation()));

/* ==========================================================
   ARROW BUTTONS
========================================================== */
arrowLeft.addEventListener("click", e => {
  e.stopPropagation();
  moveSlide(-1);
});
arrowRight.addEventListener("click", e => {
  e.stopPropagation();
  moveSlide(1);
});

/* ==========================================================
   CARD LINK NAVIGATION
========================================================== */
document.addEventListener("pointerup", e => {
  let el = e.target;

  while (el && !el.classList?.contains("card")) {
    el = el.parentElement;
  }

  if (!el || !el.dataset.link) return;

  e.stopPropagation();
  window.open(el.dataset.link, "_blank", "noopener");
});

/* ==========================================================
   MODAL
========================================================== */
document.querySelectorAll(".peripheral span").forEach(el => {
  el.addEventListener("click", e => {
    e.stopPropagation();
    modalBox.innerHTML = copy[el.dataset.modal] || "";
    modal.style.display = "flex";
  });
});

modal.addEventListener("pointerdown", e => {
  if (e.target === modal) modal.style.display = "none";
});

/* ==========================================================
   PEN TAP — DOTS
========================================================== */
modalBox.addEventListener("click", e => {
  const dot = e.target.closest(".pen-dot");
  if (!dot) return;

  const dots = modalBox.querySelectorAll(".pen-dot");
  const cards = modalBox.querySelectorAll(".pen-card");
  const index = [...dots].indexOf(dot);

  dots.forEach(d => d.classList.remove("active"));
  cards.forEach(c => c.classList.remove("active"));

  dots[index].classList.add("active");
  cards[index].classList.add("active");
});

/* ==========================================================
   PEN SWIPE — TOUCH ONLY
========================================================== */
let penStartX = 0;

modalBox.addEventListener("touchstart", e => {
  if (!e.target.closest(".pen-slider")) return;
  penStartX = e.touches[0].clientX;
}, { passive: true });

modalBox.addEventListener("touchend", e => {
  if (!e.target.closest(".pen-slider")) return;

  const endX = e.changedTouches[0].clientX;
  const delta = endX - penStartX;
  if (Math.abs(delta) < 40) return;

  const cards = modalBox.querySelectorAll(".pen-card");
  const dots = modalBox.querySelectorAll(".pen-dot");

  let index = [...cards].findIndex(c => c.classList.contains("active"));
  if (index < 0) index = 0;

  index += delta < 0 ? 1 : -1;
  index = (index + cards.length) % cards.length;

  cards.forEach(c => c.classList.remove("active"));
  dots.forEach(d => d.classList.remove("active"));

  cards[index].classList.add("active");
  dots[index].classList.add("active");
});

/* ==========================================================
   PARALLAX
========================================================== */
let px = 0, py = 0, ticking = false;

document.addEventListener("mousemove", e => {
  px = (e.clientX / window.innerWidth - 0.5) * 8;
  py = (e.clientY / window.innerHeight - 0.5) * 8;

  if (!ticking) {
    requestAnimationFrame(() => {
      gsap.to("#bg-parallax", { x: px, y: py, duration: 0.6 });
      ticking = false;
    });
    ticking = true;
  }
});

updateArrows();
