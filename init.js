const config = require('./config.json');
const argv = require('minimist')(process.argv.slice(2));

if (argv.hasOwnProperty('module')) {
    switch(argv.module) { 
        case 'core':
            require('./modules/core.js');
        break;
        case 'api': 
            require('./modules/api.js');
        break;
        case 'reset':
            require('./modules/reset.js');
        break;
    }
}