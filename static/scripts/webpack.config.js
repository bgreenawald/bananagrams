const path = require('path');

module.exports = {
  entry: {
      board: './ts/board.ts',
      socket: './ts/socket.ts',
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts' ],
  },
  output: {
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'js'),
  },
};