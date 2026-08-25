/* ============================================================
   SITE-CONFIG.JS — DANIŞMANA AİT TÜM BİLGİLER TEK YERDE
   Bu dosyayı güncellemek sitedeki tüm ilgili yerleri günceller.
   ============================================================ */

const SITE = {
  // Danışman adı
  name: "Aydın Çağlayan",

  // Ünvan
  title: { tr: "Emlak Danışmanı", en: "Real Estate Consultant" },

  // İletişim
  phone: "+905364776705",       // tel: linki için — başında + ile
  whatsapp: "905364776705",     // wa.me linki için — + ve boşluksuz
  email: "",                    // TODO: e-posta adresi

  // Faaliyet bölgesi
  region: { tr: "Aydın / Didim", en: "Aydın / Didim, Türkiye" },

  // Harita — OpenStreetMap embed (API anahtarı gerekmez)
  map: {
    embedUrl: "https://www.openstreetmap.org/export/embed.html?bbox=27.2186%2C37.3562%2C27.2986%2C37.3962&layer=mapnik&marker=37.3762%2C27.2586",
    linkUrl: "https://www.openstreetmap.org/?mlat=37.3762&mlon=27.2586#map=13/37.3762/27.2586"
  },

  // Hero
  hero: {
    eyebrow: { tr: "Emlak Danışmanı", en: "Real Estate Consultant" },
    title: { tr: "Hayalinizdeki Eve Bir Mesaj Kadar Yakınsınız", en: "Your Dream Home Is Just One Message Away" },
    subtitle: {
      tr: "Bölgenin en değerli mülklerinde kişisel danışmanlık. Alım, satım ve kiralama süreçlerinizde güvenilir bir ortak.",
      en: "Personal guidance through the region's finest properties. A trusted partner for buying, selling, and renting."
    },
    // Hero arkaplan görseli
    image: "assets/img/hero/hero.jpg"
  },

  // Güven bandı — TODO: diğer rakamları gerçek verilerle güncelle
  stats: [
    { num: "40+", label: { tr: "Yıl İş Tecrübesi", en: "Years of Experience" } },
    { num: "150+", label: { tr: "Tamamlanan İşlem", en: "Closed Deals" } },
    { num: "8", label: { tr: "Aktif Bölge", en: "Active Regions" } },
    { num: "%98", label: { tr: "Müşteri Memnuniyeti", en: "Client Satisfaction" } }
  ],

  // Hakkımda
  about: {
    photo: "assets/img/agent/portrait.jpg",
    story: {
      tr: "Merhaba, ben Aydın Çağlayan. Yılların verdiği tecrübeyle bölgenin en özel mülklerini doğru alıcı ve satıcılarla buluşturuyorum. Her müşterime kişisel bir danışmanlık süreci sunuyor, kararlarınızı güvenle almanız için yanınızda oluyorum.",
      en: "Hello, I'm Aydın Çağlayan. With years of experience, I connect the region's finest properties with the right buyers and sellers. I offer every client a personal consulting process so you can make decisions with confidence."
    },
    badges: [
      { tr: "Sertifikalı Emlak Danışmanı", en: "Licensed Real Estate Consultant" },
      { tr: "Yatırım Danışmanlığı", en: "Investment Advisory" },
      { tr: "Yabancı Yatırımcı Uzmanı", en: "Foreign Investor Specialist" }
    ]
  },

  // Hizmetler
  services: [
    {
      icon: "home",
      title: { tr: "Satılık Mülk", en: "Property Sales" },
      desc: { tr: "Doğru fiyatlama ve pazarlama ile mülkünüzü hızla değerlendirin.", en: "Sell your property fast with the right pricing and marketing." }
    },
    {
      icon: "key",
      title: { tr: "Kiralama", en: "Rentals" },
      desc: { tr: "Güvenilir kiracı bulma ve sözleşme süreçlerinde tam destek.", en: "Full support finding reliable tenants and handling contracts." }
    },
    {
      icon: "search",
      title: { tr: "Alım Danışmanlığı", en: "Buyer Advisory" },
      desc: { tr: "İhtiyacınıza uygun mülkü bulmak için kişiselleştirilmiş arama.", en: "Personalized search to find the property that fits your needs." }
    },
    {
      icon: "trending",
      title: { tr: "Yatırım Danışmanlığı", en: "Investment Advisory" },
      desc: { tr: "Bölgesel piyasa analiziyle en doğru yatırım kararını verin.", en: "Make the right investment decision with regional market analysis." }
    }
  ],

  // Yorumlar — TODO: gerçek referanslarla değiştir
  testimonials: [
    {
      text: { tr: "Süreç boyunca çok şeffaf ve profesyoneldi. Kesinlikle tavsiye ederim.", en: "Very transparent and professional throughout the process. Highly recommend." },
      name: "M. Yılmaz"
    },
    {
      text: { tr: "WhatsApp üzerinden anında dönüş almak işimi çok kolaylaştırdı.", en: "Getting instant replies over WhatsApp made everything so much easier." },
      name: "S. Demir"
    },
    {
      text: { tr: "Bölgeyi çok iyi biliyor, doğru mülkü hemen buldu.", en: "Knows the region extremely well, found the right property right away." },
      name: "A. Kaya"
    }
  ],

  social: {
    instagram: "",
    linkedin: "",
    youtube: ""
  }
};
