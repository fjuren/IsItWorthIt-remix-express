# Deploy to QA environment
Write-Host "Deploying to QA environment..." -ForegroundColor Green

# Check if the QA app exists
$appExists = fly apps list | Select-String -Pattern "isitworth-it-remix-qa"

if ($appExists) {
    # App exists, use deploy
    Write-Host "Updating existing QA app..." -ForegroundColor Yellow
    fly deploy --config fly.qa.toml --dockerfile Dockerfile.qa
}
else {
    # App doesn't exist, use launch
    Write-Host "Creating new QA app..." -ForegroundColor Yellow
    fly launch --name isitworth-it-remix-qa --config fly.qa.toml --dockerfile Dockerfile.qa
    
    # Set necessary secrets after app creation
    Write-Host "Setting up environment variables..." -ForegroundColor Yellow
    # Generate a random string for SESSION_SECRET
    $QA_SECRET = "QA-" + [Guid]::NewGuid().ToString()
    fly secrets set SESSION_SECRET=$QA_SECRET --config fly.qa.toml
}

Write-Host "QA deployment complete!" -ForegroundColor Green
