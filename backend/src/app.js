import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

//test kontrol
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'StudyPet Backend calisiyor.' });
});

export default app;