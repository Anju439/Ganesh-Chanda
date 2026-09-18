# Ganesh Chanda

Donation management for a Ganesh Utsav mandal: only authorized staff can sign in, register donors, record chanda, and review collections.

The stack is a **React** (Vite + TypeScript) frontend, an **ASP.NET Core 8** Web API, and **SQL Server**.

## Access control

The donor register is not public. Only **six** committee logins exist: Main Admin plus Admin 1–5.

1. Enter username and password.
2. Capture a face photo.
3. If **Admin 1–5** sign in or register a donor/donation, those details (including the face photo on login) are sent to the **Main Admin inbox** (`admin`). They are not sent to the other admin accounts. Main Admin’s own login is stored in the sign-in log only.

| Username | Password | Role |
| --- | --- | --- |
| `admin` | `Chanda@2026` | Main Admin — receives all alerts |
| `admin1` | `Admin1@2026` | Admin 1 |
| `admin2` | `Admin2@2026` | Admin 2 |
| `admin3` | `Admin3@2026` | Admin 3 |
| `admin4` | `Admin4@2026` | Admin 4 |
| `admin5` | `Admin5@2026` | Admin 5 |

## What staff can do after login

- Register, search, edit, and remove donors
- Record donations (UPI, cash, bank transfer, cheque, card) against a purpose
- Auto-assign receipt numbers such as `GC-2026-0015`
- View totals, monthly trend, purpose split, recent gifts, and top donors
- Review the sign-in log with captured faces
- Main Admin reviews the inbox of Admin 1–5 logins and registrations

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
| POST | `/api/auth/login` | Username and password (then face step) |
| POST | `/api/auth/login/face` | Capture face; notifies Main Admin if not `admin` |
| GET | `/api/auth/me` | Current staff (JWT) |
| GET | `/api/auth/logins` | Sign-in log with face photos |
| GET | `/api/auth/alerts` | Main Admin inbox |
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


## Public read-only + staff access update
- Dashboard, donor ledger and donation ledger are accessible without login.
- Public donor view hides private contact fields (email, phone, address and pincode); name, city/state and donation totals remain visible.
- Add donor/donation, edit and delete operations require an authenticated staff JWT on the API as well as the UI.
- Main-admin-only sign-in logs and inbox remain protected.
- Staff accounts other than the main admin continue through the camera face-capture login flow.
