import prisma from '../config/prismaClient.js';

//magazadaki urunleri listeler
export const getShopItems = async (req, res) => {
  try {
    const items = await prisma.shopItem.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    return res.status(200).json({ items });
  } catch (error) {
    console.error('Mağaza ürünleri getirilirken hata:', error);
    return res.status(500).json({ error: 'Ürünler yüklenemedi.' });
  }
};

//esya satin alma
export const buyItem = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { itemId } = req.body;

        if (!itemId) {
            return res.status(400).json({ error: 'Lütfen satın alınacak ürünü seçin.' });
        }

        const item = await prisma.shopItem.findUnique({
            where: { id: parseInt(itemId) }
        });

        if (!item) {
            return res.status(404).json({ error: 'Ürün bulunamadı.' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (user.coins < item.price) {
            return res.status(400).json({
                error: `Yetersiz bakiye! Gerekli: ${item.price} Jeton, Mevcut: ${user.coins} Jeton`
            });
        }

        //bakiye dusme ve envantere ekleme islemi
        const result = await prisma.$transaction(async (tx) => {
            //coin dusme (bakiye yeterliyse; kontrol ve dusme tek islemde)
            const { count } = await tx.user.updateMany({
                where: { id: userId, coins: { gte: item.price } },
                data: { coins: { decrement: item.price } }
            });

            if (count === 0) {
                throw new Error('insufficient_coins');
            }
            
            const updatedUser = await tx.user.findUnique({
                where: { id: userId }
            });

            //envanterde var mi kontrol
            const existingInventory = await tx.userInventory.findFirst({
                where: { userId, itemId: item.id }
            });

            let inventory;
            if (existingInventory) {
                inventory = await tx.userInventory.update({
                    where: { id: existingInventory.id },
                    data: { quantity: { increment: 1 } }
                });
            } else {
                inventory = await tx.userInventory.create({
                    data: {
                        userId,
                        itemId: item.id,
                        quantity: 1
                    }
                });
            }

            return { remainingCoins: updatedUser.coins, inventory };
        });

        return res.status(200).json({
            message: `${item.name} başarıyla satın alındı!`,
            remainingCoins: result.remainingCoins,
            inventory: result.inventory
        });
    } catch (error) {
        if (error.message === 'insufficient_coins') {
            return res.status(400).json({ error: 'Yetersiz bakiye!' });
        }
        console.error('Satın alma hatası:', error);
        return res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
};

//kullanicinin envanterini listeler
export const getUserInventory = async (req, res) => {
    try {
        const userId = req.user.userId;

        const inventory = await prisma.userInventory.findMany({
            where: {
                userId: userId,
                quantity: { gt: 0 }
            },
            include: {
                item: true
            }
        });

        return res.status(200).json({ inventory });
    } catch (error) {
        console.error('Envanter alınırken hata oluştu:', error);
        return res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
};