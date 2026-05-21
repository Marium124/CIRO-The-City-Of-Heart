/**
 * Expo Dynamic Config
 * Reads sensitive keys from environment variables / EAS Secrets
 * so they never get committed to git.
 * 
 * The GOOGLE_MAPS_API_KEY must be set as an EAS Secret:
 *   npx eas-cli secret:create --name GOOGLE_MAPS_API_KEY --value <your-key>
 */

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

module.exports = {
  expo: {
    name: "CIRO",
    slug: "crisis-response-app",
    version: "1.0.2",
    sdkVersion: "54.0.0",
    orientation: "portrait",
    userInterfaceStyle: "dark",
    assetBundlePatterns: ["**/*"],
    updates: {
      enabled: false,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.ciro.crisisresponse",
    },
    android: {
      package: "com.ciro.crisisresponse",
      versionCode: 3,
      adaptiveIcon: {
        backgroundColor: "#1A1A2E",
      },
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
      ],
      ...(GOOGLE_MAPS_KEY ? {
        config: {
          googleMaps: {
            apiKey: GOOGLE_MAPS_KEY,
          },
        },
      } : {}),
    },
    extra: {
      eas: {
        projectId: "94affc3c-076c-42ea-ac2d-b5a3146c992c",
      },
    },
    owner: "theorchestrators",
  },
};
