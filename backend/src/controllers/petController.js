import prisma from '../config/prismaClient.js';

//kullanicinin hayvanini ve envanterini getirir
export const getMyPet = async (req, res) => {
    try {
        const userId = req.user.userId;

        const pet = await prisma.pet.findUnique({
            where: { userId }
        });

        if (!pet) {
            return res.status(404).json({ error: 'Hayvan bulunamadı.' });
        }

        //kullanicinin sahip oldugu yiyecek ve esyalar
        const inventory = await prisma.userInventory.findMany({
            where: { userId },
            include: { item: true }
        });

        return res.status(200).json({ pet, inventory });
    } catch (error) {
        console.error('Hayvan bilgisi alınırken hata oluştu:', error);
        return res.status(500).json({ error: 'Sunucu hatası.' });
    }
};

//hayvan besleme
export const feedPet = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { inventoryId } = req.body;

        if (!inventoryId) {
            return res.status(400).json({ error: 'Lütfen yedirilecek yiyeceği seçin.' });
        }

        const inventoryItem = await prisma.userInventory.findFirst({
            where: {
                id: parseInt(inventoryId),
                userId
            },
            include: { item: true }
        });

        if (!inventoryItem || inventoryItem.quantity <= 0) {
            return res.status(400).json({ error: 'Envanterde bu eşyadan bulunmuyor.' });
        }

        if (inventoryItem.item.type !== 'food') {
            return res.status(400).json({ error: 'Bu eşya ile hayvan beslenemez.' });
        }

        const pet = await prisma.pet.findUnique({ where: { userId } });

        if (pet.hungerLevel >= 100) {
            return res.status(400).json({ error: 'Hayvan zaten tamamen tok (100/100).' });
        }

        //acliği max 100 olacak sekilde artir
        const newHunger = Math.min(100, pet.hungerLevel + inventoryItem.item.effectValue);

        //envanter miktarini 1 azalt - 0 olursa kaydi sil ve acligi guncelle
        await prisma.$transaction(async (tx) => {
            if (inventoryItem.quantity > 1) {
                await tx.userInventory.update({
                    where: { id: inventoryItem.id },
                    data: { quantity: { decrement: 1 } }
                });
            } else {
                await tx.userInventory.delete({
                    where: { id: inventoryItem.id }
                });
            }

            await tx.pet.update({
                where: { userId },
                data: { hungerLevel: newHunger }
            });
        });

        return res.status(200).json({
            message: `${pet.name} başarıyla beslendi. Açlık seviyesi: ${newHunger}/100`,
            newHungerLevel: newHunger,
            fedWith: inventoryItem.item.name
        });
    } catch (error) {
        console.error('Hayvan beslenirken hata oluştu:', error);
        return res.status(500).json({ error: 'Sunucu hatası.' });
    }
}