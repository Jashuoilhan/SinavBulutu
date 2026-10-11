// =====================================================================
//  ORTAK YÜKLEME ANİMASYONU (kayan yazı, Uiverse.io'dan uyarlandı)
//  Animasyonu değiştirmek için sadece bu dosyadaki animasyonHtml()
//  fonksiyonunu ve style.css içindeki "Ortak yükleme animasyonu"
//  bölümünü değiştirmek yeterli.
//
//  Kullanım:
//    Yukleme.goster("Giriş yapılıyor")   → tüm ekranı kaplar
//    Yukleme.gizle()
//    Yukleme.kutuIcin("Mesajlar yükleniyor") → bir kutunun içine konacak HTML
// =====================================================================

(function () {
  const SURE = 3.5; // saniye: bir harfin sağdan sola geçme süresi

  // Mesajı harflere bölüp her harfe sırayla gecikme verir.
  // Kutu genişliği harf sayısı kadar olduğu için harfler üst üste binmez.
  function animasyonHtml(mesaj) {
    const harfler = [...(mesaj || "Never Gonna Give You Up") + " · "];
    const n = harfler.length;
    const spanlar = harfler.map((h, i) => {
      const gecikme = (-(SURE / n) * (n - (i + 1))).toFixed(3);
      const harf = h === " " ? "&nbsp;" : h.replace(/</g, "&lt;");
      return `<span class="letter" style="animation-delay:${gecikme}s">${harf}</span>`;
    }).join("");
    return `<div class="kayan-yazi" style="width:${n}ch" role="status" aria-label="${mesaj || "Yükleniyor"}">${spanlar}</div>`;
  }

  function kutuIcin(mesaj) {
    return `<div class="yukleme-kutu">${animasyonHtml(mesaj)}</div>`;
  }

  let ekran = null;
  function goster(mesaj) {
    if (!document.body) return;
    if (!ekran) {
      ekran = document.createElement("div");
      ekran.className = "yukleme-ekrani";
      document.body.appendChild(ekran);
    }
    ekran.innerHTML = animasyonHtml(mesaj);
    ekran.classList.add("acik");
  }

  function gizle() {
    if (ekran) ekran.classList.remove("acik");
  }

  window.Yukleme = { goster, gizle, kutuIcin };

  // ---- Sayfa açılışı: sayfa hazır olunca kendiliğinden kapanır ----
  document.documentElement.classList.add("sayfa-yukleniyor");
  document.addEventListener("DOMContentLoaded", () => goster());

  function acilisBitti() {
    document.documentElement.classList.remove("sayfa-yukleniyor");
    gizle();
  }
  window.addEventListener("load", acilisBitti);
  setTimeout(acilisBitti, 4000); // bir şey takılırsa en geç 4 sn sonra kapat
})();
