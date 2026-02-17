// js/index.js
document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("surahList");
  const search = document.getElementById("search");

  if (!list) return;

  fetch("./data/index.json")
    .then(res => {
      if (!res.ok) throw new Error("data/index.json tidak ditemukan");
      return res.json();
    })
    .then(data => {
      list.innerHTML = "";

      data.forEach(s => {
        const item = document.createElement("a");
        item.href = `home.html?surah=${s.number}`;
        item.className = "surah-item";

        item.innerHTML = `
          <div class="surah-no">${s.number}</div>
          <div class="surah-info">
            <strong>${s.name_latin}</strong>
            <small>${s.name} • ${s.number_of_ayah} Ayat</small>
          </div>
        `;

        list.appendChild(item);
      });
    })
    .catch(err => {
      console.error(err);
      list.innerHTML = "<p>Gagal memuat daftar surah</p>";
    });

  search?.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    document.querySelectorAll(".surah-item").forEach(item => {
      item.style.display =
        item.innerText.toLowerCase().includes(q) ? "" : "none";
    });
  });
});
