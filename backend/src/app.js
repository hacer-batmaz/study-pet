import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);

//test kontrol
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'StudyPet Backend calisiyor.' });
});

export default app;