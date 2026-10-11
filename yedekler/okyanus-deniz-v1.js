// =====================================================================
//  ARKA PLAN: canlı gökyüzü + deniz sahnesi (kullanıcının getirdiği
//  "Tides" canvas animasyonundan uyarlandı).
//  Sahne, siteye girildiği andaki İSTANBUL SAATİNE göre çizilir ve
//  dakikada bir güncellenir: 05:00 şafak → öğle → gün batımı → 23:00 gece.
//  Koyu tema açıkken her zaman gece sahnesi gösterilir.
// =====================================================================
(function () {
  let canvas, ctx, W, H, DPR, horizonY, oceanH;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    horizonY = H * 0.42;
    oceanH = H - horizonY;
  }

  // Renk anahtar kareleri (t: 0 = 05:00, 1 = 23:00)
  const KEYS = [
    { t: 0.0, skyTop: [38, 44, 86], skyHor: [247, 176, 128], sun: [255, 238, 206], glow: [255, 178, 120], wFar: [176, 150, 150], wNear: [34, 62, 84], foam: [255, 244, 234], sunH: 0.1, glit: 0.7, star: 0 },
    { t: 0.28, skyTop: [64, 134, 206], skyHor: [188, 222, 236], sun: [255, 255, 246], glow: [255, 250, 224], wFar: [120, 186, 196], wNear: [20, 92, 114], foam: [255, 255, 255], sunH: 0.55, glit: 0.5, star: 0 },
    { t: 0.5, skyTop: [58, 142, 214], skyHor: [176, 216, 230], sun: [255, 255, 248], glow: [255, 252, 232], wFar: [96, 178, 188], wNear: [16, 96, 120], foam: [255, 255, 255], sunH: 0.92, glit: 0.45, star: 0 },
    { t: 0.68, skyTop: [74, 92, 156], skyHor: [255, 202, 120], sun: [255, 236, 194], glow: [255, 168, 92], wFar: [206, 164, 118], wNear: [34, 78, 98], foam: [255, 244, 228], sunH: 0.3, glit: 0.95, star: 0 },
    { t: 0.84, skyTop: [48, 38, 86], skyHor: [255, 108, 68], sun: [255, 206, 148], glow: [255, 92, 58], wFar: [188, 98, 84], wNear: [30, 42, 72], foam: [255, 222, 200], sunH: 0.06, glit: 1.0, star: 0.15 },
    { t: 1.0, skyTop: [8, 12, 30], skyHor: [34, 44, 82], sun: [228, 234, 255], glow: [140, 164, 216], wFar: [28, 42, 76], wNear: [6, 16, 32], foam: [196, 208, 234], sunH: 0.55, glit: 0.55, star: 1 }
  ];

  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpRGB = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

  // 24 saatlik kesintisiz döngü: anahtar kareler SAAT olarak (05:00 … ertesi gün 05:00)
  // Gece 23:00'ten 04:00'e kadar sürer, 05:00'te şafağa yumuşakça geçer.
  const SAAT_KEYS = KEYS.map(k => ({ ...k, h: 5 + k.t * 18 }))
    .concat([{ ...KEYS[5], h: 28 }, { ...KEYS[0], h: 29 }]);

  // Saati 5..29 aralığına getirir (ör. 02:00 → 26)
  const normal = h => ((((h - 5) % 24) + 24) % 24) + 5;

  function getPalette(saat) {
    const h = normal(saat);
    let i = 0;
    while (i < SAAT_KEYS.length - 1 && h > SAAT_KEYS[i + 1].h) i++;
    const a = SAAT_KEYS[i], b = SAAT_KEYS[Math.min(i + 1, SAAT_KEYS.length - 1)];
    const k = Math.max(0, Math.min(1, (h - a.h) / (b.h - a.h || 1)));
    const p = {};
    for (const key of ["skyTop", "skyHor", "sun", "glow", "wFar", "wNear", "foam"]) p[key] = lerpRGB(a[key], b[key], k);
    for (const key of ["sunH", "glit", "star"]) p[key] = lerp(a[key], b[key], k);
    return p;
  }

  function istanbulSaati() {
    const parca = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Istanbul" })
      .formatToParts(new Date());
    return (+parca.find(p => p.type === "hour").value % 24) + (+parca.find(p => p.type === "minute").value) / 60;
  }

  // Gösterilmesi gereken saat. Koyu temada: zaten geceyse o saat, değilse gece yarısı.
  function hedefSaat() {
    const simdi = istanbulSaati();
    if (document.documentElement.dataset.tema !== "koyu") return simdi;
    const geceMi = simdi >= 23 || simdi < 4;
    return geceMi ? simdi : 0;
  }

  const stars = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random() * 0.4, r: Math.random() * 1.2 + 0.3, tw: Math.random() * Math.PI * 2 }));
  const clouds = Array.from({ length: 5 }, () => ({ x: Math.random(), y: 0.08 + Math.random() * 0.18, w: 0.18 + Math.random() * 0.22, speed: 0.000015 + Math.random() * 0.00002 }));
  const birds = Array.from({ length: 4 }, () => ({ x: Math.random(), y: 0.15 + Math.random() * 0.18, speed: 0.00004 + Math.random() * 0.00004, size: 8 + Math.random() * 6, flap: Math.random() * Math.PI * 2 }));

  let mouseX = 0.5, T = 0;

  // Sahnede şu an gösterilen saat ve hedefe doğru hızlı geçiş (hep ileri akar)
  let gosterilenSaat = 12;
  let gecis = null; // { bas, bit, basZaman, sure }
  const GECIS_SURESI = 3500; // ms

  function hedefeGec(anlik) {
    const hedef = hedefSaat();
    if (anlik) { gosterilenSaat = hedef; gecis = null; return; }
    const bas = normal(gosterilenSaat);
    let bit = normal(hedef);
    if (bit < bas - 0.01) bit += 24;           // geriye değil, ileri sar
    if (Math.abs(bit - bas) < 0.02) return;   // zaten orada
    // Büyük atlamalarda (tema değişimi) yavaşça, dakikalık güncellemelerde kısa sürede
    const sure = bit - bas > 0.5 ? GECIS_SURESI : 800;
    gecis = { bas, bit, basZaman: performance.now(), sure };
  }

  function gecisiIlerlet() {
    if (!gecis) return;
    const k = Math.min(1, (performance.now() - gecis.basZaman) / gecis.sure);
    const yumusak = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; // yavaş başla, hızlan, yavaşla
    gosterilenSaat = gecis.bas + (gecis.bit - gecis.bas) * yumusak;
    if (k >= 1) { gosterilenSaat = normal(gecis.bit); gecis = null; }
  }

  function draw() {
    T += 0.016;
    gecisiIlerlet();
    const P = getPalette(gosterilenSaat);
    const sunX = W * (0.5 + (mouseX - 0.5) * 0.25);
    const sunY = horizonY - P.sunH * horizonY * 0.82;

    // Gökyüzü
    const sky = ctx.createLinearGradient(0, 0, 0, horizonY + oceanH * 0.1);
    sky.addColorStop(0, rgb(P.skyTop));
    sky.addColorStop(0.7, rgb(lerpRGB(P.skyTop, P.skyHor, 0.55)));
    sky.addColorStop(1, rgb(P.skyHor));
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, horizonY + 2);

    // Yıldızlar
    if (P.star > 0.01) {
      stars.forEach(s => {
        const tw = 0.5 + 0.5 * Math.sin(T * 2 + s.tw);
        ctx.fillStyle = rgb([255, 255, 255], P.star * tw * 0.9);
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * horizonY, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Güneş / ay parıltısı ve diski
    const glowR = Math.min(W, H) * 0.5;
    const g = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, glowR);
    g.addColorStop(0, rgb(P.glow, 0.55));
    g.addColorStop(0.25, rgb(P.glow, 0.22));
    g.addColorStop(1, rgb(P.glow, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, horizonY + oceanH * 0.4);

    const sunR = Math.min(W, H) * 0.045;
    const sd = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
    sd.addColorStop(0, rgb(P.sun, 1));
    sd.addColorStop(0.7, rgb(P.sun, 0.95));
    sd.addColorStop(1, rgb(P.sun, 0.2));
    ctx.fillStyle = sd;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();

    // Bulutlar
    clouds.forEach(c => {
      c.x += c.speed;
      if (c.x > 1.3) c.x = -0.3;
      const cx = c.x * W, cy = c.y * horizonY, cw = c.w * W;
      ctx.fillStyle = rgb(lerpRGB(P.skyHor, [255, 255, 255], 0.25), 0.16);
      for (let j = 0; j < 4; j++) {
        ctx.beginPath();
        ctx.ellipse(cx + j * cw * 0.22, cy + Math.sin(j) * 6, cw * (0.3 - j * 0.04), cw * 0.06, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Kuşlar
    birds.forEach(b => {
      b.x += b.speed;
      b.flap += 0.15;
      if (b.x > 1.2) { b.x = -0.2; b.y = 0.15 + Math.random() * 0.18; }
      const bx = b.x * W, by = b.y * horizonY;
      const wing = Math.sin(b.flap) * b.size * 0.5;
      ctx.strokeStyle = rgb(lerpRGB(P.skyTop, [0, 0, 0], 0.3), 0.5);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bx - b.size, by + wing);
      ctx.quadraticCurveTo(bx, by - b.size * 0.3, bx, by);
      ctx.quadraticCurveTo(bx, by - b.size * 0.3, bx + b.size, by + wing);
      ctx.stroke();
    });

    // Ufuk pusu
    const haze = ctx.createLinearGradient(0, horizonY - 40, 0, horizonY + 40);
    haze.addColorStop(0, rgb(P.skyHor, 0));
    haze.addColorStop(0.5, rgb(P.skyHor, 0.45));
    haze.addColorStop(1, rgb(P.wFar, 0));
    ctx.fillStyle = haze;
    ctx.fillRect(0, horizonY - 40, W, 80);

    // Deniz dalgaları (uzaktan yakına)
    const NUM = 26;
    for (let i = 0; i < NUM; i++) {
      const depth = i / (NUM - 1);
      const yTop = horizonY + Math.pow(depth, 1.9) * oceanH;
      const amp = lerp(0.6, 30, depth);
      const wlen = lerp(46, 340, depth);
      const phase = T * lerp(0.25, 0.9, depth) + i * 0.9;
      const col = lerpRGB(P.wFar, P.wNear, depth);
      const dalgaY = x => yTop + Math.sin(x / wlen + phase) * amp + Math.sin(x / (wlen * 0.4) + phase * 1.6) * amp * 0.3;

      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, dalgaY(0));
      for (let x = 0; x <= W; x += 6) ctx.lineTo(x, dalgaY(x));
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = rgb(col);
      ctx.fill();

      ctx.lineWidth = lerp(0.6, 2.2, depth);
      ctx.beginPath();
      ctx.moveTo(0, dalgaY(0));
      for (let x = 6; x <= W; x += 6) ctx.lineTo(x, dalgaY(x));
      ctx.strokeStyle = rgb(lerpRGB(col, P.sun, 0.55), lerp(0.05, 0.3, depth));
      ctx.stroke();

      if (depth > 0.62) {
        const foamA = (depth - 0.62) / 0.38;
        for (let x = 0; x <= W; x += 9) {
          if (Math.sin(x / wlen + phase) > 0.55 && Math.random() > 0.45) {
            ctx.fillStyle = rgb(P.foam, foamA * (0.18 + Math.random() * 0.35));
            ctx.fillRect(x + (Math.random() - 0.5) * 6, dalgaY(x) - Math.random() * 3, 1.5 + Math.random() * 3, 1.5 + Math.random() * 2);
          }
        }
      }
    }

    // Güneşin denizdeki parıltı yolu
    for (let i = 0; i < 220; i++) {
      const dy = Math.random();
      const y = horizonY + Math.pow(dy, 1.5) * oceanH;
      const spread = lerp(6, W * 0.3, dy);
      const x = sunX + (Math.random() - 0.5) * 2 * spread;
      const distFade = 1 - Math.min(1, Math.abs(x - sunX) / (spread + 1));
      const a = distFade * distFade * (0.25 + Math.random() * 0.75) * P.glit * (1 - dy * 0.25);
      if (a < 0.02) continue;
      ctx.fillStyle = rgb(P.sun, a * 0.85);
      ctx.fillRect(x, y, 1 + Math.random() * (2 + dy * 4), 1 + dy);
    }

    // Kenar kararması
    const vig = ctx.createRadialGradient(W / 2, H * 0.55, H * 0.25, W / 2, H * 0.55, H * 0.9);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,8,0.34)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  const hareketsiz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function dongu() {
    draw();
    if (!hareketsiz) requestAnimationFrame(dongu);
  }

  document.addEventListener("DOMContentLoaded", () => {
    canvas = document.createElement("canvas");
    canvas.className = "okyanus";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);
    ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", () => { resize(); if (hareketsiz) draw(); });

    // Sayfa açılınca doğrudan o saatin sahnesi
    hedefeGec(true);
    setInterval(() => { hedefeGec(hareketsiz); if (hareketsiz) draw(); }, 60000);
    // Tema anahtarı değişince aradaki gökyüzü renklerinden hızla geçerek yeni sahneye var
    new MutationObserver(() => { hedefeGec(hareketsiz); if (hareketsiz) draw(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });

    window.addEventListener("mousemove", e => { mouseX = e.clientX / W; });
    dongu();
  });
})();
