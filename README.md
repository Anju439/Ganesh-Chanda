# Ganesh Chanda

Donation management for a Ganesh Utsav mandal: register donors, record chanda with receipt numbers, and watch collections on a dashboard.

The stack is a **React** (Vite + TypeScript) frontend, an **ASP.NET Core 8** Web API, and **SQL Server**.

## What you can do

- Register, search, edit, and remove donors
- Record donations (UPI, cash, bank transfer, cheque, card) against a purpose
- Auto-assign receipt numbers such as `GC-2026-0015`
- View totals, monthly trend, purpose split, recent gifts, and top donors

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
| GET | `/api/health` | Liveness |
| GET | `/api/dashboard` | Collection summary |
| GET/POST | `/api/donors` | List / register |
| GET/PUT/DELETE | `/api/donors/{id}` | Donor by id |
| GET/POST | `/api/donations` | List / record gift |
| DELETE | `/api/donations/{id}` | Remove gift |

## Project layout

```
backend/GaneshChanda.Api   ASP.NET Core Web API + EF Core SQL Server
frontend                 React UI (dashboard, donors, donations)
docker-compose.yml       SQL Server 2022
```
