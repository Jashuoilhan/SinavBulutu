// Sol üstteki açılır menünün açılıp kapanması.
// - Fareyle üzerine gelince açılır, çıkınca kapanır.
// - Butona tıklayınca açılır; açıkken tekrar tıklayınca kapanır.
// - Telefonda dokununca açılır/kapanır. Dışarı tıklayınca ve Esc ile kapanır.
(function () {
  // ---- Sağ üstteki hesap butonları: girişliyse "Çıkış yap" göster ----
  // Supabase oturumu tarayıcıda "sb-<proje>-auth-token" anahtarıyla saklanır.
  function oturumVarMi() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (/^sb-.+-auth-token$/.test(k) && (localStorage.getItem(k) || "").includes("access_token")) return true;
      }
    } catch (e) {}
    return false;
  }

  function hesapButonlariniAyarla(girisli) {
    const giris = document.querySelector(".hesap-giris");
    const kayit = document.querySelector(".hesap-kayit");
    if (!giris) return;
    // Alt klasördeki sayfalarda (blog/) linkler "../" ile başlar; o ön eki koru
    if (giris.dataset.kok === undefined) {
      giris.dataset.kok = giris.getAttribute("href").replace(/topluluk\.html.*$/, "");
    }
    const kok = giris.dataset.kok;
    giris.textContent = girisli ? "Çıkış yap" : "Giriş yap";
    giris.href = kok + (girisli ? "topluluk.html?cikis=1" : "topluluk.html?mod=giris");
    giris.classList.toggle("cikis", girisli);
    // Girişliyken "Hesap aç" yerine "Profilim"
    if (kayit) {
      // Telefonda sadece 👤 görünür (yazı CSS ile gizlenir)
      kayit.innerHTML = girisli ? '👤<span class="masaustu-yazi"> Profilim</span>' : "Hesap aç";
      kayit.classList.toggle("profilim", girisli);
      kayit.setAttribute("aria-label", girisli ? "Profilim" : "Hesap aç");
      kayit.href = kok + (girisli ? "profil.html" : "topluluk.html?mod=kayit");
    }
  }
  // topluluk.js oturum değişince bunu çağırır
  window.HesapDurumu = { ayarla: hesapButonlariniAyarla };

  document.addEventListener("DOMContentLoaded", () => {
    hesapButonlariniAyarla(oturumVarMi());
  });

  document.addEventListener("DOMContentLoaded", () => {
    const menu = document.querySelector(".acilir-menu");
    if (!menu) return;
    const dugme = menu.querySelector(".am-dugme");

    function ayarla(acik) {
      menu.classList.toggle("acik", acik);
      dugme.setAttribute("aria-expanded", String(acik));
      document.body.classList.toggle("menu-acik", acik); // sayfanın geri kalanı bulanıklaşır
    }

    // Sadece gerçek fare için üzerine gelme (dokunmatikte taklit edilen olaylar yok sayılır)
    menu.addEventListener("pointerenter", e => {
      if (e.pointerType === "mouse" && !menu.classList.contains("kapatildi")) ayarla(true);
    });
    menu.addEventListener("pointerleave", e => {
      if (e.pointerType !== "mouse") return;
      menu.classList.remove("kapatildi");
      ayarla(false);
    });

    dugme.addEventListener("click", e => {
      e.stopPropagation();
      const acilacak = !menu.classList.contains("acik");
      ayarla(acilacak);
      // Fare hâlâ üzerindeyken kapatıldıysa, fare çıkana kadar tekrar açılmasın
      menu.classList.toggle("kapatildi", !acilacak);
    });

    document.addEventListener("click", e => {
      if (!menu.contains(e.target)) ayarla(false);
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && menu.classList.contains("acik")) {
        ayarla(false);
        dugme.focus();
      }
    });
  });
})();
