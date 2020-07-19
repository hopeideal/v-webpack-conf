'use strict';

const path = require('path');
const glob = require('glob');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SpeedMeasureWebpackPlugin = require('speed-measure-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const autoprefixer = require('autoprefixer');

const devMode = process.env.NODE_ENV !== 'production';
const smp = new SpeedMeasureWebpackPlugin();

function setEntries() {
  const entries = {};
  const htmlWebpackPlugins = [];
  const entryFiles = glob.sync(path.join(__dirname, '../src/views/*/index.js'));
  entryFiles.forEach((item, index) => {
    const match = item && item.match(/src\/views\/(.*)\/index\.js$/);
    const viewName = match && match[1];
    entries[viewName] = item;
    htmlWebpackPlugins.push(
      new HtmlWebpackPlugin({
        inject: true,
        template: path.join(__dirname, `../public/index.html`),
        // filename: `${viewName}.html`,
        // chunks: [viewName],
        // minify: {
        //   html5: true,
        //   collapseWhitespace: true,
        //   preserveLineBreaks: false,
        //   minifyCSS: true,
        //   minifyJS: true,
        //   removeComments: false,
        // },
      })
    );
  });

  return {
    entries,
    htmlWebpackPlugins,
  };
}

const { entries, htmlWebpackPlugins } = setEntries();

module.exports = smp.wrap({
  entry: entries,
  output: {
    path: path.join(__dirname, '../dist'),
    filename: devMode ? '[name]-[hash:8].js' : '[name]-[chunkhash:8].js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        include: [path.resolve(__dirname, '../src')],
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: process.env.NODE_ENV === 'development',
            },
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
        ],
      },
      {
        test: /\.(sc|sa)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: true,
              hmr: process.env.NODE_ENV === 'development',
            },
          },
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: [autoprefixer],
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.(jpg|jpeg|png|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]_[hash:6].[ext]',
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]_[hash:8].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    // new HtmlWebpackPlugin({
    //   inject: true,
    //   template: path.join(__dirname, '../public/index.html'),
    // }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // all options are optional
      filename: devMode ? '[name].css' : '[name].[contenthash:8].css',
      chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
    }),
    new FriendlyErrorsWebpackPlugin(),
    new BundleAnalyzerPlugin(),
    function () {
      this.hooks.done.tap('done', (stats) => {
        // if (stats.compilation.erros && stats)
      });
    },
  ].concat(htmlWebpackPlugins),
  optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
    runtimeChunk: {
      name: 'manifest',
    },
    splitChunks: {
      chunks: 'all',
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
});
