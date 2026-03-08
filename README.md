# Bitespeed Identity Reconciliation Backend (Scaffold)

Standalone production-grade Node.js backend scaffold using Express, TypeScript, Prisma ORM, and PostgreSQL.
Business logic is intentionally not implemented yet.

## Tech Stack

- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- ESLint + Prettier
- dotenv

## Project Structure

```text
.
+-- prisma/
¦   +-- schema.prisma
+-- src/
¦   +-- app.ts
¦   +-- server.ts
¦   +-- controllers/
¦   ¦   +-- health.controller.ts
¦   +-- repositories/
¦   ¦   +-- contact.repository.ts
¦   +-- routes/
¦   ¦   +-- health.routes.ts
¦   +-- services/
¦   ¦   +-- identity.service.ts
¦   +-- utils/
¦       +-- env.ts
¦       +-- prisma.ts
+-- .env.example
+-- .eslintrc.cjs
+-- .gitignore
+-- .prettierignore
+-- .prettierrc
+-- package.json
+-- tsconfig.json
+-- README.md
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm start`
- `npm run lint`
- `npm run lint:fix`
- `npm run format`
- `npm run format:check`
- `npm run prisma:generate`
- `npm run prisma:migrate:dev`
- `npm run prisma:migrate:deploy`

## Health Endpoint

- `GET /health`

## Render Deployment

1. Push this project to a GitHub repository.
2. In Render, create a new **Web Service** from that repository.
3. Configure these settings:
   - Build Command: `npm install && npm run prisma:generate && npm run build`
   - Start Command: `npm start`
4. Add environment variables in Render:
   - `NODE_ENV=production`
   - `DATABASE_URL=<your-postgres-connection-string>`
   - `PORT` is provided automatically by Render (the app already reads `process.env.PORT`).
5. Ensure your PostgreSQL database is reachable from Render.
6. Deploy and verify:
   - `GET /health` returns `{ "status": "ok" }`

### Notes

- TypeScript compiles to the `dist/` directory (`tsconfig.json` uses `outDir: "dist"`).
- Production startup uses `node dist/server.js`.
