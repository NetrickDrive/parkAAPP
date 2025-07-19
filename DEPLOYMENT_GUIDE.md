# ParkAPP Deployment Guide

## 🚀 Multiple Deployment Options

### **Option 1: Expo EAS Build (Recommended for Mobile)**

Creates standalone APK/IPA files that can be installed directly on devices.

#### Prerequisites:
1. Expo account (free)
2. EAS CLI installed

#### Steps:
```bash
# Login to Expo
npx eas login

# Build for Android (APK)
npx eas build --platform android --profile preview

# Build for iOS (IPA) - requires Apple Developer account
npx eas build --platform ios --profile preview
```

#### Benefits:
- ✅ Works offline (no internet needed after installation)
- ✅ Can be distributed via email, USB, or app stores
- ✅ Full native performance
- ✅ Camera and file system access

#### Distribution:
- **Android**: Share APK file directly
- **iOS**: Requires TestFlight or App Store (paid Apple Developer account)

---

### **Option 2: Expo Go (Development)**

Use Expo Go app for testing during development.

#### Steps:
```bash
# Start development server
npx expo start

# Scan QR code with Expo Go app
```

#### Benefits:
- ✅ Instant updates (no rebuild needed)
- ✅ Easy testing
- ❌ Requires internet connection
- ❌ Limited to Expo Go app

---

### **Option 3: Web Deployment (PWA)**

Deploy as a Progressive Web App that works on any device.

#### Steps:
```bash
# Build for web
npx expo export --platform web

# Deploy to any web hosting service:
# - Vercel (recommended)
# - Netlify
# - GitHub Pages
# - AWS S3
```

#### Benefits:
- ✅ Works on any device with a browser
- ✅ Can be installed as PWA
- ✅ Easy to update
- ❌ Limited camera/file access
- ❌ Requires internet

---

### **Option 4: Development Build**

Create a development build that includes Expo Go features but works as standalone app.

#### Steps:
```bash
# Create development build
npx eas build --profile development --platform android

# Install on device and use Expo Go features
```

---

## 🔧 Backend Deployment

### **Option A: Heroku (Recommended)**

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login and deploy
heroku login
heroku create parkapp-backend
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Set up PostgreSQL
heroku addons:create heroku-postgresql:mini
```

### **Option B: Railway**

1. Connect GitHub repository to Railway
2. Railway automatically detects Node.js app
3. Add PostgreSQL database
4. Deploy with one click

### **Option C: DigitalOcean App Platform**

1. Connect GitHub repository
2. Select Node.js environment
3. Add managed PostgreSQL database
4. Deploy

---

## 📱 Quick Start: Create Installable APK

### **Step 1: Prepare for Build**
```bash
cd mobile

# Update API URLs to production backend
# Edit all files to use your deployed backend URL instead of localhost:3001
```

### **Step 2: Build APK**
```bash
# Login to Expo (create account at expo.dev if needed)
npx eas login

# Build APK (this will take 10-15 minutes)
npx eas build --platform android --profile preview
```

### **Step 3: Download and Install**
1. EAS will provide a download link
2. Download APK to your phone
3. Enable "Install from unknown sources" in Android settings
4. Install the APK

---

## 🌐 Web Deployment (PWA)

### **Deploy to Vercel (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Build for web
npx expo export --platform web

# Deploy
vercel --prod
```

### **Deploy to Netlify**

```bash
# Build for web
npx expo export --platform web

# Drag and drop the 'web-build' folder to Netlify
```

---

## 🔄 Continuous Updates

### **For Mobile Apps:**
- **EAS Build**: Rebuild and redistribute APK/IPA
- **Expo Updates**: Push updates without rebuilding (requires development build)

### **For Web Apps:**
- Automatic updates when you push to GitHub
- Vercel/Netlify auto-deploy on git push

---

## 📋 Environment Configuration

### **Create Environment Files**

```bash
# mobile/.env
EXPO_PUBLIC_API_URL=https://your-backend-url.com

# backend/.env
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
PORT=3001
```

### **Update API URLs**

Replace all `http://localhost:3001` with your production backend URL in:
- `mobile/app/vehicle-entry.tsx`
- `mobile/app/vehicle-exit.tsx`
- `mobile/app/admin.tsx`
- `mobile/app/admin-login.tsx`

---

## 🎯 Recommended Approach

### **For Testing & Development:**
1. Use **Expo Go** for quick testing
2. Use **Development Build** for camera/file access testing

### **For Production:**
1. Deploy backend to **Heroku** or **Railway**
2. Build **APK** with EAS for Android distribution
3. Deploy **Web PWA** for universal access

### **For Continuous Development:**
1. Keep using Expo Go for development
2. Rebuild APK when major features are ready
3. Use web deployment for quick demos

---

## 🚨 Important Notes

1. **Backend URL**: Update all API calls to use your production backend
2. **Database**: Use PostgreSQL in production (not SQLite)
3. **Environment Variables**: Use proper environment configuration
4. **Permissions**: Ensure camera and storage permissions are configured
5. **Security**: Use HTTPS in production

---

## 📞 Next Steps

1. **Choose your deployment method**
2. **Deploy backend first**
3. **Update API URLs in mobile app**
4. **Build and distribute mobile app**
5. **Set up web deployment if needed**

Let me know which option you'd like to start with! 