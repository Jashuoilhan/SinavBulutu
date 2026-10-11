// Sayaç kartlarını oluşturur ve her saniye günceller.
// Sınav tarihleri sinavlar.js dosyasında.

const kartAlani = document.getElementById("kartlar");
const filtreButonlari = document.querySelectorAll(".filtreler button");
let seciliGrup = "Hepsi";

function tarihYaz(tarih) {
  return tarih.toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric", weekday: "long",
    timeZone: "Europe/Istanbul"
  }) + " • " + tarih.toLocaleTimeString("tr-TR", {
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul"
  });
}

function kartlariCiz() {
  kartAlani.innerHTML = "";

  const liste = SINAVLAR
    .filter(s => seciliGrup === "Hepsi" || s.grup === seciliGrup)
    .sort((a, b) => new Date(a.tarih) - new Date(b.tarih));

  liste.forEach((sinav, i) => {
    const kart = document.createElement("article");
    kart.className = "kart";
    kart.style.animationDelay = `${i * 0.08}s, ${i * 0.7}s`;
    kart.dataset.tarih = sinav.tarih;

    kart.innerHTML = `
      <div class="kart-ust">
        <span class="kart-ikon">${sinav.ikon}</span>
        <h2>${sinav.kod}</h2>
        <span class="etiket ${sinav.resmi ? "resmi" : "tahmini"}">
          ${sinav.resmi ? "Resmi" : "Tahmini"}
        </span>
      </div>
      <p class="alt-ad">${sinav.ad}</p>
      <div class="sayac-alani"></div>
      <p class="tarih-yazi">${tarihYaz(new Date(sinav.tarih))}</p>
    `;
    kartAlani.appendChild(kart);
  });

  sayaclariGuncelle();
}

function sayiYaz(kutu, deger) {
  const yeni = String(deger);
  if (kutu.textContent !== yeni) {
    kutu.textContent = yeni;
    kutu.classList.remove("tik");
    void kutu.offsetWidth; // animasyonu yeniden başlatmak için
    kutu.classList.add("tik");
  }
}

function sayaclariGuncelle() {
  const simdi = Date.now();

  document.querySelectorAll(".kart").forEach(kart => {
    const alan = kart.querySelector(".sayac-alani");
    const fark = new Date(kart.dataset.tarih) - simdi;

    if (fark <= 0) {
      alan.innerHTML = `<p class="gecti">✅ Sınav yapıldı, kolay gelsin!</p>`;
      return;
    }

    // İlk seferde sayaç kutularını oluştur
    if (!alan.querySelector(".buyuk-gun")) {
      alan.innerHTML = `
        <div class="buyuk-gun"><span class="sayi" data-g></span><br><span class="birim">gün kaldı</span></div>
        <div class="kucuk-sayac">
          <div><b data-s></b><span>saat</span></div>
          <div><b data-d></b><span>dakika</span></div>
          <div><b data-sn></b><span>saniye</span></div>
        </div>`;
    }

    const toplamSaniye = Math.floor(fark / 1000);
    sayiYaz(alan.querySelector("[data-g]"),  Math.floor(toplamSaniye / 86400));
    sayiYaz(alan.querySelector("[data-s]"),  Math.floor((toplamSaniye % 86400) / 3600));
    sayiYaz(alan.querySelector("[data-d]"),  Math.floor((toplamSaniye % 3600) / 60));
    sayiYaz(alan.querySelector("[data-sn]"), toplamSaniye % 60);
  });
}

filtreButonlari.forEach(buton => {
  buton.addEventListener("click", () => {
    filtreButonlari.forEach(b => b.classList.remove("aktif"));
    buton.classList.add("aktif");
    seciliGrup = buton.dataset.grup;
    kartlariCiz();
  });
});

kartlariCiz();
setInterval(sayaclariGuncelle, 1000);
