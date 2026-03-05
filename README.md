# TPW GMS – Gym Management System

A React Native (Expo) app with TypeScript for gym member login and dashboard.

## Setup & Run

```bash
# Navigate into the project
cd tpw_gms

# Install dependencies (already done if you cloned this repo)
npm install

# Install Expo-specific packages
npx expo install react-native-screens react-native-safe-area-context expo-secure-store

# Install navigation
npm install @react-navigation/native @react-navigation/native-stack

# Start the Expo dev server
npx expo start

# buld the app in expo development version
eas build --profile preview --platform android
w
#build the app in expo production version
eas build --profile production --platform android

#build the app for web
npx expo export --platform web

Then press **a** for Android emulator, **i** for iOS simulator, or scan the QR code with the Expo Go app.

## Project Structure

```
tpw_gms/
├── App.tsx                          # Entry point, navigation & auth provider
├── app.json                         # Expo config (cleartext HTTP enabled)
├── src/
│   ├── api/
│   │   ├── config.ts                # Base URL & endpoint constants
│   │   ├── auth.ts                  # loginWithPassword()
│   │   └── member.ts                # fetchMemberLoginInfo()
│   ├── context/
│   │   └── AuthContext.tsx           # Auth state, login/logout, SecureStore
│   ├── screens/
│   │   ├── LoginScreen.tsx           # Username/password form
│   │   └── DashboardScreen.tsx       # Member info + attendance list
│   ├── components/
│   │   └── AttendanceItem.tsx        # Single attendance row (late highlight)
│   └── types/
│       └── api.ts                    # TypeScript interfaces
```

## Troubleshooting

- **HTTP connections refused**: The API uses `http://` (not HTTPS). ATS (iOS) and cleartext (Android) are configured in `app.json`. If using a development build, run `npx expo prebuild` to apply native config.
- **Network unreachable**: Ensure your device/emulator can reach `202.51.74.51:2222`. Check VPN/firewall settings.
- **Expo Go limitations**: Expo Go supports the cleartext config. If issues persist, use a development build (`npx expo run:android` / `npx expo run:ios`).
