# Complete Rebuild Instructions

The polyfills have been added but you need to rebuild the app for them to take effect.

## Option 1: Quick Rebuild (Recommended)

```bash
# 1. Kill Metro bundler if running
# Press Ctrl+C in the Metro terminal

# 2. Clear Metro cache
yarn start --reset-cache
# Leave this running in one terminal

# 3. In a NEW terminal, uninstall and reinstall the app
adb uninstall io.fleetbase.navigator
yarn android
```

## Option 2: Full Clean Rebuild (If Option 1 doesn't work)

```bash
# 1. Clean everything
cd android
./gradlew clean
cd ..

# 2. Clear all caches
rm -rf android/app/build
rm -rf android/build
rm -rf /tmp/metro-*
rm -rf /tmp/haste-*
rm -rf node_modules/.cache

# 3. Start Metro with clean cache
yarn start --reset-cache
# Leave this running

# 4. In a NEW terminal, rebuild
yarn android
```

## Why This Is Needed

- React Native bundles JavaScript at build time
- The polyfills.js file needs to be included in the bundle
- Metro cache and APK need to be cleared to include the new file
- Simply reloading the app (shake menu -> Reload) won't work because the bundle doesn't include the polyfills yet

## After Rebuild

Test these scenarios:
1. ✅ Disconnect USB cable
2. ✅ Open app without GPS enabled - should work (no setImmediate error)
3. ✅ Enable GPS and use app normally
