/* ============================================================
   PROPERTIES.JS — İLAN VERİLERİ
   Yeni ilan eklemek için bu dizinin sonuna bir obje daha ekle.
   "id" alanı benzersiz olmalı (Türkçe karakter/boşluk kullanma).
   Görselleri assets/img/properties/<id>/ klasörüne koy.

   OPSİYONEL ALANLAR (doldurmazsan o kısım hiç görünmez, ilan bozulmaz):

   details — temel yapı bilgileri, ilan detay sayfasında ayrı bir
   tabloda gösterilir. Sadece bildiğin alanları doldur:
     details: {
       floor: 3,            // bulunduğu kat
       totalFloors: 5,       // binanın toplam kat sayısı
       buildingAge: 8,        // bina yaşı (yıl)
       facing: "guney",        // kuzey | guney | dogu | bati | kuzeydogu | kuzeybati | guneydogu | guneybati
       heating: "kombi"         // kombi | merkezi | klima | yerden | soba
     }

   tour — sanal gezinti. İki yöntemden biri:
     // A) Hazır platform turu (Matterport, Kuula, Google Street View vb.)
     tour: { type: "embed", url: "https://my.matterport.com/show/?m=XXXX" }
     // B) Kendi çektiğin 360° panorama fotoğrafları
     tour: {
       type: "360",
       scenes: [
         { id: "salon",  title: { tr: "Salon",  en: "Living Room" }, image: "…/360/salon.jpg" },
         { id: "mutfak", title: { tr: "Mutfak", en: "Kitchen" },     image: "…/360/mutfak.jpg" }
       ]
     }
   360° panorama, telefonda Google Street View uygulamasının "Fotoğraf Küresi"
   çekim moduyla ücretsiz oluşturulabilir.
   ============================================================ */

const PROPERTIES = [
  {
    id: "manzarali-daire-1",
    title: {
      tr: "2+1 Deniz Manzaralı Daire, Havuzlu Site",
      en: "2+1 Sea-View Apartment in a Pool Complex"
    },
    desc: {
      tr: "Didim'de, havuzlu ve güvenlikli bir site içerisinde yer alan 65 m² net kullanım alanına sahip 2+1 daire. Geniş balkonundan denizi gören daire; ferah salon, modern mutfak ve kaliteli banyo dolaplarıyla hem oturuma hem yatırıma uygun. Site içi yüzme havuzu, yeşil alanları ve merkezi konumuyla hem yazlık hem yıllık kullanım için ideal.",
      en: "A 2+1 apartment with 65 sqm of net living space, located in a secure complex with a swimming pool in Didim. Enjoying sea views from its spacious balcony, the apartment offers a bright living room, modern kitchen, and quality bathroom fittings — ideal for both living and investment. The complex's shared pool, green areas, and central location make it perfect for year-round or holiday use."
    },
    price: 5900000,
    currency: "TRY",
    status: "sale",  // sale | rent | sold
    type: "daire",  // villa | daire | arsa | isyeri
    location: { tr: "Didim, Akbük", en: "Didim, Akbük" },
    beds: 2,
    baths: 1,
    area: 65,
    featured: true,
    images: [
      "assets/img/properties/manzarali-daire-1/1.jpg",
      "assets/img/properties/manzarali-daire-1/2.jpg",
      "assets/img/properties/manzarali-daire-1/3.jpg",
      "assets/img/properties/manzarali-daire-1/4.jpg",
      "assets/img/properties/manzarali-daire-1/5.jpg",
      "assets/img/properties/manzarali-daire-1/6.jpg",
      "assets/img/properties/manzarali-daire-1/7.jpg",
      "assets/img/properties/manzarali-daire-1/8.jpg",
      "assets/img/properties/manzarali-daire-1/9.jpg"
    ]
  },

  {
    id: "villa-akbuk",
    title: { tr: "Deniz Manzaralı 3+1 Villa, Akbük", en: "Sea-View 3+1 Villa, Akbük" },
    desc: {
      tr: "Didim'in gözde bölgesi Akbük'te, sıfır ve modern mimarili 3+1 müstakil villa. İki katlı yerleşimiyle geniş bir aile için ideal olan villa; ferah yatak odaları, 2 banyo ve zeytin ağaçlarıyla çevrili özel bahçesiyle dikkat çekiyor. Üst kat balkonundan denizi gören villa, hem yıllık yaşam hem yatırım için değerlendirilebilir.",
      en: "A brand-new, modern 3+1 detached villa in Akbük, one of Didim's most sought-after areas. Spread over two floors and ideal for a large family, the villa features bright bedrooms, 2 bathrooms, and a private garden surrounded by olive trees. With sea views from its upper-floor balcony, it suits both year-round living and investment."
    },
    price: 9500000,
    currency: "TRY",
    status: "sale",  // sale | rent | sold
    type: "villa",  // villa | daire | arsa | isyeri
    location: { tr: "Didim, Akbük", en: "Didim, Akbük" },
    beds: 3,
    baths: 2,
    area: 130,
    featured: true,
    images: [
      "assets/img/properties/villa-akbuk/1.jpg",
      "assets/img/properties/villa-akbuk/2.jpg",
      "assets/img/properties/villa-akbuk/3.jpg",
      "assets/img/properties/villa-akbuk/4.jpg",
      "assets/img/properties/villa-akbuk/5.jpg",
      "assets/img/properties/villa-akbuk/6.jpg",
      "assets/img/properties/villa-akbuk/7.jpg",
      "assets/img/properties/villa-akbuk/8.jpg",
      "assets/img/properties/villa-akbuk/9.jpg",
      "assets/img/properties/villa-akbuk/10.jpg",
      "assets/img/properties/villa-akbuk/11.jpg",
      "assets/img/properties/villa-akbuk/12.jpg",
      "assets/img/properties/villa-akbuk/13.jpg",
      "assets/img/properties/villa-akbuk/14.jpg",
      "assets/img/properties/villa-akbuk/15.jpg",
      "assets/img/properties/villa-akbuk/16.jpg",
      "assets/img/properties/villa-akbuk/17.jpg",
      "assets/img/properties/villa-akbuk/18.jpg",
      "assets/img/properties/villa-akbuk/19.jpg",
      "assets/img/properties/villa-akbuk/20.jpg",
      "assets/img/properties/villa-akbuk/21.jpg",
      "assets/img/properties/villa-akbuk/22.jpg"
    ]
  },

  {
    id: "of-plan-2-adet-yapilacaktir-adet-fiyatidir",
    title: {
      tr: "Didim Efelerde 1000 m2 içinde 2 adet villa projemiz",
      en: "Our project in Didim Efeler consists of 2 villas on a 1000 m2 area."
    },
    desc: {
      tr: "Ekim 15 başlangıç mayis anahtar teslim uygun ödeme seçeneği ve takas desteği mevcut",
      en: "Starting October 15th, turnkey delivery in May. Convenient payment options and trade-in support available."
    },
    price: 30000000,
    currency: "TRY",
    status: "sale",  // sale | rent | sold
    type: "villa",  // villa | daire | arsa | isyeri
    location: { tr: "Didim(Yenihisar)", en: "Didim(Yenihisar)" },
    beds: 4,
    baths: 2,
    area: 150,
    featured: false,
    images: [
      "assets/img/properties/of-plan-2-adet-yapilacaktir-adet-fiyatidir/1.jpg",
      "assets/img/properties/of-plan-2-adet-yapilacaktir-adet-fiyatidir/2.jpg",
      "assets/img/properties/of-plan-2-adet-yapilacaktir-adet-fiyatidir/3.jpg"
    ],
    details: {
      totalFloors: 2,
      buildingAge: 0,
      facing: "guney",
      heating: "yerden"
    }
  },

  {
    id: "satilik",
    title: { tr: "Satilik", en: "Sale" },
    desc: {
      tr: "Didim efeler 4+1 salon mutfak",
      en: "From didim efeler 4 bedroom 3 bathroom"
    },
    price: 28000000,
    currency: "TRY",
    status: "sale",  // sale | rent | sold
    type: "villa",  // villa | daire | arsa | isyeri
    location: { tr: "didim efeler", en: "Didim" },
    beds: 4,
    baths: 3,
    area: 180,
    featured: false,
    images: [
      "assets/img/properties/satilik/1.jpg",
      "assets/img/properties/satilik/2.jpg",
      "assets/img/properties/satilik/3.jpg",
      "assets/img/properties/satilik/4.jpg",
      "assets/img/properties/satilik/5.jpg",
      "assets/img/properties/satilik/6.jpg",
      "assets/img/properties/satilik/7.jpg",
      "assets/img/properties/satilik/8.jpg",
      "assets/img/properties/satilik/9.jpg",
      "assets/img/properties/satilik/10.jpg",
      "assets/img/properties/satilik/11.jpg",
      "assets/img/properties/satilik/12.jpg",
      "assets/img/properties/satilik/13.jpg",
      "assets/img/properties/satilik/14.jpg",
      "assets/img/properties/satilik/15.jpg",
      "assets/img/properties/satilik/16.jpg",
      "assets/img/properties/satilik/17.jpg"
    ],
    details: {
      floor: 2,
      totalFloors: 2,
      facing: "guney",
      heating: "merkezi"
    }
  },

  {
    id: "didim-akbukte-satilik-villa",
    title: { tr: "Satilik", en: "Sale" },
    desc: {
      tr: "Akbukte mustakil Villa 4+1 havuzlu",
      en: "From akbuk 4 bedrom swimming pool"
    },
    price: 34.5,
    currency: "TRY",
    status: "sale",  // sale | rent | sold
    type: "villa",  // villa | daire | arsa | isyeri
    location: { tr: "akbuk", en: "Akbuk" },
    beds: 4,
    baths: 3,
    area: 150,
    featured: false,
    images: [
      "assets/img/properties/didim-akbukte-satilik-villa/1.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/2.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/3.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/4.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/5.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/6.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/7.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/8.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/9.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/10.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/11.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/12.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/13.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/14.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/15.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/16.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/17.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/18.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/19.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/20.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/21.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/22.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/23.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/24.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/25.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/26.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/27.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/28.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/29.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/30.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/31.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/32.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/33.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/34.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/35.jpg",
      "assets/img/properties/didim-akbukte-satilik-villa/36.jpg"
    ],
    details: {
      floor: 2,
      totalFloors: 2,
      facing: "guney",
      heating: "yerden"
    }
  },

  {
    id: "didim-efeler-41-villa",
    title: { tr: "Satilik", en: "Sale" },
    desc: {
      tr: "Didim efeler mahallesi 4+1 havuzlu",
      en: "From didim efeler 4 Bedroom swiming pool"
    },
    price: 26.75,
    currency: "TRY",
    status: "sale",  // sale | rent | sold
    type: "villa",  // villa | daire | arsa | isyeri
    location: { tr: "Didim Efeler", en: "Didim" },
    beds: 4,
    baths: 3,
    area: 175,
    featured: false,
    images: [
      "assets/img/properties/didim-efeler-41-villa/1.jpg",
      "assets/img/properties/didim-efeler-41-villa/2.jpg",
      "assets/img/properties/didim-efeler-41-villa/3.jpg",
      "assets/img/properties/didim-efeler-41-villa/4.jpg",
      "assets/img/properties/didim-efeler-41-villa/5.jpg",
      "assets/img/properties/didim-efeler-41-villa/6.jpg",
      "assets/img/properties/didim-efeler-41-villa/7.jpg",
      "assets/img/properties/didim-efeler-41-villa/8.jpg"
    ],
    details: {
      floor: 2,
      totalFloors: 2,
      buildingAge: 0,
      facing: "guney",
      heating: "yerden"
    }
  }

  // Yeni ilan örneği:
  // {
  //   id: "villa-ornek",
  //   title: { tr: "Örnek Villa", en: "Sample Villa" },
  //   desc: { tr: "...", en: "..." },
  //   price: 12500000, currency: "TRY",
  //   status: "sale", type: "villa",
  //   location: { tr: "...", en: "..." },
  //   beds: 4, baths: 3, area: 320,
  //   featured: false,
  //   images: ["assets/img/properties/villa-ornek/1.jpg"],
  //   details: { floor: 0, totalFloors: 2, buildingAge: 3, facing: "guney", heating: "yerden" },
  //   tour: { type: "embed", url: "https://my.matterport.com/show/?m=XXXX" }
  // }
];
