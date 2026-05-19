# Migrate Mobile App to Expo

The current `c:\ciro\mobile-app` project is set up as a bare React Native project, not an Expo project. Since you've installed Expo Go on your mobile device, we need to convert the project to an Expo project so you can successfully run it and scan the QR code.

## User Review Required

> [!IMPORTANT] The current mobile app was initialized as a standard React Native CLI project. Since there's no `android` or `ios` folder present, it's currently incomplete and won't build natively either. Converting to Expo is the best path forward to get you up and running quickly with Expo Go.

## Proposed Changes

### `c:\ciro\mobile-app`

#### [MODIFY] `package.json`

- Add `expo` dependency.
- Update start scripts to use Expo (`"start": "expo start"`).
- Replace `react-native-geolocation-service` with `expo-location`.
- Replace `react-native-vector-icons` with `@expo/vector-icons`.

#### [MODIFY] `babel.config.js`

- Change the Babel preset from `module:metro-react-native-babel-preset` to `babel-preset-expo`.

#### [MODIFY] `app.json`

- Wrap the configuration in an `"expo": {}` object and add a `"slug"` field so Expo can register it properly.

#### [MODIFY] `App.tsx` & `src/screens/*`

- Update all imports of `react-native-vector-icons` to use `@expo/vector-icons`.
- Update any geolocation logic to use `expo-location` instead of the bare React Native module.

## Verification Plan

### Automated Tests

- Run `npm install` to ensure the new Expo dependencies resolve successfully.

### Manual Verification

- We will start the Expo development server (`npx expo start`).
- You will scan the generated QR code with the Expo Go app on your Android device to verify the app loads.
