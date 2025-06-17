# Deployment Guide for Replit

## 🚀 Deploying to Replit

### Prerequisites
1. A [Replit](https://replit.com/) account
2. Git installed on your machine (for pushing/pulling code)

### Step 1: Prepare Your Project

- **Project Structure**
  - **FastAPI backend**: `main.py` (Python)
  - **Next.js frontend**: `/app` directory (Node.js)
  - **requirements.txt**: Python dependencies
  - **package.json**: Node.js dependencies

### Step 2: Install Dependencies

In the Replit Shell, run:
```bash
pip install -r requirements.txt
npm install
```

### Step 3: Configure Environment Variables
- Use the Replit Secrets tab to add these (see `.env.example`):
  - `SECRET_KEY`
  - `ALLOWED_ORIGINS` (e.g., `https://<your-replit-username>.<your-replit-project>.repl.co`)
  - `NEXT_PUBLIC_API_URL` (e.g., `https://<your-replit-username>.<your-replit-project>.repl.co`)

### Step 4: CORS Setup
- The backend (`main.py`) uses CORS and will read allowed origins from `ALLOWED_ORIGINS`.
- Make sure your frontend and backend URLs are included.

### Step 5: Running Both Servers
- **Option 1: Two Shell Tabs**
  - Tab 1: Run FastAPI backend
    ```bash
    uvicorn main:app --host=0.0.0.0 --port=8000
    ```
  - Tab 2: Run Next.js frontend
    ```bash
    npm run dev -- --port 3000
    ```
- **Option 2: Use `concurrently`**
  - Install concurrently:
    ```bash
    npm install concurrently --save-dev
    ```
  - Add to `package.json` scripts:
    ```json
    "dev:all": "concurrently \"uvicorn main:app --host=0.0.0.0 --port=8000\" \"next dev -p 3000\""
    ```
  - Run both:
    ```bash
    npm run dev:all
    ```

### Step 6: .replit File Example
```toml
run = "uvicorn main:app --host=0.0.0.0 --port=8000"
language = "python3"
entrypoint = "main.py"
```
- For Next.js, use a second shell tab.

### Step 7: Accessing the App
- **Backend (FastAPI):** `https://<your-replit-username>.<your-replit-project>.repl.co/docs`
- **Frontend (Next.js):** `https://<your-replit-username>.<your-replit-project>.repl.co` (if using Replit's webview, or port 3000 if running locally)

### Step 8: Static Files
- All static assets (charts, images, etc.) should be in `/public` for Next.js.
- If your backend serves files, ensure the URLs are correct and accessible.

### Step 9: Production Tips
- Use Replit Secrets for all sensitive environment variables.
- Make sure CORS is set up for your deployed Replit URL.
- For best results, run backend and frontend in separate tabs or use a process manager.

---

## 🛠️ Troubleshooting

### Common Issues

1. **Dependency Issues**
   - Ensure all dependencies are installed with `pip install -r requirements.txt` and `npm install`.
2. **Port Conflicts**
   - Make sure FastAPI runs on 8000 and Next.js on 3000.
3. **CORS Errors**
   - Double-check `ALLOWED_ORIGINS` in your backend and `NEXT_PUBLIC_API_URL` in your frontend.
4. **Environment Variables**
   - Use the Replit Secrets tab for all sensitive data.

### Support Resources
- [Replit Docs](https://docs.replit.com/)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit sensitive data
   - Use Replit's secret management
   - Rotate credentials regularly
2. **API Security**
   - Implement rate limiting
   - Use HTTPS only
   - Set up CORS properly
3. **Data Protection**
   - Encrypt sensitive data
   - Implement proper authentication
   - Regular security audits

---

**Note**: This guide assumes you have the necessary permissions and access to deploy to Replit. Always follow your organization's deployment policies and security guidelines. 