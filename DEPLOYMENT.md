# Deployment Guide

Step-by-step guide to deploy the Weather Comfort Index application to production.

## Quick Deploy Options

### Option 1: Vercel (Frontend) + Railway (Backend)
**Best for**: Quick setup, free tier available

### Option 2: Heroku (Full Stack)
**Best for**: Simple all-in-one deployment

### Option 3: AWS (EC2 + S3)
**Best for**: Production-grade, scalable deployment

### Option 4: Docker + DigitalOcean
**Best for**: Container-based deployment

---

## Option 1: Vercel + Railway

### Deploy Backend to Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   ```bash
   # In your terminal
   railway login
   railway init
   railway up
   ```

3. **Add Environment Variables**
   - Go to Railway dashboard
   - Select your project
   - Click **Variables**
   - Add:
     ```
     PORT=3001
     OPENWEATHER_API_KEY=your_key
     AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
     AUTH0_AUDIENCE=https://weather-comfort-api
     NODE_ENV=production
     ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Get Domain**
   - Railway will provide a domain like: `your-app.up.railway.app`
   - Note this URL for frontend configuration

### Deploy Frontend to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Configure Frontend**
   - Update API endpoint in frontend code:
   ```javascript
   const API_URL = process.env.REACT_APP_API_URL || 'https://your-backend.railway.app';
   ```

3. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

4. **Set Environment Variables in Vercel**
   - Go to Vercel dashboard
   - Select project → Settings → Environment Variables
   - Add:
     ```
     REACT_APP_API_URL=https://your-backend.railway.app
     REACT_APP_AUTH0_DOMAIN=your-tenant.auth0.com
     REACT_APP_AUTH0_CLIENT_ID=your_client_id
     ```

5. **Update Auth0 URLs**
   - Add Vercel domain to Auth0 allowed URLs

---

## Option 2: Heroku

### Prerequisites
- Heroku account
- Heroku CLI installed

### Deploy

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create App**
   ```bash
   heroku create fidenz-weather-comfort
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set OPENWEATHER_API_KEY=your_key
   heroku config:set AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
   heroku config:set AUTH0_AUDIENCE=https://weather-comfort-api
   heroku config:set NODE_ENV=production
   ```

4. **Create Procfile**
   ```
   web: node server.js
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Scale Dyno**
   ```bash
   heroku ps:scale web=1
   ```

7. **View Logs**
   ```bash
   heroku logs --tail
   ```

---

## Option 3: AWS EC2

### Prerequisites
- AWS account
- EC2 instance (t2.micro eligible for free tier)

### Setup

1. **Launch EC2 Instance**
   - OS: Ubuntu 22.04 LTS
   - Instance type: t2.micro
   - Security group: Allow HTTP (80), HTTPS (443), SSH (22)

2. **Connect via SSH**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo apt-get install -y nginx
   ```

4. **Clone Repository**
   ```bash
   git clone your-repo-url
   cd weather-comfort-index
   npm install
   ```

5. **Setup Environment**
   ```bash
   nano .env
   # Add your variables
   ```

6. **Install PM2**
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name weather-api
   pm2 startup
   pm2 save
   ```

7. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/weather
   ```

   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location / {
           root /var/www/weather-frontend/build;
           try_files $uri /index.html;
       }
   }
   ```

8. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/weather /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Setup SSL (Let's Encrypt)**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Option 4: Docker + DigitalOcean

### Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}
      - AUTH0_ISSUER_BASE_URL=${AUTH0_ISSUER_BASE_URL}
      - AUTH0_AUDIENCE=${AUTH0_AUDIENCE}
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

### Deploy to DigitalOcean

1. **Create Droplet**
   - Choose Docker marketplace image
   - Size: Basic ($6/month)

2. **SSH into Droplet**
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Clone and Deploy**
   ```bash
   git clone your-repo-url
   cd weather-comfort-index
   
   # Create .env file
   nano .env
   
   # Build and run
   docker-compose up -d
   ```

4. **View Logs**
   ```bash
   docker-compose logs -f
   ```

---

## Post-Deployment Checklist

### Security

- [ ] Enable HTTPS/SSL
- [ ] Setup firewall (UFW or Security Groups)
- [ ] Disable root login
- [ ] Setup SSH keys only (disable password auth)
- [ ] Configure rate limiting
- [ ] Enable CORS only for your domain
- [ ] Set secure headers (helmet.js)

### Monitoring

- [ ] Setup logging (Winston, LogRocket)
- [ ] Configure error tracking (Sentry)
- [ ] Setup uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure alerts (email, Slack)
- [ ] Setup analytics (Google Analytics, Mixpanel)

### Performance

- [ ] Enable gzip compression
- [ ] Setup CDN (CloudFlare)
- [ ] Configure caching headers
- [ ] Optimize images
- [ ] Minify JS/CSS

### Backup

- [ ] Setup automated database backups
- [ ] Configure file system snapshots
- [ ] Test restore procedures

---

## Environment Variables (Production)

```bash
# Server
NODE_ENV=production
PORT=3001

# OpenWeatherMap
OPENWEATHER_API_KEY=your_production_key

# Auth0
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_AUDIENCE=https://weather-comfort-api
AUTH0_CLIENT_ID=your_production_client_id
AUTH0_CLIENT_SECRET=your_production_secret

# Frontend URL (for CORS)
FRONTEND_URL=https://your-production-domain.com

# Optional: Logging
LOG_LEVEL=info
SENTRY_DSN=your_sentry_dsn
```

---

## CI/CD Setup (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Deploy to production
      env:
        DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
      run: |
        # Your deployment script here
        ./deploy.sh
```

---

## Monitoring Commands

```bash
# Check server status
pm2 status

# View logs
pm2 logs weather-api

# Monitor resources
pm2 monit

# Restart app
pm2 restart weather-api

# Check Nginx
sudo systemctl status nginx

# Check disk space
df -h

# Check memory
free -m

# Check running processes
top
```

---

## Troubleshooting

### App won't start
```bash
# Check logs
pm2 logs
journalctl -u nginx -f

# Check environment variables
pm2 env 0

# Restart
pm2 restart all
```

### High memory usage
```bash
# Check memory
free -m

# Restart app
pm2 restart weather-api
```

### SSL issues
```bash
# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

---

## Cost Estimates

### Heroku
- **Hobby**: $7/month (1 dyno)
- **Good for**: Development, testing

### Railway
- **Starter**: $5/month + usage
- **Good for**: Small production apps

### AWS EC2
- **t2.micro**: Free tier eligible (1 year)
- **t2.small**: ~$17/month
- **Good for**: Production, scalable

### DigitalOcean
- **Basic Droplet**: $6/month
- **Good for**: Production, simple setup

---

## Support

For deployment issues:
- Check logs first
- Verify environment variables
- Test API endpoints manually
- Check Auth0 configuration
- Review firewall/security groups

---

**Last Updated**:28 December 2025