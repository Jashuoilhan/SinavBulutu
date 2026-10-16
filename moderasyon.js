// Moderasyon paneli: şikâyetleri incele, içeriği sil, üyeyi engelle, engelleri kaldır.
// Sadece rolü "moderator" veya "yonetici" olanlar görür (veritabanı da başkasına göstermez).

const $ = id => document.getElementById(id);
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANAHTAR);
const liste = $("mod-liste");
let sekme = "acik";

const SEBEPLER = {
  hakaret: "Hakaret / zorbalık", spam: "Spam", reklam: "Reklam",
  uygunsuz: "Uygunsuz içerik", kopya: "Telifli içerik", diger: "Diğer"
};
const TURLER = { konu: "📋 Konu", cevap: "💬 Cevap", mesaj: "🗨️ Sohbet mesajı", profil: "👤 Profil" };
const TABLOLAR = { konu: "konular", cevap: "cevaplar", mesaj: "mesajlar" };

function el(etiket, sinif, yazi) {
  const e = document.createElement(etiket);
  if (sinif) e.className = sinif;
  if (yazi !== undefined) e.textContent = yazi;
  return e;
}

function buton(yazi, sinif, islem) {
  const b = el("button", sinif || "kucuk-buton", yazi);
  b.type = "button";
  b.addEventListener("click", islem);
  return b;
}

function bos(yazi) {
  liste.innerHTML = "";
  liste.append(el("p", "bos", yazi));
}

// ---------- Şikâyetler ----------
async function durumYap(s, durum) {
  const { error } = await sb.from("sikayetler").update({ durum }).eq("id", s.id);
  if (error) return Hesap.bildir(Hesap.turkce(error), "hata");
  Hesap.bildir(durum === "kapandi" ? "Şikâyet kapatıldı." : "Şikâyet yeniden açıldı.", "basari");
  yukle();
}

async function icerigiSil(s) {
  if (!(await Hesap.onayla("Şikâyet edilen içerik silinsin mi? Şikâyet de kapatılır.", { tamam: "Sil", tehlike: true }))) return;
  const { error } = await sb.from(TABLOLAR[s.tur]).delete().eq("id", s.hedef_id);
  if (error) return Hesap.bildir(Hesap.turkce(error), "hata");
  Hesap.bildir("İçerik silindi 🛡️", "basari");
  durumYap(s, "kapandi");
}

// Şikâyet edilen içeriğin sahibini bul (engellemek için)
async function sahibiBul(s) {
  if (s.tur === "profil") {
    const { data } = await sb.from("profiller").select("id, kullanici_adi").eq("id", s.hedef_id).maybeSingle();
    return data;
  }
  const { data } = await sb.from(TABLOLAR[s.tur]).select("kullanici_id, kullanici_adi").eq("id", s.hedef_id).maybeSingle();
  return data && { id: data.kullanici_id, kullanici_adi: data.kullanici_adi };
}

function sikayetKarti(s) {
  const kart = el("div", "kutu yazi-kutu sikayet-kart");
  const ust = el("div", "yazi-ust");
  ust.append(
    el("span", "konu-etiket", TURLER[s.tur] || s.tur),
    el("span", "konu-etiket engel", "🚩 " + (SEBEPLER[s.sebep] || s.sebep)),
    el("span", "yazi-zaman",
      Hesap.zaman(s.olusturma) + " · şikâyet eden: " + ((s.profiller && s.profiller.kullanici_adi) || "silinmiş üye"))
  );
  kart.append(ust);
  if (s.ozet) kart.append(el("p", "sikayet-ozet", s.ozet));
  if (s.aciklama) kart.append(el("p", "yazi-icerik", "Açıklama: " + s.aciklama));

  const arac = el("div", "yazi-arac");
  if (s.baglanti) {
    const git = el("a", "kucuk-buton", "👁️ İçeriğe git");
    git.href = s.baglanti;
    git.target = "_blank";
    arac.append(git);
  }
  if (s.durum === "acik") {
    if (TABLOLAR[s.tur]) arac.append(buton("🗑️ İçeriği sil", "kucuk-buton", () => icerigiSil(s)));
    arac.append(buton("⛔ Yazanı engelle", "kucuk-buton", async () => {
      const sahip = await sahibiBul(s);
      if (!sahip) return Hesap.bildir("İçerik ya da üye artık yok.", "hata");
      Hesap.uyeEngelle(sb, sahip.id, sahip.kullanici_adi);
    }));
    arac.append(buton("✔️ Kapat (sorun yok / halledildi)", "kucuk-buton", () => durumYap(s, "kapandi")));
  } else {
    arac.append(buton("↩️ Yeniden aç", "kucuk-buton", () => durumYap(s, "acik")));
  }
  kart.append(arac);
  return kart;
}

async function sikayetleriYukle(durum) {
  const { data, error } = await sb.from("sikayetler")
    .select("*, profiller(kullanici_adi)")
    .eq("durum", durum)
    .order("olusturma", { ascending: durum === "acik" }) // açıklarda en eski önce
    .limit(100);
  if (error) return bos(Hesap.tabloYok(error) ? "Şikâyet sistemi henüz kurulmadı (supabase-duzen.sql)." : Hesap.turkce(error));
  if (!data.length) return bos(durum === "acik" ? "Açık şikâyet yok 🎉" : "Kapanmış şikâyet yok.");
  liste.replaceChildren(...data.map(sikayetKarti));
}

// ---------- Engelli üyeler ----------
async function engellileriYukle() {
  const { data, error } = await sb.rpc("engelli_uyeler");
  if (error) return bos(Hesap.turkce(error));
  if (!data.length) return bos("Engelli üye yok.");
  liste.replaceChildren(...data.map(u => {
    const kart = el("div", "kutu yazi-kutu");
    const ust = el("div", "yazi-ust");
    const ad = el("a", "mesaj-ad", u.kullanici_adi);
    ad.href = "profil.html?ad=" + encodeURIComponent(u.kullanici_adi);
    const bitis = new Date(u.engel_bitis);
    ust.append(ad, el("span", "yazi-zaman", bitis.getFullYear() > 2100
      ? "Kalıcı engel"
      : "Engel bitişi: " + bitis.toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })));
    const arac = el("div", "yazi-arac");
    arac.append(buton("✅ Engeli kaldır", "kucuk-buton", async () => {
      const { error } = await sb.rpc("uye_engelle", { hedef: u.id, gun: 0 });
      if (error) return Hesap.bildir(Hesap.turkce(error), "hata");
      Hesap.bildir(u.kullanici_adi + " kullanıcısının engeli kaldırıldı.", "basari");
      yukle();
    }));
    kart.append(ust, arac);
    return kart;
  }));
}

function yukle() {
  liste.innerHTML = Yukleme.kutuIcin("Yükleniyor");
  if (sekme === "engelli") engellileriYukle();
  else sikayetleriYukle(sekme);
}

document.querySelectorAll(".ana-sekme").forEach(b => {
  b.addEventListener("click", () => {
    sekme = b.dataset.sekme;
    document.querySelectorAll(".ana-sekme").forEach(x => x.classList.toggle("aktif", x === b));
    yukle();
  });
});

// ---------- Sayfa açılınca: yetki kontrolü ----------
(async function () {
  const { data: { session } } = await sb.auth.getSession();
  const ben = session ? session.user : null;
  Hesap.bildirimleriBaslat(sb, ben && ben.id);
  if (!ben) {
    $("mod-yok-yazi").textContent = "Bu sayfa için giriş yapmalısın.";
    return ($("mod-yok").hidden = false);
  }
  if (!Hesap.yetkiliMi(await Hesap.rolum(sb, ben.id))) return ($("mod-yok").hidden = false);
  $("mod-alani").hidden = false;
  yukle();
})();
