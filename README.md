# Ganesh Chanda

Donation management for a Ganesh Utsav mandal: only authorized staff can sign in, register donors, record chanda, and review collections.

The stack is a **React** (Vite + TypeScript) frontend, an **ASP.NET Core 8** Web API, and **SQL Server**.

## Access control

The donor register is not public. Staff must sign in with a committee username and password. Login also requires a **face photo** of the person at the desk (webcam capture, or a photo file if the camera is unavailable). That photo is stored with the sign-in time so the mandal can see who opened the ledger.

Seeded accounts (change these before real use):

| Username | Password | Role |
| --- | --- | --- |
| `admin` | `Chanda@2026` | Committee Secretary |
| `clerk` | `Clerk@2026` | Collection Desk |

## What staff can do after login

- Register, search, edit, and remove donors
- Record donations (UPI, cash, bank transfer, cheque, card) against a purpose
- Auto-assign receipt numbers such as `GC-2026-0015`
- View totals, monthly trend, purpose split, recent gifts, and top donors
- Review the sign-in log with captured faces

The API creates the `GaneshChanda` database on first run and seeds sample donors and gifts.

## Prerequisites

- .NET 8 SDK
- Node.js 20+
- SQL Server (local, Docker, or Azure SQL)

## SQL Server

### Docker

```bash
docker compose up -d
```

This starts SQL Server 2022 on port `1433` with:

- User: `sa`
- Password: `GaneshChanda@2026!`
- Database created automatically by the API: `GaneshChanda`

### Connection string

Override with the environment variable `ConnectionStrings__DefaultConnection` if needed. The default in `backend/GaneshChanda.Api/appsettings.json` is:

```
Server=localhost,1433;Database=GaneshChanda;User Id=sa;Password=GaneshChanda@2026!;TrustServerCertificate=True;MultipleActiveResultSets=true
```

Change the password before using this outside a local machine.

## Run locally

Terminal 1 — API (http://127.0.0.1:52841):

```bash
cd backend/GaneshChanda.Api
dotnet run
```

Swagger: http://127.0.0.1:52841/swagger

Terminal 2 — frontend (http://127.0.0.1:43123):

```bash
cd frontend
npm install
npm run dev
```

Vite proxies `/api` to the backend, so the browser only needs the frontend URL.

## API routes

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/login` | Staff login with password + face photo |
| GET | `/api/auth/me` | Current staff (JWT) |
| GET | `/api/auth/logins` | Sign-in log with face photos |
| GET | `/api/health` | Liveness |
| GET | `/api/dashboard` | Collection summary (auth) |
| GET/POST | `/api/donors` | List / register (auth) |
| GET/PUT/DELETE | `/api/donors/{id}` | Donor by id (auth) |
| GET/POST | `/api/donations` | List / record gift (auth) |
| DELETE | `/api/donations/{id}` | Remove gift (auth) |

## Project layout

```
backend/GaneshChanda.Api   ASP.NET Core Web API + EF Core SQL Server
frontend                 React UI (dashboard, donors, donations)
docker-compose.yml       SQL Server 2022
```
