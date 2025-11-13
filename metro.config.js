const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Desabilita package exports que causam o erro de require
config.resolver.unstable_enablePackageExports = false;

// Configura polyfills necessários
config.resolver.extraNodeModules = {
  // Polyfills vazios para módulos Node.js não usados
  crypto: require.resolve('crypto-browserify'),
  stream: require.resolve('readable-stream'),
  buffer: require.resolve('@craftzdog/react-native-buffer'),
  process: require.resolve('process/browser'),
  // Módulos vazios para evitar erros
  fs: require.resolve('react-native-fs'),
  path: require.resolve('path-browserify'),
  http: require.resolve('stream-http'),
  https: require.resolve('https-browserify'),
  os: require.resolve('os-browserify/browser'),
  url: require.resolve('url/'),
  zlib: require.resolve('browserify-zlib'),
  net: require.resolve('react-native-tcp-socket'),
  tls: require.resolve('react-native-tcp-socket'),
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