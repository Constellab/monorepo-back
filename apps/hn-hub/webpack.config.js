const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/hn-hub'),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets', './src/environments'],
      optimization: false,
      outputHashing: 'none',
      sourceMap: true, // useful to make debugger work : https://github.com/nrwl/nx/issues/14708
    }),
  ],
};
