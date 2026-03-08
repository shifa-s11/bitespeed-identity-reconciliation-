import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { healthRouter } from './routes/health.routes';
import { identifyRouter as identifyRoutes } from './routes/identify.routes';

dotenv.config();

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

app.use('/health', healthRouter);
app.use('/identify', identifyRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

