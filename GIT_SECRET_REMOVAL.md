# Git Secret Removal Guide

## Overview
This document provides step-by-step instructions to remove hardcoded API keys and secrets from Git history.

**Identified Secrets:**
- OpenWeather API Key: `e89da8bbba11b090de6cfc1e745b1d8c` in:
  - `frontend/src/pages/Live.jsx` (line 28)
  - `backend/.env` 

---

## STEP 1: Verify Secrets Are Exposed

Check if secrets are in Git history:

```bash
# Check current branch for exposed secrets
git log -p -S "e89da8bbba11b090de6cfc1e745b1d8c" -- frontend/src/pages/Live.jsx
git log -p -S "e89da8bbba11b090de6cfc1e745b1d8c" -- backend/.env

# Show all files containing the API key
git log --all --oneline -- "*" | head -20
```

---

## STEP 2: Clean Secrets from Git History

### Option A: Using BFG Repo-Cleaner (RECOMMENDED - Faster & Safer)

**Install BFG:**
```bash
# Windows (using choco or download binary)
choco install bfg

# Or download from: https://rclone.org/downloads/
```

**Remove the secret:**
```bash
# Replace the API key value in history
bfg --replace-text '<<REPLACEMENTS' .

# Or directly replace string
bfg --replace-text <(echo "e89da8bbba11b090de6cfc1e745b1d8c==>REDACTED") .

# Reflog expire to remove references
git reflog expire --expire=now --all

# Garbage collect
git gc --prune=now --aggressive
```

### Option B: Using git filter-branch (Built-in Git)

```bash
# Important: Do this on a BACKUP CLONE first!
git clone --mirror https://github.com/YOUR_USERNAME/climate-ai climate-ai.git
cd climate-ai.git

# Remove secrets from all history
git filter-branch --tree-filter '
  find . -type f -name ".env" -o -name "*.py" -o -name "*.jsx" | 
  xargs sed -i "s/e89da8bbba11b090de6cfc1e745b1d8c/REDACTED-SECRET/g"
' -- --all

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Option C: Using git filter-repo (Modern Alternative)

```bash
# Install git-filter-repo
pip install git-filter-repo

# Create replacements file
cat > ~/.git-filter-repo-replacements.txt << EOF
e89da8bbba11b090de6cfc1e745b1d8c==>REDACTED_SECRET
EOF

# Run filter
git filter-repo --replace-text ~/.git-filter-repo-replacements.txt

# Cleanup
git gc --prune=now --aggressive
```

---

## STEP 3: Force Push to GitHub

**CRITICAL WARNINGS:**
- This rewrites history - all branches are affected
- Other contributors must pull the new history
- Do NOT do this if others are actively working
- This cannot be undone once pushed

```bash
# Verify no one is actively working on the repo
# Then force push ALL branches

# Force push main branch
git push --force origin main

# Force push all branches
git push --force --all origin

# Force push all tags
git push --force --tags origin
```

---

## STEP 4: Verify Secrets Are Removed

```bash
# Verify secret no longer in history
git log --all -p -S "e89da8bbba11b090de6cfc1e745b1d8c" | head -20

# Should return: (no results)

# Check file contents
cat backend/.env
cat frontend/src/pages/Live.jsx | grep -i "e89da8"

# Should show no matches
```

---

## STEP 5: Notify GitHub (Optional but Recommended)

GitHub has tools to help revoke compromised keys:

1. Go to your repo settings
2. Check "Security & analysis" tab
3. If secret scanning detected the key, you'll see it there
4. GitHub may auto-revoke the key or show warnings

Manually:
- Visit: https://github.com/YOUR_USERNAME/climate-ai/security/secret-scanning

---

## STEP 6: Regenerate (Optional)

If the API key was on GitHub, consider regenerating it:

1. OpenWeather Account: https://openweathermap.org/api
2. Go to API Keys section
3. Regenerate or delete the old key
4. Update .env files with new key

---

## Best Practices Going Forward

1. **Always use .env files** - Never commit secrets
2. **Add to .gitignore** - Already done: `.env`
3. **Use .env.example** - Created for reference (no secrets)
4. **Code Review** - Check for secrets before committing
5. **Git Hooks** - Use pre-commit hooks to scan for secrets:

```bash
# Install pre-commit framework
pip install pre-commit

# Create .pre-commit-config.yaml
cat > .pre-commit-config.yaml << EOF
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
EOF

# Setup hook
pre-commit install
```

---

## Quick Complete Solution (TLDR)

If you want the fastest, safest approach:

```bash
cd c:\Users\91743\Lucifer\climate-ai

# 1. Backup current state
git stash
git log --oneline | head -1  # Note the hash

# 2. Install BFG (one-time)
# Download from https://rclone.org/downloads/ and add to PATH

# 3. Clean history
bfg --replace-text <(echo "e89da8bbba11b090de6cfc1e745b1d8c==>REDACTED") .
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 4. Force push (POINT OF NO RETURN)
git push --force --all origin

# 5. Verify
git log -S "e89da8bbba11b090de6cfc1e745b1d8c" --all | wc -l  # Should be 0
```

---

## Folder Structure After Cleanup

```
climate-ai/
├── .env                 ✗ (not tracked, in .gitignore)
├── .env.example         ✓ (tracked, has placeholders)
├── backend/
│   ├── .env             ✗ (local only, secrets not in Git)
│   ├── .env.example     ✓ (tracked template)
│   ├── weather_history/ ✗ (local data, in .gitignore)
│   └── ...
├── frontend/
│   ├── .env             ✗ (local only)
│   ├── .env.example     ✓ (tracked template)
│   └── ...
└── .gitignore           ✓ (includes .env and weather_history/)
```

---

## Support

For more information:
- Git Docs: https://git-scm.com/book/en/Git-Tools-Rewriting-History
- BFG Cleaner: https://rclone.org/
- GitHub Secret Scanning: https://docs.github.com/en/code-security/secret-scanning
