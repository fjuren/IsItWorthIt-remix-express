#!/bin/bash

# Deploy to Production environment
echo "Deploying to Production environment..."

# Build the app
npm run build

# Use the Production-specific Dockerfile and configuration
fly deploy --config fly.production.toml --dockerfile Dockerfile.production

echo "Production deployment complete!"
