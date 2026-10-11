// =====================================================================
//  PUAN HESAPLAMA (veriler puan-verileri.js dosyasında)
// =====================================================================

const $ = id => document.getElementById(id);
const yuvarla = (sayi, basamak = 3) => sayi.toLocaleString("tr-TR", { minimumFractionDigits: basamak, maximumFractionDigits: basamak });

// Net = Doğru − Yanlış ÷ 4 (en az 0)
function netHesapla(dogru, yanlis) {
  return Math.max(0, dogru - yanlis / 4);
}

// Bir test için Doğru / Yanlış / Net satırı oluşturur
function testSatiri(kap, anahtar, ad, soru) {
  const satir = document.createElement("div");
  satir.className = "test-satir";
  satir.innerHTML = `
    <span class="test-ad">${ad} <small>(${soru} soru)</small></span>
    <label>D <input type="number" min="0" max="${soru}" inputmode="numeric" data-test="${anahtar}" data-tur="d"></label>
    <label>Y <input type="number" min="0" max="${soru}" inputmode="numeric" data-test="${anahtar}" data-tur="y"></label>
    <span class="test-net" id="net-${anahtar}">0 net</span>`;
  kap.appendChild(satir);
}

// Girilen doğru/yanlışı okur, soru sayısını aşarsa uyarır
function netOku(anahtar, soru) {
  const d = Math.max(0, Number(document.querySelector(`[data-test="${anahtar}"][data-tur="d"]`).value) || 0);
  const y = Math.max(0, Number(document.querySelector(`[data-test="${anahtar}"][data-tur="y"]`).value) || 0);
  const hatali = d + y > soru;
  const net = hatali ? 0 : netHesapla(d, y);
  const yazi = $(`net-${anahtar}`);
  yazi.textContent = hatali ? `En fazla ${soru} soru!` : `${yuvarla(net, 2)} net`;
  yazi.classList.toggle("hata", hatali);
  return net;
}

// ---------- YKS ----------
const Y = YKS_VERI;
Object.entries(Y.testler).forEach(([anahtar, [ad, soru]]) => {
  const kap = anahtar.startsWith("tyt") ? $("tablo-tyt") : anahtar === "ydt" ? $("tablo-ydt") : $("tablo-ayt");
  testSatiri(kap, anahtar, ad, soru);
});

function yksHesapla() {
  const netler = {};
  Object.entries(Y.testler).forEach(([anahtar, [, soru]]) => netler[anahtar] = netOku(anahtar, soru));

  const diploma = Number($("diploma").value);
  const diplomaGecerli = diploma >= 50 && diploma <= 100;
  const obpKatkisi = diplomaGecerli
    ? diploma * 5 * ($("yerlesti").checked ? Y.obpKatsayiYerlesen : Y.obpKatsayi)
    : 0;

  const tytNet = netler.tyt_tr + netler.tyt_sos + netler.tyt_mat + netler.tyt_fen;
  let html = `<div class="sonuc-satir baslik"><span>Puan türü</span><span>Ham puan</span><span>Yerleştirme</span></div>`;
  const puanlar = {};

  Object.entries(Y.turler).forEach(([tur, katsayilar]) => {
    // AYT puan türleri için o türe ait AYT/YDT testinde en az 1 net gerekir
    const aytVar = tur === "TYT" || Object.keys(katsayilar).some(t => !t.startsWith("tyt") && netler[t] > 0);
    if (tytNet === 0 || !aytVar) {
      html += `<div class="sonuc-satir"><span>${tur}</span><span class="soluk">—</span><span class="soluk">—</span></div>`;
      return;
    }
    let ham = Y.taban;
    Object.entries(katsayilar).forEach(([test, k]) => ham += netler[test] * k);
    puanlar[tur] = ham;
    html += `<div class="sonuc-satir"><span>${tur}</span><span>${yuvarla(ham)}</span><strong>${yuvarla(ham + obpKatkisi)}</strong></div>`;
  });

  $("yks-sonuc").innerHTML = html;

  // ÖSYM barajları: önlisans için TYT ≥ 150, lisans için TYT ≥ 150 ve ilgili puan ≥ 180
  // Her uyarı ayrı satırda, türüne göre renkli kutucukta gösterilir.
  // tur: "bilgi" (mavi), "basari" (yeşil), "uyari" (turuncu)
  const uyarilar = [];
  if (!diplomaGecerli) uyarilar.push({ tur: "bilgi", ikon: "ℹ️", baslik: "Diploma notu", metin: "Diploma notunu girersen yerleştirme puanına OBP de eklenir." });
  else uyarilar.push({ tur: "bilgi", ikon: "🎓", baslik: "OBP katkın", metin: `+${yuvarla(obpKatkisi)} puan` });
  if (puanlar.TYT !== undefined && puanlar.TYT < 150) uyarilar.push({ tur: "uyari", ikon: "⚠️", baslik: "TYT barajı", metin: "Puanın 150'nin altında. Tercih yapabilmek için en az 150 gerekir." });
  if (puanlar.TYT >= 150) {
    uyarilar.push({ tur: "basari", ikon: "✅", baslik: "Önlisans", metin: "TYT 150 barajını geçtin, 2 yıllık bölümleri tercih edebilirsin." });
    const lisans = ["SAY", "EA", "SÖZ", "DİL"].filter(t => puanlar[t] >= 180);
    if (lisans.length) uyarilar.push({ tur: "basari", ikon: "✅", baslik: "Lisans", metin: `${lisans.join(", ")} puanın 180'i geçti, bu türlerde 4 yıllık bölümleri tercih edebilirsin.` });
  }
  const kutu = $("yks-uyari");
  kutu.innerHTML = "";
  uyarilar.forEach(u => {
    const satir = document.createElement("div");
    satir.className = `uyari-satir ${u.tur}`;
    satir.innerHTML = `<span class="uyari-ikon" aria-hidden="true"></span><div><b></b><span class="uyari-metin"></span></div>`;
    satir.querySelector(".uyari-ikon").textContent = u.ikon;
    satir.querySelector("b").textContent = u.baslik;
    satir.querySelector(".uyari-metin").textContent = u.metin;
    kutu.appendChild(satir);
  });
}

// ---------- KPSS ----------
const K = KPSS_VERI;
testSatiri($("tablo-kpss"), "gy", "Genel Yetenek", K.soruSayisi);
testSatiri($("tablo-kpss"), "gk", "Genel Kültür", K.soruSayisi);

function kpssYillariniDoldur() {
  const duzey = K.duzeyler[$("kpss-duzey").value];
  $("kpss-yil").innerHTML = Object.keys(duzey.yillar)
    .sort((a, b) => b - a)
    .map(yil => `<option value="${yil}">${yil}</option>`).join("");
}

// ÖSYM yöntemi: standart puan → ağırlıklı standart puan (ASP) → 70-100 ölçeği
function kpssPuani(gyNet, gkNet, veri, [wGY, wGK]) {
  const sp = (net, [ort, ss]) => 50 + 10 * (net - ort) / ss;
  const asp = wGY * sp(gyNet, veri.gy) + wGK * sp(gkNet, veri.gk);
  // B: en yüksek ASP (tam net yapan aday), X: ASP ortalaması (50), S: ASP standart sapması
  const B = wGY * sp(K.soruSayisi, veri.gy) + wGK * sp(K.soruSayisi, veri.gk);
  const X = 50;
  const S = 10 * Math.sqrt(wGY ** 2 + wGK ** 2 + 2 * wGY * wGK * K.korelasyon);
  const puan = 70 + 30 * (2 * (asp - X) - S) / (2 * (B - X) - S);
  return Math.min(100, Math.max(0, puan));
}

function kpssHesapla() {
  const duzey = K.duzeyler[$("kpss-duzey").value];
  const veri = duzey.yillar[$("kpss-yil").value];
  $("kpss-veri-not").textContent = `Kullanılan veri: ${veri.not}.`;

  const gy = netOku("gy", K.soruSayisi);
  const gk = netOku("gk", K.soruSayisi);

  let html = `<div class="sonuc-satir baslik"><span>Puan türü</span><span>Toplam net</span><span>Tahmini puan</span></div>`;
  Object.entries(duzey.puanTurleri).forEach(([tur, agirlik]) => {
    const puan = gy + gk > 0 ? yuvarla(kpssPuani(gy, gk, veri, agirlik)) : "—";
    html += `<div class="sonuc-satir"><span>${tur}</span><span>${yuvarla(gy + gk, 2)}</span><strong>${puan}</strong></div>`;
  });
  $("kpss-sonuc").innerHTML = html;
}

// ---------- Olaylar ----------
$("yks-bolum").addEventListener("input", yksHesapla);
$("kpss-bolum").addEventListener("input", kpssHesapla);
$("kpss-duzey").addEventListener("change", () => { kpssYillariniDoldur(); kpssHesapla(); });

document.querySelectorAll(".filtreler button").forEach(buton => {
  buton.addEventListener("click", () => {
    document.querySelectorAll(".filtreler button").forEach(b => b.classList.remove("aktif"));
    buton.classList.add("aktif");
    const kpssMi = buton.dataset.sinav === "kpss";
    $("yks-bolum").hidden = kpssMi;
    $("kpss-bolum").hidden = !kpssMi;
  });
});

// YKS kartları: tıklanan kartın paneli açılır, diğerleri kapanır.
// Tekrar tıklanınca kapanır. Gizli paneldeki değerler hesaba girmeye devam eder.
// KPSS kartları ortak bir paneli açar ve düzey seçimini (gizli <select>) değiştirir.
document.querySelectorAll(".puan-kart").forEach(kart => {
  kart.addEventListener("click", () => {
    const acilacak = kart.getAttribute("aria-expanded") !== "true";
    const grup = kart.closest(".puan-kartlari").querySelectorAll(".puan-kart");
    grup.forEach(k => {
      k.setAttribute("aria-expanded", "false");
      k.classList.remove("aktif");
      document.getElementById(k.dataset.panel).hidden = true;
    });
    if (acilacak) {
      kart.setAttribute("aria-expanded", "true");
      kart.classList.add("aktif");
      if (kart.dataset.duzey) {
        const secim = $("kpss-duzey");
        secim.value = kart.dataset.duzey;
        secim.dispatchEvent(new Event("change", { bubbles: true }));
        $("kpss-panel-baslik").textContent = "🏛️ " + kart.querySelector(".pk-alt").textContent;
      }
      const panel = document.getElementById(kart.dataset.panel);
      panel.hidden = false;
      const ilkKutu = panel.querySelector("input");
      if (ilkKutu) ilkKutu.focus({ preventScroll: true });
    }
  });
});

kpssYillariniDoldur();
yksHesapla();
kpssHesapla();
