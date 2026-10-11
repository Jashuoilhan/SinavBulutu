// Açık / koyu tema. Seçim tarayıcıda saklanır.
// <head> içinde yüklenir ki sayfa açılırken yanlış renk yanıp sönmesin.
(function () {
  let kayitli = null;
  try { kayitli = localStorage.getItem("tema"); } catch (e) {}
  if (kayitli === "koyu") document.documentElement.dataset.tema = "koyu";

  // Anahtar: Uiverse.io ui-switch'ten uyarlandı (güneş ↔ ay)
  const anahtarHtml = `
    <label class="ui-switch" title="Gece / gündüz">
      <input type="checkbox" aria-label="Koyu tema">
      <div class="slider">
        <div class="circle"></div>
      </div>
    </label>`;

  document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header");
    if (!header) return;
    // Anahtar "Giriş yap" butonunun yanında durur
    const yer = header.querySelector(".hesap-butonlari") || header;
    yer.insertAdjacentHTML("afterbegin", anahtarHtml);
    const kutu = header.querySelector(".ui-switch input");
    kutu.checked = document.documentElement.dataset.tema === "koyu";
    kutu.addEventListener("change", () => {
      const koyu = kutu.checked;
      if (koyu) document.documentElement.dataset.tema = "koyu";
      else delete document.documentElement.dataset.tema;
      try { localStorage.setItem("tema", koyu ? "koyu" : "acik"); } catch (e) {}
    });
  });
})();
