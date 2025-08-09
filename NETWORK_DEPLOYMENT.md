# CareCloud MBO System - Company Network Deployment Guide

## Overview
This guide helps you host the CareCloud MBO System on your local machine and make it accessible to other employees in your company network for testing phases.

## Testing Phase Setup (Verified Working Configuration)

### System Details Used:
- **Development Machine IP:** 172.16.14.115
- **Testing Access URL:** http://172.16.14.115:3000
- **Environment:** Windows with Next.js development server

### Verified Working Steps:

#### Step 1: Configure Windows Firewall (CRITICAL)
1. Open **Windows Defender Firewall with Advanced Security**
2. Click **Inbound Rules** → **New Rule**
3. Select **Port** → **Next**
4. Select **TCP** and enter **3000** → **Next**
5. Select **Allow the connection** → **Next**
6. Check all network types → **Next**
7. Name it "CareCloud MBO System" → **Finish**

#### Step 2: Update Next.js Configuration
The following configuration was added to `next.config.mjs`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable network access
  experimental: {
    serverHost: '0.0.0.0'
  }
};

export default nextConfig;
```

#### Step 3: Start Application with Network Access
Use one of these verified working commands:

**Option A (Recommended):**
```powershell
npx next dev --hostname 172.16.14.115 --port 3000
```

**Option B (Alternative):**
```powershell
npx next dev -H 0.0.0.0 -p 3000
```

**Option C (Using batch file):**
```powershell
.\start-network.bat
```

### Expected Successful Output:
```
▲ Next.js 15.4.6
- Local:        http://localhost:3000
- Network:      http://172.16.14.115:3000

✓ Ready in 2.3s
```

## Testing Phase Information for Company Users

### Current Testing Deployment Status:
- **Status:** ACTIVE - Running on Development Machine
- **Access URL:** http://172.16.14.115:3000
- **Environment:** Development/Testing Phase
- **Availability:** During business hours when host machine is running

### Demo Accounts for Testing:
| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Employee | employee@carecloud.com | demo123 | Basic user dashboard, objectives view |
| Manager | manager@carecloud.com | demo123 | Team management, score reviews |
| HR | hr@carecloud.com | demo123 | Reports, bonus management |
| Senior Management | exec@carecloud.com | demo123 | Executive dashboard, analytics |

### What to Test:
1. **Login Process** - Try different user roles
2. **Navigation System** - Hover over header for role-specific options
3. **Dashboard Features** - Each role has different capabilities
4. **Performance Analytics** - Charts and reporting features
5. **Objectives Management** - Setting and tracking objectives
6. **Cross-device Compatibility** - Test on different devices/browsers

### Testing Guidelines:
- **Use realistic data** when testing features
- **Report any bugs or issues** to the development team
- **Test different user scenarios** to validate role-based access
- **Check responsive design** on mobile devices
- **Validate data accuracy** in reports and analytics

### System Requirements for Users:
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Network access** to company internal network
- **No additional software** required - web-based application

## Prerequisites for Setup (Technical Team)

### Access URL Format:
```
http://YOUR_IP_ADDRESS:3000
```

### Example:
If your IP is `192.168.1.100`, colleagues can access:
```
http://192.168.1.100:3000
```

## Step 5: User Account Information

Share these demo accounts with your team:

| Role | Email | Password |
|------|-------|----------|
| Employee | employee@carecloud.com | demo123 |
| Manager | manager@carecloud.com | demo123 |
| HR | hr@carecloud.com | demo123 |
| Senior Management | exec@carecloud.com | demo123 |

## Alternative Deployment Options

### Option 1: Use a Different Port (if 3000 is blocked)
```powershell
# Development
npm run dev:network -- --port 8080

# Production
npm run start:network -- --port 8080
```
Then access via: `http://YOUR_IP:8080`

### Option 2: Using ngrok (External Access)
If you need external access or have complex network restrictions:

1. **Install ngrok:**
   ```powershell
   npm install -g ngrok
   ```

2. **Start your application locally:**
   ```powershell
   npm run dev
   ```

3. **In another terminal, expose with ngrok:**
   ```powershell
   ngrok http 3000
   ```

4. **Share the ngrok URL** (e.g., `https://abc123.ngrok.io`)

## Troubleshooting

### Common Issues:

1. **"This site can't be reached"**
   - Check Windows Firewall settings
   - Verify your IP address is correct
   - Ensure the application is running

2. **Connection timeout**
   - Check if both devices are on the same network
   - Try disabling Windows Firewall temporarily for testing

3. **Port already in use**
   - Use a different port: `npm run dev:network -- --port 3001`

### Network Diagnostics:
```powershell
# Test if port is open
netstat -an | findstr :3000

# Test connectivity from another machine
telnet YOUR_IP_ADDRESS 3000
```

## Security Considerations

### For Company Internal Use:
- ✅ Application runs on internal network only
- ✅ Demo accounts are safe for internal testing
- ✅ No external internet exposure

### Recommendations:
1. **Run in production mode** for better performance
2. **Keep your machine running** while others need access
3. **Use strong passwords** when implementing real authentication
4. **Consider a dedicated server** for permanent deployment

## Quick Setup Commands

```powershell
# Navigate to project
cd "c:\Users\gulsherzahid\Documents\MBO\bolt 02"

# Get your IP address
ipconfig

# Install dependencies (if needed)
npm install

# Build for production
npm run build

# Start for network access
npm run start:network

# Your colleagues can now access:
# http://YOUR_IP_ADDRESS:3000
```

## Support

If colleagues cannot access the application:
1. Verify firewall configuration
2. Confirm IP address
3. Test from your own machine first: `http://localhost:3000`
4. Check Windows Event Logs for blocked connections

---

**Note:** Keep your machine running and connected to the company network while others need access to the application.
