import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prismaClient.js';

//kayit -> kullanici + secilen hayva olusturulur
export const register = async (req, res) => {
  try {
    const { username: rawUsername, email: rawEmail, password, petName: rawPetName, petType } = req.body;

    if (!rawUsername || !rawEmail || !password || !rawPetName || !petType) {
      return res.status(400).json({ error: 'Lütfen tüm alanları doldurun.' });
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
    if (petName.length < 1 || petName.length > 30) {
      return res.status(400).json({ error: 'Hayvan adı 1-30 karakter olmalıdır.' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Bu kullanıcı adı veya e-posta adresi zaten kullanımda.' });
    }

    //parola hashleme
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Kullanıcıyı ve varsayılan hayvanını tek işlemde oluştur
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        pet: {
          create: {
            name: petName,
            type: petType,
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

    //JWT token uretimi
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Kayıt başarılı!',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        coins: newUser.coins,
        pet: newUser.pet
      }
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Bu kullanıcı adı veya e-posta adresi zaten kullanımda.' });
    }
    console.error('Kayıt hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
};

//giris
export const login = async (req, res) => {
  try {
    const { email: rawEmail, password } = req.body;

    if (!rawEmail || !password) {
      return res.status(400).json({ error: 'E-posta ve şifre gereklidir.' });
    }

    const email = rawEmail.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
      include: { pet: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Giriş başarılı!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        pet: user.pet
      }
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
};

//giris yapmis kullanicinin bilgilerini dondurur
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        coins: true,
        createdAt: true,
        pet: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Kullanıcı bilgisi hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
};

// Profil bilgilerini güncelleme (Kullanıcı adı, e-posta, evcil hayvan adı)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, email, petName } = req.body;

    if (!username || username.trim() === '') {
      return res.status(400).json({ error: 'Kullanıcı adı boş bırakılamaz.' });
    }

    // Kullanıcının mevcut verilerini ve hayvanını çek
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { pet: true }
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email ? email.trim().toLowerCase() : null;
    const trimmedPetName = petName ? petName.trim() : '';

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      return res.status(400).json({ error: 'Kullanıcı adı 3-30 karakter olmalıdır.' });
    }
    if (trimmedEmail && !EMAIL_RE.test(trimmedEmail)) {
      return res.status(400).json({ error: 'Geçerli bir e-posta adresi giriniz.' });
    }
    if (trimmedPetName.length > 30) {
      return res.status(400).json({ error: 'Hayvan adı en fazla 30 karakter olabilir.' });
    }

    // Kullanıcı adı değişmişse benzersizlik kontrolü yap
    if (trimmedUsername !== currentUser.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: trimmedUsername,
          NOT: { id: userId }
        }
      });

      if (existingUser) {
        return res.status(409).json({ error: 'Bu kullanıcı adı zaten kullanılıyor.' });
      }
    }

    // E-posta değişmişse benzersizlik kontrolü yap
    if (trimmedEmail && trimmedEmail !== currentUser.email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email: trimmedEmail,
          NOT: { id: userId }
        }
      });

      if (existingEmail) {
        return res.status(409).json({ error: 'Bu e-posta adresi zaten kullanılıyor.' });
      }
    }

    // Değişiklikleri tespit et
    const usernameChanged = trimmedUsername !== currentUser.username;
    const emailChanged = Boolean(trimmedEmail) && trimmedEmail !== currentUser.email;
    const petChanged =
      Boolean(trimmedPetName) && currentUser.pet && trimmedPetName !== currentUser.pet.name;

    const changeMessages = [];
    if (usernameChanged) {
      changeMessages.push(`Kullanıcı adı değiştirildi: "${currentUser.username}" → "${trimmedUsername}".`);
    }
    if (emailChanged) {
      changeMessages.push(`E-posta değiştirildi: "${currentUser.email || 'tanımsız'}" → "${trimmedEmail}".`);
    }
    if (petChanged) {
      changeMessages.push(`Sanal hayvan adı değiştirildi: "${currentUser.pet.name}" → "${trimmedPetName}".`);
    }

    // Değişiklik yoksa DB'ye yazma (frontend user.* beklediği için user'ı yine döndür)
    if (changeMessages.length === 0) {
      return res.status(200).json({
        message: 'Herhangi bir bilgi değiştirilmedi.',
        user: {
          id: currentUser.id,
          username: currentUser.username,
          email: currentUser.email,
          coins: currentUser.coins,
          pet: currentUser.pet
        }
      });
    }

    // Kullanıcı ve hayvan güncellemesi tek transaction'da
    const [updatedUser, updatedPet] = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: userId },
        data: {
          ...(usernameChanged && { username: trimmedUsername }),
          ...(emailChanged && { email: trimmedEmail })
        },
        select: { id: true, username: true, email: true, coins: true }
      });

      const p = petChanged
        ? await tx.pet.update({
          where: { id: currentUser.pet.id },
          data: { name: trimmedPetName }
        })
        : currentUser.pet;

      return [u, p];
    });

    return res.status(200).json({
      message: changeMessages.join(' '),
      user: { ...updatedUser, pet: updatedPet }
    });
  } catch (error) {
    // Kontrol ile update arasında araya giren aynı kullanıcı adı/e-posta
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Bu kullanıcı adı veya e-posta zaten kullanılıyor.' });
    }
    console.error('Profil güncelleme hatası:', error);
    return res.status(500).json({ error: 'Profil güncellenirken sunucu hatası oluştu.' });
  }
};

// Şifre değiştirme
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Lütfen mevcut ve yeni şifrenizi girin.' });
    }

    // Yeni şifre mevcut şifre ile aynı mı kontrolü
    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'Yeni şifre mevcut şifre ile aynı olamaz.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Yeni şifre en az 6 karakter olmalıdır.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    // Mevcut şifreyi doğrula
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Mevcut şifreniz hatalı.' });
    }

    // Yeni şifreyi hashle ve kaydet
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    return res.status(200).json({ message: 'Şifreniz başarıyla güncellendi.' });
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    return res.status(500).json({ error: 'Şifre güncellenirken sunucu hatası oluştu.' });
  }
};