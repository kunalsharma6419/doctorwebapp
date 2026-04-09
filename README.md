# Doctor Consultation App

Doctor-only clinic consultation app with a separate Node.js backend and React frontend.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT

## Project Structure

```txt
doctorapp/
  backend/
  frontend/
```

## Prerequisites

Install these first:

- Node.js 20 or later
- npm 10 or later
- PostgreSQL 15 or later

You can verify them with:

```powershell
node -v
npm -v
psql --version
```

## 1. Clone And Open The Project

```powershell
cd d:\github
git clone <your-repo-url> doctorapp
cd doctorapp
```

If you already have the folder, just open:

```powershell
cd d:\github\doctorapp
```

## 2. Create The PostgreSQL Database

Open PostgreSQL and create a database:

```sql
CREATE DATABASE doctorapp;
```

Default connection example used in this project:

```txt
postgresql://postgres:postgres@localhost:5432/doctorapp?schema=public
```

If your PostgreSQL username, password, host, or port is different, use your own values in the env file.

## 3. Backend Setup

Move into the backend folder:

```powershell
cd backend
```

Install dependencies:

```powershell
npm install
```

Create the environment file:

```powershell
Copy-Item .env.example .env
```

Open `backend/.env` and update these values:

```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/doctorapp?schema=public"
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

Important:

- `DATABASE_URL` must match your PostgreSQL setup
- `JWT_SECRET` should be changed to a strong secret before real use
- `CORS_ORIGIN` should stay `http://localhost:5173` for local frontend development

Generate the Prisma client:

```powershell
npm run prisma:generate
```

Run the database migration:

```powershell
npx prisma migrate dev --name init
```

Seed the default doctor account:

```powershell
npm run prisma:seed
```

Start the backend server:

```powershell
npm run dev
```

Backend should run at:

```txt
http://localhost:4000
```

Health check:

```txt
http://localhost:4000/api/health
```

## 4. Frontend Setup

Open a new terminal and move to the frontend folder:

```powershell
cd d:\github\doctorapp\frontend
```

Install dependencies:

```powershell
npm install
```

Start the frontend:

```powershell
npm run dev
```

Frontend should run at:

```txt
http://localhost:5173
```

## 5. Default Login

The seed script creates this doctor account:

- Email: `doctor@example.com`
- Password: `Doctor@123`

You can change this later in the seed file:

- [seed.js](/d:/github/doctorapp/backend/prisma/seed.js)

## 6. Recommended Start Order

Every time you run the app locally:

1. Start PostgreSQL
2. Start backend from `backend/` with `npm run dev`
3. Start frontend from `frontend/` with `npm run dev`
4. Open `http://localhost:5173`

## 7. Useful Backend Commands

From the `backend/` folder:

```powershell
npm run dev
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

If you change the Prisma schema:

```powershell
npx prisma migrate dev --name <change-name>
npm run prisma:generate
```

## 8. Main API Routes

Auth:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/change-password`

Patients:

- `GET /api/patients`
- `POST /api/patients`
- `GET /api/patients/:id`
- `PUT /api/patients/:id`
- `GET /api/patients/:id/history`

Consultations:

- `POST /api/consultations`
- `GET /api/consultations/:id`
- `PUT /api/consultations/:id`
- `PATCH /api/consultations/:id/complete`
- `GET /api/consultations/:id/prescription`

## 9. Common Problems

### Prisma Cannot Connect To Database

Check:

- PostgreSQL is running
- database `doctorapp` exists
- username/password in `DATABASE_URL` are correct
- port `5432` is correct for your machine

### Frontend Cannot Reach Backend

Check:

- backend is running on `http://localhost:4000`
- frontend is running on `http://localhost:5173`
- `CORS_ORIGIN` in `backend/.env` matches the frontend URL

### Seed Fails

Check:

- migration was run first
- Prisma client was generated
- database credentials are correct

## 10. Current State

This repo currently includes:

- backend structure and MVP API foundation
- Prisma schema and seed script
- frontend scaffold with core doctor-only pages

Some frontend pages are still scaffold-level and will need live API wiring to become fully functional end to end.
