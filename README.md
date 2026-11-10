# Zikr-e-Ilahi

Urdu-first Quran, prayer-time, Qibla and tasbeeh web app with an Android APK build workflow.

## Web version
Open `Zikr-e-Ilahi-Home-and-Prayer-Location-Search.html` in a browser, or publish the repository with GitHub Pages.

## Build Android APK on GitHub
1. Open the repository on GitHub.
2. Select **Actions**.
3. Open **Build Zikr-e-Ilahi APK**.
4. Tap **Run workflow** on the main branch.
5. When the workflow completes, open its run and download the **Zikr-e-Ilahi-debug-apk** artifact.

The workflow creates a Capacitor Android project and builds a debug APK. A debug APK is for testing/sideloading; a signed release APK/AAB is needed for Play Store distribution.

## Local build
Requires Node.js 22, Java 21 and Android SDK:
```sh
npm install
npm run build
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

## Notes
- The complete Arabic Quran (Uthmani text) and Urdu Jalandhry translation are downloaded and validated at build time, then bundled inside the APK. Quran reading works offline after installation. No Quran audio is included.
- Prayer times and Qibla direction use AlAdhan; location search uses Photon with Nominatim fallback.
- Web notification timers are best-effort while the app is active. Reliable background Adhan alarms require native Android notification/alarm integration and device-specific testing.
- Verify prayer calculations against the local mosque timetable.
