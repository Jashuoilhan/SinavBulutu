# =====================================================================
#  SINAV BULUTU BLOG ÜRETİCİ
#  Çalıştırmak için:  python araclar/blog-uret.py
#
#  Yazılar araclar/yazilar/ klasöründe, her biri ayrı bir .html dosyası.
#  Dosyanın en üstünde şu bilgi bloğu olmalı:
#     <!--
#     baslik: Yazının başlığı
#     aciklama: Google'da görünecek 1-2 cümlelik özet (150 karakter civarı)
#     tarih: 2026-10-12
#     etiket: YKS        (YKS, KPSS, LGS, ALES ya da Genel)
#     -->
#  Altına yazının gövdesi (h2, p, ul...) gelir.
#
#  Araç şunları üretir:
#   - blog/<dosya-adi>.html  -> her yazının sayfası (site tasarımıyla)
#   - blog.html              -> tüm yazıların listesi
#   - sitemap.xml            -> tüm sayfalar + yazılar
#  Menü, üst kısım ve alt kısım kaynaklar.html sayfasından kopyalanır.
# =====================================================================
import html
import json
import pathlib
import re
import sys

KOK = pathlib.Path(__file__).resolve().parent.parent
YAZILAR = KOK / "araclar" / "yazilar"
ALANADI = "ALANADI"  # alan adı alınınca değiştir (ör. "sinavbulutu.com")
AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos",
         "Eylül", "Ekim", "Kasım", "Aralık"]
ETIKET_IKON = {"YKS": "🎓", "KPSS": "🏛️", "LGS": "🏫", "ALES": "📚", "Genel": "💡"}


def tarih_yaz(t):
    y, a, g = t.split("-")
    return f"{int(g)} {AYLAR[int(a) - 1]} {y}"


def okuma_suresi(govde):
    kelime = len(re.sub(r"<[^>]+>", " ", govde).split())
    return max(1, round(kelime / 200)), kelime


def yazilari_oku():
    yazilar = []
    for dosya in sorted(YAZILAR.glob("*.html")):
        metin = dosya.read_text(encoding="utf-8")
        m = re.match(r"\s*<!--(.*?)-->", metin, re.S)
        if not m:
            sys.exit(f"Bilgi bloğu yok: {dosya.name}")
        bilgi = dict(re.findall(r"^\s*(\w+):\s*(.+?)\s*$", m.group(1), re.M))
        bilgi["govde"] = metin[m.end():].strip()
        bilgi["ad"] = dosya.stem
        yazilar.append(bilgi)
    yazilar.sort(key=lambda y: y["tarih"], reverse=True)
    return yazilar


def sablon():
    """kaynaklar.html'den head ve header/footer parçalarını alır."""
    s = (KOK / "kaynaklar.html").read_text(encoding="utf-8")
    head = s[:s.index("<title>")]
    head_son = s[s.index("</title>") + len("</title>"):s.index("</head>")]
    head_son = re.sub(r'\s*<meta name="description"[^>]*>', "", head_son)
    head_son = re.sub(r'\s*<script src="kaynaklar\.js[^>]*></script>', "", head_son)
    govde_bas = s[s.index("</head>"):s.index("  <main>")]
    govde_son = s[s.index("  </main>") + len("  </main>"):]
    govde_bas = govde_bas.replace('class="button aktif"', 'class="button"')
    govde_bas = govde_bas.replace('<a href="blog.html" class="button"', '<a href="blog.html" class="button aktif"')
    return head, head_son, govde_bas, govde_son


def goreli(parca, onek):
    """Klasör içindeki sayfalar için yerel linklerin başına ../ ekler."""
    if not onek:
        return parca
    return re.sub(r'(href|src)="(?!https?:|#|mailto:|\.\./)([^"]+)"', rf'\1="{onek}\2"', parca)


def sayfa(baslik, aciklama, ana, onek="", ek_head=""):
    head, head_son, govde_bas, govde_son = sablon()
    ust = (head + f"<title>{html.escape(baslik)} — Sınav Bulutu</title>\n"
           f'  <meta name="description" content="{html.escape(aciklama)}">' + head_son + ek_head)
    return goreli(ust, onek) + goreli(govde_bas, onek) + "  <main>\n" + ana + "\n  </main>" + goreli(govde_son, onek)


def kart(y, onek=""):
    dk, _ = okuma_suresi(y["govde"])
    ikon = ETIKET_IKON.get(y["etiket"], "💡")
    return f'''      <a class="blog-kart" href="{onek}blog/{y["ad"]}.html">
        <span class="blog-etiket">{ikon} {html.escape(y["etiket"])}</span>
        <h2>{html.escape(y["baslik"])}</h2>
        <p>{html.escape(y["aciklama"])}</p>
        <span class="blog-bilgi">{tarih_yaz(y["tarih"])} · {dk} dk okuma</span>
      </a>'''


def yazi_sayfasi(y, hepsi):
    dk, _ = okuma_suresi(y["govde"])
    benzer = [b for b in hepsi if b["ad"] != y["ad"] and b["etiket"] == y["etiket"]]
    benzer += [b for b in hepsi if b["ad"] != y["ad"] and b not in benzer]
    benzer_html = "\n".join(kart(b, "../") for b in benzer[:3])
    jsonld = json.dumps({
        "@context": "https://schema.org", "@type": "Article",
        "headline": y["baslik"], "description": y["aciklama"],
        "datePublished": y["tarih"], "dateModified": y.get("guncelleme", y["tarih"]),
        "author": {"@type": "Organization", "name": "Sınav Bulutu"},
        "publisher": {"@type": "Organization", "name": "Sınav Bulutu"},
        "inLanguage": "tr",
    }, ensure_ascii=False)
    ek = f'\n  <script type="application/ld+json">{jsonld}</script>\n'
    ana = f'''    <article class="kutu yazi">
      <a class="geri" href="../blog.html">← Tüm yazılar</a>
      <span class="blog-etiket">{ETIKET_IKON.get(y["etiket"], "💡")} {html.escape(y["etiket"])}</span>
      <h1>{html.escape(y["baslik"])}</h1>
      <p class="blog-bilgi">Sınav Bulutu Ekibi · {tarih_yaz(y["tarih"])} · {dk} dk okuma</p>
{y["govde"]}
    </article>

    <div class="reklam">Reklam alanı</div>

    <section class="blog-benzer">
      <h2>Bunlar da işine yarayabilir</h2>
      <div class="blog-liste">
{benzer_html}
      </div>
    </section>'''
    return sayfa(y["baslik"], y["aciklama"], ana, "../", ek)


def liste_sayfasi(yazilar):
    etiketler = sorted({y["etiket"] for y in yazilar})
    butonlar = "\n".join(f'      <button data-grup="{e}">{e}</button>' for e in etiketler)
    kartlar = "\n".join(kart(y).replace('<a class="blog-kart"', f'<a class="blog-kart" data-grup="{y["etiket"]}"') for y in yazilar)
    ana = f'''    <section class="giris">
      <h1>✍️ Blog</h1>
      <p>Çalışma taktikleri, sınav rehberleri ve puan hesaplama yazıları</p>
    </section>

    <div class="filtreler blog-filtre">
      <button class="aktif" data-grup="hepsi">Tümü</button>
{butonlar}
    </div>

    <div class="blog-liste">
{kartlar}
    </div>

    <div class="reklam">Reklam alanı</div>
    <script>
      document.querySelectorAll(".blog-filtre button").forEach(b => b.addEventListener("click", () => {{
        document.querySelectorAll(".blog-filtre button").forEach(x => x.classList.remove("aktif"));
        b.classList.add("aktif");
        document.querySelectorAll(".blog-kart").forEach(k => {{
          k.hidden = b.dataset.grup !== "hepsi" && k.dataset.grup !== b.dataset.grup;
        }});
      }}));
    </script>'''
    return sayfa("Blog", "YKS, KPSS, LGS ve ALES için çalışma taktikleri, deneme analizi, puan hesaplama ve sınav rehberleri.", ana)


def site_haritasi(yazilar):
    sabit = [("", "1.0"), ("puan.html", "0.9"), ("blog.html", "0.9"), ("kaynaklar.html", "0.8"),
             ("topluluk.html", "0.6"), ("hakkimizda.html", "0.5"), ("iletisim.html", "0.5"),
             ("gizlilik.html", "0.3"), ("kullanim-kosullari.html", "0.3")]
    satirlar = [f"  <url><loc>https://{ALANADI}/{y}</loc><priority>{p}</priority></url>" for y, p in sabit]
    satirlar += [f"  <url><loc>https://{ALANADI}/blog/{y['ad']}.html</loc><lastmod>{y.get('guncelleme', y['tarih'])}</lastmod><priority>0.7</priority></url>"
                 for y in yazilar]
    return ('<?xml version="1.0" encoding="UTF-8"?>\n<!-- Bu dosyayı araclar/blog-uret.py üretir. Alan adı için oradaki ALANADI değerini değiştir. -->\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(satirlar) + "\n</urlset>\n")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    yazilar = yazilari_oku()
    (KOK / "blog").mkdir(exist_ok=True)
    for y in yazilar:
        (KOK / "blog" / f"{y['ad']}.html").write_text(yazi_sayfasi(y, yazilar), encoding="utf-8")
        print("✔", f"blog/{y['ad']}.html", f"({okuma_suresi(y['govde'])[1]} kelime)")
    (KOK / "blog.html").write_text(liste_sayfasi(yazilar), encoding="utf-8")
    (KOK / "sitemap.xml").write_text(site_haritasi(yazilar), encoding="utf-8")
    print("✔ blog.html ve sitemap.xml güncellendi,", len(yazilar), "yazı")
