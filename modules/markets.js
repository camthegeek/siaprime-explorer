const config = require('../config.json');
const mysql = require('mysql');
const pg = require('pg');
const knex = require('knex')({
    client: 'postgresql',
    connection: {
        host: config.sql.ip,
        user: config.sql.user,
        password: config.sql.pass,
        database: config.sql.database
    },              // not sure we need this pool area
    pool: {         // we need to setup tests on this soon
        min: 2,
        max: 25,
        propagateCreateError: false // <- default is true, set to false
    },
});
const request = require('request-promise');
const { attachOnDuplicateUpdate } = require('knex-on-duplicate-update');
attachOnDuplicateUpdate();
const cors = require('cors'); // I added cors just in case it's ever needed.. but thinking we don't need it, ever.

console.log('markets online')

function createMarketTable() {
    return knex.schema
    .createTable('markets', function(m) {
        m.string('timestamp');
        m.string('btc_value');
        m.string('usd_value');
        m.string('eur_value');
    })
    .then((created) => {
        console.log(created)
    })
    .catch((error) => {
        console.log(error);
    })
}

async function startUp() {  // the main function ran when script is started
    let hasMarketTable = await knex.schema.hasTable("markets"); // check to see if block table exists
    if (hasMarketTable == false) {  // if not
        createMarketTable().then((created) => { // create tables
            getValues(); // then fill tables
        })
    } else { // if it does
        getValues(); // keep filling!
    }
}

// first we pull the data
async function getValues() {
    request('https://api.coingecko.com/api/v3/coins/siaprime-coin')
    .then((data) => {
        //console.log(data);
        data = JSON.parse(data);
        //console.log(data.market_data)
        let timestamp = +new Date();
        let btcv = data.market_data.current_price.btc;
        let usdv = data.market_data.current_price.usd;
        let eurv = data.market_data.current_price.eur;
        saveValues(timestamp, btcv, usdv, eurv)
        .then((saved) => {
            setTimeout(startUp, 300000);
        })
        .catch((err) => {
            console.log(err);
        })
    })
}


// then we save the data

async function saveValues(ts, btc, usd, eur) {
    return new Promise((resolve) => {

        return knex('markets').insert({
            timestamp: ts,
            btc_value: btc,
            usd_value: usd,
            eur_value: eur
    })
    .then((res) => {
        resolve('true');
    })
    .catch((error) => {
        console.log(error);
    })

})
}

startUp();