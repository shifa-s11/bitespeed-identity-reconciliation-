const port = Number(process.env.PORT ?? 3000);

if (Number.isNaN(port) || port <= 0) {
  throw new Error('Invalid PORT. Please provide a valid positive number.');
}

export const env = {
  PORT: port,
  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const;
