import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

//test kontrol
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'StudyPet Backend calisiyor.' });
});

export default app;