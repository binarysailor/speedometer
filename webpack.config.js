const path = require('path');

module.exports = {
    entry: './src/meters.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'meters.bundle.js'
    }
};
