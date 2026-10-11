// Sayfa başlıklarındaki (.giris h1) harf harf parlama efekti.
// Her harf <span class="harf"> olur ve sırayla parlar (stil: style.css → .harf).
// Ekran okuyucular başlığı düz metin olarak okur (aria-label).
(function () {
  function harflereBol(baslik) {
    if (baslik.dataset.harfli) return;
    baslik.dataset.harfli = "1";
    const metin = baslik.textContent.trim();
    baslik.setAttribute("aria-label", metin);
    baslik.classList.add("isikli-baslik");

    // Emojiler tek parça kalsın diye harfleri "görünen karakter" olarak böl
    const parcalar = window.Intl && Intl.Segmenter
      ? [...new Intl.Segmenter("tr", { granularity: "grapheme" }).segment(metin)].map(s => s.segment)
      : [...metin];

    const kap = document.createElement("span");
    kap.className = "harfler";
    kap.setAttribute("aria-hidden", "true");
    parcalar.forEach((harf, i) => {
      const s = document.createElement("span");
      s.className = "harf";
      s.textContent = harf;
      s.style.animationDelay = `${0.1 + i * 0.105}s`;
      kap.appendChild(s);
    });
    baslik.replaceChildren(kap);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".giris h1").forEach(harflereBol);
  });
})();
