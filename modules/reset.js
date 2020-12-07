const support = require('./support.js');
const config = require('../config.json');

support.resetDatabase()
    .then((success) => {
        console.log('Database dropped');
        process.exit(1)
    }).catch((error) => {
        console.log(error);
    })