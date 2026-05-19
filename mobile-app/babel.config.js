module.exports = function (api) {
  const isWeb = api.caller((caller) => !!(caller && caller.platform === 'web'));
  return {
    presets: ['babel-preset-expo'],
    plugins: isWeb ? [] : ['react-native-worklets/plugin'],
  };
};
