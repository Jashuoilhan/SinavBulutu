// =====================================================================
//  ORTAK SAYI GİRİŞİ: − [kayan rakam] +
//  Kullanıcının getirdiği Number Flow "Input" örneğinden (React) uyarlandı.
//  Sayfadaki tüm <input type="number"> alanlarını otomatik dönüştürür;
//  sonradan eklenen alanlar da (ör. puan tablosu satırları) dönüştürülür.
//  Asıl <input> yerinde kalır (yazısı görünmez), rakamı üstündeki
//  <number-flow> gösterir. Değer değişince "input" olayı tetiklenir,
//  yani mevcut hesaplama kodları aynen çalışır.
//  Dönüştürülmesini istemediğin alana: data-yerli
//  Gerekli: sayfada number-flow kütüphanesi (esm.sh/number-flow) yüklü olmalı.
// =====================================================================
(function () {
  const EKSI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><path d="M5 12h14"/></svg>';
  const ARTI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><path d="M5 12h14M12 5v14"/></svg>';

  function sayiOlarak(v, yedek) {
    const n = parseFloat(v);
    return isNaN(n) ? yedek : n;
  }

  function donustur(girdi) {
    if (girdi.dataset.sayiGirdi || girdi.hasAttribute("data-yerli")) return;
    girdi.dataset.sayiGirdi = "1";

    const min = sayiOlarak(girdi.min, -Infinity);
    const max = sayiOlarak(girdi.max, Infinity);
    const adim = sayiOlarak(girdi.step, 1) || 1;
    const ondalikli = adim < 1;

    // Yapı: [−] [girdi + number-flow üst üste] [+]
    const kutu = document.createElement("span");
    kutu.className = "sayi-girdi";
    const eksi = document.createElement("button");
    const arti = document.createElement("button");
    for (const [b, ikon, sinif] of [[eksi, EKSI, "sg-eksi"], [arti, ARTI, "sg-arti"]]) {
      b.type = "button";
      b.tabIndex = -1;
      b.setAttribute("aria-hidden", "true");
      b.className = "sg-dugme " + sinif;
      b.innerHTML = ikon;
    }
    const ust = document.createElement("span");
    ust.className = "sg-ust";
    const akis = document.createElement("number-flow");
    akis.setAttribute("aria-hidden", "true");
    akis.className = "sg-akis";

    girdi.replaceWith(kutu);
    ust.append(girdi, akis);
    kutu.append(eksi, ust, arti);
    girdi.classList.add("sg-girdi");

    // Genişlik: en uzun değere göre (ör. 40 → 2 hane, 85.50 → 5 karakter)
    const hane = String(isFinite(max) ? max : 999).length + (ondalikli ? 3 : 0);
    ust.style.setProperty("--hane", hane);

    let animasyonlu = true;
    let hazir = false;

    function goster() {
      const bos = girdi.value === "";
      kutu.classList.toggle("bos", bos);
      kutu.classList.toggle("yer-tutuculu", bos && !!girdi.placeholder);
      eksi.disabled = !bos && sayiOlarak(girdi.value, 0) <= min;
      arti.disabled = !bos && sayiOlarak(girdi.value, 0) >= max;
      const deger = bos ? (isFinite(min) && min > 0 ? min : 0) : sayiOlarak(girdi.value, 0);
      if (hazir) {
        akis.animated = animasyonlu;
        akis.update(deger);
      } else {
        akis.textContent = String(deger);
      }
    }

    // Klavyeyle yazınca: animasyonsuz; çok büyük değeri sınıra çek
    girdi.addEventListener("input", () => {
      if (girdi._butondan) { girdi._butondan = false; goster(); return; }
      animasyonlu = false;
      if (girdi.value !== "") {
        const n = girdi.valueAsNumber;
        if (!isNaN(n) && n > max) girdi.value = String(max);
        if (!isNaN(n) && n < 0 && min >= 0) girdi.value = String(min);
      }
      goster();
    });

    // Yazarken imleç rakamların kaymasını göstermesin
    akis.addEventListener("animationsstart", () => kutu.classList.add("imlecsiz"));
    akis.addEventListener("animationsfinish", () => kutu.classList.remove("imlecsiz"));

    function degistir(fark) {
      return e => {
        animasyonlu = true;
        if (e.pointerType === "mouse") { e.preventDefault(); girdi.focus(); }
        const simdi = girdi.value === "" ? (isFinite(min) && min > 0 ? min - fark : 0) : sayiOlarak(girdi.value, 0);
        let yeni = Math.min(Math.max(simdi + fark * adim, min), max);
        if (ondalikli) yeni = Math.round(yeni * 100) / 100;
        girdi.value = String(yeni);
        girdi._butondan = true;
        girdi.dispatchEvent(new Event("input", { bubbles: true }));
      };
    }
    eksi.addEventListener("pointerdown", degistir(-1));
    arti.addEventListener("pointerdown", degistir(1));

    customElements.whenDefined("number-flow").then(() => {
      akis.locales = "en-US";
      akis.format = { useGrouping: false, maximumFractionDigits: ondalikli ? 2 : 0 };
      akis.willChange = true;
      akis.textContent = "";
      hazir = true;
      animasyonlu = false;
      goster();
    });
    goster();
  }

  function hepsiniDonustur(kok) {
    kok.querySelectorAll('input[type="number"]').forEach(donustur);
  }

  document.addEventListener("DOMContentLoaded", () => {
    hepsiniDonustur(document);
    new MutationObserver(kayitlar => {
      for (const k of kayitlar) {
        k.addedNodes.forEach(n => {
          if (n.nodeType !== 1) return;
          if (n.matches('input[type="number"]')) donustur(n);
          else hepsiniDonustur(n);
        });
      }
    }).observe(document.body, { childList: true, subtree: true });
  });
})();
