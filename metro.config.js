const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Adiciona as extensões .db e .wasm à lista de assets
config.resolver.assetExts.push('db', 'wasm');

// Desabilita package exports que causam o erro de require
config.resolver.unstable_enablePackageExports = false;

// Configura polyfills necessários
config.resolver.extraNodeModules = {
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

  // 🔧 Corrige erro do Metro com 'copy-anything'
  'copy-anything': require.resolve('copy-anything'),
};


// Configurações de transformação
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Ignora arquivos do backend no bundle do frontend
config.resolver.blockList = [
  /backend\/.*/,
  /node_modules\/.*\/node_modules\/react-native\/.*/,
];

module.exports = config;