const { getDefaultConfig: getExpoDefaultConfig } = require('expo/metro-config');
const { mergeConfig } = require('metro-config');
const { getDefaultConfig } = require('@react-native/metro-config');

// Get the default Expo configuration
const expoConfig = getExpoDefaultConfig(__dirname);

// Add custom asset extensions
expoConfig.resolver.assetExts.push('db', 'wasm');

// Disable package exports
expoConfig.resolver.unstable_enablePackageExports = false;

// Add polyfills
expoConfig.resolver.extraNodeModules = {
  crypto: require.resolve('crypto-browserify'),
  stream: require.resolve('readable-stream'),
  buffer: require.resolve('@craftzdog/react-native-buffer'),
  process: require.resolve('process/browser'),
  fs: require.resolve('react-native-fs'),
  path: require.resolve('path-browserify'),
  http: require.resolve('stream-http'),
  https: require.resolve('https-browserify'),
  os: require.resolve('os-browserify/browser'),
  url: require.resolve('url/'),
  zlib: require.resolve('browserify-zlib'),
  net: require.resolve('react-native-tcp-socket'),
  tls: require.resolve('react-native-tcp-socket'),
  'copy-anything': require.resolve('copy-anything'),
};

// Transformer configuration
expoConfig.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Block backend files
expoConfig.resolver.blockList = [
  /backend\/.*/,
  /node_modules\/.*\/node_modules\/react-native\/.*/,
];

// Get the default React Native configuration
const defaultConfig = getDefaultConfig(__dirname);

// Merge the configurations
const mergedConfig = mergeConfig(defaultConfig, expoConfig);

module.exports = mergedConfig;
