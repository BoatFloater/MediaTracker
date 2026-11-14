module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '26',
        },
        modules: 'commonjs',
      },
    ],
    ['@babel/preset-typescript', { onlyRemoveTypeImports: false }],
  ],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ts', '.js', '.json'],
      },
    ],
    '@lingui/babel-plugin-lingui-macro',
    [
      'babel-plugin-inline-import',
      {
        extensions: ['.xml'],
      },
    ],
  ],
};
