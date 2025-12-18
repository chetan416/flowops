# FlowOps

FlowOps is a SaaS platform built with FastAPI, Next.js, and PostgreSQL.

## Features
- **Backend:** FastAPI, SQLAlchemy, Alembic, Pydantic
- **Frontend:** Next.js, TailwindCSS
- **Database:** PostgreSQL
- **Auth:** JWT Authentication
- **Payments:** Stripe Integration
- **Deployment:** Docker, CI/CD

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js & npm (for local frontend dev)
- Python 3.11+ (for local backend dev)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd flowops
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and fill in the values.
   ```bash
   cp .env.example .env
   ```

3. **Run with Docker (Recommended)**
   This command spins up the entire stack: Backend (FastAPI), Frontend (Next.js), Worker (Celery), Redis, and Postgres.
   ```bash
   docker-compose up --build
   ```
   *The first build may take a few minutes.*

   **Useful Commands:**
   - **Stop containers:** `Ctrl+C` or `docker-compose down`
   - **View logs:** `docker-compose logs -f`
   - **Rebuild specific service:** `docker-compose up -d --build --no-deps backend`
   - **Access DB shell:** `docker-compose exec db psql -U postgres -d flowops`

4. **Access the App**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/docs

5. **Testing**
   - **Backend Tests:**
     ```bash
     docker-compose exec backend pytest
     ```
   - **Frontend Tests:**
     ```bash
     cd frontend && npm test
     ```
