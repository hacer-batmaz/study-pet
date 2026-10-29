import prisma from '../config/prismaClient.js';
import bcrypt from 'bcryptjs';

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });

    const totalSessions = await prisma.studySession.count();
    const completedSessions = await prisma.studySession.count({ where: { status: 'completed' } });
    const abandonedSessions = await prisma.studySession.count({ where: { status: 'abandoned' } });

    const durationSum = await prisma.studySession.aggregate({
      _sum: { durationMinutes: true },
      where: { status: 'completed' }
    });

    const allSessions = await prisma.studySession.findMany({
      where: { status: 'completed' },
      select: { category: true }
    });

    const categoryCounts = {};
    allSessions.forEach(s => {
      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const abandonedRate = totalSessions > 0
      ? Math.round((abandonedSessions / totalSessions) * 100)
      : 0;

    res.json({
      totalUsers,
      activeUsers,
      totalSessions,
      completedSessions,
      abandonedSessions,
      abandonedRate,
      totalStudyMinutes: durationSum._sum.durationMinutes || 0,
      totalStudyHours: ((durationSum._sum.durationMinutes || 0) / 60).toFixed(1),
      topCategories
    });
  } catch (error) {
    console.error('Admin stats hatası:', error);
    res.status(500).json({ error: 'Platform istatistikleri alınamadı.' });
  }
};

// Kullanici listesi
export const getAllUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const whereClause = {};

    if (search) {
      whereClause.OR = [
        { username: { contains: search } },
        { email: { contains: search } }
      ];
    }

    if (role && role !== 'ALL') {
      whereClause.role = role;
    }

    if (status && status !== 'ALL') {
      whereClause.isActive = status === 'ACTIVE';
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        coins: true,
        isActive: true,
        createdAt: true,
        pet: {
          select: {
            name: true,
            type: true,
            level: true,
            hungerLevel: true
          }
        },
        _count: {
          select: { sessions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ users });
  } catch (error) {
    console.error('Kullanıcı listesi hatası:', error);
    res.status(500).json({ error: 'Kullanıcılar getirilemedi.' });
  }
};

// Kullanici durumunu guncelleme
export const updateUserStatus = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const { isActive, role } = req.body;
    const adminId = req.user.userId;

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    // Adminin kendi yetkisini dusurmesini veya kendini askiya almasini engelle
    if (targetUser.id === adminId && (isActive === false || role === 'USER')) {
      return res.status(400).json({ error: 'Kendi aktif yönetici hesabınızı askıya alamaz veya yetkinizi düşüremezsiniz.' });
    }

    const updatedData = {};
    if (typeof isActive === 'boolean') updatedData.isActive = isActive;
    if (role && ['USER', 'ADMIN'].includes(role)) updatedData.role = role;

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: updatedData
    });

    // Kullanici askiya alindiysa aktif seansini abandoned yap
    if (isActive === false) {
      await prisma.studySession.updateMany({
        where: {
          userId: targetUserId,
          status: 'in_progress'
        },
        data: { status: 'abandoned' }
      });
    }

    // AdminLog kaydi olustur
    await prisma.adminLog.create({
      data: {
        adminId,
        action: isActive === false ? 'USER_SUSPEND' : role ? 'ROLE_CHANGE' : 'USER_ACTIVATE',
        target: `User #${targetUser.id} (${targetUser.username})`,
        details: JSON.stringify(updatedData)
      }
    });

    res.json({
      message: 'Kullanıcı durumu başarıyla güncellendi.',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role,
        isActive: updatedUser.isActive
      }
    });
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    res.status(500).json({ error: 'Kullanıcı durumu güncellenemedi.' });
  }
};

// Magaza urun listesi
export const getAdminShopItems = async (req, res) => {
  try {
    const items = await prisma.shopItem.findMany({
      orderBy: { id: 'asc' }
    });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: 'Mağaza ürünleri getirilemedi.' });
  }
};

// Yeni urun ekleme (PNG bağımlılığı kaldırıldı, emoji desteği sağlandı)
export const createShopItem = async (req, res) => {
  try {
    const { name, type, price, effectValue, spriteUrl } = req.body;
    const adminId = req.user.userId;

    if (!name || price === undefined || effectValue === undefined) {
      return res.status(400).json({ error: 'Ürün adı, fiyat ve açlık etki değeri zorunludur.' });
    }

    const newItem = await prisma.shopItem.create({
      data: {
        name: name.trim(),
        type: type || 'food',
        price: parseInt(price, 10),
        effectValue: parseInt(effectValue, 10),
        spriteUrl: spriteUrl || '🍖',
        isActive: true
      }
    });

    await prisma.adminLog.create({
      data: {
        adminId,
        action: 'ITEM_CREATE',
        target: `Item #${newItem.id} (${newItem.name})`,
        details: `Fiyat: ${newItem.price}, Etki: +${newItem.effectValue}, Simge: ${newItem.spriteUrl}`
      }
    });

    res.status(201).json({ message: 'Ürün mağazaya eklendi.', item: newItem });
  } catch (error) {
    console.error('Ürün ekleme hatası:', error);
    res.status(500).json({ error: 'Ürün eklenemedi.' });
  }
};

// Magaza urunu aktif/pasif yapma (Soft delete)
export const toggleShopItem = async (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);
    const adminId = req.user.userId;

    const item = await prisma.shopItem.findUnique({ where: { id: itemId } });
    if (!item) {
      return res.status(404).json({ error: 'Ürün bulunamadı.' });
    }

    const updated = await prisma.shopItem.update({
      where: { id: itemId },
      data: { isActive: !item.isActive }
    });

    await prisma.adminLog.create({
      data: {
        adminId,
        action: 'ITEM_TOGGLE',
        target: `Item #${item.id} (${item.name})`,
        details: `Yeni durum: ${updated.isActive ? 'Aktif' : 'Pasif'}`
      }
    });

    res.json({ message: `Ürün ${updated.isActive ? 'aktifleştirildi' : 'pasife alındı'}.`, item: updated });
  } catch (error) {
    res.status(500).json({ error: 'Ürün durumu değiştirilemedi.' });
  }
};

// Logları çekmek için endpoint
export const getAdminLogs = async (req, res) => {
  try {
    const logs = await prisma.adminLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: { username: true, email: true }
        }
      }
    });
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Denetim kayıtları alınamadı.' });
  }
};

// Admin kullanıcı ekleme
export const createUserByAdmin = async (req, res) => {
  try {
    const {
      username: rawUsername,
      email: rawEmail,
      password,
      role = 'USER',
      petName: rawPetName,
      petType = 'cat'
    } = req.body;
    const adminId = req.user.userId;

    if (!rawUsername || !rawEmail || !password || !rawPetName) {
      return res.status(400).json({ error: 'Lütfen kullanıcı adı, e-posta, şifre ve evcil hayvan adını doldurun.' });
    }

    const username = rawUsername.trim();
    const email = rawEmail.trim().toLowerCase();
    const petName = rawPetName.trim();

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: 'Kullanıcı adı 3-30 karakter olmalıdır.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Geçerli bir e-posta adresi giriniz.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır.' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Bu kullanıcı adı veya e-posta adresi zaten kullanımda.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: ['USER', 'ADMIN'].includes(role) ? role : 'USER',
        isActive: true,
        coins: 50,
        pet: {
          create: {
            name: petName,
            type: ['cat', 'dog', 'rabbit'].includes(petType) ? petType : 'cat',
            hungerLevel: 100,
            xp: 0,
            level: 1
          }
        }
      },
      include: {
        pet: true
      }
    });

    await prisma.adminLog.create({
      data: {
        adminId,
        action: 'USER_CREATE',
        target: `User #${newUser.id} (${newUser.username})`,
        details: `Rol: ${newUser.role}, Pet: ${newUser.pet?.name} (${newUser.pet?.type})`
      }
    });

    return res.status(201).json({
      message: 'Kullanıcı ve evcil hayvanı başarıyla oluşturuldu.',
      user: newUser
    });
  } catch (error) {
    console.error('Admin kullanıcı oluşturma hatası:', error);
    return res.status(500).json({ error: 'Kullanıcı oluşturulurken sunucu hatası oluştu.' });
  }
};