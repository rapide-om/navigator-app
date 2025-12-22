/**
 * Metro configuration for React Native
 * https://facebook.github.io/metro/docs/configuration
 */
const { getDefaultConfig } = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const path = require('path');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  // Optional: keep SVG or other asset handling here if your project uses it.
  return {
    ...config,
    transformer: {
      ...config.transformer,
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
    resolver: {
      ...config.resolver,
      assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...config.resolver.sourceExts, 'svg'],
      // Exclude build directories from being watched
      blockList: exclusionList([
        // Android build directories
        /.*\/android\/build\/.*/,
        /.*\/android\/\.gradle\/.*/,
        /.*\/android\/app\/build\/.*/,
        /.*\/android\/.*\/build\/.*/,
        // CMake build directories (fix for ENOENT watch error)
        /.*\/android\/app\/\.cxx\/.*/,
        /.*\/\.cxx\/.*/,
        // iOS build directories
        /.*\/ios\/build\/.*/,
        /.*\/ios\/Pods\/.*/,
        // Node modules build directories
        /.*\/node_modules\/.*\/android\/build\/.*/,
        /.*\/node_modules\/.*\/ios\/build\/.*/,
      ]),
      // Resolve Node.js modules to React Native equivalents
      extraNodeModules: {
        ...config.resolver?.extraNodeModules,
        // Replace ws (Node.js WebSocket) with React Native's native WebSocket
        'ws': path.resolve(__dirname, 'ws-shim.js'),
      },
    },
    watchFolders: [path.resolve(__dirname)],
    // Explicitly ignore certain paths from the watcher
    watcher: {
      ...config.watcher,
      watchman: {
        ...config.watcher?.watchman,
        deferStates: ['hg.update'],
      },
      healthCheck: {
        enabled: true,
        interval: 10000,
        timeout: 5000,
      },
    },
  };
})();
