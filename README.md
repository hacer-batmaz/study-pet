# 🐾 StudyPet — Oyunlaştırılmış Odaklanma ve Sanal Hayvan Platformu

**StudyPet**, öğrencilerin ders çalışma motivasyonunu ve zaman yönetimi alışkanlıklarını artırmak amacıyla tam yığın (full-stack) bir web uygulamasıdır.

Kullanıcılar odaklanma seanslarını tamamladıkça deneyim puanı (**XP**) ve sanal jeton (**Coins**) kazanır; kazandıkları jetonlarla mağazadan yiyecek satın alarak evcil hayvanlarının açlık seviyesini ve mutluluğunu korurlar.

---

## ✨ Temel Özellikler

### 🎮 Oyunlaştırılmış Çalışma Odası
* **Dayanıklı Pomodoro Sayacı:** Sunucu zaman damgası ve `localStorage` senkronizasyonu sayesinde sayfa yenilemelerinde (F5) süre sıfırlanmaz.
* **Dinamik Sanal Hayvan Animasyonları:** Kedi (`cat`), köpek (`dog`) ve tavşan (`rabbit`) türleri için açlık seviyesine (%70–100 *Çok Mutlu*, %30–69 *Normal*, %0–29 *Mutsuz*) göre otomatik değişen GIF animasyonları.
* **Ödül & Ceza Mekanizması:** Tamamlanan her seans süresine göre XP ve jeton kazandırır. Seansı yarıda terk etmek evcil hayvanın açlık seviyesini düşürür.
* **Sanal Mağaza & Envanter:** Ürün isimlerine göre otomatik Türkçe duyarlı emojilerle (`🍎`, `🐟`, `🥕`, `🍰`, `🍕` vb.) listelenen ürünler, fiyata göre artan/azalan sıralama ve anlık besleme mekaniği.
* **8-Bit Retro Ses Sentezi:** Harici ses dosyası indirmeden tarayıcının yerleşik **Web Audio API** motoruyla anlık üretilen 8-bit zafer ve bildirim melodileri.
* **Kullanıcıya İzole Ders Kategorileri:** Her kullanıcı kendi çalışma kategorilerini oluşturup yönetebilir.

### 🛡️ Sistem Yönetim Paneli (`ADMIN`)
* **Genel İstatistikler:** Toplam üye, aktif hesap, tamamlanan/terk edilen seans oranları ve en popüler ders kategorileri.
* **Kullanıcı Denetimi:** Arama, rol/duruma göre filtreleme, yeni kullanıcı ve evcil hayvan tanımlama, hesap askıya alma/aktifleştirme ve rol değiştirme.
* **Mağaza Yönetimi:** Canlı emoji önizlemeli yeni ürün ekleme, fiyata/duruma göre sıralama ve ürünleri pasife alma (*soft-delete*).
* **Denetim Günlüğü (Audit Trail):** Yönetici işlemlerinin zaman damgalı kayıt dökümü.

---

## 🛠️ Teknoloji Yığını

| Katman | Teknolojiler |
| :--- | :--- |
| **Frontend (İstemci)** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React, Web Audio API |
| **Backend (Sunucu)** | Node.js, Express.js, JWT (JSON Web Token), Bcryptjs |
| **Veritabanı & ORM** | SQLite, Prisma ORM |

---

## 📁 Proje Dizin Yapısı

```text
study-pet-project/
├── backend/
│   ├── prisma/
│   │   ├── migrations/         # Veritabanı şema göç dosyaları
│   │   ├── dev.db              # SQLite veritabanı
│   │   ├── schema.prisma       # Prisma veri modelleri
│   │   └── seed.js             # Varsayılan admin hesabı ve mağaza ürünleri
│   ├── src/
│   │   ├── config/             # Prisma istemci bağlantısı
│   │   ├── controllers/        # Auth, Session, Shop, Pet ve Admin kontrolcüleri
│   │   ├── middlewares/        # JWT doğrulama ve rol yetkilendirme (requireAdmin)
│   │   ├── routes/             # REST API yönlendirmeleri
│   │   └── app.js              # Express uygulama yapılandırması
│   ├── .env                    # Çevre değişkenleri
│   └── server.js               # Sunucu başlatıcı
│
└── frontend/
    ├── public/
    │   └── assets/pets/        # Sanal hayvan GIF animasyonları
    └── src/
        ├── api/                # Merkezi Axios istemcisi (client.js)
        ├── components/         # Timer, PetDisplay, ShopModal, FeedModal, LevelUpModal, Sidebar
        ├── context/            # Global oturum ve pet state yönetimi (AuthContext.jsx)
        ├── pages/              # HomePage, LoginPage, RegisterPage, DashboardPage, AdminPage
        └── utils/              # Dinamik emoji (itemIcons.js) ve sprite (petSprites.js) yardımcıları
