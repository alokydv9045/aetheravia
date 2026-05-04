# 🚀 Next.js App Deployment Guide via Nginx & PM2

This step-by-step guide walks you through the production deployment of the **Aetheravia Store** (Next.js application) on a Linux server (Ubuntu/Debian) with Nginx as a Reverse Proxy and PM2 for process management.

---

## 🏗️ Deployment Architecture

```mermaid
graph TD
    Client["🌐 Client (Browser)"] -- HTTPS (Port 443) --> Nginx["🔒 Nginx (Reverse Proxy)"]
    Nginx -- HTTP (Port 3000) --> Next["⚙️ Next.js Node Server (PM2)"]
    Next -- DB Queries --> Mongo["🍃 MongoDB Atlas / Database"]
```

---

## 📋 Step 1: Server Initialization

Connect to your server via SSH and install required system packages.

```bash
# Update package list and install basic dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential nginx
```

---

## 📦 Step 2: Install Node.js (via NVM)

It is highly recommended to install Node.js using Node Version Manager (NVM).

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load NVM into your current shell
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js 20 LTS (Recommended for Next.js)
nvm install 20
nvm use 20
nvm alias default 20

# Verify installation
node -v
npm -v
```

---

## 🗂️ Step 3: Clone Codebase and Install Dependencies

```bash
# Navigate to your deployment directory
cd /var/www

# Clone your repository (replace with your repo URL)
git clone https://github.com/yourusername/aetheravia.git
cd aetheravia

# Install all dependencies with legacy-peer-deps if needed
npm install --legacy-peer-deps
```

---

## 🔑 Step 4: Add Environment Variables

Create and edit the production `.env` file.

```bash
nano .env
```

Add your production keys:

```env
# Runtime
NODE_ENV=production
APP_ENV=production

# NextAuth config
NEXTAUTH_SECRET=your_32_character_random_string
NEXTAUTH_URL=https://yourdomain.com
AUTH_TRUST_HOST=true

# MongoDB URI
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/your_db"

# Public Branding & Support
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_BRAND_NAME=Aetheravia
NEXT_PUBLIC_BRAND_TAGLINE="Embrace the earth, unveil your personality"

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx

# Fast2SMS
FAST2SMS_API_KEY="J9nAtYOGmjxrXFeCyZT0VS8WBQ3LIUHldsMfaqhukKRoE7bvz5DAx9kGPLzcRX0MjfdY1v8Q2Cm7TbWi"
```

---

## 🛠️ Step 5: Build and Run Seeding

Compile the application for production and seed your initial records.

```bash
# Seed the database
npm run sync-seed

# Build Next.js for production
npm run build
```

---

## 🔄 Step 6: Process Management with PM2

Install PM2 globally to ensure the application automatically restarts on crashes or reboots.

```bash
# Install PM2 globally
npm install -g pm2

# Start Next.js server in the background via PM2
pm2 start npm --name "aetheravia-app" -- start

# Configure PM2 to restart automatically on system reboot
pm2 startup
# (Run the exact command provided in the output of the command above)

# Save current PM2 processes list
pm2 save
```

To view app status or logs:
```bash
pm2 status
pm2 logs aetheravia-app
```

---

## 🌐 Step 7: Nginx Configuration

We use Nginx to listen on Port 80 / 443 and forward requests to the PM2 server running on Port 3000.

1. Remove default configuration:
   ```bash
   sudo rm /etc/nginx/sites-enabled/default
   ```

2. Create a new server block:
   ```bash
   sudo nano /etc/nginx/sites-available/aetheravia
   ```

3. Paste the following configuration:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       # Buffer settings for file uploads
       client_max_body_size 20M;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       # Error pages
       error_page 502 /502.html;
       location = /502.html {
           root /var/www/html;
           internal;
       }
   }
   ```

4. Enable the server block and test config:
   ```bash
   sudo ln -s /etc/nginx/sites-available/aetheravia /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## 🔐 Step 8: SSL Installation via Certbot

To ensure your production site runs on HTTPS securely, use Let's Encrypt Certbot.

```bash
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot

sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Request an SSL certificate for your domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Verify renewal works
sudo certbot renew --dry-run
```

---

## ⚙️ CI/CD Deployment Script (`deploy.sh`)

You can save this script as `deploy.sh` in the root of your project directory on the server to automate future updates:

```bash
#!/bin/bash
echo "🔄 Starting automatic deployment..."

# Pull new changes
git pull origin main

# Install new dependencies
npm install --legacy-peer-deps

# Build the Next.js production build
npm run build

# Restart the application under PM2
pm2 restart aetheravia-app

echo "✅ Deployment complete and server restarted!"
```

To use it:
```bash
chmod +x deploy.sh
./deploy.sh
```
