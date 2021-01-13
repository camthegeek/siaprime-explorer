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

console.log('Market data saver is now online')

function createMarketTable() {
    return knex.schema
    .createTable('markets', function(m) {
        m.string('timestamp');
        m.string('btc_value');
        m.string('usd_value');
        m.string('eur_value');
        m.string('vol_btc');
        m.string('vol_usd');
        m.string('vol_eur');
    })
    .then((created) => {
        console.log(created)
    })
    .catch((error) => {
        console.log(error);
    })
}

async function startUp() {  // the main function ran when script is started
    console.log('['+new Date()+'] Updating values..') // verbosely let us know what's up
    let hasMarketTable = await knex.schema.hasTable("markets"); // check to see if block table exists
    if (hasMarketTable == false) {  // if not
        createMarketTable().then((created) => { // create tables
            getValues(); // then fill tables
        })
    } else { // if tables do exist..
        getValues(); // keep filling!
    }
}

// first we pull the data
async function getValues() {
    request('https://api.coingecko.com/api/v3/coins/siaprime-coin') // fetching directly from coingecko
    .then((data) => {
        data = JSON.parse(data); // just incase it returns as string, we'll parse as JSON.
        let timestamp = +new Date(); // timestamp = now.
        let btcv = data.market_data.current_price.btc; // save btc value as var
        let usdv = data.market_data.current_price.usd; // save usd value as var
        let eurv = data.market_data.current_price.eur; // save eur value as var
        let vol_btc = data.market_data.total_volume.btc; // save btc volume as var 
        let vol_usd = data.market_data.total_volume.usd; // save usd volume as var
        let vol_eur = data.market_data.total_volume.eur // save eur volume as var
        saveValues(timestamp, btcv, usdv, eurv, vol_btc, vol_usd, vol_eur) // send vars to be saved
        .then((saved) => {
            console.log('Values updated'); // let us know if saved
            setTimeout(startUp, 300000); // do it again 5 minutes later (300000ms)
        })
        .catch((err) => {
            console.log(err); // cry if there's an issue
        })
    })
}

// then we save the data
async function saveValues(ts, btc, usd, eur, vol_btc, vol_usd, vol_eur) { // take vars from previous function
    return new Promise((resolve) => {
        return knex('markets').insert({ // stuff them into sql
            timestamp: ts,
            btc_value: btc,
            usd_value: usd,
            eur_value: eur,
            vol_btc: vol_btc,
            vol_usd: vol_usd,
            vol_eur: vol_eur
        })
        .then((res) => {
            resolve('true'); // let us know it's done
        })
        .catch((error) => {
            console.log(error); // or cry about it.
        }) 
    })
}

startUp(); // most important thing ever. make sure the stuff runs when you run it!