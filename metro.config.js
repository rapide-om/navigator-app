/**
 * Metro configuration for React Native
 * https://facebook.github.io/metro/docs/configuration
 */
const { getDefaultConfig } = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

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
        /.*\/android\/build\/.*/,
        /.*\/android\/\.gradle\/.*/,
        /.*\/android\/app\/build\/.*/,
        /.*\/android\/.*\/build\/.*/,
        /.*\/ios\/build\/.*/,
        /.*\/ios\/Pods\/.*/,
        /.*\/node_modules\/.*\/android\/build\/.*/,
        /.*\/node_modules\/.*\/ios\/build\/.*/,
      ]),
    },
  };
})();
