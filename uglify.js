const fs = require('fs');
const path = require('path');
const UglifyJS = require('uglify-js');

const wwwPath = path.join(__dirname, 'www');

const options = {
  mangle: {
    eval: true,
  },
  compress: {
    drop_console: true,
  },
};

function minifyFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const minified = UglifyJS.minify(code, options);
  fs.writeFileSync(filePath, minified.code, 'utf8');
}

function processDirectory(directoryPath) {
  fs.readdirSync(directoryPath).forEach((file) => {
    const fullPath = path.join(directoryPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (path.extname(fullPath) === '.js') {
      minifyFile(fullPath);
    }
  });
}

processDirectory(wwwPath);
