const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Enable TurboModule interop for new architecture
config.resolver.unstable_enablePackageExports = true;

// Add support for resolving modules with extensions
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configure for new architecture
config.transformer.unstable_allowRequireContext = true;

module.exports = config;
