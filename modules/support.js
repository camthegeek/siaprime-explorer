const config = require('../config.json');
const sia = require('siaprime.js');
const pg = require('pg');
const { async } = require('@babel/runtime/regenerator');
const axios = require('axios');
const knex = require('knex')({
    client: 'postgresql',
    connection: {
        host: config.sql.ip,
        user: config.sql.user,
        password: config.sql.pass,
        database: config.sql.database
    },              // not sure we need this pool area
    pool: {         // we need to setup tests on this soon
        min: 0,
        max: 25,
        propagateCreateError: false // <- default is true, set to false
    },
});

function getTx(tx) {
    return new Promise(resolve => {
        resolve(knex('transactions').where('tx_hash', tx).select('*'));
    })
}
function getAddress(address) {  // fetch the address from the database -- probably will return more than one result.
    return new Promise(resolve => {
        resolve(knex('address_history').where('address', address).select('*'));
    })
}
function getAddressTotal(address) {  // fetch the address from the database -- probably will return more than one result.
    return new Promise(resolve => {
        resolve(knex('address_totals').where('address', address).select('*'));
    })
}

/* this function needs to be titled generateRIchlist
 * it pulls from table: totals
*/
function genRichlistSCP(limit) {
    return new Promise(resolve => {
        resolve(knex('address_totals').select('*').orderBy('totalscp', 'desc').limit(limit));
    })
}

function getInfoBlock(id) { // this gets info on a block hash or height based on api URL
    return new Promise(resolve => { // this puppy returns a promise!
        if (id.length === 64) { // if input length is 64
            resolve(knex('blocks').where('hash', id).select('*')); // come back with hash results
        } else {
            resolve(knex('blocks').where('height', id).select('*')); // come back with height results
        }
    })
}

async function getTopBlock() {
    return new Promise((resolve) => { 
    sia.connect(config.daemon.ip + ':' + config.daemon.port) // connect to daemon
        .then((spd) => { // now that we're connected.. 
        spd.call('/consensus') // get consensus data
        .then((consensus) => { // with that data..
            //var topHeight = 100; // purely for testing
            resolve(consensus.height); // we send the current height of the blockchain
        })
    })
})
}

async function getLastIndexed() {
    let counter = await knex('blocks').count({ height: 'height' }); // get total amount of rows from sql
    let height = JSON.parse(JSON.stringify(counter[0].height)); // parse the json, retreive height variable
    return new Promise((resolve) => { 
    resolve(height-1); 
})
}

async function getAddressesBetweenBlocks(start, end) { 
    // get addresses that received coin between height_start and height_End
    let data = await knex('address_history').whereBetween('height', [start, end]);
    return new Promise((resolve) => { 
       
        resolve(JSON.parse(JSON.stringify(data)));
    })
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function resetDatabase() {
    return new Promise((resolve) => {
        resolve(knex.schema.dropTableIfExists('blocks').dropTableIfExists('transactions').dropTableIfExists('address_history').dropTableIfExists('address_totals').dropTableIfExists('hostAnnInfo').dropTableIfExists('contractInfo').dropTableIfExists('contractResolutions').dropTableIfExists('revisionInfo').dropTableIfExists('storageProofInfo'));
    })
}

async function getCoinValue() { 
    return new Promise((resolve) => { 
        axios.get('https://api.coingecko.com/api/v3/simple/price?ids=siaprime-coin&vs_currencies=usd%2Cbtc%2Ceur&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=false')
        .then((market) => {
            console.log(market.data['siaprime-coin']);
            resolve(market.data['siaprime-coin']);
        })
        .catch((eeee) => {
            console.log(eeee);
        })
    })
}

async function getNetworkInfo() {
    return new Promise((resolve) => {
        sia.connect(config.daemon.ip + ':' + config.daemon.port) // connect to daemon
            .then((spd) => { // now that we're connected.. 
                spd.call('/consensus') // get consensus data
                    .then((consensus) => { // with that data..
                        var returnData = {
                            height: consensus.height,
                            difficulty: Number(consensus.difficulty),
                            blockfrequency: consensus.blockfrequency,
                            genesisTimestamp: consensus.genesistimestamp,
                            cummulativeStorage: 0,
                            availableStorage: 0
                        }
                        spd.call('/hostdb/active')
                            .then((hostdata) => {
                                let hosts = hostdata.hosts;
                                returnData.hostCount = hosts.length;
                                for (var i = 0; i < hosts.length; i++) {
                                    returnData.availableStorage += hosts[i].remainingstorage;
                                    returnData.cummulativeStorage += hosts[i].totalstorage;
                                }
                                resolve(returnData);
                            })
                    })
            })
    })
}

async function getLast(amount, type) { 
    return new Promise((resolve) => {
        switch(type) {
            case 'blocks': 
                resolve(knex('blocks').select('*').orderBy('height', 'desc').limit(amount));
            break;
            case 'tx':
                resolve(knex('transactions').select('*').orderBy('block_height', 'desc').limit(amount));
            break;
        }        
    })
}

module.exports = {
    getTx,
    getAddress,
    getAddressTotal,
    genRichlistSCP,
    getInfoBlock,
    getTopBlock,
    getLastIndexed,
    getAddressesBetweenBlocks,
    formatBytes,
    resetDatabase,
    getNetworkInfo,
    getCoinValue,
    getLast
}