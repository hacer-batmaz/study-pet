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
    const userId = req.user.userId;
    const { sessionId } = req.body;

    // 1. Kullanıcının hayvanını bul
    const pet = await prisma.pet.findFirst({ where: { userId } });
    if (!pet) {
      return res.status(404).json({ error: 'Sanal hayvan bulunamadı.' });
    }

    // 2. Seansı bul (Varsa id'ye göre, yoksa kullanıcının en son tamamlanmamış seansına göre)
    let session = null;
    if (sessionId) {
      session = await prisma.studySession.findFirst({
        where: {
          id: parseInt(sessionId, 10),
          userId
        }
      });
    }

    if (!session) {
      session = await prisma.studySession.findFirst({
        where: {
          userId,
          status: 'in_progress'
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    // Seans süresini al (Yoksa varsayılan 25 dk)
    const sessionMins = session?.durationMinutes || session?.duration || 25;

    // Süreye göre dinamik ceza puanı (10 taban + her 5 dk için +1, maks 40)
    const penaltyAmount = Math.min(40, 10 + Math.floor(sessionMins / 5));

    // Açlığı 0'ın altına düşmeyecek şekilde hesapla
    const updatedHunger = Math.max(0, pet.hungerLevel - penaltyAmount);

    // 3. Veritabanı Güncellemesi: Hayvanın açlığını düşür, seansın durumunu güncelle
    let updatedPet;
    if (session) {
      const [p] = await prisma.$transaction([
        prisma.pet.update({
          where: { id: pet.id },
          data: { hungerLevel: updatedHunger }
        }),
        prisma.studySession.update({
          where: { id: session.id },
          data: {
            status: 'abandoned',
            isCompleted: false
            // endedAt alanı şemada olmadığı için kaldırıldı
          }
        })
      ]);
      updatedPet = p;
    } else {
      updatedPet = await prisma.pet.update({
        where: { id: pet.id },
        data: { hungerLevel: updatedHunger }
      });
    }

    return res.status(200).json({
      message: 'Seans iptal edildi.',
      penaltyAmount,
      pet: updatedPet
    });
  } catch (error) {
    console.error('Abandon hatası:', error);
    return res.status(500).json({ error: 'Seans iptal edilirken sunucu hatası oluştu.' });
  }
};

//kullanicinin varsa aktif seansini ve kalan suresini getirir
export const getActiveSession = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Kullanıcının devam eden seansını bul
    const activeSession = await prisma.studySession.findFirst({
      where: {
        userId,
        status: 'in_progress'
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!activeSession) {
      return res.status(200).json({ activeSession: null });
    }

    // Geçen ve kalan süreyi hesapla
    const now = new Date();
    const startTime = new Date(activeSession.createdAt);
    const elapsedSeconds = Math.floor((now - startTime) / 1000);
    const totalMinutes = activeSession.durationMinutes || activeSession.duration || 25;
    const totalSeconds = totalMinutes * 60;
    const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

    return res.status(200).json({
      activeSession: {
        id: activeSession.id,
        category: activeSession.category,
        durationMinutes: totalMinutes,
        remainingSeconds,
        isExpired: remainingSeconds === 0
      }
    });
  } catch (error) {
    console.error('Aktif seans sorgulama hatası:', error);
    return res.status(500).json({ error: 'Aktif seans kontrol edilirken sunucu hatası oluştu.' });
  }
};

//kullanicinin calisma istatistiklerini hesaplar ve doner
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { timeRange, startDate, endDate, category } = req.query;

    // Prisma sorgu filtresi oluşturma
    const whereClause = {
      userId,
      status: { in: ['completed', 'abandoned'] }
    };

    // 1. Kategori Filtresi
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    // 2. Tarih Filtresi
    const now = new Date();
    if (timeRange === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      whereClause.createdAt = { gte: startOfDay, lte: endOfDay };
    } else if (timeRange === 'week') {
      const past7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      whereClause.createdAt = { gte: past7Days };
    } else if (timeRange === 'custom' && (startDate || endDate)) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(`${startDate}T00:00:00`);
      if (endDate) whereClause.createdAt.lte = new Date(`${endDate}T23:59:59`);
    }

    const sessions = await prisma.studySession.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.status === 'completed');
    const abandonedSessions = sessions.filter((s) => s.status === 'abandoned');

    // Sadece tamamlanan seansların süresi eklenir
    const totalMinutesStudied = completedSessions.reduce(
      (acc, s) => acc + (s.durationMinutes || 0),
      0
    );

    const completionRate =
      totalSessions > 0
        ? Math.round((completedSessions.length / totalSessions) * 100)
        : 0;

    // Kategori bazlı süre dağılımı
    const categoryBreakdown = {};
    completedSessions.forEach((s) => {
      const cat = s.category || 'Genel Çalışma';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + (s.durationMinutes || 0);
    });

    const categoryStats = Object.entries(categoryBreakdown).map(([name, minutes]) => ({
      name,
      minutes,
      percentage: totalMinutesStudied > 0 ? Math.round((minutes / totalMinutesStudied) * 100) : 0
    }));

    return res.status(200).json({
      totalMinutesStudied,
      totalHours: Number((totalMinutesStudied / 60).toFixed(1)),
      totalSessionsCount: totalSessions,
      completedCount: completedSessions.length,
      abandonedCount: abandonedSessions.length,
      completionRate,
      categoryStats
    });
  } catch (error) {
    console.error('İstatistik getirme hatası:', error);
    return res.status(500).json({ error: 'İstatistikler hesaplanırken sunucu hatası oluştu.' });
  }
};

//kullanicinin gecmis calisma seanslari listesini doner
export const getSessionHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit, 10) || 20;

    const history = await prisma.studySession.findMany({
      where: {
        userId,
        status: { in: ['completed', 'abandoned'] }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return res.status(200).json({ history });
  } catch (error) {
    console.error('Seans geçmişi getirme hatası:', error);
    return res.status(500).json({ error: 'Geçmiş seanslar yüklenirken sunucu hatası oluştu.' });
  }
};