// =====================================================================
//  ARKA PLAN: 3B hareketli bulutlar (kullanıcının getirdiği
//  "Moving Clouds" / CloudGenerator kodundan uyarlandı).
//  - Bulut dokusu dış siteden çekilmez, burada canvas ile çizilir.
//  - jQuery gerekmez.
//  - Koyu temada gece gökyüzü (stil: style.css → .bulut3d).
//  Önceki arka plan (deniz sahnesi) yedekte: yedekler/okyanus-deniz-v1.js
// =====================================================================
(function () {
  // Yumuşak, puf puf bir bulut dokusu üret (256x256, şeffaf zemin)
  function bulutDokusu() {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const x = c.getContext("2d");
    for (let i = 0; i < 22; i++) {
      const px = 128 + (Math.random() - 0.5) * 120;
      const py = 128 + (Math.random() - 0.5) * 70;
      const r = 40 + Math.random() * 50;
      const g = x.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, "rgba(255,255,255,0.55)");
      g.addColorStop(0.5, "rgba(255,255,255,0.25)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      x.fillStyle = g;
      x.beginPath();
      x.arc(px, py, r, 0, Math.PI * 2);
      x.fill();
    }
    return c.toDataURL("image/png");
  }

  function CloudGenerator(el, image) {
    this.viewport = el;
    this.cloudBG = image;
    this.world = document.createElement("div");
    this.world.className = "gok3d";
    this.viewport.appendChild(this.world);
    this.olcu();
    this.imgLayers = [];
    this.numClouds = 5;
  }

  CloudGenerator.prototype.olcu = function () {
    const margin = 300;
    this.width = this.viewport.offsetWidth - margin;
    this.height = this.viewport.offsetHeight - margin;
  };

  CloudGenerator.prototype.donustur = function (layer) {
    const d = layer.data;
    layer.style.transform = `translateX(${d.x}px) translateY(${d.y}px) translateZ(${d.z}px) rotateZ(${d.a}deg) scale(${d.s})`;
  };

  CloudGenerator.prototype.createCloud = function (x) {
    const cloud = {
      x: x,
      y: this.height / 2 - Math.random() * this.height,
      z: 400 - Math.random() * 512,
      xSpeed: 0.3 + 0.075 * Math.random() // orijinalin 1,5 katı
    };
    const adet = 5 + Math.round(Math.random() * 10);
    for (let i = 0; i < adet; i++) {
      const image = document.createElement("img");
      image.src = this.cloudBG;
      image.alt = "";
      image.className = "cloudLayer";
      image.data = {
        x: cloud.x + 0.2 * (256 - Math.random() * 512),
        y: cloud.y + 0.2 * (256 - Math.random() * 512),
        z: cloud.z + 100 - Math.random() * 200,
        a: Math.random() * 360,
        s: 0.25 + Math.random(),
        xSpeed: cloud.xSpeed,
        rSpeed: 0.1 * Math.random()
      };
      this.donustur(image);
      image.style.zIndex = Math.floor(image.data.z);
      this.world.appendChild(image);
      this.imgLayers.push(image);
    }
  };

  CloudGenerator.prototype.update = function () {
    if (this.imgLayers.length < this.numClouds * 7) this.createCloud(-this.width - 100);

    for (let i = this.imgLayers.length - 1; i >= 0; i--) {
      const layer = this.imgLayers[i];
      layer.data.x += layer.data.xSpeed;
      layer.data.a += layer.data.rSpeed;
      // Bulut sağdan çıkınca katmanı sil
      if (layer.data.x > this.width + 300) {
        this.world.removeChild(layer);
        this.imgLayers.splice(i, 1);
        continue;
      }
      this.donustur(layer);
    }
    requestAnimationFrame(this.update.bind(this));
  };

  // Açılışta bulutların içinden geçerek uzaklaşma (zoom) efekti
  CloudGenerator.prototype.updateZoom = function (zoom) {
    this.world.style.transform = `translateZ(${zoom}px)`;
    this.world.classList.add("gorunur");
    if (zoom >= 1) requestAnimationFrame(this.updateZoom.bind(this, zoom - 5));
  };

  CloudGenerator.prototype.init = function (hareketsiz) {
    const w = this.width;
    const baslangic = [-w / 2 + w * 0.05, -w / 2 + w * 0.2, 0, w / 2 + w * 0.05, w / 2 + w * 0.35];
    for (let i = 0; i < this.numClouds; i++) this.createCloud(baslangic[i]);
    if (hareketsiz) { this.world.classList.add("gorunur"); return; }
    this.updateZoom(1500);
    this.update();
  };

  document.addEventListener("DOMContentLoaded", () => {
    const sahne = document.createElement("div");
    sahne.className = "bulut3d";
    sahne.setAttribute("aria-hidden", "true");
    document.body.prepend(sahne);

    const hareketsiz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bulutlar = new CloudGenerator(sahne, bulutDokusu());
    bulutlar.init(hareketsiz);
    window.addEventListener("resize", () => bulutlar.olcu());
  });
})();
