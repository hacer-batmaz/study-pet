import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {
        return res.status(401).json({ message: 'Erişim reddedildi: Giriş yapmanız gerekiyor.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err) {
            return res.status(403).json({ message: 'Geçersiz veya süresi dolmuş oturum.' });
        }
        req.user = user;
        next();
    });
}

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Bu alana erişim yetkiniz bulunmamaktadır. (Yalnızca Admin)' });
  }
  next();
};