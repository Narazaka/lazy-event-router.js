require('babel-core/register');

import webpack from 'webpack';

export default {
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
      },
      {
        test: /\.json$/,
        loader: 'json',
      },
    ],
  },
  entry: {
    'routable-component': './src/lib/routable-component.js',
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
    publicPath: '/dist',
    library: 'routableComponent',
    libraryTarget: 'var',
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
//    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
  ],
  resolve: {
    alias: {
      'eventEmitter/EventEmitter': 'wolfy87-eventemitter/EventEmitter',
    },
  },
};
