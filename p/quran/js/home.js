document.addEventListener("DOMContentLoaded", () => {  
  
  /* ================= PAGE GUARD ================= */  
  if (!document.body.classList.contains("page-reader")) return;  
  
  /* ===== AUDIO URL GENERATOR ===== */  
  function pad3(n){  
    return String(n).padStart(3,"0");  
  }  
  
  function getAyatAudioUrl(surah, ayat){  
    return `https://everyayah.com/data/aziz_alili_128kbps/${pad3(surah)}${pad3(ayat)}.mp3`;  
  }  
  
  const params = new URLSearchParams(location.search);  
  const surah = Number(params.get("surah"));  
  
  const ayatDiv = document.getElementById("ayat");  
  const surahTitle = document.getElementById("surahTitle");  
  
  const prevBtn = document.getElementById("prevSurah");  
  const nextBtn = document.getElementById("nextSurah");  
  const playBtn = document.getElementById("playSurah");  
  
  const toggle = document.getElementById("toggleArti");  
  const sidebar = document.getElementById("sidebar");  
  const toggleSidebar = document.getElementById("toggleSidebar");  
  const closeSidebar = document.getElementById("closeSidebar");  
  const overlay = document.getElementById("overlay");  
  
  const themeButtons = document.querySelectorAll(".theme-options button");  
  const bookmarkListEl = document.getElementById("bookmarkList");  
  const clearBookmarksBtn = document.getElementById("clearBookmarks");  
  
  if (!ayatDiv) return;  
  
  if (!surah || isNaN(surah)) {  
    ayatDiv.innerHTML = "<p>Surah tidak valid</p>";  
    return;  
  }  
  
  /* ================= THEME ================= */  
  const THEMES=["theme-light","theme-dark","theme-sepia","theme-paper"];  
  document.body.classList.remove(...THEMES);  
  document.body.classList.add(localStorage.getItem("theme")||"theme-paper");  
  
  themeButtons.forEach(btn=>{  
    btn.onclick=()=>{  
      document.body.classList.remove(...THEMES);  
      document.body.classList.add(btn.dataset.theme);  
      localStorage.setItem("theme",btn.dataset.theme);  
    };  
  });  
  
  
/* ================= LANGUAGE ================= */  
  
const LANGS = ["id","Eng","Jpn","Kor","Fra"];  
let currentLang = localStorage.getItem("lang") || "id";  
  
document.querySelectorAll(".language-options button")  
.forEach(btn=>{  
  if(btn.dataset.lang === currentLang){  
    btn.classList.add("active");  
  }  
  
  btn.onclick = ()=>{  
    currentLang = btn.dataset.lang;  
    localStorage.setItem("lang", currentLang);  
  
    document.querySelectorAll(".language-options button")  
      .forEach(b=>b.classList.remove("active"));  
  
    btn.classList.add("active");  
  
    loadSurah(surah, false); // OPTIMIZED (no arab reload)
  };  
});  
  
  
  /* ================= SIDEBAR ================= */  
  toggleSidebar?.addEventListener("click",()=>{  
    overlay.classList.remove("hidden");  
    sidebar.style.pointerEvents="auto";  
    gsap?.to(sidebar,{right:0,duration:.25});  
  });  
  
  function closeSidebarFn(){  
    gsap?.to(sidebar,{  
      right:"-100vw",  
      duration:.25,  
      onComplete:()=>sidebar.style.pointerEvents="none"  
    });  
    overlay.classList.add("hidden");  
  }  
  
  closeSidebar?.addEventListener("click",closeSidebarFn);  
  overlay?.addEventListener("click",closeSidebarFn);  
  
  /* ================= BOOKMARK ================= */  
  function getBookmarks(){  
    try{return JSON.parse(localStorage.getItem("bookmarks")||"[]")}  
    catch{return[]}  
  }  
  
  function saveBookmarks(b){  
    localStorage.setItem("bookmarks",JSON.stringify(b));  
  }  
  
  function updateBookmarkList(){  
    const arr=getBookmarks();  
    bookmarkListEl.innerHTML=arr.length?"":"Belum ada";  
  
    arr.forEach((b,i)=>{  
      const d=document.createElement("div");  
      d.className="bookmark-item";  
  
      d.innerHTML=`  
        <a href="home.html?surah=${b.surah}">Surah ${b.surah} • ayat ${b.ayat}</a>  
        <button class="btn-ghost">Hapus</button>  
      `;  
  
      d.querySelector("button").onclick=e=>{  
        e.stopPropagation();  
        arr.splice(i,1);  
        saveBookmarks(arr);  
        updateBookmarkList();  
      };  
  
      bookmarkListEl.appendChild(d);  
    });  
  }  
  
  clearBookmarksBtn?.addEventListener("click",()=>{  
    localStorage.removeItem("bookmarks");  
    updateBookmarkList();  
  });  
  
    
  /* ================= LAST READ ================= */  
  
const lastReadEl = document.getElementById("lastRead");  
  
function updateLastRead(){  
  if(!lastReadEl) return;  
  
  const data = localStorage.getItem("lastRead");  
  
  if(!data){  
    lastReadEl.textContent = "Belum ada";  
    return;  
  }  
  
  try{  
    const r = JSON.parse(data);  
  
    lastReadEl.innerHTML = `  
      <a href="home.html?surah=${r.surah}">  
        Surah ${r.surah} • Ayat ${r.ayat}  
      </a>  
    `;  
  }catch{  
    lastReadEl.textContent="Belum ada";  
  }  
}  
  
  
  /* ================= LOAD SURAH (OPTIMIZED) ================= */  

  let ayatData=[];  
  let rendered=0;  
  const BATCH=20;  

  let arabCache=null;  
  let translationCache={};  
  let tafsirCache=null;  

async function loadSurah(n, forceReloadArab=true){  
  try{  

    /* ===== LOAD ARAB ONCE ===== */  
    if(!arabCache || forceReloadArab){  
      const arabRes = await fetch(`./surah/${n}.json`);  
      if(!arabRes.ok) throw new Error("File surah tidak ditemukan");  
      arabCache = await arabRes.json();  

      if (surahTitle){  
        surahTitle.textContent =  
          `${arabCache.name_latin} (${arabCache.name}) • ${arabCache.number_of_ayah} Ayat`;  
      }  

      ayatData = Object.keys(arabCache.text).map(no => ({  
        no,  
        text: arabCache.text[no],  
        terjemah: "",  
        tafsir: ""  
      }));  

      ayatDiv.innerHTML="";  
      rendered=0;  
      renderNext();  
    }  

    /* ===== LOAD TRANSLATION CACHE ===== */  
    if(!translationCache[currentLang]){  
      try{  
        const trRes = await fetch(`./translations/${currentLang}/${n}.json`);  
        if(trRes.ok)  
          translationCache[currentLang] = await trRes.json();  
      }catch{}  
    }  

    const translation = translationCache[currentLang];  

    if(translation){  
      document.querySelectorAll(".ayat").forEach(el=>{  
        const no = el.querySelector(".no")?.textContent;  
        const arti = el.querySelector(".arti");  
        if(arti) arti.textContent = translation.text?.[no] || "";  
      });  
    }  

    /* ===== LOAD TAFSIR ONCE ===== */  
    if(!tafsirCache){  
      try{  
        const tfRes = await fetch(`./tafsir/id/${n}.json`);  
        if(tfRes.ok) tafsirCache = await tfRes.json();  
      }catch{}  
    }  

    updateBookmarkList();  
    updateLastRead();  

  }catch(err){  
    console.error(err);  
    ayatDiv.innerHTML="<p>Gagal memuat surah</p>";  
  }  
}  
  
  function renderNext(){  
    ayatData.slice(rendered,rendered+BATCH).forEach(a=>{  
      const el=document.createElement("article");  
      el.className="ayat";  
  
      const audioUrl=getAyatAudioUrl(surah,a.no);  
  
      el.innerHTML=`  
        <div class="arab">  
          <span class="no">${a.no}</span>  
          ${a.text}  
          <button class="audio-btn" data-audio="${audioUrl}">🔊</button>  
        </div>  
        <div class="arti"></div>  
      `;  
  
      ayatDiv.appendChild(el);  
    });  
  
    rendered+=BATCH;  
  }  
  
  window.addEventListener("scroll",()=>{  
    if(innerHeight+scrollY>document.body.offsetHeight-250){  
      renderNext();  
    }  
  });  
  
  loadSurah(surah, true);  
  
  
  /* ================= NAV SURAH ================= */
  prevBtn?.addEventListener("click",()=>{
    if(surah>1)
      location.href=`home.html?surah=${surah-1}`;
  });

  nextBtn?.addEventListener("click",()=>{
    if(surah<114)
      location.href=`home.html?surah=${surah+1}`;
  });

  /* ================= TOGGLE TERJEMAH ================= */
  toggle?.addEventListener("click",e=>{
    e.preventDefault();
    document.body.classList.toggle("hide-translation");
  });

  /* ================= AUDIO SINGLE ================= */
  const audio=new Audio();
  let activeBtn=null;

  document.addEventListener("click",e=>{
    const btn=e.target.closest(".audio-btn");
    if(!btn) return;

    if(audio.src===btn.dataset.audio&&!audio.paused){
      audio.pause();
      btn.textContent="🔊";
      return;
    }

    if(activeBtn) activeBtn.textContent="🔊";

    audio.src=btn.dataset.audio;
    audio.play().catch(()=>alert("Audio tidak tersedia"));

    btn.textContent="⏸";
    activeBtn=btn;
  });

  audio.onended=()=>activeBtn&&(activeBtn.textContent="🔊");

  /* ================= PLAY FULL SURAH ================= */
  let playIndex=0;
  let playingAll=false;

  playBtn?.addEventListener("click",()=>{
    if(!ayatData.length) return;

    playingAll=true;
    playIndex=0;
    playNextAyat();
  });

  function playNextAyat(){
    if(!playingAll || playIndex>=ayatData.length){
      playingAll=false;
      playBtn.textContent="▶ Putar";
      return;
    }

    const a=ayatData[playIndex];
    audio.src=getAyatAudioUrl(surah,a.no);
    audio.play();

    playBtn.textContent=`⏸ Ayat ${a.no}`;
    playIndex++;
  }

  audio.addEventListener("ended",()=>{
    if(playingAll) playNextAyat();
  });




/* ================= LONG PRESS MENU (STABLE) ================= */

const ayatMenu = document.getElementById("ayatMenu");

let pressTimer = null;
let selectedAyat = null;
let longPressActive = false;
let ignoreNextClick = false;

const HOLD_TIME = 600; // ms


/* ===== POINTER DOWN ===== */
ayatDiv.addEventListener("pointerdown", e => {

  const ayatEl = e.target.closest(".ayat");
  if (!ayatEl) return;

  // jangan aktif kalau klik tombol audio
  if (e.target.closest(".audio-btn")) return;

  longPressActive = false;

  pressTimer = setTimeout(() => {
    longPressActive = true;
    ignoreNextClick = true;

    selectedAyat = ayatEl;
    ayatMenu.classList.remove("hidden");
  }, HOLD_TIME);

});


/* ===== CANCEL HOLD ===== */
ayatDiv.addEventListener("pointermove", () => {
  clearTimeout(pressTimer);
});

ayatDiv.addEventListener("pointerup", () => {
  clearTimeout(pressTimer);
});

ayatDiv.addEventListener("pointercancel", () => {
  clearTimeout(pressTimer);
});


/* ===== BLOCK CLICK AFTER LONG PRESS ===== */
ayatDiv.addEventListener("click", e => {
  if (longPressActive) {
    e.preventDefault();
    e.stopPropagation();
    longPressActive = false;
  }
});


/* ===== CLICK OUTSIDE ===== */
document.addEventListener("click", e => {

  if (ignoreNextClick) {
    ignoreNextClick = false;
    return;
  }

  if (!e.target.closest("#ayatMenu")) {
    ayatMenu.classList.add("hidden");
  }
});



/* ================= JUMP TO AYAT ================= */

const jumpInput = document.getElementById("jumpInput");
const jumpBtn   = document.getElementById("jumpBtn");

function jumpToAyat(no){

  no = Number(no);
  if(!no || no < 1) return;

  // cari ayat yang sudah dirender
  let target = [...document.querySelectorAll(".ayat")]
    .find(a => a.querySelector(".no")?.textContent == no);

  // kalau belum dirender → render batch sampai ketemu
  while(!target && rendered < ayatData.length){
    renderNext();
    target = [...document.querySelectorAll(".ayat")]
      .find(a => a.querySelector(".no")?.textContent == no);
  }

  if(!target){
    alert("Ayat tidak ditemukan");
    return;
  }

  // scroll smooth
  target.scrollIntoView({
    behavior:"smooth",
    block:"center"
  });

  // highlight
  target.classList.add("jump-highlight");
  setTimeout(()=>target.classList.remove("jump-highlight"),1200);

  // tutup sidebar
  closeSidebarFn?.();
}

jumpBtn?.addEventListener("click",()=>{
  jumpToAyat(jumpInput.value);
});

jumpInput?.addEventListener("keypress",e=>{
  if(e.key==="Enter")
    jumpToAyat(jumpInput.value);
});

/* ================= AYAT MENU ACTION ================= */

ayatMenu?.addEventListener("click", e => {

  const action = e.target.dataset.action;
  if (!action || !selectedAyat) return;

  const ayatNo = selectedAyat.querySelector(".no")?.textContent;

  if (!ayatNo) return;

  /* ===== BOOKMARK ===== */
  if (action === "bookmark") {

    const arr = getBookmarks();

    arr.push({
      surah: surah,
      ayat: ayatNo
    });

    saveBookmarks(arr);
    updateBookmarkList();

    alert(`Bookmark ditambahkan (Ayat ${ayatNo})`);
  }

  /* ===== LAST READ ===== */
  if (action === "lastread") {

    localStorage.setItem("lastRead", JSON.stringify({
      surah: surah,
      ayat: ayatNo
    }));

    updateLastRead();
    alert(`Ditandai terakhir dibaca (Ayat ${ayatNo})`);
  }

  /* ===== SHARE ===== */
  if (action === "share") {

    const text = `Surah ${surah} Ayat ${ayatNo}\n${location.href}`;

    if (navigator.share) {
      navigator.share({
        title: "Al-Qur'an",
        text: text,
        url: location.href
      }).catch(()=>{});
    } else {
      navigator.clipboard.writeText(text);
      alert("Link disalin ke clipboard");
    }
  }

  ayatMenu.classList.add("hidden");
});
});
