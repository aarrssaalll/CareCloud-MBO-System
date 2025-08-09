# CareCloud MBO System - Company Network Deployment Guide

## Overview
This guide helps you host the CareCloud MBO System on your local machine and make it accessible to other employees in your company network.

## Prerequisites
- Node.js 18+ installed on your system
- Network admin access (for firewall configuration)
- Your system must be connected to the company network
- Windows Defender/Firewall access

## Step 1: Get Your Local IP Address

### Method 1: Command Prompt
```powershell
ipconfig
```
Look for your IPv4 Address (usually starts with 192.168.x.x or 10.x.x.x)

### Method 2: PowerShell
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*"}
```

**Example Output:** Your IP might be something like `192.168.1.100`

## Step 2: Configure Windows Firewall

### Option A: Allow Node.js through Firewall (Recommended)
1. Open **Windows Defender Firewall with Advanced Security**
2. Click **Inbound Rules** → **New Rule**
3. Select **Program** → **Next**
4. Browse to your Node.js installation (usually `C:\Program Files\nodejs\node.exe`)
5. Select **Allow the connection** → **Next**
6. Check all network types → **Next**
7. Name it "Node.js CareCloud MBO" → **Finish**

### Option B: Allow Port 3000 (Alternative)
1. Open **Windows Defender Firewall with Advanced Security**
2. Click **Inbound Rules** → **New Rule**
3. Select **Port** → **Next**
4. Select **TCP** and enter **3000** → **Next**
5. Select **Allow the connection** → **Next**
6. Check all network types → **Next**
7. Name it "CareCloud MBO Port 3000" → **Finish**

## Step 3: Start the Application for Network Access

### Development Mode (For Testing)
```powershell
cd "c:\Users\gulsherzahid\Documents\MBO\bolt 02"
npm run dev:network
```

### Production Mode (For Company Use)
```powershell
cd "c:\Users\gulsherzahid\Documents\MBO\bolt 02"
npm run build
npm run start:network
```

## Step 4: Share Access with Company Users

Once the application is running, share this information with your colleagues:

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
