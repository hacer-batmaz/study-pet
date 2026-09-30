import prisma from '../config/prismaClient.js';

//seans baslatma
export const startSession = async (req, res) => {
  try {
    const { category, durationMinutes } = req.body;
    const userId = req.user.userId;

    if (!category || !durationMinutes || durationMinutes <= 0) {
      return res.status(400).json({ error: 'Geçerli bir ders kategorisi ve süre giriniz.' });
    }

    //aktif seans var mi kontrol
    const activeSession = await prisma.studySession.findFirst({
      where: {
        userId,
        status: 'in_progress'
      }
    });

    if (activeSession) {
      return res.status(400).json({ 
        error: 'Zaten devam eden bir çalışma seansınız var.',
        session: activeSession 
      });
    }

    const newSession = await prisma.studySession.create({
      data: {
        userId,
        category,
        durationMinutes: parseInt(durationMinutes),
        status: 'in_progress',
        isCompleted: false
      }
    });

    return res.status(201).json({
      message: 'Çalışma seansı başlatıldı.',
      session: newSession
    });
  } catch (error) {
    console.error('Seans başlatma hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
};

//seans tamamlama
export const completeSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.userId;

    const session = await prisma.studySession.findFirst({
      where: {
        id: parseInt(sessionId),
        userId,
        status: 'in_progress'
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Tamamlanacak aktif bir seans bulunamadı.' });
    }

    //her 10 dk ya 10 coin 20 xp
    const coinsEarned = Math.max(5, Math.floor(session.durationMinutes / 10) * 10);
    const xpEarned = Math.max(10, Math.floor(session.durationMinutes / 10) * 20);

    //kullanici ve hayvan bilgilerini al
    const pet = await prisma.pet.findUnique({
      where: { userId }
    });

    if (!pet) {
      return res.status(404).json({ error: 'Kullanıcıya ait hayvan bulunamadı.' });
    }

    let newXp = pet.xp + xpEarned;
    let newLevel = pet.level;
    const xpThreshold = newLevel * 100;

    if (newXp >= xpThreshold) {
      newLevel += 1;
      newXp = newXp - xpThreshold;
    }

    //seans guncelle,coin ver, hayvanin xp - level artir
    const [updatedSession, updatedUser, updatedPet] = await prisma.$transaction([
      prisma.studySession.update({
        where: { id: session.id },
        data: {
          status: 'completed',
          isCompleted: true
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          coins: { increment: coinsEarned }
        }
      }),
      prisma.pet.update({
        where: { userId },
        data: {
          xp: newXp,
          level: newLevel
        }
      })
    ]);

    return res.status(200).json({
      message: 'Tebrikler! Seans başarıyla tamamlandı.',
      rewards: {
        coinsEarned,
        xpEarned,
        leveledUp: newLevel > pet.level
      },
      userCoins: updatedUser.coins,
      pet: updatedPet
    });
  } catch (error) {
    console.error('Seans tamamlama hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
};

//pes etme- iptal
export const abandonSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.userId;

    const session = await prisma.studySession.findFirst({
      where: {
        id: parseInt(sessionId),
        userId,
        status: 'in_progress'
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'İptal edilecek aktif bir seans bulunamadı.' });
    }

    const pet = await prisma.pet.findUnique({
      where: { userId }
    });

    //aclik puanini 15 dusurur - 0in altina inmez
    const newHunger = Math.max(0, (pet ? pet.hungerLevel : 100) - 15);

    await prisma.$transaction([
      prisma.studySession.update({
        where: { id: session.id },
        data: {
          status: 'abandoned',
          isCompleted: false
        }
      }),
      prisma.pet.update({
        where: { userId },
        data: {
          hungerLevel: newHunger
        }
      })
    ]);

    return res.status(200).json({
      message: 'Seans iptal edildi. Hayvanınız açlık puanı kaybetti!',
      hungerLevel: newHunger
    });
  } catch (error) {
    console.error('Seans iptal hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
};