# Deployment Guide - Renault D&I Game

Complete guide for deploying the Renault D&I Game web application to various platforms.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Heroku Deployment](#heroku-deployment)
4. [AWS Deployment](#aws-deployment)
5. [DigitalOcean Deployment](#digitalocean-deployment)
6. [Docker Deployment](#docker-deployment)
7. [Vercel + Railway](#vercel--railway)
8. [Post-Deployment](#post-deployment)

---

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All code is committed and pushed to repository
- [ ] Dependencies are up to date
- [ ] Environment variables are documented
- [ ] Build process works locally (`npm run build`)
- [ ] Database/storage solution chosen (if adding persistence)
- [ ] SSL certificate ready (or using platform's SSL)
- [ ] Domain name configured (if using custom domain)
- [ ] Testing completed on staging environment

---

## Environment Configuration

### Required Environment Variables

**Server (.env):**
```env
NODE_ENV=production
PORT=3001
CLIENT_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

**Client (.env.production):**
```env
REACT_APP_SOCKET_URL=https://api.your-domain.com
```

### Building the Client

```bash
cd client
npm run build
```

This creates an optimized production build in `client/build/`.

---

## Heroku Deployment

### Prerequisites
- Heroku account
- Heroku CLI installed

### Step 1: Prepare for Heroku

Create `Procfile` in root:
```
web: cd server && npm start
```

Create `.slugignore`:
```
client/src
client/public
*.md
docs/
```

### Step 2: Server Configuration

Update `server/package.json`:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "build": "cd ../client && npm install && npm run build"
  }
}
```

### Step 3: Serve Client from Server

Update `server/src/server.js`:
```javascript
const path = require('path');

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../../client/build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
});
```

### Step 4: Deploy

```bash
# Login to Heroku
heroku login

# Create app
heroku create renault-di-game

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set CLIENT_URL=https://renault-di-game.herokuapp.com

# Deploy
git push heroku main

# Open app
heroku open
```

### Scaling on Heroku

```bash
# Scale to multiple dynos
heroku ps:scale web=2

# View logs
heroku logs --tail
```

---

## AWS Deployment

### Using AWS Elastic Beanstalk

### Prerequisites
- AWS account
- EB CLI installed

### Step 1: Initialize EB

```bash
cd webapp
eb init

# Choose:
# - Region
# - Application name: renault-di-game
# - Platform: Node.js
# - CodeCommit: No
```

### Step 2: Create Environment

```bash
eb create renault-di-game-prod

# Set environment variables
eb setenv NODE_ENV=production
eb setenv CLIENT_URL=https://your-domain.com
```

### Step 3: Configure nginx

Create `.ebextensions/nginx.config`:
```yaml
files:
  "/etc/nginx/conf.d/websocket.conf":
    mode: "000644"
    owner: root
    group: root
    content: |
      upstream nodejs {
        server 127.0.0.1:8081;
        keepalive 256;
      }

      server {
        listen 8080;

        location / {
          proxy_pass http://nodejs;
          proxy_set_header Connection "upgrade";
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Host $host;
          proxy_cache_bypass $http_upgrade;
        }
      }
```

### Step 4: Deploy

```bash
eb deploy

# Open app
eb open

# View logs
eb logs
```

### Using AWS EC2 (Manual)

```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs

# Clone repository
git clone your-repo-url
cd renault-diversity-game/webapp

# Install dependencies
npm install

# Build client
cd client && npm run build && cd ..

# Install PM2
sudo npm install -g pm2

# Start server with PM2
cd server
pm2 start src/server.js --name renault-di-game

# Save PM2 configuration
pm2 save
pm2 startup
```

---

## DigitalOcean Deployment

### Using App Platform

1. **Connect Repository**
   - Go to DigitalOcean App Platform
   - Create new app
   - Connect GitHub repository

2. **Configure Build**
   - Component: Web Service
   - Branch: main
   - Build Command: `cd client && npm install && npm run build && cd ../server && npm install`
   - Run Command: `node src/server.js`

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   CLIENT_URL=${APP_URL}
   ```

4. **Deploy**
   - Click "Create Resources"
   - App builds and deploys automatically

### Using Droplet (Manual)

```bash
# Create Ubuntu 20.04 droplet

# SSH into droplet
ssh root@your-droplet-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
sudo apt-get install nginx

# Clone repository
git clone your-repo-url
cd renault-diversity-game/webapp

# Install and build
npm install
cd client && npm run build && cd ..

# Configure Nginx
sudo nano /etc/nginx/sites-available/renault-di-game

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/webapp/client/build;
        try_files $uri /index.html;
    }

    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location /api {
        proxy_pass http://localhost:3001;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/renault-di-game /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Start server with PM2
cd server
npm install -g pm2
pm2 start src/server.js --name renault-di-game
pm2 startup
pm2 save
```

---

## Docker Deployment

### Dockerfile

Create `Dockerfile` in webapp/:

```dockerfile
# Multi-stage build

# Stage 1: Build client
FROM node:16-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Server
FROM node:16-alpine
WORKDIR /app

# Copy server files
COPY server/package*.json ./
RUN npm install --production

COPY server/ ./

# Copy built client
COPY --from=client-build /app/client/build ./client-build

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "src/server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  renault-di-game:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - CLIENT_URL=http://localhost:3001
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
```

### Deploy with Docker

```bash
# Build image
docker build -t renault-di-game .

# Run container
docker run -d \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e CLIENT_URL=https://your-domain.com \
  --name renault-di-game \
  renault-di-game

# Or with docker-compose
docker-compose up -d

# View logs
docker logs -f renault-di-game

# Stop container
docker stop renault-di-game
```

---

## Vercel + Railway

### Vercel (Frontend)

1. **Connect Repository**
   - Go to Vercel dashboard
   - Import project from GitHub
   - Framework Preset: Create React App
   - Root Directory: `webapp/client`

2. **Configure Build**
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

3. **Environment Variables**
   ```
   REACT_APP_SOCKET_URL=https://your-railway-api.up.railway.app
   ```

4. **Deploy**
   - Automatic deployment on push

### Railway (Backend)

1. **Create New Project**
   - Go to Railway dashboard
   - New Project from GitHub

2. **Configure**
   - Root Directory: `webapp/server`
   - Start Command: `node src/server.js`
   - Port: 3001

3. **Environment Variables**
   ```
   NODE_ENV=production
   PORT=3001
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```

4. **Deploy**
   - Automatic deployment

---

## Post-Deployment

### SSL/HTTPS Setup

Most platforms provide automatic SSL. For manual setup:

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Monitoring

**Server Monitoring:**
```bash
# With PM2
pm2 monitor

# View metrics
pm2 status
pm2 monit
```

**Log Management:**
```bash
# PM2 logs
pm2 logs

# System logs
tail -f /var/log/nginx/error.log
```

### Performance Optimization

1. **Enable gzip compression**
2. **Use CDN for static assets**
3. **Implement Redis for session storage**
4. **Add database for persistence**
5. **Enable HTTP/2**
6. **Optimize images and assets**

### Backup Strategy

1. **Code**: Ensure Git repository is backed up
2. **Logs**: Implement log rotation
3. **Database**: Regular backups if using database
4. **Configuration**: Document all environment variables

### Scaling

**Horizontal Scaling:**
- Add more server instances
- Use load balancer
- Implement Redis for shared state
- Consider sticky sessions for WebSocket

**Vertical Scaling:**
- Increase server resources (CPU, RAM)
- Optimize Node.js memory
- Use clustering

### Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] CORS configured correctly
- [ ] Rate limiting implemented
- [ ] Input validation on server
- [ ] WebSocket authentication
- [ ] Regular security updates
- [ ] Firewall configured
- [ ] Monitoring and alerts set up

---

## Troubleshooting Deployment

**WebSocket connection fails:**
- Check CORS settings
- Verify WebSocket proxy configuration
- Ensure sticky sessions if load balanced

**Build fails:**
- Check Node.js version compatibility
- Verify all dependencies installed
- Check for environment-specific code

**High latency:**
- Use CDN
- Optimize assets
- Check server location vs. users
- Implement caching

**Memory issues:**
- Increase server memory
- Optimize game state management
- Implement cleanup for old rooms

---

## Support

For deployment assistance:
- [Platform documentation]
- [Internal DevOps team]
- [Cloud provider support]

---

**Deployment checklist complete! Your Renault D&I Game is ready for production! 🚀**
