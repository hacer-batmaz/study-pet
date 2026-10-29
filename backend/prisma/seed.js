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

  // backend/prisma/seed.js içinde mağaza ürünleri kısmı:
  const defaultItems = [
    {
      name: 'Kırmızı Elma',
      type: 'food',
      price: 15,
      effectValue: 15,
      spriteUrl: '🍎',
      isActive: true
    },
    {
      name: 'Taze Havuç',
      type: 'food',
      price: 20,
      effectValue: 20,
      spriteUrl: '🥕',
      isActive: true
    },
    {
      name: 'Lezzetli Balık',
      type: 'food',
      price: 30,
      effectValue: 35,
      spriteUrl: '🐟',
      isActive: true
    },
    {
      name: 'Çilekli Kek',
      type: 'food',
      price: 60,
      effectValue: 60,
      spriteUrl: '🍰',
      isActive: true
    }
  ];

  for (const item of defaultItems) {
    const existing = await prisma.shopItem.findFirst({
      where: { name: item.name }
    });

    if (!existing) {
      await prisma.shopItem.create({ data: item });
    } else {
      // Varsa spriteUrl ve isActive alanlarını güncelle
      await prisma.shopItem.update({
        where: { id: existing.id },
        data: {
          spriteUrl: item.spriteUrl,
          isActive: true,
          price: item.price,
          effectValue: item.effectValue
        }
      });
    }
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