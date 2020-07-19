'use strict';

const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config.base');

module.exports = merge(baseConfig, {
  mode: 'development',
  devtool: '#@cheap-source-map',
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    hot: true,
    open: true,
    stats: {
      colors: true,
    },
    compress: true,
  },
});
