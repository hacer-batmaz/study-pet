import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import petRoutes from './routes/petRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/stats', statsRoutes);

//test kontrol
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'StudyPet Backend calisiyor.' });
});

export default app;