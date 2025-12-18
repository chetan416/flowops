# FlowOps Production Deployment Guide

This guide outlines the steps to deploy FlowOps in a production environment.

## 1. Environment Configuration

Ensure all production secrets are securely managed (e.g., AWS Secrets Manager, Vault).

- **`SECRET_KEY`**: Generate a strong random string (e.g., `openssl rand -hex 32`).
- **`POSTGRES_PASSWORD`**: Use a strong password.
- **`OPENAI_API_KEY`**: Required for AI features.
- **`STRIPE_SECRET_KEY`**: Required for billing.

## 2. Docker Swarm / Kubernetes

For high availability, we recommend Kubernetes.

### Kubernetes Manifests
Located in `k8s/`:
- `backend-deployment.yaml`: Replicas set to 3.
- `worker-deployment.yaml`: Replicas set to 2 (scale based on queue depth).

### Deployment Command
```bash
kubectl apply -f k8s/
```

## 3. Database Migrations

Always run migrations before starting the new application version.

```bash
# Run migration container just once
docker run --env-file .env flowops-backend alembic upgrade head
```

## 4. Monitoring & Alerts

- **Prometheus**: Scrape `/metrics` on port 8000.
- **Grafana**: Import Dashboard #12345 (FlowOps Standard).
- **Sentry**: Configure `SENTRY_DSN` in `.env` for error tracking.

## 5. Rollback Strategy

If a deployment fails:
1. Revert to the previous Docker image tag.
2. If database schema changed, run `alembic downgrade -1`.
