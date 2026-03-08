import { Router } from 'express';

import { IdentifyController } from '../controllers/identify.controller';

const identifyController = new IdentifyController();

export const identifyRouter = Router();

identifyRouter.post('/identify', identifyController.identify);
