# Deployment Guide for Railway

## 🚂 Deploying to Railway

### Prerequisites
1. A [Railway](https://railway.app/) account
2. [Railway CLI](https://docs.railway.app/develop/cli) installed
3. Git installed on your machine

### Step 1: Prepare Your Project

1. **Frontend (Next.js)**
```bash
# Build the Next.js application
npm run build

# Create a railway.toml file
cat > railway.toml << EOL
[build]
builder = "nixpacks"
buildCommand = "npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/"
healthcheckTimeout = 100
restartPolicyType = "on-failure"
restartPolicyMaxRetries = 10
EOL
```

2. **Backend (FastAPI)**
```bash
# Create requirements.txt if not exists
pip freeze > requirements.txt

# Create a Procfile
echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile
```

### Step 2: Initialize Railway Project

```bash
# Login to Railway
railway login

# Initialize project
railway init

# Link to existing project (if applicable)
railway link
```

### Step 3: Configure Environment Variables

```bash
# Set environment variables
railway variables set \
  NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app \
  DATABASE_URL=your_database_url \
  TESSERACT_PATH=/usr/bin/tesseract
```

### Step 4: Deploy

```bash
# Deploy to Railway
railway up
```

### Step 5: Verify Deployment

1. Check the deployment logs:
```bash
railway logs
```

2. Monitor the application:
```bash
railway status
```

## 🔧 Configuration

### Frontend Configuration

1. **Next.js Configuration**
```typescript
// next.config.js
module.exports = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}
```

2. **CORS Configuration**
```typescript
// Backend CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-url.railway.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Backend Configuration

1. **FastAPI Configuration**
```python
# main.py
import os

app = FastAPI(
    title="EcoTown Health API",
    description="Healthcare analytics API",
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") == "development" else None,
)
```

2. **Tesseract OCR Configuration**
```python
# Ensure Tesseract is installed in the Railway environment
if os.getenv("RAILWAY_ENVIRONMENT"):
    pytesseract.pytesseract.tesseract_cmd = os.getenv("TESSERACT_PATH")
```

## 📊 Monitoring

### Railway Dashboard
- Monitor application health
- View logs and metrics
- Configure auto-scaling
- Set up alerts

### Health Checks
```bash
# Configure health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

## 🔄 Continuous Deployment

### GitHub Integration
1. Connect your GitHub repository to Railway
2. Configure automatic deployments
3. Set up deployment environments (staging/production)

### Deployment Workflow
1. Push to main branch
2. Railway automatically builds and deploys
3. Run health checks
4. Update DNS if needed

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
```bash
# Check build logs
railway logs --build
```

2. **Runtime Errors**
```bash
# Check application logs
railway logs --app
```

3. **Environment Variables**
```bash
# List all environment variables
railway variables list
```

### Support Resources
- [Railway Documentation](https://docs.railway.app/)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

## 🔒 Security Considerations

1. **Environment Variables**
- Never commit sensitive data
- Use Railway's secret management
- Rotate credentials regularly

2. **API Security**
- Implement rate limiting
- Use HTTPS only
- Set up CORS properly

3. **Data Protection**
- Encrypt sensitive data
- Implement proper authentication
- Regular security audits

## 📈 Scaling

### Auto-scaling Configuration
```toml
# railway.toml
[deploy]
autoScaling = true
minInstances = 1
maxInstances = 3
```

### Resource Allocation
- Monitor CPU/Memory usage
- Adjust instance size as needed
- Set up alerts for resource thresholds

## 🔄 Backup and Recovery

### Database Backups
```bash
# Configure automated backups
railway backup create
```

### Recovery Procedures
1. Document recovery steps
2. Test recovery process
3. Maintain backup schedule

---

**Note**: This guide assumes you have the necessary permissions and access to deploy to Railway. Always follow your organization's deployment policies and security guidelines. 