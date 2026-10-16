// Profil sayfası: profil.html?ad=kullanici_adi → o üyenin profili,
// profil.html (adsız) → kendi profilin + düzenleme, şifre değiştirme, hesap silme.

const $ = id => document.getElementById(id);
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANAHTAR);

const AVATARLAR = ["🙂", "😎", "🤓", "🧠", "📚", "🎯", "🚀", "🦉", "🐱", "🐼", "🦊", "🐢", "🌟", "☁️", "🔥", "🍀"];
const SINAV_ADLARI = {
  yks: "YKS", kpss: "KPSS", ales: "ALES", lgs: "LGS", dgs: "DGS", yds: "YDS / YÖKDİL", diger: "Diğer"
};

let profil = null;   // görüntülenen profil
let seciliAvatar = "🙂";

function bildir(alan, yazi, hataMi = true) {
  const p = $(alan);
  p.textContent = yazi;
  p.className = hataMi ? "form-mesaj hata" : "form-mesaj basari";
}

// supabase-hesap.sql çalıştırılmadıysa anlaşılır bir mesaj ver
function hataYazisi(hata) {
  const m = hata.message || "";
  if (m.includes("column") || m.includes("permission denied") || m.includes("hesabimi_sil")) {
    return "Veritabanı güncellemesi eksik: supabase-hesap.sql dosyası Supabase'de çalıştırılmalı.";
  }
  return Hesap.turkce(hata);
}

function profilYok(yazi, link) {
  $("profil-yok-yazi").textContent = yazi;
  if (link) $("profil-yok").querySelector("a").replaceWith(link);
  $("profil-yok").hidden = false;
}

// ---------- Profil kartını doldur ----------
async function kartiDoldur() {
  $("p-avatar").replaceChildren(...Hesap.avatar(profil).childNodes);
  $("p-ad").textContent = profil.kullanici_adi;
  $("profil-alt").textContent = profil.kullanici_adi + " adlı üyenin profili";
  document.title = profil.kullanici_adi + " — Sınav Bulutu";

  $("p-hedef").hidden = !profil.hedef_sinav;
  $("p-hedef").textContent = "🎯 " + (SINAV_ADLARI[profil.hedef_sinav] || "");
  // Rol ve engel rozetleri
  document.querySelectorAll(".rozet-ek").forEach(r => r.remove());
  const rozet = (yazi, sinif) => {
    const r = document.createElement("span");
    r.className = "rozet-ek " + sinif;
    r.textContent = yazi;
    $("p-hedef").before(r);
  };
  if (profil.rol === "yonetici") rozet("🛡️ Yönetici", "rol");
  else if (profil.rol === "moderator") rozet("🛡️ Moderatör", "rol");
  if (profil.engel_bitis && new Date(profil.engel_bitis) > new Date()) rozet("⛔ Engelli", "engel");

  $("p-katilim").textContent = "📅 " + new Date(profil.olusturma)
    .toLocaleDateString("tr-TR", { month: "long", year: "numeric" }) + " katıldı";

  const hakkinda = $("p-hakkinda");
  hakkinda.textContent = profil.hakkinda || "Henüz kendinden bahsetmemiş.";
  hakkinda.classList.toggle("soluk", !profil.hakkinda);

  $("p-mesaj").textContent = "💬 …";
  const { count } = await sb.from("mesajlar")
    .select("id", { count: "exact", head: true }).eq("kullanici_id", profil.id);
  $("p-mesaj").textContent = "💬 " + (count || 0) + " mesaj";

  $("profil-goster").hidden = false;
  konulariYukle();
}

// ---------- Açtığı konular ----------
async function konulariYukle() {
  const { data, error } = await sb.from("konular")
    .select("id, baslik, olusturma, cevap_sayisi").eq("kullanici_id", profil.id)
    .order("olusturma", { ascending: false }).limit(10);
  if (error || !data.length) return ($("p-konular-kutu").hidden = true);
  $("p-konular").replaceChildren(...data.map(k => {
    const a = document.createElement("a");
    a.href = "konu.html?id=" + k.id;
    a.className = "profil-konu";
    const b = document.createElement("span");
    b.textContent = k.baslik;
    const m = document.createElement("small");
    m.textContent = Hesap.zaman(k.olusturma) + " · 💬 " + k.cevap_sayisi;
    a.append(b, m);
    return a;
  }));
  $("p-konular-kutu").hidden = false;
}

// ---------- Başkasının profilinde: şikâyet / moderatör engeli ----------
function profilAraclari(ben, yetkili) {
  const arac = $("p-arac");
  arac.innerHTML = "";
  if (!ben || ben.id === profil.id) return (arac.hidden = true);
  const sikayet = document.createElement("button");
  sikayet.type = "button";
  sikayet.className = "kucuk-buton";
  sikayet.textContent = "🚩 Şikâyet et";
  sikayet.addEventListener("click", () => Hesap.sikayetEt(sb, {
    tur: "profil", hedef_id: profil.id,
    baglanti: "profil.html?ad=" + encodeURIComponent(profil.kullanici_adi),
    ozet: profil.kullanici_adi + (profil.hakkinda ? " — " + profil.hakkinda : "")
  }));
  const gizli = Hesap.gizliMi(profil.id);
  const gizle = document.createElement("button");
  gizle.type = "button";
  gizle.className = "kucuk-buton";
  gizle.textContent = gizli ? "👁️ Gizlemeyi kaldır" : "🙈 Bu üyeyi gizle";
  gizle.title = "Yazıları sana kapalı görünür (sadece bu tarayıcıda)";
  gizle.addEventListener("click", () => {
    Hesap.gizlemeAyarla(profil.id, profil.kullanici_adi, !gizli);
    profilAraclari(ben, yetkili);
  });
  arac.append(sikayet, gizle);
  if (yetkili) {
    const engel = document.createElement("button");
    engel.type = "button";
    engel.className = "kucuk-buton";
    engel.textContent = "⛔ Engelle / engeli kaldır";
    engel.addEventListener("click", () => Hesap.uyeEngelle(sb, profil.id, profil.kullanici_adi));
    arac.append(engel);
  }
  arac.hidden = false;
}

// ---------- Profil fotoğrafı: 256x256'ya küçültüp yükle ----------
function kucult(dosya) {
  return new Promise((coz, reddet) => {
    const img = new Image();
    img.onload = () => {
      const boyut = 256;
      const tuval = document.createElement("canvas");
      tuval.width = tuval.height = boyut;
      const kenar = Math.min(img.width, img.height); // ortadan kare kırp
      tuval.getContext("2d").drawImage(img,
        (img.width - kenar) / 2, (img.height - kenar) / 2, kenar, kenar, 0, 0, boyut, boyut);
      URL.revokeObjectURL(img.src);
      tuval.toBlob(b => (b ? coz(b) : reddet(new Error("Resim işlenemedi"))), "image/webp", 0.85);
    };
    img.onerror = () => reddet(new Error("Bu dosya açılamadı, başka bir resim dene."));
    img.src = URL.createObjectURL(dosya);
  });
}

$("foto-dosya").addEventListener("change", async e => {
  const dosya = e.target.files[0];
  e.target.value = "";
  if (!dosya) return;
  if (dosya.size > 10 * 1024 * 1024) return bildir("profil-mesaj", "Resim en fazla 10 MB olabilir.");

  Yukleme.goster("Fotoğraf yükleniyor");
  try {
    const blob = await kucult(dosya);
    const yol = profil.id + "/avatar.webp";
    const { error } = await sb.storage.from("avatarlar").upload(yol, blob, { upsert: true, contentType: "image/webp" });
    if (error) throw error;
    const adres = sb.storage.from("avatarlar").getPublicUrl(yol).data.publicUrl + "?v=" + Date.now();
    const sonuc = await sb.from("profiller").update({ foto: adres }).eq("id", profil.id).select().single();
    if (sonuc.error) throw sonuc.error;
    profil = sonuc.data;
    kartiDoldur();
    $("foto-kaldir").hidden = false;
    bildir("profil-mesaj", "Fotoğrafın güncellendi 📷", false);
  } catch (hata) {
    bildir("profil-mesaj", Hesap.tabloYok(hata) || (hata.message || "").includes("Bucket")
      ? "Fotoğraf yükleme henüz kurulmadı (supabase-ekstra.sql)." : hataYazisi(hata));
  } finally {
    Yukleme.gizle();
  }
});

$("foto-kaldir").addEventListener("click", async () => {
  const { data, error } = await sb.from("profiller").update({ foto: null }).eq("id", profil.id).select().single();
  if (error) return bildir("profil-mesaj", hataYazisi(error));
  sb.storage.from("avatarlar").remove([profil.id + "/avatar.webp"]);
  profil = data;
  kartiDoldur();
  $("foto-kaldir").hidden = true;
  bildir("profil-mesaj", "Fotoğraf kaldırıldı.", false);
});

// ---------- Kendi profilin: düzenleme formu ----------
function avatarSec(emoji) {
  seciliAvatar = emoji;
  document.querySelectorAll("#avatar-secim button").forEach(b => {
    const secili = b.textContent === emoji;
    b.classList.toggle("secili", secili);
    b.setAttribute("aria-checked", String(secili));
  });
}

function duzenlemeyiAc() {
  const kutu = $("avatar-secim");
  kutu.innerHTML = "";
  AVATARLAR.forEach(emoji => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = emoji;
    b.setAttribute("role", "radio");
    b.addEventListener("click", () => avatarSec(emoji));
    kutu.append(b);
  });
  avatarSec(profil.avatar || "🙂");
  $("foto-kaldir").hidden = !profil.foto;

  $("profil-ad").value = profil.kullanici_adi;
  $("profil-hakkinda").value = profil.hakkinda || "";
  const hedef = $("profil-hedef");
  hedef.value = profil.hedef_sinav || "";
  hedef.dispatchEvent(new Event("change")); // süslü seçim kutusu da güncellensin

  gizlenenleriYaz();
  $("profil-ayarlar").hidden = false;
}

// Kendi profilinde: gizlediğin üyeler
function gizlenenleriYaz() {
  const liste = Object.entries(Hesap.gizlenenler());
  const kutu = $("gizlenenler");
  kutu.innerHTML = "";
  if (!liste.length) {
    kutu.innerHTML = "<p class='soluk'>Gizlediğin üye yok. Bir üyenin profilinden \"🙈 Bu üyeyi gizle\" diyebilirsin.</p>";
    return;
  }
  liste.forEach(([id, ad]) => {
    const satir = document.createElement("div");
    satir.className = "profil-konu";
    const link = document.createElement("a");
    link.href = "profil.html?ad=" + encodeURIComponent(ad);
    link.textContent = ad;
    const kaldir = document.createElement("button");
    kaldir.type = "button";
    kaldir.className = "kucuk-buton";
    kaldir.textContent = "Gizlemeyi kaldır";
    kaldir.addEventListener("click", () => { Hesap.gizlemeAyarla(id, ad, false); gizlenenleriYaz(); });
    satir.append(link, kaldir);
    kutu.append(satir);
  });
}

$("form-profil").addEventListener("submit", async e => {
  e.preventDefault();
  const ad = $("profil-ad").value.trim();
  if (!Hesap.AD_KURALI.test(ad)) {
    return bildir("profil-mesaj", "Kullanıcı adı 3-20 karakter olmalı; harf, rakam ve _ kullanabilirsin.");
  }
  const yeni = {
    kullanici_adi: ad,
    avatar: seciliAvatar,
    hedef_sinav: $("profil-hedef").value || null,
    hakkinda: $("profil-hakkinda").value.trim() || null
  };

  Yukleme.goster("Kaydediliyor");
  let data, error;
  try {
    ({ data, error } = await sb.from("profiller").update(yeni).eq("id", profil.id).select().single());
  } finally {
    Yukleme.gizle();
  }
  if (error) return bildir("profil-mesaj", hataYazisi(error));

  // Hesap bilgisindeki ad da güncel kalsın (bazı yerler oradan okuyor)
  if (ad !== profil.kullanici_adi) sb.auth.updateUser({ data: { kullanici_adi: ad } });
  profil = data;
  kartiDoldur();
  bildir("profil-mesaj", "Kaydedildi ✅", false);
});

// ---------- Şifre değiştir ----------
$("form-sifre").addEventListener("submit", async e => {
  e.preventDefault();
  const sifre = $("sifre-yeni").value;
  if (sifre !== $("sifre-yeni2").value) return bildir("sifre-mesaj", "İki şifre aynı değil.");

  Yukleme.goster("Şifre değiştiriliyor");
  let error;
  try {
    ({ error } = await sb.auth.updateUser({ password: sifre }));
  } finally {
    Yukleme.gizle();
  }
  if (error) return bildir("sifre-mesaj", Hesap.turkce(error));
  e.target.reset();
  bildir("sifre-mesaj", "Şifren değiştirildi ✅", false);
});

// ---------- Hesabı sil ----------
$("form-sil").addEventListener("submit", async e => {
  e.preventDefault();
  if ($("sil-onay").value.trim() !== profil.kullanici_adi) {
    return bildir("sil-mesaj", "Kullanıcı adını aynen yazmalısın: " + profil.kullanici_adi);
  }
  if (!(await Hesap.onayla("Hesabın ve tüm yazıların kalıcı olarak silinecek. Emin misin?",
    { tamam: "Evet, sil", tehlike: true }))) return;

  Yukleme.goster("Hesabın siliniyor");
  let error;
  try {
    ({ error } = await sb.rpc("hesabimi_sil"));
  } finally {
    Yukleme.gizle();
  }
  if (error) return bildir("sil-mesaj", hataYazisi(error));

  await sb.auth.signOut({ scope: "local" }); // hesap artık yok, sadece tarayıcıdaki oturumu temizle
  Hesap.bildir("Hesabın silindi. Görüşmek üzere 👋", "basari");
  setTimeout(() => (location.href = "index.html"), 1500);
});

// ---------- Sayfa açılınca ----------
(async function () {
  const istenenAd = new URLSearchParams(location.search).get("ad");
  const { data: { session } } = await sb.auth.getSession();
  const ben = session ? session.user : null;
  Hesap.bildirimleriBaslat(sb, ben && ben.id);

  let sorgu = sb.from("profiller").select("*");
  if (istenenAd) {
    // "_" aramada joker olmasın diye kaçırılıyor; büyük/küçük harf fark etmez
    sorgu = sorgu.ilike("kullanici_adi", istenenAd.replace(/_/g, "\\_"));
  } else if (ben) {
    sorgu = sorgu.eq("id", ben.id);
  } else {
    const link = document.createElement("a");
    link.href = "topluluk.html?mod=giris";
    link.className = "ana-buton";
    link.textContent = "Giriş yap";
    return profilYok("Profilini görmek için giriş yapmalısın.", link);
  }

  const { data, error } = await sorgu.maybeSingle();
  if (error || !data) return profilYok(error ? "Profil yüklenemedi." : "Böyle bir üye bulunamadı.");

  profil = data;
  kartiDoldur();
  if (ben && ben.id === profil.id) duzenlemeyiAc();
  else profilAraclari(ben, Hesap.yetkiliMi(await Hesap.rolum(sb, ben && ben.id)));
})();
