import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { merge } from 'webpack-merge';

import commonConfig from './webpack.common.ts';

import type { Configuration as WebpackConfiguration } from 'webpack';
import type { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

const config: Configuration = merge(commonConfig, {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'babel-loader',

          options: {
            extends: './babel.config.json',
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  devServer: {
    proxy: [
      {
        context: ['/api', '/img'],
        target: 'http://127.0.0.1:7481',
        changeOrigin: true,
        secure: false,
      },
    ],
    hot: true,
    port: 7000,
    compress: false,
  },
  devtool: 'source-map',
  plugins: [new ReactRefreshWebpackPlugin(), new MiniCssExtractPlugin()],
});

export default config;
