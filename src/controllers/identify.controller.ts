import type { Request, Response } from 'express';
import { ZodError } from 'zod';

import { IdentityService } from '../services/identity.service';
import { identifySchema } from '../utils/identify.schema';
import { logger } from '../utils/logger';

export class IdentifyController {
  private readonly identityService: IdentityService;

  constructor(identityService?: IdentityService) {
    this.identityService = identityService ?? new IdentityService();
  }

  identify = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, phoneNumber } = identifySchema.parse(req.body);

      logger.info('Incoming identify request', { email, phoneNumber });

      const result = await this.identityService.identifyContact(email, phoneNumber);

      logger.info('Identity reconciliation completed', result);

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        logger.error('Identify request validation failed', {
          issues: error.issues,
        });

        return res.status(400).json({
          message: error.issues[0]?.message ?? 'Invalid request body.',
        });
      }

      const message = error instanceof Error ? error.message : 'Internal server error';

      logger.error('Identify request failed', {
        message,
      });

      return res.status(500).json({
        message,
      });
    }
  };
}
