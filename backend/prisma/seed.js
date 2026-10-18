import prisma from '../src/config/prismaClient.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Tohumlama (Seed) işlemi başlatılıyor...');

  // 1. ADIM: Varsayılan Admin Kullanıcısını Ekle / Güncelle
  const adminEmail = 'admin@studypet.com';
  const adminPassword = await bcrypt.hash('admin1234', 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        email: adminEmail,
        passwordHash: adminPassword,
        coins: 999,
        role: 'ADMIN',
        isActive: true,
        pet: {
          create: {
            name: 'Sheriff',
            type: 'dog',
            hungerLevel: 100,
            xp: 0,
            level: 5
          }
        }
      }
    });
    console.log(`Admin kullanıcısı oluşturuldu: ${adminUser.email} (Şifre: admin1234)`);
  } else {
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        role: 'ADMIN',
        isActive: true
      }
    });
    console.log(`Mevcut ${adminEmail} kullanıcısı ADMIN olarak güncellendi.`);
  }

  // 2. ADIM: Mağaza Verilerini Yükle
  console.log('Mağaza verileri yükleniyor...');

  // İlişkisel foreign key hatası almamak için temizleme işlemini güvenli yapalım
  await prisma.shopItem.deleteMany({});

  const items = [
    {
      name: 'Kırmızı Elma',
      type: 'food',
      price: 15,
      effectValue: 20, // +20 Açlık doldurur
      spriteUrl: '/assets/items/apple.png',
      isActive: true
    },
    {
      name: 'Taze Balık',
      type: 'food',
      price: 30,
      effectValue: 45, // +45 Açlık doldurur
      spriteUrl: '/assets/items/fish.png',
      isActive: true
    },
    {
      name: 'Havuç Şöleni',
      type: 'food',
      price: 20,
      effectValue: 25,
      spriteUrl: '/assets/items/carrot.png',
      isActive: true
    },
    {
      name: 'Sihirli Kek',
      type: 'food',
      price: 60,
      effectValue: 100, // Açlığı tamamen doldurur
      spriteUrl: '/assets/items/cake.png',
      isActive: true
    },
    {
      name: 'Dedektif Şapkası',
      type: 'accessory',
      price: 100,
      effectValue: 0,
      spriteUrl: '/assets/items/hat_detective.png',
      isActive: true
    },
    {
      name: 'Çalışma Masası Bitkisi',
      type: 'decor',
      price: 75,
      effectValue: 0,
      spriteUrl: '/assets/items/desk_plant.png',
      isActive: true
    }
  ];

  for (const item of items) {
    await prisma.shopItem.create({ data: item });
  }

  console.log('Mağaza verileri ve Admin hesabı başarıyla hazırlandı.');
}

main()
  .catch((e) => {
    console.error('Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });