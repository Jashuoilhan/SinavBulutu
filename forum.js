// Forum: konu listesi, kategoriler, arama, sıralama, sayfalama ve yeni konu açma.
// topluluk.js'ten sonra yüklenir; sb, kullanici, girisIste ve $ oradan gelir.

const SAYFA_BOYU = 15;
const forum = { kategori: new URLSearchParams(location.search).get("kategori") || "", sira: "aktif", arama: "", sayfa: 0, toplam: 0 };
let kategoriler = [];
let sabitDestegi = true; // supabase-duzen.sql çalıştırılmadıysa "sabit" sütunu yok
const konuListesi = $("konu-listesi");

function kategoriBul(id) {
  return kategoriler.find(k => k.id === id) || { ad: id, emoji: "💬" };
}

function forumKurulmadi() {
  konuListesi.innerHTML =
    "<div class='kutu bos-kutu'><p>⚙️ Forum henüz kurulmadı. <code>supabase-forum.sql</code> Supabase'de çalıştırılınca konular burada görünecek.</p></div>";
  $("sayfalama").hidden = true;
}

// ---------- Kategoriler ----------
async function kategorileriYukle() {
  const { data, error } = await sb.from("kategoriler").select("*").order("sira");
  if (error) return Hesap.tabloYok(error) ? forumKurulmadi() : null;
  kategoriler = data;

  const filtre = $("kategori-filtre");
  filtre.innerHTML = "";
  [{ id: "", ad: "Tümü", emoji: "🗂️" }, ...kategoriler].forEach(k => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "oda" + (k.id === forum.kategori ? " aktif" : "");
    b.textContent = k.emoji + " " + k.ad;
    b.addEventListener("click", () => {
      filtre.querySelectorAll("button").forEach(x => x.classList.toggle("aktif", x === b));
      forum.kategori = k.id;
      forum.sayfa = 0;
      listeYukle();
    });
    filtre.append(b);
  });

  const secim = $("konu-kategori");
  secim.innerHTML = "<option value=''>Kategori seç</option>" +
    kategoriler.map(k => `<option value="${k.id}">${k.emoji} ${k.ad}</option>`).join("");
}

// ---------- Konu listesi ----------
function konuKarti(k) {
  const kat = kategoriBul(k.kategori);
  const a = document.createElement("a");
  a.className = "konu-kart" + (k.sabit ? " sabit" : "");
  a.href = "konu.html?id=" + k.id;

  const ust = document.createElement("div");
  ust.className = "konu-kart-ust";
  const etiket = document.createElement("span");
  etiket.className = "konu-etiket";
  etiket.textContent = kat.emoji + " " + kat.ad;
  ust.append(etiket);
  if (k.sabit) ust.append(Object.assign(document.createElement("span"), { className: "konu-etiket", textContent: "📌 Sabit" }));
  if (k.kilitli) ust.append(Object.assign(document.createElement("span"), { className: "konu-etiket kilitli", textContent: "🔒 Kilitli" }));
  if (k.en_iyi_cevap) {
    const cozuldu = document.createElement("span");
    cozuldu.className = "konu-etiket cozuldu";
    cozuldu.textContent = "✅ Çözüldü";
    ust.append(cozuldu);
  }

  const baslik = document.createElement("h3");
  baslik.textContent = k.baslik;

  const ozet = document.createElement("p");
  ozet.className = "konu-ozet";
  const duz = k.icerik.replace(/[*`]/g, ""); // listede biçimlendirme işaretleri görünmesin
  ozet.textContent = duz.length > 160 ? duz.slice(0, 160) + "…" : duz;

  const alt = document.createElement("div");
  alt.className = "konu-meta";
  alt.textContent = `${k.kullanici_adi} · ${Hesap.zaman(k.olusturma)} · 💬 ${k.cevap_sayisi} · ❤️ ${k.begeni_sayisi}`;

  a.append(ust, baslik, ozet, alt);
  return a;
}

async function listeYukle() {
  const istek = { ...forum }; // cevap gelene kadar filtre değişirse eskisini çizme
  konuListesi.innerHTML = Yukleme.kutuIcin("Konular yükleniyor");

  let sorgu = sb.from("konular")
    .select("*", { count: "exact" });
  if (forum.kategori) sorgu = sorgu.eq("kategori", forum.kategori);
  if (forum.arama) sorgu = sorgu.or(`baslik.ilike.*${forum.arama}*,icerik.ilike.*${forum.arama}*`);
  if (forum.sira === "cevapsiz") sorgu = sorgu.eq("cevap_sayisi", 0);

  const siralama = {
    aktif: "son_hareket", yeni: "olusturma", populer: "begeni_sayisi", cevapsiz: "olusturma"
  }[forum.sira];
  // Sabit konular her zaman en üstte (arama yapılırken değil)
  if (sabitDestegi && !forum.arama) sorgu = sorgu.order("sabit", { ascending: false });
  sorgu = sorgu.order(siralama, { ascending: false });
  if (forum.sira === "populer") sorgu = sorgu.order("son_hareket", { ascending: false });

  const bas = forum.sayfa * SAYFA_BOYU;
  const { data, error, count } = await sorgu.range(bas, bas + SAYFA_BOYU - 1);
  if (JSON.stringify(istek) !== JSON.stringify(forum)) return;

  if (error) {
    if (error.code === "42703" && sabitDestegi) { sabitDestegi = false; return listeYukle(); }
    if (Hesap.tabloYok(error)) return forumKurulmadi();
    konuListesi.innerHTML = "<p class='bos'>Konular yüklenemedi. Sayfayı yenilemeyi dene.</p>";
    return;
  }

  konuListesi.innerHTML = "";
  if (data.length === 0) {
    konuListesi.innerHTML = forum.arama
      ? "<p class='bos'>Aramana uygun konu bulunamadı 🔎</p>"
      : "<p class='bos'>Burada henüz konu yok. İlk konuyu sen aç! ✨</p>";
  }
  data.forEach(k => {
    const kart = konuKarti(k);
    const benim = kullanici && k.kullanici_id === kullanici.id;
    konuListesi.append(!benim && Hesap.gizliMi(k.kullanici_id) ? Hesap.gizliKapak(kart) : kart);
  });

  forum.toplam = count || 0;
  const sayfaSayisi = Math.max(1, Math.ceil(forum.toplam / SAYFA_BOYU));
  $("sayfalama").hidden = sayfaSayisi <= 1;
  $("sayfa-bilgi").textContent = `Sayfa ${forum.sayfa + 1} / ${sayfaSayisi}`;
  $("sayfa-geri").disabled = forum.sayfa === 0;
  $("sayfa-ileri").disabled = forum.sayfa + 1 >= sayfaSayisi;
}

$("sayfa-geri").addEventListener("click", () => { forum.sayfa--; listeYukle(); konuListesi.scrollIntoView({ behavior: "smooth" }); });
$("sayfa-ileri").addEventListener("click", () => { forum.sayfa++; listeYukle(); konuListesi.scrollIntoView({ behavior: "smooth" }); });

$("forum-sira").addEventListener("change", e => {
  forum.sira = e.target.value;
  forum.sayfa = 0;
  listeYukle();
});

// Yazmayı bırakınca ara (her harfte değil)
let aramaZamanlayici;
$("forum-ara").addEventListener("input", e => {
  clearTimeout(aramaZamanlayici);
  aramaZamanlayici = setTimeout(() => {
    forum.arama = Hesap.aramaTemizle(e.target.value);
    forum.sayfa = 0;
    listeYukle();
  }, 400);
});

// ---------- Yeni konu ----------
$("yeni-konu-ac").addEventListener("click", () => {
  if (!kullanici) return girisIste("giris");
  const form = $("form-konu");
  form.hidden = false;
  const secim = $("konu-kategori");
  if (forum.kategori) {
    secim.value = forum.kategori;
    secim.dispatchEvent(new Event("change")); // süslü seçim kutusu da güncellensin
  }
  $("konu-baslik").focus();
});

$("yeni-konu-kapat").addEventListener("click", () => { $("form-konu").hidden = true; });

$("form-konu").addEventListener("submit", async e => {
  e.preventDefault();
  const mesaj = $("konu-mesaj");
  const yeni = {
    kategori: $("konu-kategori").value,
    baslik: $("konu-baslik").value.trim(),
    icerik: $("konu-icerik").value.trim()
  };
  mesaj.className = "form-mesaj hata";
  if (!yeni.kategori) return (mesaj.textContent = "Bir kategori seç.");
  if (yeni.baslik.length < 5) return (mesaj.textContent = "Başlık en az 5 karakter olmalı.");
  if (!yeni.icerik) return (mesaj.textContent = "İçerik boş olamaz.");

  Yukleme.goster("Konu açılıyor");
  let data, error;
  try {
    ({ data, error } = await sb.from("konular").insert(yeni).select("id").single());
  } finally {
    Yukleme.gizle();
  }
  if (error) return (mesaj.textContent = Hesap.tabloYok(error) ? "Forum henüz kurulmadı." : Hesap.turkce(error));
  location.href = "konu.html?id=" + data.id;
});

// ---------- Başlangıç ----------
// topluluk.js oturum belli olunca bu olayı gönderir; ilk yüklemeyi de o tetikler
let forumHazir = false;
document.addEventListener("oturum-degisti", async () => {
  if (!forumHazir) {
    forumHazir = true;
    await kategorileriYukle();
    if (!kategoriler.length) return;
  }
  listeYukle();
});
