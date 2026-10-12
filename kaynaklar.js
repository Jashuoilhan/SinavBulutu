// Kaynaklar sayfası: YKS / KPSS / ALES filtreleri
document.addEventListener("DOMContentLoaded", () => {
  const butonlar = document.querySelectorAll(".kaynak-filtre button");
  const bolumler = document.querySelectorAll(".kaynak-bolum");

  butonlar.forEach(buton => {
    buton.addEventListener("click", () => {
      butonlar.forEach(b => b.classList.remove("aktif"));
      buton.classList.add("aktif");
      const grup = buton.dataset.grup;
      bolumler.forEach(bolum => {
        bolum.hidden = grup !== "hepsi" && bolum.dataset.grup !== grup;
      });
    });
  });
});
