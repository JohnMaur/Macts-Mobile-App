module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};

// module.exports = function(api) {
//   api.cache(true);
//   const presets = ['babel-preset-expo'];
//   const plugins = [];

//   if (process.env.REDUCED_MOTION === 'true') {
//     // Reduced Motion setting is enabled, disable Reanimated
//     console.log('Reduced Motion is enabled. Disabling Reanimated.');
//   } else {
//     // Reduced Motion setting is not enabled, include Reanimated plugin
//     plugins.push('react-native-reanimated/plugin');
//   }

//   return {
//     presets,
//     plugins,
//   };
// };
