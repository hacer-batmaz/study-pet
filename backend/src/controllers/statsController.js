import prisma from '../config/prismaClient.js';

export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        //kullanicinin tum seanslari
        const sessions = await prisma.studySession.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        const completedSessions = sessions.filter(s => s.status === 'completed');
        const abandonedSessions = sessions.filter(s => s.status === 'abandoned');

        const totalMinutes = completedSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

        //kategori bazli sure dagilimi
        const categoryDistribution = completedSessions.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.durationMinutes;
            return acc;
        }, {});

        //son 7 gunluk sure trendi
        const last7DaysMap = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            last7DaysMap[key] = 0;
        }

        completedSessions.forEach(s => {
            const sessionDate = s.createdAt.toISOString().split('T')[0];
            if (last7DaysMap[sessionDate] !== undefined) {
                last7DaysMap[sessionDate] += s.durationMinutes;
            }
        });

        const dailyTrend = Object.keys(last7DaysMap).map(date => ({
            date,
            minutes: last7DaysMap[date]
        }));

        //son 5 seans gecmis
        const recentSessions = sessions.slice(0, 5);

        return res.status(200).json({
            summary: {
                totalSessions: sessions.length,
                completedSessions: completedSessions.length,
                abandonedSessions: abandonedSessions.length,
                totalMinutes,
                totalHours: (totalMinutes / 60).toFixed(2)
            },
            categoryDistribution,
            dailyTrend,
            recentSessions
        });
    } catch (error) {
        console.error('İstatistik alma hatası:', error);
        return res.status(500).json({ message: 'Sunucu hatası' });
    }
}