import prisma from '../src/config/prismaClient.js';

async function main() {
    console.log('Mağaza verileri yükleniyor...');

    //mevcut urunleri temizler - tekrar calisinca cift kayit olmamasi icin
    await prisma.shopItem.deleteMany({});

    const items = [
        {
            name: 'Kırmızı Elma',
            type: 'food',
            price: 15,
            effectValue: 20, // +20 Açlık doldurur
            spriteUrl: '/assets/items/apple.png'
        },
        {
            name: 'Taze Balık',
            type: 'food',
            price: 30,
            effectValue: 45, // +45 Açlık doldurur
            spriteUrl: '/assets/items/fish.png'
        },
        {
            name: 'Havuç Şöleni',
            type: 'food',
            price: 20,
            effectValue: 25,
            spriteUrl: '/assets/items/carrot.png'
        },
        {
            name: 'Sihirli Kek',
            type: 'food',
            price: 60,
            effectValue: 100, // Açlığı tamamen doldurur
            spriteUrl: '/assets/items/cake.png'
        },
        {
            name: 'Dedektif Şapkası',
            type: 'accessory',
            price: 100,
            effectValue: 0,
            spriteUrl: '/assets/items/hat_detective.png'
        },
        {
            name: 'Çalışma Masası Bitkisi',
            type: 'decor',
            price: 75,
            effectValue: 0,
            spriteUrl: '/assets/items/desk_plant.png'
        }
    ];

    for (const item of items) {
        await prisma.shopItem.create({data: item});
    }

    console.log('Mağaza verileri başarıyla yüklendi.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
