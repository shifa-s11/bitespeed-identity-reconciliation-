# Bitespeed Identity Reconciliation Backend

## Project Overview
This project is a production-ready Node.js backend built for the **Bitespeed Identity Reconciliation** task.  
It resolves customer identities across multiple contact records using shared `email` and/or `phoneNumber`, and returns a consolidated identity response.

The service ensures:
- Contacts linked by email or phone number are grouped under one identity.
- The oldest contact remains the **primary** contact.
- Newer related contacts are marked as **secondary**.

## Tech Stack
- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Validation:** Zod
- **Linting/Formatting:** ESLint + Prettier
- **Environment Management:** dotenv

## Architecture
The codebase follows a clean layered structure:

```text
src/
+-- controllers/   # HTTP layer (request/response handling)
+-- services/      # Business logic (identity reconciliation)
+-- repositories/  # Data access using Prisma Client
+-- routes/        # Express route definitions
+-- utils/         # Shared utilities (env, prisma, logger, schemas)
```

Flow:
1. Route receives request.
2. Controller validates payload and delegates to service.
3. Service applies reconciliation rules.
4. Repository handles all database operations.
5. Controller returns normalized API response.

## Database Schema
Prisma model used for contacts:

```prisma
model Contact {
  id             Int            @id @default(autoincrement())
  email          String?
  phoneNumber    String?
  linkedId       Int?
  linkPrecedence LinkPrecedence
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  deletedAt      DateTime?

  @@index([email])
  @@index([phoneNumber])
  @@index([linkedId])
}

enum LinkPrecedence {
  primary
  secondary
}
```

## API Endpoint (/identify)
### `POST /identify`
Identifies or creates a reconciled customer identity.

### Validation Rules
- Request body accepts:
  - `email?: string`
  - `phoneNumber?: string`
- At least one of `email` or `phoneNumber` must be provided.

## Example Request
```http
POST /identify
Content-Type: application/json

{
  "email": "test@example.com",
  "phoneNumber": "123456"
}
```

## Example Response
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["test@example.com", "alt@example.com"],
    "phoneNumbers": ["123456", "999999"],
    "secondaryContactIds": [2, 3]
  }
}
```

## Running Locally
### 1. Install dependencies
```bash
npm install
```

### 2. Setup environment variables
Create `.env` from `.env.example` and set values:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bitespeed?schema=public"
```

### 3. Generate Prisma Client
```bash
npm run prisma:generate
```

### 4. Run the project
```bash
npm run dev
```

### 5. Build and run production mode
```bash
npm run build
npm start
```

### 6. Health Check
```http
GET /health
```
Response:
```json
{
  "status": "ok"
}
```

## Deployment Instructions (Render)
1. Push the repository to GitHub.
2. In Render, create a new **Web Service** from the repository.
3. Configure:
- **Build Command:** `npm install && npm run prisma:generate && npm run build`
- **Start Command:** `npm start`
4. Add environment variables:
- `NODE_ENV=production`
- `DATABASE_URL=<your-postgres-connection-string>`
- `PORT` will be provided automatically by Render.
5. Deploy and verify:
- `GET /health` should return `{ "status": "ok" }`

## Future Improvements
- Add integration and unit tests for reconciliation scenarios.
- Add request tracing and structured observability (request IDs, metrics).
- Add API documentation via OpenAPI/Swagger.
- Add soft-delete handling strategy and archival jobs.
- Add CI pipeline (lint, type-check, test, build).
- Add Docker production image and Compose setup for local parity.

## Postman Testing
### Base URL
```text
http://localhost:3000
```

### 1) Identify Contact
- Method: `POST`
- URL: `/identify`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "email": "test@example.com",
  "phoneNumber": "123456"
}
```

### 2) Health Check
- Method: `GET`
- URL: `/health`

### Optional: Postman Collection JSON (v2.1)
Import this into Postman (`Import` -> `Raw text`):

```json
{
  "info": {
    "name": "Bitespeed Identity Reconciliation",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Identify",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@example.com\",\n  \"phoneNumber\": \"123456\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/identify",
          "host": ["{{baseUrl}}"],
          "path": ["identify"]
        }
      }
    },
    {
      "name": "Health",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/health",
          "host": ["{{baseUrl}}"],
          "path": ["health"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    }
  ]
}
```
