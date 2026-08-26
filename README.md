# Aydın Çağlayan — Emlak Danışmanlığı Sitesi

Bu site saf HTML/CSS/JavaScript ile yazıldı — kurulum, derleme (`npm install` vb.) **gerekmez**. Bilgisayarında Node.js olmasa da çalışır.

---

## 1. Siteyi bilgisayarında görüntüleme

**Yöntem A — En basit:** `index.html` dosyasına çift tıkla, tarayıcıda açılır.

**Yöntem B — Yerel sunucu (bazı tarayıcı özellikleri için daha sağlıklı):**
```bash
python -m http.server 5500
```
Sonra tarayıcıda `http://localhost:5500` adresini aç.

---

## 2. Kendi bilgilerini girme — `assets/js/site-config.js`

Bu dosyayı aç, aşağıdaki alanları doldur:

| Alan | Ne yapılacak |
|---|---|
| `name` | Zaten dolu: "Aydın Çağlayan" |
| `phone` | `tel:` linki için telefon numarası — başında `+` ile: `+90...` |
| `whatsapp` | WhatsApp linki için — `+` ve boşluk **olmadan**: `905364776705` (mevcut) |
| `email` | E-posta adresin |
| `region` | Faaliyet gösterdiğin bölge/şehir (TR ve EN) |
| `hero.title` / `hero.subtitle` | Ana sayfa başlığı ve alt metni |
| `hero.image` | Hero arkaplan görseli — büyük, yatay bir mülk fotoğrafı öner |
| `stats` | Güven bandındaki 4 rakam (yıl deneyim, satılan mülk sayısı vb.) |
| `about.photo` | **Kendi profesyonel portren** — `assets/img/agent/` klasörüne koy, yolunu buraya yaz (örn. `assets/img/agent/portrait.jpg`). Şu an placeholder kullanılıyor. |
| `about.story` | Hakkımda metni (TR ve EN) |
| `about.badges` | Uzmanlık rozetleri |
| `testimonials` | Gerçek müşteri yorumlarınla değiştir |
| `social` | Instagram/LinkedIn linkleri |

Değişiklik yaptıktan sonra dosyayı kaydet, tarayıcıyı yenile — hepsi otomatik güncellenir.

---

## 3. Yeni ilan ekleme — `assets/js/properties.js`

1. `assets/img/properties/` altında ilan için yeni bir klasör aç. Klasör adı ilanın **id**'si olacak (Türkçe karakter, boşluk kullanma — örn. `villa-deniz-manzarali`).
2. Fotoğrafları o klasöre koy: `1.jpg`, `2.jpg`, `3.jpg` ...
3. `properties.js` dosyasını aç, dizinin (`PROPERTIES = [...]`) içine şu şablonu kopyala ve doldur:

```js
{
  id: "villa-deniz-manzarali",
  title: { tr: "Deniz Manzaralı Villa", en: "Sea View Villa" },
  desc: {
    tr: "İlan açıklaması...",
    en: "Property description..."
  },
  price: 12500000,
  currency: "TRY",
  status: "sale",      // sale = satılık, rent = kiralık, sold = satıldı
  type: "villa",        // villa | daire | arsa | isyeri
  location: { tr: "Bodrum", en: "Bodrum" },
  beds: 4,
  baths: 3,
  area: 320,
  featured: true,
  images: [
    "assets/img/properties/villa-deniz-manzarali/1.jpg",
    "assets/img/properties/villa-deniz-manzarali/2.jpg"
  ]
}
```

4. Kaydet — ilan otomatik olarak anasayfadaki ızgarada ve kendi detay sayfasında (`ilan.html?id=villa-deniz-manzarali`) görünür. HTML dosyalarına dokunmana gerek yok.

**İlanı kaldırmak** için: objeyi diziden sil, ya da `status: "sold"` yaparak "Satıldı" rozetiyle tutmaya devam et.

---

## 3b. Opsiyonel alanlar — yapı bilgileri ve sanal gezinti

Aynı ilan objesine bu iki alanı da ekleyebilirsin. **İkisi de opsiyonel** — eklemezsen o bölüm sitede hiç görünmez, hiçbir şey bozulmaz.

**`details` — temel yapı bilgileri** (ilan detay sayfasında ayrı bir kutu halinde gösterilir, sadece doldurduğun alanlar görünür):

```js
details: {
  floor: 3,           // bulunduğu kat
  totalFloors: 5,      // binanın toplam kat sayısı
  buildingAge: 8,       // bina yaşı (yıl)
  facing: "guney",       // kuzey | guney | dogu | bati | kuzeydogu | kuzeybati | guneydogu | guneybati
  heating: "kombi"        // kombi | merkezi | klima | yerden | soba
}
```

**`tour` — sanal gezinti.** İki yöntemden biri:

```js
// A) Hazır platform turu — Matterport, Kuula, Google Street View vb. bir yerde tur oluşturup linkini yapıştır
tour: { type: "embed", url: "https://my.matterport.com/show/?m=XXXX" }

// B) Kendi 360° panorama fotoğrafların
tour: {
  type: "360",
  scenes: [
    { id: "salon",  title: { tr: "Salon",  en: "Living Room" }, image: "assets/img/properties/villa-deniz-manzarali/360/salon.jpg" },
    { id: "mutfak", title: { tr: "Mutfak", en: "Kitchen" },     image: "assets/img/properties/villa-deniz-manzarali/360/mutfak.jpg" }
  ]
}
```

360° panorama fotoğrafını ücretsiz çekmenin en kolay yolu: telefonunda **Google Street View** uygulamasını aç → "Fotoğraf Küresi" (Photo Sphere) modunu seç → odanın ortasında dönerek çek → dosyayı `assets/img/properties/<id>/360/` klasörüne kaydet.

`tour` eklenen ilan otomatik olarak kartında **"360° Tur"** rozeti kazanır ve detay sayfasında **"Sanal Gezinti Başlat"** butonu belirir.

---

## 4. Fotoğraf önerileri

- Her ilan için **en az 5 fotoğraf** yükle (galeri düzeni buna göre tasarlandı)
- Yatay (landscape) fotoğraflar dikeye göre daha iyi görünür
- Büyük dosyaları (>3MB) sıkıştırıp yükle — sayfa daha hızlı açılır ([squoosh.app](https://squoosh.app) ücretsiz ve kolay bir araçtır)
- Dosya adlarını sırayla numarala: `1.jpg`, `2.jpg` ... — ilk fotoğraf hem kart görselinde hem galeri başında kullanılır

---

## 5. Yayınlama (siteyi internete koyma)

Bu bir statik site olduğu için ücretsiz servislerle kolayca yayınlanır:

**Netlify (önerilir, en kolay):**
1. [netlify.com](https://netlify.com) hesabı aç
2. "Deploy manually" seçeneğinden `job` klasörünü sürükle-bırak
3. Saniyeler içinde bir link alırsın

**Vercel:** Benzer şekilde `vercel.com` üzerinden klasörü yükleyebilirsin.

Kendi alan adını (örn. `aydincaglayan.com`) bağlamak istediğinde bu servislerin "Domain" ayarlarından ekleyebilirsin.

---

## 6. Dosya yapısı özeti

```
index.html                 → Ana sayfa (tüm bölümler)
ilan.html                  → İlan detay şablonu (URL'de ?id=... alır)
assets/css/style.css       → Tüm görsel stiller
assets/js/site-config.js   → Danışman bilgileri (İSİM, TELEFON, WHATSAPP...)
assets/js/properties.js    → İlan verileri — yeni ilan eklenecek dosya
assets/js/i18n.js          → TR/EN arayüz metinleri
assets/js/app.js           → Anasayfa mantığı (filtre, render, dil)
assets/js/property-detail.js → İlan detay sayfası mantığı
assets/js/lightbox.js      → İlan detayında tam ekran fotoğraf galerisi
assets/js/tour.js          → Sanal gezinti (360°/gömülü tur) görüntüleyici
assets/js/chat.js          → Scriptli asistan (yapay zeka DEĞİL, ücretsiz, API anahtarı yok)
assets/vendor/pannellum/   → 360° görüntüleyici kütüphanesi (yalnızca `tour.type: "360"` kullanan bir ilan olduğunda yüklenir)
assets/img/agent/          → Danışman portresi
assets/img/properties/     → İlan fotoğrafları (ilan başına bir klasör)
```

---

## Bilinmesi gerekenler

- Site **iki dilli** (TR/EN) — sağ üstteki düğmeyle değişir, seçim tarayıcıda hatırlanır
- Mobilde ekranın altında sabit **Ara / WhatsApp** butonları vardır
- Her ilan kartındaki WhatsApp butonu, danışmana **hangi ilan hakkında** yazıldığını otomatik ileten hazır bir mesajla açılır
- Sağ altta gördüğün sohbet ikonu **scriptli bir asistan** — fiyat/konum/m²/randevu gibi sık sorulan soruları ilan verisinden otomatik yanıtlar ve "WhatsApp'tan devam et" ile danışmana devreder. Gerçek yapay zeka değildir, sunucu/API maliyeti yoktur.
- Form/CRM/admin panel bu ilk sürümde yok — tüm talepler WhatsApp'a yönleniyor (bireysel danışmanlık için en hızlı yol)
