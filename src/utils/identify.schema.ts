import { z } from 'zod';

export const identifySchema = z
  .object({
    email: z.string().email().optional(),
    phoneNumber: z.string().min(1).optional(),
  })
  .refine((data) => Boolean(data.email || data.phoneNumber), {
    message: 'At least one of email or phoneNumber is required.',
  });

export type IdentifyInput = z.infer<typeof identifySchema>;
