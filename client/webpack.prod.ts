import { merge } from 'webpack-merge';
import CompressionPlugin from 'compression-webpack-plugin';

import commonConfig from './webpack.common.ts';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import type { Configuration } from 'webpack';

process.env['NODE_ENV'] = 'production';

const config: Configuration = merge(commonConfig, {
  mode: 'production',
  optimization: {
    minimize: true,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name]_[chunkhash:8].css',
      chunkFilename: '[name]_[chunkhash:8].css',
    }),
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      include: /\.(?:js|css)$/,
    }),
    new CompressionPlugin({
      filename: '[path][base].br',
      algorithm: 'brotliCompress',
      include: /\.(?:js|css)$/,
    }),
  ],
});

export default config;
