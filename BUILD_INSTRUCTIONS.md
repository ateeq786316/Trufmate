# 🚀 TrufMate APK Build Instructions

## 📱 App Icon Configuration ✅

Your app icon (`trufmatepng.png`) has been configured for:
- **Main App Icon**: Used across all platforms
- **Splash Screen**: Appears when app launches
- **Android Adaptive Icon**: For modern Android devices
- **iOS Icon**: For iOS devices
- **Web Favicon**: For web version

## 🛠️ Building APK with Custom Icon

### Method 1: Using EAS Build (Recommended)

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure EAS Build**:
   ```bash
   eas build:configure
   ```

4. **Build APK**:
   ```bash
   # For preview/testing
   eas build --platform android --profile preview
   
   # For production
   eas build --platform android --profile production
   ```

### Method 2: Using Expo Build (Legacy)

1. **Build APK**:
   ```bash
   npm run build:android
   # or
   expo build:android
   ```

## 📋 Prerequisites

- ✅ Expo account
- ✅ EAS CLI installed
- ✅ App icon configured in `app.json` and `app.config.js`
- ✅ Android build profile configured

## 🔧 Configuration Files

- **`app.json`**: Basic Expo configuration
- **`app.config.js`**: Advanced configuration with permissions
- **`eas.json`**: EAS Build profiles
- **`assets/trufmatepng.png`**: Your custom app icon

## 📱 Icon Specifications

- **Format**: PNG (recommended)
- **Size**: 1024x1024 px (source)
- **Background**: Dark theme (#1A1A2E)
- **Design**: Sports-themed with football, soccer ball, and checkmark

## 🚨 Important Notes

1. **First Build**: May take 10-20 minutes
2. **Icon Processing**: Expo automatically generates all required sizes
3. **Testing**: Always test APK on device before distribution
4. **Updates**: Icon changes require a new build

## 📥 Download APK

After successful build:
1. Check your Expo dashboard
2. Download the generated APK
3. Install on Android device
4. Verify icon appears correctly

## 🆘 Troubleshooting

- **Icon not showing**: Ensure `trufmatepng.png` exists in `assets/` folder
- **Build fails**: Check Expo dashboard for error logs
- **Icon blurry**: Ensure source image is high resolution (1024x1024+)

## 🎯 Next Steps

1. Run your first build
2. Test APK on device
3. Verify icon appears correctly
4. Distribute to users

---

**Your TrufMate app is now ready to build with the custom sports-themed icon! 🏈⚽✅** 