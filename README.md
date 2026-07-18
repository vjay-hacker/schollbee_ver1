<div align="center">
  <h1>🐝 SchoolBee</h1>
  <p><strong>Production-Grade Multi-Tenant School Management SaaS Platform</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Expo-SDK%2057-000020?logo=expo&logoColor=white" />
    <img src="https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white" />
    <img src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white" />
    <img src="https://img.shields.io/badge/Kubernetes-manifests-326CE5?logo=kubernetes&logoColor=white" />
  </p>
</div>

---

## What is SchoolBee?

SchoolBee is a complete, production-ready SaaS platform for school management combining the best of ClassDojo, PowerSchool, Brightwheel, and ParentSquare into a single multi-tenant platform.

### Features

| Module | Description |
|--------|-------------|
| 🏫 **Multi-School Management** | Multi-tenant isolation via `school_id` + Supabase RLS |
| 👨‍👩‍👧 **Student & Parent Tracking** | Student profiles, parent-child linking, leave requests |
| 📋 **Attendance** | Real-time marking by teachers, parent visibility |
| 🚌 **GPS Bus Tracking** | Live route tracking, trip lifecycle, boarding status |
| 📚 **Academics** | Assignments, grading, bulk grade import, analytics |
| 💬 **Communication** | Parent-teacher chat, school circulars, multi-language |
| 🍎 **Food & Health Logs** | Meal tracking, health incidents, medication records |
| 🤖 **AI Assistant** | Natural language queries for attendance, food, bus, leaves |
| 🔔 **Notifications** | FCM push, SMS, WhatsApp, Email templates |
| 📊 **Analytics** | Performance trends, class rankings, materialized views |
| 🌍 **i18n** | Circulars in English, Tamil, Hindi, French, Arabic |
| 🎨 **White Label** | Per-school branding (logo, colors, app name) |

### User Roles

- **Super Admin** — manages all schools and subscriptions
- **School Admin** — manages their school, staff, students
- **Teacher** — marks attendance, assigns homework, grades
- **Parent** — tracks child, chats with teachers, views reports
- **Driver** — manages bus route, marks pickups/drop-offs

---

## Tech Stack

```
├── Monorepo:    Turborepo + pnpm workspaces
├── Mobile:      Expo SDK 57, React Native, NativeWind v5, RTK Query
├── Backend:     Express.js + TypeScript, Zod validation
├── Database:    Supabase (PostgreSQL + Auth + Storage + RLS)
├── Cache:       Redis 7
├── Monitoring:  Prometheus + Grafana + Loki
├── CI/CD:       GitHub Actions (4 workflows)
└── Deploy:      Docker Compose / Kubernetes
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker Desktop
- Supabase account (free tier works)
- Expo Go app on your phone (for mobile preview)

### 1. Clone & Install

```bash
git clone https://github.com/vjay-hacker/schollbee_ver1.git
cd schollbee_ver1
npm install -g pnpm
pnpm install
```

### 2. Set Up Environment

```bash
cp .env.example .env.development
# Edit .env.development with your Supabase URL and keys
```

Required variables (minimum to run):
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=any-32-character-random-string
```

### 3. Run the Database Migrations

In your Supabase dashboard → SQL Editor, run these in order:
1. `supabase/migrations/001_foundation.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_functions_triggers.sql`

### 4. Start the Backend API

```bash
cd apps/api
pnpm dev
# API runs at http://localhost:3001
# Health check: http://localhost:3001/api/v1/health
```

### 5. Start the Mobile App

```bash
cd apps/mobile
pnpm start
# Scan the QR code with Expo Go app on your phone
```

---

## Project Structure

```
schoolbee/
├── apps/
│   ├── api/                    # Express.js TypeScript backend
│   │   └── src/
│   │       ├── features/       # 11 feature modules
│   │       ├── middleware/     # Auth, RBAC, metrics, rate limit
│   │       └── utils/         # Logger, API response, errors
│   └── mobile/                 # Expo React Native app
│       └── app/
│           ├── (auth)/         # Login screen
│           ├── (parent)/       # Parent portal (10 screens)
│           ├── (teacher)/      # Teacher portal (6 screens)
│           └── (driver)/       # Driver portal (4 screens)
├── packages/
│   └── shared-types/           # Shared TypeScript types
├── supabase/
│   └── migrations/             # 3 SQL migration files
├── docker/                     # Docker configs + monitoring
├── k8s/                        # Kubernetes manifests
├── scripts/                    # Backup & restore scripts
├── docs/                       # API docs, DR runbook
└── .github/workflows/          # 4 CI/CD pipelines
```

---

## API Endpoints

| Base Path | Module |
|-----------|--------|
| `POST /api/v1/auth/login` | Authentication |
| `GET/POST /api/v1/students` | Student management |
| `GET/POST /api/v1/attendance` | Attendance |
| `GET/POST /api/v1/transport` | GPS & Bus tracking |
| `GET/POST /api/v1/academics/assignments` | Assignments |
| `GET/POST /api/v1/academics/grades` | Grading |
| `GET /api/v1/academics/students/:id/progress` | Analytics |
| `GET/POST /api/v1/communication/circulars` | Broadcasts |
| `GET/POST /api/v1/communication/chat` | Parent-teacher chat |
| `POST /api/v1/ai/chat` | AI Assistant |
| `GET /api/v1/health` | Health check |
| `GET /metrics` | Prometheus metrics |

---

## Deployment

### Docker (simplest)

```bash
cp .env.example .env.production
# Fill in production values
docker compose -f docker/docker-compose.prod.yml up -d
```

### Kubernetes

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/
```

### Vercel (API as serverless — not recommended for this stack)

> The API is a stateful Express.js server. For Vercel, deploy it as a **Docker container on Vercel's infrastructure** or use Railway/Render instead.

---

## CI/CD

| Workflow | Trigger |
|----------|---------|
| `ci.yml` | Every push/PR |
| `deploy-staging.yml` | Push to `main` |
| `deploy-production.yml` | Manual with approval |
| `db-migrate.yml` | Manual |

---

## License

MIT © 2026 SchoolBee
