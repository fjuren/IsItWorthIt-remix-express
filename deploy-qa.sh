#!/bin/bash

# Deploy to QA environment
echo "Deploying to QA environment..."

# Check if the QA app exists
if fly apps list | grep -q "isitworth-it-remix-qa"; then
  # App exists, use deploy
  echo "Updating existing QA app..."
  fly deploy --config fly.qa.toml --dockerfile Dockerfile.qa
else
  # App doesn't exist, use launch
  echo "Creating new QA app..."
  fly launch --name isitworth-it-remix-qa --config fly.qa.toml --dockerfile Dockerfile.qa

  # Set necessary secrets after app creation
  echo "Setting up environment variables..."
  # Generate a random string for SESSION_SECRET
  QA_SECRET="QA-$(date +%s)-$(echo $RANDOM | md5sum | head -c 16)"
  fly secrets set SESSION_SECRET="$QA_SECRET" --config fly.qa.toml
fi

echo "QA deployment complete!"
