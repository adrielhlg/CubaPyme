const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
	  bundle1 : './js/super.js',
	  bundle2 : './js/product.js',
	  bundle3 : './js/registerUser.js',
	  
  }, // Ruta del archivo JavaScript principal de tu aplicación Cordova
  mode : 'production',
  
  output: {
    filename: '[name].js', // Utilizamos [name] para que Webpack use el nombre de entrada como nombre de salida
    path: path.resolve(__dirname, 'www/js'), // Carpeta de salida donde se generará el archivo bundle.js
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'www/index.html', // Ruta al archivo HTML de tu aplicación
      minify: {
        collapseWhitespace: true, // Minificar el HTML
      },
    }),
  ],
};


