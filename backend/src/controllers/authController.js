import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prismaClient.js';

//kayit -> kullanici + secilen hayva olusturulur
export const register = async (req, res) => {
  try {
    const { username, email, password, petName, petType } = req.body;

    if (!username || !email || !password || !petName || !petType) {
      return res.status(400).json({ error: 'Lütfen tüm alanları doldurun.' });
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
    console.error('Kayıt hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
};

//giris
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-posta ve şifre gereklidir.' });
    }

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