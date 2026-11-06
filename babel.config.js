module.exports = function (api) {
  api.cache(true);
  const plugins = [
    'react-native-worklets/plugin',
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './',
          '@assets': './assets',
        },
      },
    ],
  ];

  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel'
    ],
    plugins,
  };
};