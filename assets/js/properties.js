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
    title: { tr: "2+1 Deniz Manzaralı Daire, Havuzlu Site", en: "2+1 Sea-View Apartment in a Pool Complex" },
    desc: {
      tr: "Didim'de, havuzlu ve güvenlikli bir site içerisinde yer alan 65 m² net kullanım alanına sahip 2+1 daire. Geniş balkonundan denizi gören daire; ferah salon, modern mutfak ve kaliteli banyo dolaplarıyla hem oturuma hem yatırıma uygun. Site içi yüzme havuzu, yeşil alanları ve merkezi konumuyla hem yazlık hem yıllık kullanım için ideal.",
      en: "A 2+1 apartment with 65 sqm of net living space, located in a secure complex with a swimming pool in Didim. Enjoying sea views from its spacious balcony, the apartment offers a bright living room, modern kitchen, and quality bathroom fittings — ideal for both living and investment. The complex's shared pool, green areas, and central location make it perfect for year-round or holiday use."
    },
    price: 9500000,
    currency: "TRY",
    status: "sale",              // sale | rent | sold
    type: "daire",                // villa | daire | arsa | isyeri
    location: { tr: "Didim, Aydın", en: "Didim, Aydın" },
    beds: 2,
    baths: 1,
    area: 65,
    featured: true,
    images: [
      "https://raw.githubusercontent.com/sibelcaglayan0919/aydin-caglayan-emlak/master/assets/img/properties/manzarali-daire-1/1.jpg",
      "https://raw.githubusercontent.com/sibelcaglayan0919/aydin-caglayan-emlak/master/assets/img/properties/manzarali-daire-1/2.jpg",
      "https://raw.githubusercontent.com/sibelcaglayan0919/aydin-caglayan-emlak/master/assets/img/properties/manzarali-daire-1/3.jpg",
      "https://raw.githubusercontent.com/sibelcaglayan0919/aydin-caglayan-emlak/master/assets/img/properties/manzarali-daire-1/4.jpg",
      "https://raw.githubusercontent.com/sibelcaglayan0919/aydin-caglayan-emlak/master/assets/img/properties/manzarali-daire-1/5.jpg",
      "https://raw.githubusercontent.com/sibelcaglayan0919/aydin-caglayan-emlak/master/assets/img/properties/manzarali-daire-1/6.jpg",
      "https://raw.githubusercontent.com/sibelcaglayan0919/aydin-caglayan-emlak/master/assets/img/properties/manzarali-daire-1/7.jpg",
      "https://raw.githubusercontent.com/sibelcaglayan0919/aydin-caglayan-emlak/master/assets/img/properties/manzarali-daire-1/8.jpg",
      "https://raw.githubusercontent.com/sibelcaglayan0919/aydin-caglayan-emlak/master/assets/img/properties/manzarali-daire-1/9.jpg"
    ]
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
  //   images: ["https://raw.githubusercontent.com/sibelcaglayan0919/aydin-caglayan-emlak/master/assets/img/properties/villa-ornek/1.jpg"],
  //   details: { floor: 0, totalFloors: 2, buildingAge: 3, facing: "guney", heating: "yerden" },
  //   tour: { type: "embed", url: "https://my.matterport.com/show/?m=XXXX" }
  // }
];
