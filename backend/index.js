import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes.js';
import { errorHandler } from './errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Storybook backend is running!' });
});

app.use('/api', routes);

// This must be LAST — it catches all errors from all routes
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});