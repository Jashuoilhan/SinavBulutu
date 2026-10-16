// Hesap ve topluluk sayfalarının ortak parçaları (topluluk.html, konu.html, profil.html, moderasyon.html).

const Hesap = {
  // Kullanıcı adı kuralı: veritabanındaki kuralla aynı
  AD_KURALI: /^[a-zA-Z0-9_çğıöşüÇĞİÖŞÜ]{3,20}$/,

  // Supabase'in İngilizce / teknik hata mesajlarını Türkçeleştir
  turkce(hata) {
    const m = hata.message || String(hata);
    const engel = m.match(/ENGELLI:(.+)/);
    if (engel) return "Hesabın " + engel[1] + " tarihine kadar yazı yazamaz (topluluk kuralları).";
    if (m.includes("COK_HIZLI")) return "Çok hızlı yazıyorsun 🙂 Biraz bekleyip tekrar dene.";
    if (m.includes("KONU_KILITLI")) return "Bu konu kilitlendi, yeni cevap yazılamaz.";
    if (m.includes("YETKI_YOK")) return "Bunun için yetkin yok.";
    if (m.includes("Invalid login credentials")) return "E-posta veya şifre yanlış.";
    if (m.includes("Email not confirmed")) return "Önce e-postana gelen onay linkine tıkla.";
    if (m.includes("User already registered")) return "Bu e-posta ile zaten hesap var.";
    if (m.includes("Password should be")) return "Şifre en az 6 karakter olmalı.";
    if (m.includes("different from the old password")) return "Yeni şifre eskisiyle aynı olamaz.";
    if (m.includes("rate limit") || m.includes("security purposes")) return "Çok fazla deneme yaptın, biraz bekle.";
    if (m.includes("Database error saving new user")) return "Bu kullanıcı adı alınmış olabilir, başka dene.";
    if (hata.code === "23505" || m.includes("duplicate key")) return "Bu kullanıcı adı alınmış, başka bir tane dene.";
    if (m.includes("kullanici_adi_bicim")) return "Kullanıcı adı 3-20 karakter olmalı; harf, rakam ve _ kullanabilirsin.";
    if (m.includes("Failed to fetch")) return "İnternet bağlantını kontrol et.";
    return "Bir hata oldu: " + m;
  },

  // "3 dk önce", "dün", "12 Eki" gibi
  zaman(tarih) {
    const t = new Date(tarih);
    const sn = (Date.now() - t) / 1000;
    if (sn < 60) return "az önce";
    if (sn < 3600) return Math.floor(sn / 60) + " dk önce";
    if (sn < 86400) return Math.floor(sn / 3600) + " saat önce";
    if (sn < 172800) return "dün";
    if (sn < 604800) return Math.floor(sn / 86400) + " gün önce";
    return t.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
  },

  // Arama kutusundaki yazıyı Supabase filtresini bozmayacak hale getir
  aramaTemizle(yazi) {
    return yazi.replace(/[,()%_\\*."']/g, " ").trim().slice(0, 60);
  },

  // Tablo henüz kurulmadıysa (ilgili supabase-*.sql çalıştırılmadıysa)
  tabloYok(hata) {
    const m = (hata && hata.message) || "";
    return !!hata && (hata.code === "42P01" || hata.code === "PGRST205" || hata.code === "42703" ||
      m.includes("does not exist") || m.includes("schema cache"));
  },

  // Avatar: fotoğraf varsa resim, yoksa emoji
  avatar(profil, sinif = "yazi-avatar") {
    const kutu = document.createElement("span");
    kutu.className = sinif;
    if (profil && profil.foto) {
      const img = document.createElement("img");
      img.src = profil.foto;
      img.alt = "";
      img.loading = "lazy";
      kutu.append(img);
    } else {
      kutu.textContent = (profil && profil.avatar) || "🙂";
    }
    return kutu;
  },

  // ---------- Yazı biçimlendirme (güvenli) ----------
  // **kalın**, *italik*, `kod`, linkler otomatik. HTML asla çalıştırılmaz: her parça
  // textContent ile eklenir, link sadece http/https olabilir.
  bicimle(yazi) {
    const parca = document.createDocumentFragment();
    const desen = /(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(`[^`\n]+`)|(https?:\/\/[^\s<>"]+[^\s<>".,;:!?)\]])/g;
    let son = 0, m;
    while ((m = desen.exec(yazi))) {
      if (m.index > son) parca.append(yazi.slice(son, m.index));
      let e;
      if (m[1]) { e = document.createElement("strong"); e.textContent = m[1].slice(2, -2); }
      else if (m[2]) { e = document.createElement("em"); e.textContent = m[2].slice(1, -1); }
      else if (m[3]) { e = document.createElement("code"); e.textContent = m[3].slice(1, -1); }
      else {
        e = document.createElement("a");
        e.href = m[4];
        e.textContent = m[4].length > 60 ? m[4].slice(0, 57) + "…" : m[4];
        e.target = "_blank";
        e.rel = "nofollow ugc noopener noreferrer";
      }
      parca.append(e);
      son = desen.lastIndex;
    }
    if (son < yazi.length) parca.append(yazi.slice(son));
    return parca;
  },

  // ---------- alert() yerine sağ altta kaybolan bildirim ----------
  bildir(yazi, tur = "bilgi") {
    let alan = document.querySelector(".tost-alani");
    if (!alan) {
      alan = document.createElement("div");
      alan.className = "tost-alani";
      alan.setAttribute("role", "status");
      alan.setAttribute("aria-live", "polite");
      document.body.append(alan);
    }
    const tost = document.createElement("div");
    tost.className = "tost " + tur;
    tost.textContent = yazi;
    alan.append(tost);
    setTimeout(() => tost.classList.add("gidiyor"), 4000);
    setTimeout(() => tost.remove(), 4400);
  },

  // ---------- Ortadan açılan pencere (onay / şikâyet için) ----------
  pencere(icerik) {
    const arka = document.createElement("div");
    arka.className = "pencere-arka";
    const kutu = document.createElement("div");
    kutu.className = "pencere";
    kutu.setAttribute("role", "dialog");
    kutu.setAttribute("aria-modal", "true");
    kutu.append(icerik);
    arka.append(kutu);
    document.body.append(arka);
    const kapat = () => { arka.remove(); document.removeEventListener("keydown", esc); };
    const esc = e => { if (e.key === "Escape") kapat(); };
    document.addEventListener("keydown", esc);
    arka.addEventListener("click", e => { if (e.target === arka) kapat(); });
    setTimeout(() => (kutu.querySelector("textarea, select, button") || kutu).focus(), 0);
    return kapat;
  },

  // confirm() yerine: await Hesap.onayla("Emin misin?") → true / false
  onayla(soru, { tamam = "Evet", tehlike = false } = {}) {
    return new Promise(coz => {
      const form = document.createElement("form");
      form.className = "hk-form";
      const p = document.createElement("p");
      p.className = "pencere-soru";
      p.textContent = soru;
      const butonlar = document.createElement("div");
      butonlar.className = "hk-butonlar";
      const evet = document.createElement("button");
      evet.className = "hk-buton" + (tehlike ? " tehlike" : "");
      evet.textContent = tamam;
      const hayir = document.createElement("button");
      hayir.type = "button";
      hayir.className = "hk-buton ikincil";
      hayir.textContent = "Vazgeç";
      butonlar.append(evet, hayir);
      form.append(p, butonlar);

      let sonuc = false;
      const kapat = Hesap.pencere(form);
      const bitir = deger => { sonuc = deger; kapat(); coz(sonuc); };
      form.addEventListener("submit", e => { e.preventDefault(); bitir(true); });
      hayir.addEventListener("click", () => bitir(false));
      // Esc / dışarı tıklama: pencere kapanır, cevap "hayır"
      new MutationObserver((_, g) => { if (!form.isConnected) { g.disconnect(); coz(sonuc); } })
        .observe(document.body, { childList: true });
    });
  },

  // ---------- Şikâyet et ----------
  // hedef: { tur: "konu"|"cevap"|"mesaj"|"profil", hedef_id, baglanti, ozet }
  sikayetEt(sb, hedef) {
    const form = document.createElement("form");
    form.className = "hk-form";
    form.innerHTML = `
      <p class="hk-baslik">🚩 Şikâyet et</p>
      <select required aria-label="Sebep" data-yerli class="pencere-secim">
        <option value="">Sebep seç</option>
        <option value="hakaret">Hakaret / zorbalık</option>
        <option value="spam">Spam</option>
        <option value="reklam">Reklam</option>
        <option value="uygunsuz">Uygunsuz içerik</option>
        <option value="kopya">Telifli içerik (kitap, PDF vb.)</option>
        <option value="diger">Diğer</option>
      </select>
      <div class="hk-alan"><textarea class="hk-girdi" rows="3" maxlength="500" placeholder="İstersen açıkla (zorunlu değil)" aria-label="Açıklama"></textarea></div>
      <div class="hk-butonlar">
        <button class="hk-buton">Gönder</button>
        <button type="button" class="hk-buton ikincil">Vazgeç</button>
      </div>
      <p class="form-mesaj hata"></p>`;
    const kapat = Hesap.pencere(form);
    form.querySelector(".ikincil").addEventListener("click", kapat);
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const gonder = form.querySelector(".hk-buton");
      gonder.disabled = true;
      const { error } = await sb.from("sikayetler").insert({
        tur: hedef.tur,
        hedef_id: String(hedef.hedef_id),
        baglanti: hedef.baglanti || null,
        ozet: (hedef.ozet || "").slice(0, 300) || null,
        sebep: form.querySelector("select").value,
        aciklama: form.querySelector("textarea").value.trim() || null
      });
      gonder.disabled = false;
      if (error && error.code !== "23505") {
        form.querySelector(".form-mesaj").textContent =
          Hesap.tabloYok(error) ? "Şikâyet sistemi henüz kurulmadı." : Hesap.turkce(error);
        return;
      }
      kapat();
      Hesap.bildir(error ? "Bunu zaten şikâyet etmiştin, inceleniyor." : "Şikâyetin alındı, teşekkürler 🙏", "basari");
    });
  },

  // ---------- Moderatör: üyeyi engelle ----------
  uyeEngelle(sb, uyeId, ad) {
    const form = document.createElement("form");
    form.className = "hk-form";
    form.innerHTML = `
      <p class="hk-baslik">⛔ Üyeyi engelle</p>
      <p class="pencere-soru"></p>
      <select required aria-label="Süre" data-yerli class="pencere-secim">
        <option value="1">1 gün</option>
        <option value="3">3 gün</option>
        <option value="7" selected>7 gün</option>
        <option value="30">30 gün</option>
        <option value="36500">Kalıcı</option>
        <option value="0">Engeli kaldır</option>
      </select>
      <div class="hk-butonlar">
        <button class="hk-buton tehlike">Uygula</button>
        <button type="button" class="hk-buton ikincil">Vazgeç</button>
      </div>
      <p class="form-mesaj hata"></p>`;
    form.querySelector(".pencere-soru").textContent =
      ad + " bu süre boyunca konu, cevap ve sohbet mesajı yazamaz. Okumaya devam edebilir.";
    const kapat = Hesap.pencere(form);
    form.querySelector(".ikincil").addEventListener("click", kapat);
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const gun = Number(form.querySelector("select").value);
      const { error } = await sb.rpc("uye_engelle", { hedef: uyeId, gun });
      if (error) return (form.querySelector(".form-mesaj").textContent = Hesap.turkce(error));
      kapat();
      Hesap.bildir(gun ? ad + " engellendi." : ad + " kullanıcısının engeli kaldırıldı.", "basari");
    });
  },

  // ---------- Bildirim zili (sağ üst) ----------
  // Her sayfa giriş belli olunca çağırır: Hesap.bildirimleriBaslat(sb, kullaniciId | null)
  bildirimleriBaslat(sb, kullaniciId) {
    const eski = document.querySelector(".zil");
    if (eski) eski.remove();
    if (Hesap._zilKanal) { sb.removeChannel(Hesap._zilKanal); Hesap._zilKanal = null; }
    const yer = document.querySelector(".hesap-butonlari");
    if (!kullaniciId || !yer) return;

    const kok = location.pathname.includes("/blog/") ? "../" : "";
    const zil = document.createElement("div");
    zil.className = "zil";
    zil.innerHTML = `
      <button type="button" class="zil-dugme" aria-label="Bildirimler" aria-expanded="false">🔔<span class="zil-sayi" hidden></span></button>
      <div class="zil-panel" hidden>
        <div class="zil-ust"><b>Bildirimler</b><button type="button" class="zil-hepsi">Tümünü okundu yap</button></div>
        <div class="zil-liste"></div>
      </div>`;
    yer.prepend(zil);
    const dugme = zil.querySelector(".zil-dugme");
    const panel = zil.querySelector(".zil-panel");
    const liste = zil.querySelector(".zil-liste");
    const sayiEl = zil.querySelector(".zil-sayi");

    const YAZI = {
      cevap: k => `${k} konuna cevap yazdı`,
      en_iyi: k => `${k} cevabını en iyi cevap seçti ✅`,
      begeni: k => `${k} yazını beğendi ❤️`
    };

    async function yukle() {
      const { data, error } = await sb.from("bildirimler").select("*")
        .order("olusturma", { ascending: false }).limit(20);
      if (error) { zil.remove(); return; } // tablo henüz yok
      const okunmamis = data.filter(b => !b.okundu).length;
      sayiEl.hidden = !okunmamis;
      sayiEl.textContent = okunmamis > 9 ? "9+" : okunmamis;
      dugme.setAttribute("aria-label", "Bildirimler" + (okunmamis ? ` (${okunmamis} yeni)` : ""));

      liste.innerHTML = data.length ? "" : "<p class='zil-bos'>Henüz bildirim yok.</p>";
      data.forEach(b => {
        const a = document.createElement("a");
        a.className = "zil-oge" + (b.okundu ? "" : " yeni");
        a.href = kok + "konu.html?id=" + b.konu_id;
        const ana = document.createElement("span");
        ana.textContent = YAZI[b.tur] ? YAZI[b.tur](b.kimden || "Biri") : "Yeni bildirim";
        const alt = document.createElement("small");
        alt.textContent = (b.baslik || "") + " · " + Hesap.zaman(b.olusturma);
        a.append(ana, alt);
        a.addEventListener("click", () => {
          if (!b.okundu) sb.from("bildirimler").update({ okundu: true }).eq("id", b.id);
        });
        liste.append(a);
      });
    }

    dugme.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      dugme.setAttribute("aria-expanded", String(!panel.hidden));
    });
    document.addEventListener("click", e => {
      if (!zil.contains(e.target)) { panel.hidden = true; dugme.setAttribute("aria-expanded", "false"); }
    });
    zil.querySelector(".zil-hepsi").addEventListener("click", async () => {
      await sb.from("bildirimler").update({ okundu: true }).eq("okundu", false);
      yukle();
    });

    // Canlı: yeni bildirim gelince sayaç hemen artsın
    Hesap._zilKanal = sb.channel("bildirim-" + kullaniciId)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "bildirimler", filter: "alici=eq." + kullaniciId },
        yukle)
      .subscribe();
    yukle();
  },

  // ---------- Üyeyi benim için gizle (sadece bu tarayıcıda) ----------
  gizlenenler() {
    try { return JSON.parse(localStorage.getItem("sb-gizlenenler") || "{}"); } catch (e) { return {}; }
  },
  gizliMi(id) {
    return !!id && id in Hesap.gizlenenler();
  },
  gizlemeAyarla(id, ad, gizle) {
    const liste = Hesap.gizlenenler();
    if (gizle) liste[id] = ad; else delete liste[id];
    try { localStorage.setItem("sb-gizlenenler", JSON.stringify(liste)); } catch (e) {}
    Hesap.bildir(gizle ? ad + " gizlendi. Yazıları sana kapalı görünecek." : ad + " artık gizli değil.", "basari");
  },
  // Gizli üyenin yazısı yerine "göster" düğmeli kapalı kutu
  gizliKapak(asil) {
    const kapak = document.createElement("div");
    kapak.className = "gizli-kapak";
    const yazi = document.createElement("span");
    yazi.textContent = "🙈 Gizlediğin bir üyenin yazısı";
    const goster = document.createElement("button");
    goster.type = "button";
    goster.className = "hk-link";
    goster.textContent = "Göster";
    goster.addEventListener("click", () => kapak.replaceWith(asil));
    kapak.append(yazi, goster);
    return kapak;
  },

  // Giriş yapan kişinin rolü: "uye" | "moderator" | "yonetici"
  async rolum(sb, kullaniciId) {
    if (!kullaniciId) return "uye";
    const { data } = await sb.from("profiller").select("*").eq("id", kullaniciId).maybeSingle();
    return (data && data.rol) || "uye";
  },

  yetkiliMi(rol) {
    return rol === "moderator" || rol === "yonetici";
  }
};

// Şifre kutularındaki 👁️ butonu: şifreyi göster / gizle
document.addEventListener("click", e => {
  const goz = e.target.closest(".sifre-goz");
  if (!goz) return;
  const girdi = goz.parentElement.querySelector("input");
  const goster = girdi.type === "password";
  girdi.type = goster ? "text" : "password";
  goz.textContent = goster ? "🙈" : "👁️";
  goz.setAttribute("aria-label", goster ? "Şifreyi gizle" : "Şifreyi göster");
  goz.title = goz.getAttribute("aria-label");
});
