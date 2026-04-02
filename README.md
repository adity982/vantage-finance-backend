# 🏦 Vantage Finance Backend

A robust, role-based Finance Data Processing API built with **Node.js**, **TypeScript**, **Express.js**, **Prisma ORM**, and **PostgreSQL**. Features JWT authentication, Argon2 password hashing, Zod request validation, and a strict RBAC middleware layer.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started (Step-by-Step)](#getting-started-step-by-step)
- [Environment Variables](#environment-variables)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [API Endpoints](#api-endpoints)
- [API Testing (Postman)](#-api-testing-postman)
- [Project Structure](#project-structure)
- [Error Response Format](#error-response-format)

---

## Tech Stack

| Technology   | Purpose                          |
| ------------ | -------------------------------- |
| **Node.js**  | JavaScript runtime               |
| **TypeScript** | Type-safe development (strict mode, zero `any`) |
| **Express.js** | HTTP framework & routing        |
| **PostgreSQL** | Relational database (production-grade) |
| **Prisma ORM** | Database access, migrations & seeding |
| **JWT**      | Stateless authentication tokens  |
| **Argon2**   | Industry-standard password hashing |
| **Zod**      | Runtime request schema validation |

---

## Features

- **JWT Authentication** with Argon2 password hashing
- **Role-Based Access Control** (VIEWER, ANALYST, ADMIN)
- **Financial Records CRUD** with filtering (date range, category, type)
- **Dashboard Analytics** — summary, category breakdown, monthly trends
- **Request Validation** with Zod schemas on every POST/PATCH
- **Standardized Error Responses** via global error handler (`{ error, code }`)
- **Clean Architecture** — Controller → Service → Repository (Prisma) pattern

---

## Getting Started (Step-by-Step)

Follow these steps **in order** to get the app running locally.

### Prerequisites

- **Node.js** v18+ and npm
- **PostgreSQL** 14+ installed and running (or Docker)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment Variables

Copy the example file and update it with your PostgreSQL credentials:

```bash
cp .env.example .env
```

Open `.env` and set your `DATABASE_URL` with the correct username and password:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/vantage_finance?schema=public"
JWT_SECRET="your-secure-secret-key"
JWT_EXPIRES_IN="24h"
PORT=3000
```

### Step 3: Set Up the Database

**Option A: Using Docker (Recommended)**

```bash
docker-compose up -d
```

**Option B: Using Local PostgreSQL**

Create a database named `vantage_finance` manually (via psql or pgAdmin).

### Step 4: Generate Prisma Client

```bash
npx prisma generate
```

### Step 5: Run Database Migrations

This creates all the tables (`users`, `finance_records`) and enums in your database:

```bash
npx prisma migrate dev --name init
```

### Step 6: Seed the Database

This creates an initial **ADMIN** user so you can log in immediately:

```bash
npx prisma db seed
```

> **Seed credentials:** `admin@vantage.com` / `Admin123!`

### Step 7: Start the Development Server

```bash
npm run dev
```

The API will be available at **http://localhost:3000**. You can verify it's running by visiting:

```
GET http://localhost:3000/api/health
```

### Production Build (Optional)

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable        | Description                  | Default                           |
| --------------- | ---------------------------- | --------------------------------- |
| `DATABASE_URL`  | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/vantage_finance` |
| `JWT_SECRET`    | Secret key for JWT signing   | *(must be set)*                   |
| `JWT_EXPIRES_IN`| Token expiration time        | `24h`                             |
| `PORT`          | Server port                  | `3000`                            |

---

## Role-Based Access Control (RBAC)

Security is enforced through a **two-layer middleware pipeline** on every protected route.

### The Three Roles

| Role      | Records (Read) | Records (Write) | Dashboard Analytics | User Management |
| --------- | :------------: | :--------------: | :-----------------: | :-------------: |
| `VIEWER`  | ✅             | ❌               | ❌                  | ❌              |
| `ANALYST` | ✅             | ❌               | ✅                  | ❌              |
| `ADMIN`   | ✅             | ✅               | ✅                  | ✅              |

### How the RBAC Middleware Works

The system uses two chained Express middlewares to secure endpoints:

1. **`authenticate` middleware** (`src/middlewares/auth.middleware.ts`)
   - Extracts the JWT from the `Authorization: Bearer <token>` header.
   - Verifies the token signature and expiration using the `JWT_SECRET`.
   - Decodes the payload (`userId`, `email`, `role`) and attaches it to `req.user`.
   - Returns **401 Unauthorized** if the token is missing, malformed, or expired.

2. **`checkRole(allowedRoles[])` middleware** (`src/middlewares/role.middleware.ts`)
   - A **factory function** that accepts an array of allowed roles (e.g., `[Role.ANALYST, Role.ADMIN]`).
   - Reads `req.user.role` (set by the `authenticate` middleware above).
   - Compares the user's role against the `allowedRoles` array.
   - Returns **403 Forbidden** if the user's role is not in the allowed list.

3. **`validate(schema)` middleware** (`src/middlewares/validate.middleware.ts`)
   - Validates `req.body` against a **Zod schema** before the request reaches the controller.
   - Returns **422 Unprocessable Entity** with detailed validation errors on failure.

### Example: How a Route is Protected

```typescript
// Only ADMIN can create records
router.post(
  "/",
  authenticate,                    // Step 1: Verify JWT
  checkRole([Role.ADMIN]),         // Step 2: Check role
  validate(createRecordSchema),    // Step 3: Validate body
  recordController.createRecord    // Step 4: Handle request
);
```

**Flow:** `Request → authenticate → checkRole → validate → Controller → Service → Database`

If any middleware fails, the request is immediately rejected with the appropriate HTTP status code and never reaches the controller.

---

## API Endpoints

### Authentication

| Method | Endpoint           | Auth | Description                |
| ------ | ------------------ | ---- | -------------------------- |
| POST   | `/api/auth/login`  | No   | Login and receive JWT      |

### User Management

| Method | Endpoint       | Auth  | Role  | Description          |
| ------ | -------------- | ----- | ----- | -------------------- |
| POST   | `/api/users`   | Yes   | ADMIN | Create a new user    |

### Financial Records

| Method | Endpoint             | Auth | Role          | Description             |
| ------ | -------------------- | ---- | ------------- | ----------------------- |
| GET    | `/api/records`       | Yes  | ALL           | List records (filtered) |
| POST   | `/api/records`       | Yes  | ADMIN         | Create a record         |
| PATCH  | `/api/records/:id`   | Yes  | ADMIN         | Update a record         |
| DELETE | `/api/records/:id`   | Yes  | ADMIN         | Delete a record         |

**Query Filters for GET /api/records:**
- `startDate` — ISO 8601 datetime (e.g., `2024-01-01T00:00:00Z`)
- `endDate` — ISO 8601 datetime
- `category` — Case-insensitive category name
- `type` — `INCOME` or `EXPENSE`

### Dashboard & Analytics

| Method | Endpoint                    | Auth | Role            | Description                  |
| ------ | --------------------------- | ---- | --------------- | ---------------------------- |
| GET    | `/api/dashboard/summary`    | Yes  | ANALYST, ADMIN  | Total income/expense/balance |
| GET    | `/api/dashboard/categories` | Yes  | ANALYST, ADMIN  | Spending by category         |
| GET    | `/api/dashboard/trends`     | Yes  | ANALYST, ADMIN  | Monthly trend data           |

### Health Check

| Method | Endpoint       | Auth | Description         |
| ------ | -------------- | ---- | ------------------- |
| GET    | `/api/health`  | No   | Server health check |

---

## 🧪 API Testing (Postman)

To make testing easier, I have included a full Postman collection with all configured routes and sample payloads.

1. Open Postman.
2. Click **Import** in the top left corner.
3. Select the `vantage_finance_postman_collection.json` file located in the `docs/` folder of this repository.
4. All endpoints are pre-configured. Remember to run the **Login** endpoint first to get your JWT token, then use it in the `Authorization` header for all other requests.

---

## Project Structure

```
├── docs/
│   └── postman_collection.json # Postman collection for API testing
├── prisma/
│   ├── schema.prisma           # Data models & enums
│   └── seed.ts                 # Database seeding script
├── src/
│   ├── controllers/            # Request/Response handling
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── record.controller.ts
│   │   └── dashboard.controller.ts
│   ├── services/               # Business logic ("the brain")
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── record.service.ts
│   │   └── dashboard.service.ts
│   ├── middlewares/            # Auth & Role checks
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── validate.middleware.ts
│   │   └── errorHandler.middleware.ts
│   ├── routes/                 # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── record.routes.ts
│   │   └── dashboard.routes.ts
│   ├── schemas/                # Zod validation schemas
│   │   ├── auth.schema.ts
│   │   ├── user.schema.ts
│   │   └── record.schema.ts
│   ├── types/                  # TypeScript interfaces
│   │   └── index.ts
│   ├── utils/                  # Shared utilities
│   │   ├── prisma.ts
│   │   ├── jwt.ts
│   │   └── apiError.ts
│   ├── app.ts                  # Express app configuration
│   └── server.ts               # Entry point
├── .env.example                # Environment template
├── docker-compose.yml          # PostgreSQL container
├── package.json
└── tsconfig.json
```

---

## Error Response Format

All errors follow a standardized format:

```json
{
  "error": "Descriptive error message",
  "code": 422
}
```

| Code | Meaning                |
| ---- | ---------------------- |
| 400  | Bad Request            |
| 401  | Unauthorized           |
| 403  | Forbidden              |
| 404  | Not Found              |
| 422  | Validation Error       |
| 500  | Internal Server Error  |
