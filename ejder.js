// =====================================================================
//  GENÇ EJDER GÖSTERİSİ
//  Bulutun üstünde bir genç belirir, güç toplar, ejdere dönüşür
//  ve bulutların arasından uçup gider. 45 saniyede bir tekrarlanır.
// =====================================================================

(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const TEKRAR_SURESI = 45000;
  const bekle = ms => new Promise(r => setTimeout(r, ms));

  const INSAN_SVG = `
    <svg viewBox="0 0 60 120" class="insan">
      <path class="pelerin" d="M18 34 Q10 70 6 100 Q20 95 30 100 Q40 95 54 100 Q50 70 42 34 Z" fill="#c62828"/>
      <path d="M24 72 L22 112 L28 112 L30 82 L32 112 L38 112 L36 72 Z" fill="#1d2b44"/>
      <path d="M20 34 Q30 30 40 34 L38 74 L22 74 Z" fill="#24395e"/>
      <path d="M30 34 L26 40 L30 52 L34 40 Z" fill="#ffb300"/>
      <path d="M20 36 L12 62 L16 64 L23 44 Z" fill="#24395e"/>
      <path d="M40 36 L48 62 L44 64 L37 44 Z" fill="#24395e"/>
      <circle cx="30" cy="20" r="9" fill="#f1c27d"/>
      <path d="M20 19 L18 8 L24 12 L26 3 L30 10 L34 2 L36 11 L42 6 L40 19 Q30 12 20 19 Z" fill="#141414"/>
      <rect class="goz" x="25" y="19" width="3" height="2" rx="1" fill="#ffe14d"/>
      <rect class="goz" x="32" y="19" width="3" height="2" rx="1" fill="#ffe14d"/>
    </svg>`;

  const EJDER_SVG = `
    <svg viewBox="0 -40 330 160" class="ejder">
      <defs>
        <linearGradient id="ejderGovde" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#e53935"/>
          <stop offset="1" stop-color="#8e1414"/>
        </linearGradient>
        <linearGradient id="ejderKanat" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stop-color="#ff7043"/>
          <stop offset="1" stop-color="#b71c1c"/>
        </linearGradient>
        <radialGradient id="ejderAtes" cx="0" cy="0.5" r="1">
          <stop offset="0" stop-color="#fffde7"/>
          <stop offset="0.3" stop-color="#ffd54f"/>
          <stop offset="0.7" stop-color="#ff6f00"/>
          <stop offset="1" stop-color="#ff3d00" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <!-- arka kanat -->
      <g transform="translate(118 58)"><g class="kanat kanat-arka">
        <path d="M0 0 L-58 -96 Q-44 -74 -26 -80 Q-16 -62 0 -62 Q4 -48 18 -40 Q12 -18 14 4 Z" fill="#7f1010"/>
      </g></g>

      <!-- kuyruk -->
      <path d="M76 64 C48 62 28 50 12 38 C24 56 48 76 80 82 Z" fill="url(#ejderGovde)"/>
      <path d="M14 40 L-2 26 L2 44 L-4 52 L18 46 Z" fill="#ffb300"/>

      <!-- gövde -->
      <path d="M70 60 C90 45 130 44 150 56 C162 64 160 80 146 86 C120 96 90 92 72 82 C63 76 63 66 70 60 Z" fill="url(#ejderGovde)"/>
      <path d="M78 80 C100 90 126 90 146 84 C130 93 100 95 78 84 Z" fill="#ffca28"/>

      <!-- sırt dikenleri -->
      <path d="M82 54 L88 42 L94 51 M98 49 L104 37 L110 47 M114 46 L120 34 L126 46 M130 47 L137 36 L141 50 M152 50 L160 40 L162 54 M164 40 L172 30 L172 44" fill="#ffb300" stroke="#ffb300" stroke-width="2" stroke-linejoin="round"/>

      <!-- bacaklar -->
      <path d="M92 86 L88 104 L98 106 L93 101 L99 88 Z" fill="#9e1a1a"/>
      <path d="M134 84 L140 101 L150 102 L143 97 L142 82 Z" fill="#9e1a1a"/>

      <!-- boyun ve kafa -->
      <path d="M140 60 C155 45 166 34 178 28 L188 40 C176 48 166 62 156 80 Z" fill="url(#ejderGovde)"/>
      <path d="M150 74 C158 60 166 50 180 40 L184 44 C172 52 162 64 156 80 Z" fill="#ffca28"/>
      <path d="M182 22 L170 4 L188 19 Z" fill="#ffe082"/>
      <path d="M191 20 L186 0 L198 19 Z" fill="#ffe082"/>
      <path class="cene" d="M178 30 C186 18 202 16 214 22 L224 29 C226 33 222 36 216 36 L200 37 C194 44 184 46 179 41 Z" fill="url(#ejderGovde)"/>
      <circle cx="201" cy="26" r="3" fill="#ffeb3b"/>
      <circle cx="202" cy="26" r="1.2" fill="#000"/>
      <circle cx="219" cy="27" r="1.2" fill="#4a0000"/>

      <!-- ateş -->
      <g class="ates" transform="translate(222 33)">
        <ellipse cx="45" cy="0" rx="50" ry="16" fill="url(#ejderAtes)"/>
        <ellipse cx="30" cy="0" rx="30" ry="8" fill="#fffde7" opacity="0.8"/>
      </g>

      <!-- ön kanat -->
      <g transform="translate(124 56)"><g class="kanat kanat-on">
        <path d="M0 0 L-58 -96 Q-44 -74 -26 -80 Q-16 -62 0 -62 Q4 -48 18 -40 Q12 -18 14 4 Z" fill="url(#ejderKanat)"/>
        <path d="M0 0 L-58 -96 M-6 -12 L-26 -80 M-3 -8 L0 -62 M0 -4 L18 -40" stroke="#5d0a0a" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      </g></g>
    </svg>`;

  // ---------- Sahneyi kur ----------
  const sahne = document.createElement("div");
  sahne.className = "ejder-sahne";
  sahne.setAttribute("aria-hidden", "true");
  sahne.innerHTML = `
    <div class="ejder-baslangic">
      <div class="ejder-aura"></div>
      <div class="ejder-kivilcimlar">${"<i></i>".repeat(8)}</div>
      ${INSAN_SVG}
      <div class="ejder-bulut"></div>
      <div class="ejder-halka"></div>
    </div>
    <div class="ejder-ucan">${EJDER_SVG}</div>
    <div class="ejder-flas"></div>
    <div class="ejder-yazi">${[..."GENÇ EJDER"].map((h, i) =>
      `<span style="--sira:${i}">${h === " " ? "&nbsp;" : h}</span>`).join("")}</div>`;
  document.body.appendChild(sahne);

  const baslangic = sahne.querySelector(".ejder-baslangic");
  const ucan = sahne.querySelector(".ejder-ucan");

  // Ejderin arkasından dökülen kıvılcımlar
  function kivilcimBirak(x, y) {
    const k = document.createElement("div");
    k.className = "ejder-kor";
    k.style.left = x + "px";
    k.style.top = y + "px";
    k.style.setProperty("--kay", (Math.random() * 40 - 20) + "px");
    sahne.appendChild(k);
    k.addEventListener("animationend", () => k.remove());
  }

  // Dalgalı uçuş: soldan sağa, inip çıkarak
  function uc(sure) {
    return new Promise(bitti => {
      const kutu = baslangic.getBoundingClientRect();
      const x0 = kutu.left - 40, y0 = kutu.top - 30;
      const x1 = innerWidth + 80;
      const genlik = Math.min(60, innerHeight * 0.06);
      const yukselme = innerHeight * 0.05;
      const yolY = t => y0 - yukselme * Math.sin(t * Math.PI) + genlik * Math.sin(t * Math.PI * 3);
      const bas = performance.now();
      let sonKor = 0;

      function kare(simdi) {
        const t = Math.min(1, (simdi - bas) / sure);
        const e = t < 0.15 ? t * t / 0.3 : t - 0.075; // yavaş kalkış
        const ilerleme = e / 0.925;
        const x = x0 + (x1 - x0) * ilerleme;
        const y = yolY(ilerleme);
        const egim = Math.atan2(yolY(ilerleme + 0.01) - y, (x1 - x0) * 0.01) * 180 / Math.PI;
        ucan.style.transform = `translate(${x}px, ${y}px) rotate(${egim}deg)`;

        if (simdi - sonKor > 70) {
          const r = ucan.getBoundingClientRect();
          kivilcimBirak(r.left + r.width * 0.05, r.top + r.height * 0.45);
          sonKor = simdi;
        }
        t < 1 ? requestAnimationFrame(kare) : bitti();
      }
      requestAnimationFrame(kare);
    });
  }

  async function gosteri() {
    sahne.className = "ejder-sahne";
    ucan.style.transform = "";
    void sahne.offsetWidth; // animasyonları baştan başlat

    sahne.classList.add("s-belir");       // genç bulutun üstünde belirir
    await bekle(1400);
    sahne.classList.add("s-guc");         // güç toplar, gözler parlar
    await bekle(2000);

    // Dönüşüm: flaş, halka, ejder ortaya çıkar
    const kutu = baslangic.getBoundingClientRect();
    ucan.style.transform = `translate(${kutu.left - 40}px, ${kutu.top - 30}px)`;
    sahne.classList.add("s-donusum");
    await bekle(900);

    sahne.classList.add("s-yazi");        // GENÇ EJDER yazısı
    await bekle(500);

    sahne.classList.add("s-uc");
    setTimeout(() => sahne.classList.add("s-ates"), 2600);
    setTimeout(() => sahne.classList.remove("s-ates"), 3600);
    setTimeout(() => sahne.classList.add("s-yazi-git"), 4800);
    await uc(7000);

    sahne.className = "ejder-sahne";
  }

  async function dongu() {
    await bekle(1200);
    while (true) {
      if (!document.hidden) await gosteri();
      await bekle(TEKRAR_SURESI);
    }
  }
  dongu();
})();
