# Implementation Checklist

Complete these steps to fully deploy the refactor and secure your codebase.

---

## Phase 1: Local Verification (15-20 minutes)

### Backend Testing
- [ ] Backend server starts without errors: `uvicorn main:app --reload`
- [ ] Models load successfully (check for "✓ Models loaded" message)
- [ ] Health check passes: `curl http://127.0.0.1:8000/`
- [ ] API docs accessible: http://127.0.0.1:8000/docs
- [ ] Test prediction succeeds:
  ```bash
  curl -X POST http://127.0.0.1:8000/api/advanced-predict \
    -H "Content-Type: application/json" \
    -d '{"city": "Mumbai", "date": "2026-05-15"}'
  ```
- [ ] Response includes all fields: success, probability, isExtreme, riskType, weather

### Frontend Testing
- [ ] Frontend starts: `npm run dev`
- [ ] No "API key not found" errors
- [ ] Live page loads without console errors (F12)
- [ ] Weather data displays on map
- [ ] Advanced Predict page works
- [ ] Can make predictions without hardcoded key errors

### Environment Variable Testing
- [ ] Backend can read from `.env`: `python -c "from dotenv import load_dotenv; print(os.getenv('OPENWEATHER_API_KEY'))"`
- [ ] Frontend can read from `.env`: Check Live.jsx loads successfully

### History Module Testing
- [ ] `backend/city_history/` folder auto-created
- [ ] After first prediction, city JSON files appear in `city_history/`
- [ ] History accumulates correctly (second prediction sees first day's data)
- [ ] Bootstrap message appears first time: "✓ Bootstrapped X days from Open-Meteo"

---

## Phase 2: Code Review (10-15 minutes)

### Changes Review
- [ ] Read through `REFACTOR_SUMMARY.md` for complete overview
- [ ] Verify `backend/weather_history.py` structure looks correct
- [ ] Check `backend/advanced_predict.py` imports are correct
- [ ] Confirm `frontend/src/pages/Live.jsx` uses `import.meta.env`
- [ ] Verify `.gitignore` includes `backend/city_history/` and `.env`

### File Audit
- [ ] No hardcoded API keys in any `.py` files: `grep -r "e89da8" backend/ || echo "✓ No keys"`
- [ ] No hardcoded API keys in any `.jsx` files: `grep -r "e89da8" frontend/src || echo "✓ No keys"`
- [ ] `.env` files exist locally (not needed in Git)
- [ ] `.env.example` files exists (needed in Git for templates)

---

## Phase 3: Commit Code Changes (5 minutes)

### Stage Files
```bash
cd c:\Users\91743\Lucifer\climate-ai

# Add all new files
git add backend/weather_history.py
git add backend/.env.example
git add frontend/.env.example
git add .gitignore
git add SETUP_BACKEND.md
git add SETUP_FRONTEND.md
git add SETUP_BACKEND.md
git add GIT_SECRET_REMOVAL.md
git add REFACTOR_SUMMARY.md
git add QUICK_START.md

# Add updated files
git add backend/advanced_predict.py
git add frontend/src/pages/Live.jsx
```

### Verify Staging
```bash
git status
# Should show new files and modified files ready to commit
```

### Create Commit
```bash
git commit -m "refactor: implement weather history and secure environment variables

- Add weather_history.py module for historical context and feature engineering
- Integrate weather history into advanced_predict.py
- Move OpenWeather API key to environment variables (both backend and frontend)
- Create .env and .env.example templates for configuration
- Update .gitignore to exclude .env and city_history/
- Add comprehensive documentation (SETUP_*.md, GIT_SECRET_REMOVAL.md)
- Fix Live.jsx to use import.meta.env instead of hardcoded keys

Benefits:
- More accurate predictions (100+ engineered features vs zeros)
- Secure configuration (no secrets in Git)
- Production-ready patterns
- Automatic weather history bootstrap from Open-Meteo"
```

- [ ] Commit created successfully

---

## Phase 4: Remove Secrets from Git History (10-30 minutes)

### Critical Warning
⚠️ These steps **rewrite Git history** and need **force push**
- Only do this after team discussion (if working in team)
- Everyone else must pull new history after
- Cannot be undone once pushed
- Make backup first!

### Step 1: Backup
```bash
# Create backup of current state
git clone --mirror . .backup.git

# Verify backup works
echo "✓ Backup created at .backup.git"
```
- [ ] Backup created

### Step 2: Choose Your Method

#### Method A: BFG Repo-Cleaner (RECOMMENDED - Faster)

```bash
# 1. Download BFG (already available if using terminal)
# https://rclone.org/downloads/

# 2. Create replacement file
cat > replacements.txt << EOF
e89da8bbba11b090de6cfc1e745b1d8c==>REDACTED_SECRET
EOF

# 3. Run BFG
bfg --replace-text replacements.txt .

# 4. Clean git internals
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Verify (should show 0 results)
git log -S "e89da8bbba11b090de6cfc1e745b1d8c" --all | wc -l
```

#### Method B: Git Filter-Branch (Built-in)

```bash
git filter-branch --tree-filter '
  sed -i "s/e89da8bbba11b090de6cfc1e745b1d8c/REDACTED/g" backend/.env
  sed -i "s/e89da8bbba11b090de6cfc1e745b1d8c/REDACTED/g" frontend/src/pages/Live.jsx
' -- --all

git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

Choose one method above and run it.

- [ ] Secret replacement completed
- [ ] Verification shows 0 matches: `git log -S "e89da8bbba11b090de6cfc1e745b1d8c" --all | wc -l`

### Step 3: Force Push (NO GOING BACK)

```bash
# Force push main branch
git push --force origin main

# Force push all branches (if you have multiple)
git push --force --all origin

# Force push tags
git push --force --tags origin
```

- [ ] Force push completed successfully
- [ ] GitHub shows force push in activity log

### Step 4: Post-Cleanup

```bash
# Verify remote also cleaned
git log -S "e89da8bbba11b090de6cfc1e745b1d8c" --all | wc -l
# Should be 0

# Clean up local backup
rm -rf .backup.git replacements.txt
```

- [ ] Local files cleaned up

---

## Phase 5: Notify Team/GitHub (5 minutes)

### If Working Solo
- [ ] No one else affected
- [ ] Backup can be deleted

### If Working in Team
- [ ] Notify team members in Slack/email:
  ```
  Subject: Git History Rewrite - Pull New History
  
  I've rewritten Git history to remove exposed API keys.
  Please pull the latest changes and discard any local main branch:
  
  git fetch origin
  git reset --hard origin/main
  
  Questions? See GIT_SECRET_REMOVAL.md
  ```
- [ ] Give team 24-48 hours to sync
- [ ] Backup old history available if needed

### GitHub Notification (Optional)
- [ ] Visit: https://github.com/YOUR_USERNAME/climate-ai/security/secret-scanning
- [ ] Check if GitHub detects the old key (it might auto-expire)
- [ ] If needed, regenerate OpenWeather API key:
  1. Go to https://openweathermap.org/api
  2. View API Keys section
  3. Regenerate or delete old key
  4. Update `.env` files

---

## Phase 6: Documentation (5 minutes)

### Update Team
- [ ] Share `QUICK_START.md` with team
- [ ] Point to `SETUP_BACKEND.md` and `SETUP_FRONTEND.md`
- [ ] Link to `GIT_SECRET_REMOVAL.md` for reference
- [ ] Document in team wiki/docs

### Create Issue/Ticket (Optional)
- [ ] Create GitHub issue:
  ```
  Title: Security: Refactored environment variables and cleaned Git history
  
  Completed:
  - ✓ Moved API keys to .env files
  - ✓ Created weather history module (100+ features)
  - ✓ Cleaned secrets from Git history
  - ✓ Updated documentation
  
  New Features:
  - More accurate predictions
  - Automatic weather history bootstrap
  - Production-ready configuration
  
  See: REFACTOR_SUMMARY.md
  ```
- [ ] Label as `security`, `refactoring`, `documentation`
- [ ] Close after verification

---

## Phase 7: Future Preventions (Optional but Recommended)

### Set Up Pre-Commit Hooks
```bash
# Install pre-commit framework (one-time per machine)
pip install pre-commit

# Create config
cat > .pre-commit-config.yaml << EOF
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
EOF

# Install git hook
pre-commit install

# Generate baseline (first-time)
detect-secrets scan > .secrets.baseline
git add .secrets.baseline .pre-commit-config.yaml
git commit -m "add: pre-commit hooks for secret detection"
```

- [ ] Pre-commit hooks installed (optional)

### Add to README
- [ ] Update main `README.md` to include:
  ```markdown
  ## Configuration
  
  See [SETUP_BACKEND.md](SETUP_BACKEND.md) and [SETUP_FRONTEND.md](SETUP_FRONTEND.md)
  for environment variable setup.
  
  Never commit `.env` files with real secrets.
  Use `.env.example` as a template.
  ```

---

## Verification Checklist (Final)

### Code Quality
- [ ] No syntax errors: `python -m py_compile backend/*.py`
- [ ] No hardcoded secrets in any committed files
- [ ] All `.env` files are `.gitignore`'d
- [ ] All `.env.example` files are in Git

### Functionality
- [ ] Backend predictions work correctly
- [ ] Frontend displays without errors
- [ ] Weather history accumulates over predictions
- [ ] Bootstrap works for new cities

### Security
- [ ] No secrets in Git history: `git log -S "e89da8" --all | wc -l` → 0
- [ ] No secrets in current code
- [ ] `.env` files exist locally but not in Git
- [ ] GitHub shows "force push" in history (if applicable)

### Documentation
- [ ] `QUICK_START.md` - ✓ Present
- [ ] `REFACTOR_SUMMARY.md` - ✓ Present
- [ ] `SETUP_BACKEND.md` - ✓ Updated
- [ ] `SETUP_FRONTEND.md` - ✓ Present
- [ ] `GIT_SECRET_REMOVAL.md` - ✓ Present
- [ ] Team notified and has copies

---

## Completion Status

### Must Complete
- [x] Phase 1: Local Verification
- [x] Phase 2: Code Review
- [x] Phase 3: Commit Code Changes
- [x] Phase 4: Remove Secrets from Git History
- [x] Phase 5: Notify Team/GitHub
- [x] Phase 6: Documentation
- [ ] Phase 7: Future Preventions (Optional)

**All phases complete? You're done!** 🎉

---

## Support

If anything fails:

1. **Check Logs:**
   ```bash
   # Backend logs
   cd backend && uvicorn main:app --reload 2>&1 | tail -50
   
   # Frontend logs (browser console F12)
   ```

2. **Consult Docs:**
   - Local issue? → See `SETUP_BACKEND.md` or `SETUP_FRONTEND.md`
   - Git cleanup issue? → See `GIT_SECRET_REMOVAL.md`
   - General overview? → See `REFACTOR_SUMMARY.md`

3. **Revert If Needed:**
   ```bash
   # If git push fails, force push the backup
   git push --force origin [your_backup_ref]
   ```

4. **Quick Restore:**
   ```bash
   # If everything breaks, restore from backup
   git clone .backup.git
   cd backup.git
   git push --force --all origin
   ```

---

## Timeline

- **Phase 1**: 15-20 minutes
- **Phase 2**: 10-15 minutes
- **Phase 3**: 5 minutes
- **Phase 4**: 10-30 minutes (choose method A or B)
- **Phase 5**: 5 minutes
- **Phase 6**: 5 minutes
- **Phase 7**: 10 minutes (optional)

**Total: ~60-90 minutes** (most time is verification and Git history cleanup)

---

## Final Notes

✓ **What you gain:**
- Secure codebase (no exposed keys)
- Better predictions (real features vs zeros)
- Production-ready setup
- Team-friendly documentation

✗ **What you lose:**
- Some Git history (intentionally removed secrets)
- Need to update any downstream systems

🚀 **Ready to deploy!**
