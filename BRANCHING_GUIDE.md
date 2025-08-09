# CareCloud MBO System - Git Branching Strategy

## Branch Structure

### Main Branches
- **`main`** - Production-ready code, stable releases only
- **`development`** - Integration branch for all development work

## Workflow for Multiple Users

### For New Features/Bug Fixes:
1. **Start from development branch:**
   ```bash
   git checkout development
   git pull origin development
   ```

2. **Create your personal/feature branch:**
   ```bash
   git checkout -b username/feature-description
   # Example: git checkout -b john/objective-scoring
   # Example: git checkout -b mary/ui-improvements
   ```

3. **Work on your changes and commit:**
   ```bash
   git add .
   git commit -m "Descriptive commit message"
   ```

4. **Push your branch:**
   ```bash
   git push origin username/feature-description
   ```

5. **Create Pull Request:**
   - Target: `development` branch
   - Get code review from team members
   - Merge after approval

6. **Clean up after merge:**
   ```bash
   git checkout development
   git pull origin development
   git branch -d username/feature-description
   ```

## Branch Naming Convention

### Personal Development Branches:
- `username/short-description`
- Examples:
  - `gulsher/navigation-fixes`
  - `ahmed/dashboard-updates`
  - `sara/authentication-improvements`

### Quick Fix Branches:
- `hotfix/issue-description`
- Example: `hotfix/login-bug`

## Current Status
- main - Initial CareCloud MBO System
- development - Ready for team development
- Ready for multi-user collaboration

## Team Collaboration Guidelines

1. **Always pull latest development before creating new branch**
2. **Use descriptive commit messages**
3. **Test your changes locally before pushing**
4. **Create Pull Requests for code review**
5. **Delete branches after successful merge**

## Quick Commands for Daily Use

```bash
# Start new work
git checkout development
git pull origin development
git checkout -b yourname/feature-name

# Save your work
git add .
git commit -m "Your descriptive message"
git push origin yourname/feature-name

# Update from team changes
git checkout development
git pull origin development
```

## Repository URL
https://github.com/gulshercarecloud/carecloud-mbo-system.git
