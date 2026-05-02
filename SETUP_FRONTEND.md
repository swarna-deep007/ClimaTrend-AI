# Frontend Setup Guide

## Prerequisites

### 1. Node.js & npm

Make sure you have Node.js 16+ installed:

```bash
node --version  # Should be v16 or higher
npm --version
```

### 2. Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
# Copy the template
cp .env.example .env

# Edit .env with your values
VITE_OPENWEATHER_API_KEY=your_api_key_here
VITE_BACKEND_URL=http://127.0.0.1:8000
```

**Important: `.env` is in `.gitignore` - never commit real secrets!**

---

## Installation & Development

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

You should see:
```
VITE v5.x.x  local:   http://localhost:5173/
```

Open http://localhost:5173 in your browser.

### Step 3: Build for Production

```bash
npm run build
npm run preview
```

---

## Environment Variables (React + Vite)

### How It Works

Vite exposes environment variables prefixed with `VITE_` to the browser:

**In `frontend/.env`:**
```bash
VITE_OPENWEATHER_API_KEY=secret_key_here
VITE_BACKEND_URL=http://127.0.0.1:8000
```

**In React component:**
```jsx
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
```

### Important Security Notes

⚠️ **ANYTHING PREFIXED WITH `VITE_` IS EXPOSED TO BROWSER!**

- ✓ Safe: API keys for public APIs (like OpenWeather free tier)
- ✓ Safe: Backend URLs
- ✗ Unsafe: Private authentication tokens
- ✗ Unsafe: Database connection strings
- ✗ Unsafe: Admin credentials

**For sensitive data:**
- Store on backend
- Access via authenticated API calls
- Never expose in frontend code

---

## File Locations

### Environment Variables

```
frontend/
├── .env              # ✗ NOT in Git (local only - .gitignore)
├── .env.example      # ✓ In Git (template)
├── .env.production   # ✗ Optional local production config
└── src/
    └── pages/
        └── Live.jsx  # Uses import.meta.env.VITE_OPENWEATHER_API_KEY
```

---

## Features Using Environment Variables

### 1. Live.jsx - Weather Map

```jsx
// Now uses environment variable (no hardcoded key)
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "";

// Fallback if .env not configured
if (!API_KEY) {
  console.warn("VITE_OPENWEATHER_API_KEY not set in .env");
}
```

### 2. API Calls

```jsx
// Using backend URL from environment
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const response = await axios.post(
  `${BACKEND_URL}/api/advanced-predict`,
  { city, date }
);
```

---

## Supported .env Formats

### Development Mode (`.env`)

```bash
# Used when running: npm run dev
VITE_OPENWEATHER_API_KEY=dev_key_here
VITE_BACKEND_URL=http://localhost:8000
```

### Production Mode (`.env.production`)

```bash
# Used when building: npm run build (for production)
VITE_OPENWEATHER_API_KEY=prod_key_here
VITE_BACKEND_URL=https://api.example.com
```

### Local Override (`.env.local`)

```bash
# Highest priority, never committed
# Overrides all other .env files
VITE_OPENWEATHER_API_KEY=personal_key
```

**Priority Order:**
1. `.env.local` (highest)
2. `.env.[mode].local`
3. `.env.[mode]`
4. `.env` (lowest)

---

## Troubleshooting

### "Cannot read properties of undefined" Error

**Problem:** `API_KEY` is undefined
```
error: Cannot read properties of undefined (reading 'toUpperCase')
```

**Solution:**
1. Check `.env` exists: `ls -la frontend/.env`
2. Verify variable is set: `grep VITE_OPENWEATHER_API_KEY frontend/.env`
3. Restart dev server: `npm run dev`
4. Check browser console for actual value

```jsx
// Debug in component
console.log("API Key:", import.meta.env.VITE_OPENWEATHER_API_KEY);
console.log("All env vars:", import.meta.env);
```

### API Calls Return 404

**Problem:** Backend URL is wrong
```
error: GET http://localhost:5173/api/... 404
```

**Solution:**
1. Check backend is running: `uvicorn main:app --reload`
2. Check VITE_BACKEND_URL is correct in `.env`
3. Try directly: `curl http://127.0.0.1:8000/`

### "VITE_OPENWEATHER_API_KEY is required" Warning

**Problem:** API key not configured

**Solution:**
1. Create `.env`: `cp .env.example .env`
2. Add your key from https://openweathermap.org/api
3. Restart: `npm run dev`

---

## Best Practices

### ✓ DO:
- Store secrets in `.env` (local, never commit)
- Use `.env.example` for templates
- Rotate API keys regularly
- Use different keys for dev vs prod
- Check `.env` into team secure storage (1Pass, Vault, etc.)

### ✗ DON'T:
- Commit `.env` to Git
- Hardcode secrets in source files
- Use same key for dev and production
- Share API keys via email/chat
- Log API keys in console (production)

---

## Secret Cleanup (If Needed)

If you previously had hardcoded API keys and want to remove them from Git history:

See: `GIT_SECRET_REMOVAL.md`

Quick commands:
```bash
# Remove from history
git filter-branch --tree-filter '
  find . -type f -name "*.jsx" | xargs sed -i "s/e89da8bbba11b090de6cfc1e745b1d8c/REDACTED/g"
' -- --all

# Force push (CAREFUL - rewrites history)
git push --force --all origin
```

---

## Environment Variables Reference

### Available Variables

| Variable | Type | Required | Example | Notes |
|----------|------|----------|---------|-------|
| `VITE_OPENWEATHER_API_KEY` | String | ✓ Yes | `abc123...` | Free key from OpenWeather |
| `VITE_BACKEND_URL` | String | ✗ No | `http://127.0.0.1:8000` | Defaults to localhost |

### Getting API Keys

1. **OpenWeather** (Free Tier)
   - Visit: https://openweathermap.org/api
   - Sign up for free account
   - Generate API key in dashboard
   - No credit card required
   - ~1000 calls/day free tier

---

## Development Workflow

```bash
# 1. Setup (one-time)
cd frontend
npm install
cp .env.example .env
# Edit .env with your API key

# 2. Development
npm run dev
# Edit code, auto-reloads

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

---

## CI/CD Deployment

For GitHub Actions / GitLab CI:

```yaml
# Example: GitHub Actions
- name: Build frontend
  env:
    VITE_OPENWEATHER_API_KEY: ${{ secrets.OPENWEATHER_API_KEY }}
    VITE_BACKEND_URL: ${{ secrets.BACKEND_URL }}
  run: |
    cd frontend
    npm install
    npm run build
```

Store secrets in repository settings → Secrets and variables.

---

## Support & Resources

- Vite Docs: https://vitejs.dev/guide/env-and-mode.html
- React: https://react.dev/
- OpenWeather API: https://openweathermap.org/api
- Environment Variables Best Practices: https://12factor.net/config
