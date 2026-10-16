// Topluluk: kayıt, giriş, şifre yenileme ve canlı sohbet odaları.
// Bağlantı bilgileri supabase-ayar.js, ortak hesap parçaları hesap-ortak.js dosyasında.

const $ = id => document.getElementById(id);

const girisAlani = $("giris-alani");
const sohbetAlani = $("sohbet-alani");
const ayarUyari = $("ayar-uyari");
const formMesaj = $("form-mesaj");
const mesajListesi = $("mesaj-listesi");
const onayTekrar = $("onay-tekrar");

// Şifre yenileme mailindeki linkten gelindiyse adres "#...type=recovery" içerir.
// Supabase adresi temizlemeden önce okuyoruz.
let sifreYenileniyor = location.hash.includes("type=recovery");

if (SUPABASE_URL.startsWith("BURAYA")) {
  ayarUyari.hidden = false;
  girisAlani.hidden = true;
  throw new Error("supabase-ayar.js doldurulmamış");
}

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANAHTAR);
const buSayfa = location.origin + location.pathname; // mail linkleri buraya döner

let kullanici = null;
let yetkili = false; // moderatör / yönetici
let seciliOda = "genel";
let kanal = null;
let onayEposta = ""; // "onay mailini tekrar gönder" hangi adrese gidecek

function bildir(yazi, hataMi = true) {
  formMesaj.textContent = yazi;
  formMesaj.className = hataMi ? "form-mesaj hata" : "form-mesaj basari";
}

// Onay maili gelmediyse tekrar gönderme butonunu göster
function onayButonu(eposta) {
  onayEposta = eposta;
  onayTekrar.hidden = !eposta;
}

// ---------- Formlar arası geçiş (giriş / kayıt / şifremi unuttum / yeni şifre) ----------
const formlar = {
  giris: $("form-giris"),
  kayit: $("form-kayit"),
  unuttum: $("form-unuttum"),
  yeni: $("form-yeni-sifre")
};

function formGoster(mod) {
  for (const [ad, form] of Object.entries(formlar)) form.hidden = ad !== mod;
  formMesaj.textContent = "";
  onayButonu("");
  // Giriş formuna yazılan e-postayı "şifremi unuttum"a taşı
  if (mod === "unuttum" && !$("unuttum-eposta").value) {
    $("unuttum-eposta").value = $("giris-eposta").value;
  }
}

document.querySelectorAll(".sekme").forEach(sekme => {
  sekme.addEventListener("click", () => formGoster(sekme.dataset.mod));
});

// Giriş kartı sadece istenince görünür: üstteki "Giriş yap / Hesap aç" butonları,
// ya da misafir yazmaya çalışınca (forum.js de bunu çağırır)
const istenenMod = new URLSearchParams(location.search).get("mod");
let girisIstendi = istenenMod === "giris" || istenenMod === "kayit";
if (istenenMod === "kayit") formGoster("kayit");

function girisIste(mod = "giris") {
  girisIstendi = true;
  formGoster(mod);
  ekraniAyarla();
  girisAlani.scrollIntoView({ behavior: "smooth", block: "center" });
}

document.querySelectorAll(".giris-iste").forEach(b => {
  b.addEventListener("click", () => girisIste(b.dataset.mod));
});

// ---------- Forum / Canlı sohbet sekmeleri ----------
let aktifSekme = "forum";
document.querySelectorAll(".ana-sekme").forEach(b => {
  b.addEventListener("click", () => {
    if (b.dataset.sekme === "sohbet" && !kullanici) return girisIste("giris");
    aktifSekme = b.dataset.sekme;
    document.querySelectorAll(".ana-sekme").forEach(x => x.classList.toggle("aktif", x === b));
    ekraniAyarla();
  });
});

// ---------- Kayıt ol ----------
$("form-kayit").addEventListener("submit", async e => {
  e.preventDefault();
  const kullaniciAdi = $("kayit-ad").value.trim();
  const eposta = $("kayit-eposta").value.trim();
  const sifre = $("kayit-sifre").value;

  if (!Hesap.AD_KURALI.test(kullaniciAdi)) {
    return bildir("Kullanıcı adı 3-20 karakter olmalı; harf, rakam ve _ kullanabilirsin.");
  }
  if (sifre !== $("kayit-sifre2").value) return bildir("İki şifre aynı değil.");

  Yukleme.goster("Hesabın açılıyor");
  let data, error;
  try {
    // Büyük/küçük harf farkı aynı ad sayılır (Ali = ali). "_" aramada joker olmasın diye kaçırılıyor.
    const { data: varMi } = await sb
      .from("profiller").select("id")
      .ilike("kullanici_adi", kullaniciAdi.replace(/_/g, "\\_"))
      .maybeSingle();
    if (varMi) return bildir("Bu kullanıcı adı alınmış, başka bir tane dene.");

    ({ data, error } = await sb.auth.signUp({
      email: eposta,
      password: sifre,
      options: { data: { kullanici_adi: kullaniciAdi }, emailRedirectTo: buSayfa }
    }));
  } finally {
    Yukleme.gizle();
  }

  if (error) return bildir(Hesap.turkce(error));
  // Supabase, zaten kayıtlı bir e-postayı güvenlik için hata vermeden "boş" kullanıcıyla döndürür
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return bildir("Bu e-posta ile zaten hesap var. Giriş yapmayı ya da \"Şifremi unuttum\"u dene.");
  }
  if (!data.session) {
    bildir("Hesabın oluşturuldu! 📧 E-postana gelen onay linkine tıkla, sonra giriş yap.", false);
    onayButonu(eposta);
  }
});

// ---------- Giriş yap ----------
$("form-giris").addEventListener("submit", async e => {
  e.preventDefault();
  const eposta = $("giris-eposta").value.trim();
  Yukleme.goster("Giriş yapılıyor");
  let error;
  try {
    ({ error } = await sb.auth.signInWithPassword({ email: eposta, password: $("giris-sifre").value }));
  } finally {
    Yukleme.gizle();
  }
  if (error) {
    bildir(Hesap.turkce(error));
    if ((error.message || "").includes("Email not confirmed")) onayButonu(eposta);
  }
});

// ---------- Onay mailini tekrar gönder ----------
onayTekrar.addEventListener("click", async () => {
  onayTekrar.disabled = true;
  const { error } = await sb.auth.resend({
    type: "signup", email: onayEposta, options: { emailRedirectTo: buSayfa }
  });
  onayTekrar.disabled = false;
  if (error) bildir(Hesap.turkce(error));
  else bildir("Onay maili tekrar gönderildi 📧 Gereksiz (spam) klasörüne de bak.", false);
});

// ---------- Şifremi unuttum ----------
$("form-unuttum").addEventListener("submit", async e => {
  e.preventDefault();
  Yukleme.goster("Link gönderiliyor");
  let error;
  try {
    ({ error } = await sb.auth.resetPasswordForEmail($("unuttum-eposta").value.trim(), { redirectTo: buSayfa }));
  } finally {
    Yukleme.gizle();
  }
  if (error) return bildir(Hesap.turkce(error));
  bildir("Bu e-postayla bir hesap varsa şifre yenileme linki gönderildi 📧", false);
});

// ---------- Yeni şifre belirle (mail linkinden gelince) ----------
$("form-yeni-sifre").addEventListener("submit", async e => {
  e.preventDefault();
  const sifre = $("yeni-sifre").value;
  if (sifre !== $("yeni-sifre2").value) return bildir("İki şifre aynı değil.");
  Yukleme.goster("Şifre kaydediliyor");
  let error;
  try {
    ({ error } = await sb.auth.updateUser({ password: sifre }));
  } finally {
    Yukleme.gizle();
  }
  if (error) return bildir(Hesap.turkce(error));
  sifreYenileniyor = false;
  formGoster("giris"); // çıkış yapınca giriş formu görünsün
  ekraniAyarla();
});

// ---------- Çıkış ----------

// Sağ üstteki "Çıkış yap" (herhangi bir sayfadan) buraya ?cikis=1 ile gelir
if (new URLSearchParams(location.search).get("cikis") === "1") {
  sb.auth.signOut().finally(() => history.replaceState(null, "", "topluluk.html"));
}

// ---------- Oturum değişince ekranı ayarla ----------
async function rolYukle() {
  yetkili = Hesap.yetkiliMi(await Hesap.rolum(sb, kullanici.id));
  $("mod-link").hidden = !yetkili;
  if (yetkili && kanal) odaAc(seciliOda); // açık sohbette 🛡️ Sil butonları görünsün
}

async function hosgeldinYaz() {
  const { data } = await sb.from("profiller")
    .select("*").eq("id", kullanici.id).maybeSingle();
  const ad = data ? data.kullanici_adi : (kullanici.user_metadata.kullanici_adi || "öğrenci");
  $("hosgeldin").textContent = "Hoş geldin, " + ad + " " + ((data && data.avatar) || "👋");
}

let oncekiKullanici; // aynı oturum için tekrar tekrar yükleme yapmasın

function ekraniAyarla() {
  if (window.HesapDurumu) HesapDurumu.ayarla(!!kullanici); // sağ üst: Giriş yap ↔ Çıkış yap

  // Şifre yenileme linkinden gelindiyse önce yeni şifre formu
  if (sifreYenileniyor && kullanici) {
    girisAlani.hidden = false;
    formGoster("yeni");
  } else {
    if (kullanici) girisIstendi = false;
    girisAlani.hidden = !!kullanici || !girisIstendi;
  }

  $("profilim-link").hidden = !kullanici;
  $("misafir-not").hidden = !!kullanici;
  if (!kullanici) {
    $("hosgeldin").textContent = "Konu açmak ve cevap yazmak için giriş yap 👉";
    if (aktifSekme === "sohbet") aktifSekme = "forum";
    document.querySelectorAll(".ana-sekme").forEach(x => x.classList.toggle("aktif", x.dataset.sekme === aktifSekme));
  }

  $("forum-alani").hidden = aktifSekme !== "forum";
  sohbetAlani.hidden = !(kullanici && aktifSekme === "sohbet");

  const kimlik = kullanici ? kullanici.id : null;
  if (kimlik !== oncekiKullanici) {
    oncekiKullanici = kimlik;
    Hesap.bildirimleriBaslat(sb, kimlik); // sağ üstteki 🔔
    if (kullanici) {
      hosgeldinYaz();
      rolYukle();
    } else {
      yetkili = false;
      $("mod-link").hidden = true;
    }
    document.dispatchEvent(new Event("oturum-degisti")); // forum.js beğeni vb. için yeniler
  }

  if (kullanici && aktifSekme === "sohbet") {
    if (!kanal) odaAc(seciliOda);
  } else if (kanal) {
    sb.removeChannel(kanal);
    kanal = null;
  }
}

sb.auth.onAuthStateChange((olay, oturum) => {
  kullanici = oturum ? oturum.user : null;
  if (olay === "PASSWORD_RECOVERY") sifreYenileniyor = true;
  // Bu olayın içinde başka Supabase sorgusu beklenirse kilitlenebiliyor; bir adım sonra çalıştır
  setTimeout(ekraniAyarla, 0);
});

// ---------- Sohbet odaları ----------
document.querySelectorAll(".oda").forEach(buton => {
  buton.addEventListener("click", () => {
    document.querySelectorAll(".oda").forEach(b => b.classList.remove("aktif"));
    buton.classList.add("aktif");
    odaAc(buton.dataset.oda);
  });
});

function saatYaz(tarih) {
  return new Date(tarih).toLocaleString("tr-TR", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
  });
}

function mesajEkle(m) {
  const kutu = document.createElement("div");
  kutu.className = "mesaj" + (kullanici && m.kullanici_id === kullanici.id ? " benim" : "");
  kutu.dataset.id = m.id;

  const ust = document.createElement("div");
  ust.className = "mesaj-ust";
  const ad = document.createElement("a");
  ad.className = "mesaj-ad";
  ad.href = "profil.html?ad=" + encodeURIComponent(m.kullanici_adi);
  ad.textContent = m.kullanici_adi;
  const saat = document.createElement("span");
  saat.textContent = saatYaz(m.olusturma);
  ust.append(ad, saat);

  // Kendi mesajını (moderatör herkesinkini) silebilir
  const benim = kutu.classList.contains("benim");
  if (benim || yetkili) {
    const sil = document.createElement("button");
    sil.className = "sil";
    sil.textContent = benim ? "Sil" : "🛡️ Sil";
    sil.addEventListener("click", async () => {
      if (!benim && !(await Hesap.onayla("Bu mesaj silinsin mi?", { tamam: "Sil", tehlike: true }))) return;
      const { error } = await sb.from("mesajlar").delete().eq("id", m.id);
      if (error) return Hesap.bildir(Hesap.turkce(error), "hata");
      kutu.remove();
    });
    ust.append(sil);
  }
  if (!benim) {
    const sikayet = document.createElement("button");
    sikayet.className = "sil sikayet-kucuk";
    sikayet.textContent = "🚩";
    sikayet.title = "Şikâyet et";
    sikayet.setAttribute("aria-label", "Şikâyet et");
    sikayet.addEventListener("click", () => Hesap.sikayetEt(sb, {
      tur: "mesaj", hedef_id: m.id, baglanti: "topluluk.html", ozet: m.kullanici_adi + ": " + m.icerik
    }));
    ust.append(sikayet);
  }

  // Biçimlendirme güvenli: HTML asla çalışmaz, kimse mesajla siteye kod sokamasın
  const icerik = document.createElement("p");
  icerik.append(Hesap.bicimle(m.icerik));

  kutu.append(ust, icerik);
  // Gizlediğin üyenin mesajı kapalı gelir
  mesajListesi.appendChild(!benim && Hesap.gizliMi(m.kullanici_id) ? Hesap.gizliKapak(kutu) : kutu);
  mesajListesi.scrollTop = mesajListesi.scrollHeight;
}

async function odaAc(oda) {
  seciliOda = oda;
  mesajListesi.innerHTML = Yukleme.kutuIcin("Mesajlar yükleniyor");

  const { data, error } = await sb
    .from("mesajlar")
    .select("*")
    .eq("oda", oda)
    .order("olusturma", { ascending: false })
    .limit(50);

  if (oda !== seciliOda) return; // bu arada başka odaya geçildiyse
  mesajListesi.innerHTML = "";

  if (error) {
    mesajListesi.innerHTML = "<p class='bos'>Mesajlar yüklenemedi.</p>";
    return;
  }
  if (data.length === 0) {
    mesajListesi.innerHTML = "<p class='bos'>Henüz mesaj yok. İlk yazan sen ol! ✨</p>";
  }
  data.reverse().forEach(mesajEkle);

  // Canlı: bu odaya yeni mesaj gelince ekrana ekle
  if (kanal) sb.removeChannel(kanal);
  kanal = sb
    .channel("oda-" + oda)
    .on("postgres_changes",
      { event: "INSERT", schema: "public", table: "mesajlar", filter: "oda=eq." + oda },
      yuk => {
        mesajListesi.querySelector(".bos")?.remove();
        if (!mesajListesi.querySelector(`[data-id="${yuk.new.id}"]`)) mesajEkle(yuk.new);
      })
    .subscribe();
}

// ---------- Mesaj gönder ----------
$("form-gonder").addEventListener("submit", async e => {
  e.preventDefault();
  const kutu = $("mesaj-yaz");
  const icerik = kutu.value.trim();
  if (!icerik) return;

  kutu.disabled = true;
  const { error } = await sb.from("mesajlar").insert({ oda: seciliOda, icerik });
  kutu.disabled = false;

  if (error) {
    Hesap.bildir(Hesap.turkce(error), "hata");
  } else {
    kutu.value = "";
  }
  kutu.focus();
});
