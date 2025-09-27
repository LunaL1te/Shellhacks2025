module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }]
    ],
    plugins: [
      // Required for expo-router
      'expo-router/babel',
      // Support for React Native Reanimated (if needed)
      'react-native-reanimated/plugin',
    ],
  };
};
