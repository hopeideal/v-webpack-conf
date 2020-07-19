'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
// process.env.PUBLIC_URL = ''

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
  throw err;
});

// Ensure environment variables are read.
// require('../config/env');

const webpack = require('webpack');
const express = require('express');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const openBrowser = require('react-dev-utils/openBrowser');
const clearConsole = require('react-dev-utils/clearConsole');
const { choosePort } = require('react-dev-utils/WebpackDevServerUtils');
const config = require('../config/webpack.config.dev');

const app = express();
const compiler = webpack(config);
const port = parseInt(process.env.PORT, 10) || 3000;
const host = process.env.HOST || '0.0.0.0';

app.use(
  webpackDevMiddleware(compiler, {
    // webpack-dev-middleware options
    noInfo: true,
  })
);
app.use(webpackHotMiddleware(compiler));
app.use(express.static(config.output.path));

let firstBuild = false;

choosePort(host, port).then((realPort) => {
  if (!port) {
    return;
  }
  app.listen(port);

  compiler.hooks.done.callAsync('done', () => {
    if (process.stdout.isTTY && !firstBuild) {
      clearConsole();
    }
    console.log(`\n==> 🌎  Listening on port ${realPort}. \n`);
    if (!firstBuild) {
      let url = `http://127.0.0.1:${realPort}`;
      openBrowser(url);
      firstBuild = true;
    }
  });
});
