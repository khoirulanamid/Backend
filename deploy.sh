#!/bin/bash

# Atlas Kos Backend - VPS Deployment Script
# Run this script on your VPS

echo "🚀 Starting Atlas Kos Backend Deployment..."

# Update system
sudo apt update

# Install Node.js 20 LTS
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v

# Create app directory
echo "📁 Creating app directory..."
sudo mkdir -p /var/www/atlas-kos-backend
sudo chown $USER:$USER /var/www/atlas-kos-backend

# Navigate to directory
cd /var/www/atlas-kos-backend

echo "✅ Environment ready!"
echo ""
echo "Next steps:"
echo "1. Upload your backend files to /var/www/atlas-kos-backend"
echo "2. Run: npm install"
echo "3. Run: cp .env.example .env"
echo "4. Run: npx prisma generate"
echo "5. Run: npx prisma db push"
echo "6. Run: npm run build"
echo "7. Install PM2: npm install -g pm2"
echo "8. Start with PM2: pm2 start dist/app.js --name atlas-kos-backend"
