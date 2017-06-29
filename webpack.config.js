

module.exports = {
  entry: './app.js',

  output: {
    filename: 'index.js'
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        // exclude: /node_modules/,
        // include: /node_modules\/rxjs-es/,
        query: {
          presets: ['es2015']
        }
      }
    ]
  },

  resolve: {
    root: __dirname,
    modulesDirectories: ['node_modules', 'components']
  },

  plugins: [
  ],

  devtool: '#source-map'
};
