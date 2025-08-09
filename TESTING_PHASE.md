# CareCloud MBO System - Testing Phase Documentation

## Current Testing Deployment

### Deployment Information
- **Host Machine:** Windows Development System
- **Network IP:** 172.16.14.115
- **Access URL:** http://172.16.14.115:3000
- **Server Type:** Next.js Development Server
- **Deployment Date:** August 9, 2025
- **Status:** Active for Company Testing

## How to Start Testing Environment

### Quick Start Commands (For Host Machine)
```powershell
# Navigate to project directory
cd "c:\Users\gulsherzahid\Documents\MBO\bolt 02"

# Start with network access
npx next dev --hostname 172.16.14.115 --port 3000
```

### Verification Steps
1. **Check server output** shows both local and network URLs
2. **Test local access:** http://localhost:3000
3. **Test network access:** http://172.16.14.115:3000
4. **Confirm firewall rule** is active for port 3000

## Testing Accounts & Scenarios

### Demo Accounts
| Role | Username | Password | Primary Testing Focus |
|------|----------|----------|----------------------|
| Employee | employee@carecloud.com | demo123 | Basic navigation, objectives view, performance tracking |
| Manager | manager@carecloud.com | demo123 | Team management, score reviews, approval workflows |
| HR | hr@carecloud.com | demo123 | Employee reports, bonus calculations, system administration |
| Senior Management | exec@carecloud.com | demo123 | Executive dashboards, company-wide analytics, strategic insights |

### Testing Scenarios

#### Employee Role Testing:
- [ ] Login and dashboard access
- [ ] Objective viewing and remarks submission
- [ ] Performance history review
- [ ] Personal analytics and trends
- [ ] Digital signature workflow

#### Manager Role Testing:
- [ ] Team member overview
- [ ] Objective setting and management
- [ ] Score review and override capabilities
- [ ] Team performance analytics
- [ ] Approval workflow processes

#### HR Role Testing:
- [ ] Employee data management
- [ ] Bonus structure configuration
- [ ] Comprehensive reporting features
- [ ] Department analytics
- [ ] System administration functions

#### Senior Management Testing:
- [ ] Executive dashboard overview
- [ ] Company-wide performance metrics
- [ ] Strategic analytics and insights
- [ ] Cross-department comparisons
- [ ] Historical trend analysis

## Technical Configuration

### Network Setup
```javascript
// next.config.mjs configuration
const nextConfig = {
  experimental: {
    serverHost: '0.0.0.0'
  }
};
```

### Firewall Configuration
- **Rule Name:** CareCloud MBO System
- **Protocol:** TCP
- **Port:** 3000
- **Direction:** Inbound
- **Action:** Allow
- **Scope:** All networks

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "dev:network": "next dev -H 0.0.0.0",
    "build": "next build",
    "start": "next start",
    "start:network": "next start -H 0.0.0.0"
  }
}
```

## Testing Guidelines

### For Test Users:
1. **Access the application** at http://172.16.14.115:3000
2. **Login with provided demo accounts** to test different roles
3. **Navigate through all sections** using the hover-reveal navigation
4. **Test key features** relevant to your expected role
5. **Report any issues** with specific steps to reproduce
6. **Test on different devices** (desktop, tablet, mobile)

### For Development Team:
1. **Monitor server logs** for errors during testing
2. **Track user feedback** and categorize by priority
3. **Document bugs** with reproduction steps
4. **Test fixes** in development environment first
5. **Communicate updates** to testing team

## Known Limitations (Testing Phase)

### Technical Limitations:
- **Development server** - not optimized for production performance
- **Demo data** - uses simulated data for testing purposes
- **Host dependency** - requires host machine to be running and connected
- **Network security** - internal network access only

### Feature Limitations:
- **Authentication** - uses demo accounts, not integrated with company systems
- **Data persistence** - may reset between server restarts
- **Email notifications** - not configured for testing phase
- **External integrations** - placeholder implementations

## Troubleshooting for Users

### Common Issues:

#### "This site can't be reached"
- Verify you're on the company network
- Check if host machine (172.16.14.115) is running
- Confirm the application server is started

#### Login Issues
- Use exact email addresses provided
- Password is case-sensitive: "demo123"
- Clear browser cache if needed

#### Navigation Problems
- **Hover over the header** to reveal navigation options
- Different roles see different navigation items
- Refresh page if navigation appears empty

#### Performance Issues
- Close other browser tabs to free memory
- Try a different browser
- Report specific slow operations

## Feedback Collection

### What to Report:
- **Bugs:** Specific steps to reproduce errors
- **UI/UX Issues:** Screenshots of unexpected behavior
- **Performance Problems:** Which operations are slow
- **Feature Requests:** Suggestions for improvements
- **Security Concerns:** Any potential security issues

### How to Report:
- **Email:** development-team@carecloud.com
- **Include:** Role used, browser, operating system, steps to reproduce
- **Priority:** Critical, High, Medium, Low

## Next Steps

### After Testing Phase:
1. **Production deployment** with proper infrastructure
2. **Real authentication** integration with company systems
3. **Database integration** for persistent data storage
4. **Performance optimization** for larger user base
5. **Security hardening** for production environment

---

**Testing Phase Active:** August 2025  
**Expected Duration:** 2-4 weeks  
**Production Target:** Q4 2025
