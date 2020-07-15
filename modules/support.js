const config = require('../config.json');
const mysql = require('mysql');
const knex = require('knex')({
    client: 'mysql',
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

module.exports = {
    getTx,
    getAddress,
    getAddressTotal,
    genRichlistSCP,
    getInfoBlock
}