# Cast Tracker v2 — Docker Deployment Guide

This guide explains how to run Cast Tracker v2 in a Docker container on any machine.

## Prerequisites

- **Docker** (version 20.10+) — [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** (version 1.29+) — Usually included with Docker Desktop

## Quick Start (Local Development)

### 1. Clone or Copy the Project

```bash
cd /path/to/casttracker-v2
```

### 2. Create Environment File

Copy the environment template and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your actual values:
- `VITE_APP_ID` — Your Manus OAuth app ID
- `OWNER_OPEN_ID` — Your Manus owner ID
- `BUILT_IN_FORGE_API_KEY` — Your Manus API key
- All other Manus OAuth and API URLs

### 3. Start the Application

```bash
docker-compose up -d
```

This will:
- Build the Cast Tracker Docker image
- Start the application on port 3000
- Start a MySQL database on port 3306
- Create persistent database volumes

### 4. Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

### 5. Stop the Application

```bash
docker-compose down
```

To also remove the database volume:

```bash
docker-compose down -v
```

---

## Production Deployment

### Option 1: Deploy to AWS (ECS)

1. **Build and push image to ECR:**

```bash
# Create ECR repository
aws ecr create-repository --repository-name casttracker

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and tag image
docker build -t casttracker:latest .
docker tag casttracker:latest <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/casttracker:latest

# Push to ECR
docker push <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/casttracker:latest
```

2. **Create ECS task definition** using the image URL
3. **Create ECS service** and load balancer
4. **Configure RDS MySQL** database (instead of local Docker database)
5. **Set environment variables** in ECS task definition

### Option 2: Deploy to Railway

1. **Connect GitHub repository** to Railway
2. **Add environment variables** in Railway dashboard
3. **Set build command:** `pnpm build`
4. **Set start command:** `node dist/index.js`
5. **Add MySQL plugin** from Railway marketplace
6. **Deploy** — Railway will automatically build and run the Docker image

### Option 3: Deploy to DigitalOcean App Platform

1. **Create new app** on DigitalOcean
2. **Connect GitHub repository**
3. **Select Dockerfile** as build source
4. **Add environment variables**
5. **Add managed database** (MySQL)
6. **Deploy** — DigitalOcean will build and run the container

---

## Environment Variables

All environment variables from `.env.example` are required for production. Key variables:

| Variable | Purpose | Example |
|---|---|---|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@host:3306/casttracker` |
| `VITE_APP_ID` | Manus OAuth app ID | `your-app-id` |
| `OWNER_OPEN_ID` | Your Manus owner ID | `your-owner-id` |
| `JWT_SECRET` | Session signing key | Generate with: `openssl rand -base64 32` |
| `BUILT_IN_FORGE_API_KEY` | Manus API key | `your-api-key` |

---

## Database Migrations

When deploying to a new environment, run migrations:

```bash
# Inside the running container
docker-compose exec app pnpm db:push
```

Or include in your deployment script:

```bash
docker-compose up -d
docker-compose exec -T app pnpm db:push
```

---

## Monitoring & Logs

### View Application Logs

```bash
docker-compose logs -f app
```

### View Database Logs

```bash
docker-compose logs -f db
```

### Check Container Health

```bash
docker-compose ps
```

---

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, change it in `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"  # Use 8080 instead
```

### Database Connection Error

Ensure `DATABASE_URL` is correct and the database is running:

```bash
docker-compose exec db mysql -u root -p -e "SHOW DATABASES;"
```

### Build Fails

Clear Docker cache and rebuild:

```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

### Application Won't Start

Check logs for errors:

```bash
docker-compose logs app
```

---

## Security Best Practices

1. **Change JWT_SECRET** — Generate a new one for production:
   ```bash
   openssl rand -base64 32
   ```

2. **Use strong database passwords** — Change `DB_PASSWORD` in `.env.local`

3. **Enable HTTPS** — Use a reverse proxy (Nginx) or load balancer with SSL

4. **Restrict database access** — Only allow app container to access database

5. **Use secrets management** — For production, use AWS Secrets Manager, DigitalOcean App Spec, or similar

6. **Keep Docker images updated** — Regularly rebuild with latest Node.js base image

---

## Scaling

For high-traffic deployments:

1. **Use managed database** (AWS RDS, DigitalOcean Managed Database)
2. **Deploy multiple app containers** behind a load balancer
3. **Use container orchestration** (Kubernetes, ECS, Docker Swarm)
4. **Add caching layer** (Redis)
5. **Enable CDN** for static assets

---

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review environment variables: `docker-compose config`
- Test database connection: `docker-compose exec db mysql -u root -p`
