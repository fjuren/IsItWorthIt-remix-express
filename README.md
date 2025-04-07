# IsItWorthIt - Remix Web App

## Overview
This is a Remix web application that helps users determine if a game purchase is worth it based on various metrics and user reviews.

## Development

### Prerequisites
- Node.js 18 or later
- npm

### Setup
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables by creating a `.env` file with the following variables:
   ```
   SESSION_SECRET=your-secret-key
   DATABASE_URL=file:./data.sqlite
   ```

### Database Setup
Initialize the database and run migrations:
```
npx prisma migrate dev
```

Seed the database with initial data:
```
npx prisma db seed
```

### Running Locally
```
npm run dev
```

The application will be available at http://localhost:3000

## Deployment to Fly.io

### Prerequisites
- Install the Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
- Sign up for a Fly.io account

### QA Deployment

For deploying a QA environment with seeded test data:

1. Log in to Fly.io:
   ```
   fly auth login
   ```

2. For first-time QA deployment:
   ```
   fly launch --name isitworth-it-remix-qa --config fly.qa.toml --dockerfile Dockerfile.qa
   ```

3. For subsequent QA deployments:
   ```
   fly deploy --config fly.qa.toml --dockerfile Dockerfile.qa
   ```
   Or use the provided script:
   ```
   ./deploy-qa.sh
   ```

The QA environment includes:
- All dependencies (including development dependencies)
- Automatically runs database migrations
- Seeds the database with test data
- Uses the same environment variables as production but with `IS_QA=true`

### Production Deployment

For deploying to production (when ready):

1. Log in to Fly.io:
   ```
   fly auth login
   ```

2. For first-time production deployment:
   ```
   fly launch --name isitworth-it-remix --config fly.production.toml --dockerfile Dockerfile.production
   ```

3. For subsequent production deployments:
   ```
   fly deploy --config fly.production.toml --dockerfile Dockerfile.production
   ```
   Or use the provided script:
   ```
   ./deploy.sh
   ```

## Deployment File Structure

This project uses separate files for QA and Production deployments:

### QA Environment
- `Dockerfile.qa` - Docker configuration for QA with all dependencies
- `fly.qa.toml` - Fly.io configuration for QA
- `deploy-qa.sh` - Script to deploy to QA

### Production Environment
- `Dockerfile.production` - Docker configuration for Production
- `fly.production.toml` - Fly.io configuration for Production
- `deploy.sh` - Script to deploy to Production

## Working with the QA Database

To download the SQLite database from the Fly.io deployment for inspection:

```bash
# Download the database to the QA folder
fly ssh sftp get /app/data/sqlite.db ./prisma/QA/downloaded-db.sqlite --config fly.qa.toml
```

This allows you to inspect the database locally using SQLite tools like DB Browser for SQLite.

## Project Notes

### Vite Migration
This project was migrated from the classic Remix compiler to Vite. Migration steps included:

- Installing Vite
- Updating configuration from remix.config.js to vite.config.ts
- Removing <LiveReload /> component
- Updating tsconfig.json
- Updating server.mjs for Vite compatibility
- Configuring path aliases with vite-tsconfig-paths
- Updating CSS imports with ?url suffix for Vite compatibility
