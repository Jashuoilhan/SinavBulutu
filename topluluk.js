// Topluluk: kayıt, giriş ve canlı sohbet odaları.
// Bağlantı bilgileri supabase-ayar.js dosyasında.

const $ = id => document.getElementById(id);

const girisAlani = $("giris-alani");
const sohbetAlani = $("sohbet-alani");
const ayarUyari = $("ayar-uyari");
const formMesaj = $("form-mesaj");
const mesajListesi = $("mesaj-listesi");

if (SUPABASE_URL.startsWith("BURAYA")) {
  ayarUyari.hidden = false;
  girisAlani.hidden = true;
  throw new Error("supabase-ayar.js doldurulmamış");
}

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANAHTAR);

let kullanici = null;
let seciliOda = "genel";
let kanal = null;

// ---------- Hata mesajlarını Türkçeleştir ----------
function turkce(hata) {
  const m = hata.message || String(hata);
  if (m.includes("Invalid login credentials")) return "E-posta veya şifre yanlış.";
  if (m.includes("Email not confirmed")) return "Önce e-postana gelen onay linkine tıkla.";
  if (m.includes("User already registered")) return "Bu e-posta ile zaten hesap var.";
  if (m.includes("Password should be")) return "Şifre en az 6 karakter olmalı.";
  if (m.includes("rate limit")) return "Çok fazla deneme yaptın, biraz bekle.";
  if (m.includes("Database error saving new user")) return "Bu kullanıcı adı alınmış olabilir, başka dene.";
  return "Bir hata oldu: " + m;
}

function bildir(yazi, hataMi = true) {
  formMesaj.textContent = yazi;
  formMesaj.className = hataMi ? "form-mesaj hata" : "form-mesaj basari";
}

// ---------- Giriş / Kayıt sekmeleri ----------
document.querySelectorAll(".sekme").forEach(sekme => {
  sekme.addEventListener("click", () => {
    document.querySelectorAll(".sekme").forEach(s => s.classList.remove("aktif"));
    sekme.classList.add("aktif");
    const kayitMi = sekme.dataset.mod === "kayit";
    $("form-giris").hidden = kayitMi;
    $("form-kayit").hidden = !kayitMi;
    formMesaj.textContent = "";
  });
});

// Üstteki "Hesap aç" butonundan gelindiyse kayıt sekmesini aç
if (new URLSearchParams(location.search).get("mod") === "kayit") {
  document.querySelector('.sekme[data-mod="kayit"]').click();
}

// ---------- Kayıt ol ----------
$("form-kayit").addEventListener("submit", async e => {
  e.preventDefault();
  const kullaniciAdi = $("kayit-ad").value.trim();
  const eposta = $("kayit-eposta").value.trim();
  const sifre = $("kayit-sifre").value;

  if (!/^[a-zA-Z0-9_çğıöşüÇĞİÖŞÜ]{3,20}$/.test(kullaniciAdi)) {
    return bildir("Kullanıcı adı 3-20 karakter olmalı; harf, rakam ve _ kullanabilirsin.");
  }

  const { data: varMi } = await sb
    .from("profiller").select("id").eq("kullanici_adi", kullaniciAdi).maybeSingle();
  if (varMi) return bildir("Bu kullanıcı adı alınmış, başka bir tane dene.");

  const { data, error } = await sb.auth.signUp({
    email: eposta,
    password: sifre,
    options: { data: { kullanici_adi: kullaniciAdi } }
  });

  if (error) return bildir(turkce(error));
  if (!data.session) {
    bildir("Hesabın oluşturuldu! 📧 E-postana gelen onay linkine tıkla, sonra giriş yap.", false);
  }
});

// ---------- Giriş yap ----------
$("form-giris").addEventListener("submit", async e => {
  e.preventDefault();
  const { error } = await sb.auth.signInWithPassword({
    email: $("giris-eposta").value.trim(),
    password: $("giris-sifre").value
  });
  if (error) bildir(turkce(error));
});

// ---------- Çıkış ----------
$("cikis").addEventListener("click", () => sb.auth.signOut());

// ---------- Oturum değişince ekranı ayarla ----------
sb.auth.onAuthStateChange(async (_olay, oturum) => {
  kullanici = oturum ? oturum.user : null;
  girisAlani.hidden = !!kullanici;
  sohbetAlani.hidden = !kullanici;

  if (kullanici) {
    $("hosgeldin").textContent =
      "Hoş geldin, " + (kullanici.user_metadata.kullanici_adi || "öğrenci") + " 👋";
    odaAc(seciliOda);
  } else if (kanal) {
    sb.removeChannel(kanal);
    kanal = null;
  }
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
  const ad = document.createElement("b");
  ad.textContent = m.kullanici_adi;
  const saat = document.createElement("span");
  saat.textContent = saatYaz(m.olusturma);
  ust.append(ad, saat);

  // Kendi mesajını silebilir
  if (kutu.classList.contains("benim")) {
    const sil = document.createElement("button");
    sil.className = "sil";
    sil.textContent = "Sil";
    sil.addEventListener("click", async () => {
      const { error } = await sb.from("mesajlar").delete().eq("id", m.id);
      if (!error) kutu.remove();
    });
    ust.append(sil);
  }

  // textContent kullanıyoruz: kimse mesajla siteye kod sokamasın
  const icerik = document.createElement("p");
  icerik.textContent = m.icerik;

  kutu.append(ust, icerik);
  mesajListesi.appendChild(kutu);
  mesajListesi.scrollTop = mesajListesi.scrollHeight;
}

async function odaAc(oda) {
  seciliOda = oda;
  mesajListesi.innerHTML = "<p class='bos'>Yükleniyor...</p>";

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
    alert("Mesaj gönderilemedi: " + error.message);
  } else {
    kutu.value = "";
  }
  kutu.focus();
});
