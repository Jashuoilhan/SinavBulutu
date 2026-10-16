// Konu sayfası: konu.html?id=N → konu, cevaplar, beğeni, en iyi cevap, düzenle/sil,
// şikâyet ve moderatör işlemleri (sabitle, kilitle, sil, engelle).

const $ = id => document.getElementById(id);
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANAHTAR);

const CEVAP_SAYFASI = 20;
const konuId = Number(new URLSearchParams(location.search).get("id"));

let ben = null;          // giriş yapan kullanıcı
let yetkili = false;     // moderatör / yönetici mi
let konu = null;
let yuklenenCevap = 0;
const begendiklerim = new Set(); // "konu-5", "cevap-12"

function konuYok(yazi) {
  $("konu-alani").innerHTML = "";
  $("konu-yok-yazi").textContent = yazi;
  $("konu-yok").hidden = false;
}

function el(etiket, sinif, yazi) {
  const e = document.createElement(etiket);
  if (sinif) e.className = sinif;
  if (yazi !== undefined) e.textContent = yazi; // textContent: kimse yazıyla siteye kod sokamasın
  return e;
}

// ---------- Beğeni ----------
async function begeniDegistir(tur, kayit, buton) {
  if (!ben) return (location.href = "topluluk.html?mod=giris");
  const anahtar = tur + "-" + kayit.id;
  const begendi = begendiklerim.has(anahtar);
  buton.disabled = true;
  const { error } = begendi
    ? await sb.from("begeniler").delete().match({ kullanici_id: ben.id, tur, hedef_id: kayit.id })
    : await sb.from("begeniler").insert({ tur, hedef_id: kayit.id });
  buton.disabled = false;
  if (error) return Hesap.bildir(Hesap.turkce(error), "hata");

  begendi ? begendiklerim.delete(anahtar) : begendiklerim.add(anahtar);
  kayit.begeni_sayisi += begendi ? -1 : 1;
  begeniButonuYaz(buton, !begendi, kayit.begeni_sayisi);
}

function begeniButonuYaz(buton, begendi, sayi) {
  buton.textContent = (begendi ? "❤️ " : "🤍 ") + sayi;
  buton.classList.toggle("begendi", begendi);
  buton.setAttribute("aria-pressed", String(begendi));
  buton.title = begendi ? "Beğenmekten vazgeç" : "Beğen";
}

// ---------- Konu ve cevaplar için ortak yazı kutusu ----------
function yaziKutusu(tur, kayit) {
  const benim = ben && kayit.kullanici_id === ben.id;
  const kutu = el("article", "kutu yazi-kutu" + (tur === "cevap" ? " cevap" : ""));
  kutu.id = tur + "-" + kayit.id;
  if (tur === "cevap" && konu.en_iyi_cevap === kayit.id) kutu.classList.add("en-iyi");

  // Üst: avatar + ad + zaman
  const ust = el("div", "yazi-ust");
  const avatar = Hesap.avatar(kayit.profiller);
  const ad = el("a", "mesaj-ad", kayit.kullanici_adi);
  ad.href = "profil.html?ad=" + encodeURIComponent(kayit.kullanici_adi);
  const zaman = el("span", "yazi-zaman", Hesap.zaman(kayit.olusturma) + (kayit.duzenleme ? " · düzenlendi" : ""));
  zaman.title = new Date(kayit.olusturma).toLocaleString("tr-TR");
  ust.append(avatar, ad, zaman);
  if (tur === "cevap" && konu.en_iyi_cevap === kayit.id) ust.append(el("span", "konu-etiket cozuldu", "✅ En iyi cevap"));
  if (tur === "konu" && kayit.sabit) ust.append(el("span", "konu-etiket", "📌 Sabit"));
  if (tur === "konu" && kayit.kilitli) ust.append(el("span", "konu-etiket kilitli", "🔒 Kilitli"));

  const govde = el("div", "yazi-govde");
  if (tur === "konu") govde.append(el("h1", "konu-baslik", kayit.baslik));
  const icerik = el("p", "yazi-icerik");
  icerik.append(Hesap.bicimle(kayit.icerik)); // **kalın**, *italik*, `kod`, linkler
  govde.append(icerik);

  // Alt: beğeni, en iyi cevap, düzenle, sil
  const arac = el("div", "yazi-arac");
  const begen = el("button", "kucuk-buton begen");
  begen.type = "button";
  begeniButonuYaz(begen, begendiklerim.has(tur + "-" + kayit.id), kayit.begeni_sayisi);
  begen.addEventListener("click", () => begeniDegistir(tur, kayit, begen));
  arac.append(begen);

  if (tur === "cevap" && ben && konu.kullanici_id === ben.id) {
    const sec = el("button", "kucuk-buton", konu.en_iyi_cevap === kayit.id ? "✖️ En iyi cevabı kaldır" : "✅ En iyi cevap");
    sec.type = "button";
    sec.addEventListener("click", () => enIyiSec(kayit.id));
    arac.append(sec);
  }

  if (benim) {
    const duzenle = el("button", "kucuk-buton", "✏️ Düzenle");
    duzenle.type = "button";
    duzenle.addEventListener("click", () => duzenlemeAc(tur, kayit, govde, arac));
    const sil = el("button", "sil", "Sil");
    sil.type = "button";
    sil.addEventListener("click", () => yaziSil(tur, kayit, kutu));
    arac.append(duzenle, sil);
  } else if (ben) {
    const sikayet = el("button", "kucuk-buton sikayet", "🚩 Şikâyet et");
    sikayet.type = "button";
    sikayet.addEventListener("click", () => Hesap.sikayetEt(sb, {
      tur, hedef_id: kayit.id,
      baglanti: "konu.html?id=" + konu.id + (tur === "cevap" ? "#cevap-" + kayit.id : ""),
      ozet: (kayit.baslik ? kayit.baslik + " — " : "") + kayit.icerik
    }));
    arac.append(sikayet);
  }

  // Moderatör araçları
  if (yetkili) {
    const mod = el("span", "mod-araclar");
    if (tur === "konu") {
      const sabitle = el("button", "kucuk-buton", kayit.sabit ? "📌 Sabitlemeyi kaldır" : "📌 Sabitle");
      sabitle.type = "button";
      sabitle.addEventListener("click", () => konuAyarla("sabit"));
      const kilitle = el("button", "kucuk-buton", kayit.kilitli ? "🔓 Kilidi aç" : "🔒 Kilitle");
      kilitle.type = "button";
      kilitle.addEventListener("click", () => konuAyarla("kilitli"));
      mod.append(sabitle, kilitle);
    }
    if (!benim) {
      const engelle = el("button", "kucuk-buton", "⛔ Engelle");
      engelle.type = "button";
      engelle.addEventListener("click", () => Hesap.uyeEngelle(sb, kayit.kullanici_id, kayit.kullanici_adi));
      const sil = el("button", "sil", "🛡️ Sil");
      sil.type = "button";
      sil.addEventListener("click", () => yaziSil(tur, kayit, kutu));
      mod.append(engelle, sil);
    }
    arac.append(mod);
  }

  kutu.append(ust, govde, arac);
  return kutu;
}

// ---------- Düzenleme ----------
function duzenlemeAc(tur, kayit, govde, arac) {
  const form = el("form", "hk-form duzenle-form");
  let baslikGirdi;
  if (tur === "konu") {
    const alan = el("div", "hk-alan");
    baslikGirdi = el("input", "hk-girdi");
    Object.assign(baslikGirdi, { value: kayit.baslik, maxLength: 120, minLength: 5, required: true });
    baslikGirdi.setAttribute("aria-label", "Başlık");
    alan.append(baslikGirdi);
    form.append(alan);
  }
  const alan = el("div", "hk-alan");
  const icerik = el("textarea", "hk-girdi");
  Object.assign(icerik, { value: kayit.icerik, maxLength: 5000, rows: 5, required: true });
  icerik.setAttribute("aria-label", "İçerik");
  alan.append(icerik);

  const butonlar = el("div", "hk-butonlar");
  const kaydet = el("button", "hk-buton", "Kaydet");
  const vazgec = el("button", "hk-buton ikincil", "Vazgeç");
  vazgec.type = "button";
  butonlar.append(kaydet, vazgec);
  const mesaj = el("p", "form-mesaj hata");
  form.append(alan, butonlar, mesaj);

  const eskiGovde = [...govde.childNodes];
  govde.replaceChildren(form);
  arac.hidden = true;
  icerik.focus();

  vazgec.addEventListener("click", () => {
    govde.replaceChildren(...eskiGovde);
    arac.hidden = false;
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const yeni = { icerik: icerik.value.trim() };
    if (baslikGirdi) yeni.baslik = baslikGirdi.value.trim();
    if (!yeni.icerik) return (mesaj.textContent = "İçerik boş olamaz.");
    if (baslikGirdi && yeni.baslik.length < 5) return (mesaj.textContent = "Başlık en az 5 karakter olmalı.");

    kaydet.disabled = true;
    const { data, error } = await sb.from(tur === "konu" ? "konular" : "cevaplar")
      .update(yeni).eq("id", kayit.id).select("*, profiller(*)").single();
    kaydet.disabled = false;
    if (error) return (mesaj.textContent = Hesap.turkce(error));

    Object.assign(kayit, data);
    if (tur === "konu") {
      konu = kayit;
      document.title = konu.baslik + " — Sınav Bulutu";
    }
    $(tur + "-" + kayit.id).replaceWith(yaziKutusu(tur, kayit));
  });
}

// ---------- Silme ----------
async function yaziSil(tur, kayit, kutu) {
  const soru = tur === "konu"
    ? "Konu ve altındaki tüm cevaplar silinecek. Emin misin?"
    : "Cevabın silinecek. Emin misin?";
  if (!(await Hesap.onayla(soru, { tamam: "Sil", tehlike: true }))) return;

  const { error } = await sb.from(tur === "konu" ? "konular" : "cevaplar").delete().eq("id", kayit.id);
  if (error) return Hesap.bildir(Hesap.turkce(error), "hata");

  if (tur === "konu") return (location.href = "topluluk.html");
  kutu.remove();
  konu.cevap_sayisi = Math.max(0, konu.cevap_sayisi - 1);
  yuklenenCevap--;
  if (konu.en_iyi_cevap === kayit.id) konu.en_iyi_cevap = null;
  cevapBasligiYaz();
}

// ---------- En iyi cevap ----------
async function enIyiSec(cevapId) {
  const { error } = await sb.rpc("en_iyi_cevap_sec", { konu: konu.id, cevap: cevapId });
  if (error) return Hesap.bildir(Hesap.turkce(error), "hata");
  konu.en_iyi_cevap = konu.en_iyi_cevap === cevapId ? null : cevapId;
  // Hangi cevabın vurgulanacağı değişti: yüklü cevapları baştan çiz
  const adet = Math.max(CEVAP_SAYFASI, yuklenenCevap);
  yuklenenCevap = 0;
  $("cevap-listesi").innerHTML = "";
  cevaplariYukle(adet);
}

// ---------- Moderatör: sabitle / kilitle ----------
async function konuAyarla(alan) {
  const { error } = await sb.rpc("konu_ayarla", { konu: konu.id, alan });
  if (error) return Hesap.bildir(Hesap.turkce(error), "hata");
  konu[alan] = !konu[alan];
  $("konu-" + konu.id).replaceWith(yaziKutusu("konu", konu));
  cevapFormunuAyarla();
  Hesap.bildir(alan === "sabit"
    ? (konu.sabit ? "Konu sabitlendi 📌" : "Sabitleme kaldırıldı")
    : (konu.kilitli ? "Konu kilitlendi 🔒" : "Kilit açıldı 🔓"), "basari");
}

// Cevap formu: girişli ve konu kilitli değilse görünür
function cevapFormunuAyarla() {
  $("form-cevap").hidden = !ben || konu.kilitli;
  $("cevap-giris").hidden = !!ben || konu.kilitli;
  $("konu-kilitli").hidden = !konu.kilitli;
}

// Gizlediğin üyenin yazısı kapalı gelir (kendi yazın hiç gizlenmez)
function gizliyseKapat(kayit, kutu) {
  if (ben && kayit.kullanici_id === ben.id) return kutu;
  if (!Hesap.gizliMi(kayit.kullanici_id)) return kutu;
  const kapak = Hesap.gizliKapak(kutu);
  kapak.classList.add("kutu");
  return kapak;
}

// ---------- Yükleme ----------
function cevapBasligiYaz() {
  const baslik = $("cevap-baslik");
  baslik.hidden = false;
  baslik.textContent = konu.cevap_sayisi ? `💬 ${konu.cevap_sayisi} cevap` : "💬 Henüz cevap yok. İlk cevabı sen yaz!";
  $("daha-fazla").hidden = yuklenenCevap >= konu.cevap_sayisi;
}

async function begenileriGetir(tur, idler) {
  if (!ben || !idler.length) return;
  const { data } = await sb.from("begeniler").select("hedef_id")
    .eq("kullanici_id", ben.id).eq("tur", tur).in("hedef_id", idler);
  (data || []).forEach(b => begendiklerim.add(tur + "-" + b.hedef_id));
}

async function cevaplariYukle(adet = CEVAP_SAYFASI) {
  const buton = $("daha-fazla");
  buton.disabled = true;
  const { data, error } = await sb.from("cevaplar")
    .select("*, profiller(*)")
    .eq("konu_id", konu.id)
    .order("olusturma")
    .range(yuklenenCevap, yuklenenCevap + adet - 1);
  buton.disabled = false;
  if (error) return;

  await begenileriGetir("cevap", data.map(c => c.id));
  data.forEach(c => $("cevap-listesi").append(gizliyseKapat(c, yaziKutusu("cevap", c))));
  yuklenenCevap += data.length;
  cevapBasligiYaz();
}

$("daha-fazla").addEventListener("click", () => cevaplariYukle());

// ---------- Cevap yaz ----------
$("form-cevap").addEventListener("submit", async e => {
  e.preventDefault();
  const kutu = $("cevap-icerik");
  const icerik = kutu.value.trim();
  const mesaj = $("cevap-mesaj");
  if (!icerik) return;

  const gonder = e.target.querySelector("button[type=submit]");
  gonder.disabled = true;
  const { data, error } = await sb.from("cevaplar")
    .insert({ konu_id: konu.id, icerik }).select("*, profiller(*)").single();
  gonder.disabled = false;
  if (error) {
    mesaj.className = "form-mesaj hata";
    return (mesaj.textContent = Hesap.turkce(error));
  }

  mesaj.textContent = "";
  kutu.value = "";
  konu.cevap_sayisi++;
  // Önceki cevapların hepsi yüklüyse yenisini sona ekle; değilse sayıyı güncellemek yeter
  if (yuklenenCevap === konu.cevap_sayisi - 1) {
    $("cevap-listesi").append(yaziKutusu("cevap", data));
    yuklenenCevap++;
  }
  cevapBasligiYaz();
  $("cevap-" + data.id)?.scrollIntoView({ behavior: "smooth", block: "center" });
});

// ---------- Sayfa açılınca ----------
(async function () {
  if (!konuId) return konuYok("Konu bulunamadı.");
  $("konu-alani").innerHTML = Yukleme.kutuIcin("Konu yükleniyor");

  const { data: { session } } = await sb.auth.getSession();
  ben = session ? session.user : null;
  yetkili = Hesap.yetkiliMi(await Hesap.rolum(sb, ben && ben.id));
  Hesap.bildirimleriBaslat(sb, ben && ben.id);

  const [{ data, error }, kategoriSonuc] = await Promise.all([
    sb.from("konular").select("*, profiller(*)").eq("id", konuId).maybeSingle(),
    sb.from("kategoriler").select("*")
  ]);
  if (error) return konuYok(Hesap.tabloYok(error) ? "Forum henüz kurulmadı." : "Konu yüklenemedi.");
  if (!data) return konuYok("Bu konu bulunamadı. Silinmiş olabilir.");

  konu = data;
  document.title = konu.baslik + " — Sınav Bulutu";
  await begenileriGetir("konu", [konu.id]);

  const kat = (kategoriSonuc.data || []).find(k => k.id === konu.kategori);
  const geri = document.querySelector(".geri-link");
  if (kat) {
    geri.textContent = `← ${kat.emoji} ${kat.ad} konularına dön`;
    geri.href = "topluluk.html?kategori=" + kat.id;
  }

  $("konu-alani").replaceChildren(gizliyseKapat(konu, yaziKutusu("konu", konu)));
  cevapFormunuAyarla();
  await cevaplariYukle();
  // Bildirimden / şikâyetten gelindiyse ilgili cevaba kaydır
  if (location.hash) document.querySelector(location.hash)?.scrollIntoView({ block: "center" });
})();
