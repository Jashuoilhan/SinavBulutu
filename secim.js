// =====================================================================
//  ORTAK AÇILIR SEÇİM KUTUSU (Uiverse.io menü animasyonundan uyarlandı)
//  Sitedeki tüm <select>'leri otomatik olarak bu görünüme çevirir.
//  Asıl <select> gizli olarak yerinde kalır; seçim yapılınca onun değeri
//  değişir ve "change" olayı tetiklenir, yani mevcut kodlar aynen çalışır.
//  Seçenekler sonradan değişirse (ör. KPSS yılları) menü kendini yeniler.
//  Bir <select>'in dönüştürülmesini istemezsen: <select data-yerli>
// =====================================================================

(function () {
  let acikMenu = null;

  function kapat() {
    if (!acikMenu) return;
    acikMenu.kutu.classList.remove("acik");
    acikMenu.dugme.setAttribute("aria-expanded", "false");
    acikMenu = null;
  }

  function donustur(secim) {
    if (secim.dataset.donustu) return;
    secim.dataset.donustu = "1";

    const kutu = document.createElement("div");
    kutu.className = "secim";
    const dugme = document.createElement("button");
    dugme.type = "button";
    dugme.className = "secim-dugme";
    dugme.setAttribute("aria-haspopup", "listbox");
    dugme.setAttribute("aria-expanded", "false");
    const liste = document.createElement("div");
    liste.className = "input secim-liste";
    liste.setAttribute("role", "listbox");
    kutu.append(dugme, liste);

    secim.classList.add("secim-gizli");
    secim.tabIndex = -1;
    secim.after(kutu);

    function yenile() {
      const secili = secim.options[secim.selectedIndex];
      dugme.textContent = secili ? secili.textContent : "Seçiniz";
      liste.innerHTML = "";
      [...secim.options].forEach(o => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "value";
        b.setAttribute("role", "option");
        b.setAttribute("aria-selected", String(o.selected));
        b.textContent = o.textContent;
        b.addEventListener("click", () => {
          secim.value = o.value;
          secim.dispatchEvent(new Event("change", { bubbles: true }));
          yenile();
          kapat();
          dugme.focus();
        });
        liste.appendChild(b);
      });
    }

    dugme.addEventListener("click", e => {
      e.stopPropagation();
      const zatenAcik = acikMenu && acikMenu.kutu === kutu;
      kapat();
      if (zatenAcik) return;
      kutu.classList.add("acik");
      dugme.setAttribute("aria-expanded", "true");
      acikMenu = { kutu, dugme };
      const secili = liste.querySelector('[aria-selected="true"]') || liste.firstChild;
      if (secili) secili.focus();
    });

    // Klavye: yukarı/aşağı ok ile gezin
    liste.addEventListener("keydown", e => {
      const ogeler = [...liste.children];
      const i = ogeler.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); (ogeler[i + 1] || ogeler[0]).focus(); }
      if (e.key === "ArrowUp") { e.preventDefault(); (ogeler[i - 1] || ogeler[ogeler.length - 1]).focus(); }
    });

    secim.addEventListener("change", yenile);
    new MutationObserver(yenile).observe(secim, { childList: true, subtree: true });
    yenile();
  }

  document.addEventListener("click", kapat);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && acikMenu) {
      const d = acikMenu.dugme;
      kapat();
      d.focus();
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("select:not([data-yerli])").forEach(donustur);
  });
})();
