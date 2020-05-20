const sia = require('siaprime.js');
const config = require('./config.json');
const mysql = require('mysql');
const knex = require('knex')({
    client: 'mysql',
    connection: {
        host: config.sql.ip,
        user: config.sql.user,
        password: config.sql.pass,
        database: config.sql.database
    }
});
const express = require('express');
const app = express();
const cors = require('cors');

function createBlockTable() {
    return knex.schema
        .createTable('blocks', function (table) {
            table.string('height').primary();
            table.string('hash');
            table.string('difficulty');
            table.string('estimatedhashrate');
            table.string('maturitytimestamp');
            table.string('totalcoins');
            table.string('minerpayoutcount');
            table.string('transactioncount');
            table.string('siacoininputcount');
            table.string('siacoinoutputcount');
            table.string('filecontractcount');
            table.string('filecontractrevisioncount');
            table.string('storageproofcount');
            table.string('siafundinputcount');
            table.string('siafundoutputcount');
            table.string('minerfeecount');
            table.string('arbitrarydatacount');
            table.string('transactionsignaturecount');
            table.string('activecontractcost');
            table.string('activecontractcount');
            table.string('activecontractsize');
            table.string('totalcontractcost');
            table.string('totalcontractsize');
            table.string('totalrevisionvolume');
        })
        .createTable('transactions', function (tx) {
            tx.string('block_height');
            tx.string('tx_hash');
            tx.string('parent_block');
            tx.string('tx_type');
            tx.string('tx_total');
            tx.string('fees');
            tx.string('timestamp');
        })
        .then((created) => {
            console.log(created)
        })
}

async function startUp() {  // the main function ran when script is started
    let hasBlockTable = await knex.schema.hasTable("blocks"); // check to see if block table exists
    if (hasBlockTable == false) {  // if not
        createBlockTable().then((woo) => { // create our tables
            startSync('0'); // start sync from 0
        })
    } else { // if it does
        let counter = await knex('blocks').count({ height: 'height' }); // get total amount of rows from sql
        let height = JSON.parse(JSON.stringify(counter[0].height)); // parse the json, retreive height variable
        startSync(height); // start syncing from total row height (last block in sql)
    }
}

// seems stuff during this interval loop. 74953. 
// fetches same blocks over and over. not sure why it happened yet.

startUp(); // run the damn thing when you launch.
setInterval(startUp, 120000); // run it every so often to catch new blocks

var scprimecoinprecision = 1000000000000000000000000000;
var baseCoinbase = 300;

function startSync(startHeight) { // start synchronizing blocks from startHeight
    sia.connect(config.daemon.ip + ':' + config.daemon.port) // connect to daemon
        .then((spd) => { // now that we're connected.. 
            spd.call('/consensus') // get consensus data
                .then((consensus) => { // with that data..
                    var topHeight = consensus.height; // we want to know the current height of the blockchain
                    console.log('startHeight: ', startHeight);
                    console.log('topHeight: ', topHeight);
                    if ((startHeight - 1) == topHeight) { // if our startheight (minus one, because we counted all the rows and found ourselves 1 ahead of the blockchain), is equal to consensus height
                        console.log('heights are the same, taking a break');
                        return; // lets not do a damn thing at all.
                    }
                    getBlocks(spd, topHeight, startHeight); // lets start processing the blocks starting at startHeight until we reach topHeight
                })
                .catch((error) => {  // if there's an error. . . 
                    console.log(error);  // scream about it
                })
        })
}

function getBlockInfo(spd, blockNumber) { // begin to pull data for each blockNumber (block height)
    return new Promise((resolve, reject) => { // this puppy returns a promise!
        let number = parseInt(blockNumber); // make sure blockNumber is an integer (number, no decimals)
        spd.call({ // connect to siaprime daemon
            url: '/explorer/blocks/' + number, // at this url
            method: 'GET' // make a get request
        })
            .then((rawblock) => { // with the data we get
                resolve(rawblock); // send it back to the function who called it, when we get the data!
            })
    })
}

function getBlocks(spd, topHeight, startHeight) { // this function deserves a better name. gets block from sync, starts to process it.
    return new Promise(resolve => { // this puppy returns a promise
        (async () => { // make everything from this point forward asynchronous 
            let blockNumber = startHeight; // we start syncing from this height (last block in sql)
            do { // do all this stuff. . .
                await getBlockInfo(spd, blockNumber).then((blockInfo) => { // getblockinfo, and when we g et data
                    let transactions = blockInfo.block.transactions; // store all the block transactions in 1 temp variable                  
                    processTransaction(transactions, blockInfo.block.maturitytimestamp); // process the tx; add to sql here.
                    addToBlocks(blockInfo.block.height, blockInfo.block.blockid, blockInfo.block.difficulty, blockInfo.block.estimatedhashrate, blockInfo.block.maturitytimestamp, blockInfo.block.totalcoins, blockInfo.block.minerpayoutcount, blockInfo.block.transactioncount, blockInfo.block.siacoininputcount, blockInfo.block.siacoinoutputcount, blockInfo.block.filecontractcount, blockInfo.block.filecontractrevisioncount, blockInfo.block.storageproofcount, blockInfo.block.siafundinputcount, blockInfo.block.siafundoutputcount, blockInfo.block.minerfeecount, blockInfo.block.arbitrarydatacount, blockInfo.block.transactionsignaturecount, blockInfo.block.activecontractcost, blockInfo.block.activecontractcount, blockInfo.block.activecontractsize, blockInfo.block.totalcontractcost, blockInfo.block.totalcontractsize, blockInfo.block.totalrevisionvolume).then((added) => console.log(added)).catch((err) => console.log(err)); // add to block sql
                });
                blockNumber++; // increase block counter in do/while statement
            } while (blockNumber <= topHeight) // but only do it while blockNumber is less than or equal to our consensus height.
        })(); // end of the async function
    })
        .catch((error) => { console.log(error) }) // cry about errors
}

function processTransaction(transactions, timestamp) { // appropriately named function.
    let minerFees = 0; // set minerFees to zero
    let txType = ''; // allows us to use the txType variable anywhere in this function

    for (t = 0; t < transactions.length; t++) { // for each transaction. . .
        let txTotal = 0; // set the tx total sent to 0;
        if (transactions[t].rawtransaction.minerfees != undefined) { // if the tx has miner fees..
            let fee = Number(transactions[t].rawtransaction.minerfees); // make sure they're number not string
            minerFees += fee; // add them all together.
        }
        if ((transactions[t].rawtransaction.minerfees).length === 0) { // if minerfees does not have anything in it
            minerFees = 0; // set fee to zero
        }
        if ((transactions[t].rawtransaction.siacoininputs).length === 0) { // if siacoinputs is empty
            txType = 'coinbase'; // assume it's a coinbase tx. coinbase tx is 300 scp per block but goes down 0.001 per block
            if (transactions[t].height < 290000) { // so when we get to this height, there's a base of 10scp per block
                txTotal = baseCoinbase - (transactions[t].height * 0.001); // until then, do the math right.
            } else { // otherwise.. 
                txTotal = 10; // set the reward to flat 10 scp
            }
        } else { // if siacoininputs contains stuff..
            if ((transactions[t].rawtransaction.siacoinoutputs).length === 0) { 
                txType = 'hostAnn';
            } else {
            txType = 'tx'; // mark it as a transaction
            }
            for (tt = 0; tt < transactions[t].rawtransaction.siacoinoutputs.length; tt++) {  // for each siacoinoutput. . 
                txTotal += transactions[t].rawtransaction.siacoinoutputs[tt].value / scprimecoinprecision; // lets save how much each tx had in it
            }
        }
        addToTransactions(transactions[t].height, transactions[t].id, transactions[t].parent, txType, txTotal, minerFees / scprimecoinprecision, timestamp * 1000); // then add it to sql.
    }
}

function addToBlocks(height, hash, difficulty, estimatedhashrate, maturitytimestamp, totalcoins, minerpayoutcount, transactioncount, siacoininputcount, siacoinoutputcount, filecontractcount, filecontractrevisioncount, storageproofcount, siafundinputcount, siafundoutputcount, minerfeecount, arbitrarydatacount, transactionsignaturecount, activecontractcost, activecontractcount, activecontractsize, totalcontractcost, totalcontractsize, totalrevisionvolume) { // appropriately named function
    console.log('attempting to add ' + height + ' to database');
    return knex('blocks').insert({
        height: height,
        hash: hash,
        difficulty: difficulty,
        estimatedhashrate: estimatedhashrate,
        maturitytimestamp: maturitytimestamp,
        totalcoins: totalcoins,
        minerpayoutcount: minerpayoutcount,
        transactioncount: transactioncount,
        siacoininputcount: siacoininputcount,
        siacoinoutputcount: siacoinoutputcount,
        filecontractcount: filecontractcount,
        filecontractrevisioncount: filecontractrevisioncount,
        storageproofcount: storageproofcount,
        siafundinputcount: siafundinputcount,
        siafundoutputcount: siafundoutputcount,
        minerfeecount: minerfeecount,
        arbitrarydatacount: arbitrarydatacount,
        transactionsignaturecount: transactionsignaturecount,
        activecontractcost: activecontractcost,
        activecontractcount: activecontractcount,
        activecontractsize: activecontractsize,
        totalcontractcost: totalcontractcost,
        totalcontractsize: totalcontractsize,
        totalrevisionvolume: totalrevisionvolume
    })
}

function addToTransactions(height, hash, parent, type, total, fees, timestamp) { // add to transactions table
    console.log('attempting to add tx ' + hash + ' to database');
    return knex('transactions').insert({
        block_height: height,
        tx_hash: hash,
        parent_block: parent,
        tx_type: type,
        tx_total: total,
        fees: fees,
        timestamp: timestamp
    }).then((results) => {
        console.log(results)
    }).catch(error => console.log(error))
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
/* all my shit has this block when you start it up. :) */
app.listen(config.api.port, () => {
    console.log('# # # # # # # # # # # # # # # # # # # # # #');
    console.log('# - - - - - - - S C P R I M E - - - - - - #');
    console.log('# - - - B L O C K - E X P L O R E R - - - #');
    console.log('# - - - - B Y - C A M T H E G E E K - - - #');
    console.log('# - - I S - B O O T I N G - U P - O N - - #');
    console.log('# - - - - - - P O R T - ' + config.api.port + ' - - - - - - #');
    console.log('# # # # # # # # # # # # # # # # # # # # # #');
});
/* when a user navigates to site.tld/ */
app.get('/', (req, res) => {
    res.json({
        "test": "fail"
    });
});
/* api route for block info */
app.get('/api/block/:id', (req, res) => {
    getInfoBlock(req.params.id).then((block) => {
        var block = block[0];
        res.json({
            "height": block.height,
            "hash": block.hash,
            "difficulty": block.difficulty,
            "estimatedhashrate": block.estimatedhashrate,
            "maturitytimestamp": block.maturitytimestamp,
            "totalcoins": block.totalcoins,
            "minerpayoutcount": block.minerpayoutcount,
            "transactioncount": block.transactioncount,
            "siacoininputcount": block.siacoininputcount,
            "siacoinoutputcount": block.siacoinoutputcount,
            "filecontractcount": block.filecontractcount,
            "filecontractrevisioncount": block.filecontractrevisioncount,
            "storageproofcount": block.storageproofcount,
            "siafundinputcount": block.siafundinputcount,
            "siafundoutputcount": block.siafundoutputcount,
            "minerfeecount": block.minerfeecount,
            "arbitrarydatacount": block.arbitrarydatacount,
            "transactionsignaturecount": block.transactionsignaturecount,
            "activecontractcost": block.activecontractcost,
            "activecontractcount": block.activecontractcount,
            "activecontractsize": block.activecontractsize,
            "totalcontractcost": block.totalcontractcost,
            "totalcontractsize": block.totalcontractsize,
            "totalrevisionvolume": block.totalrevisionvolume
        });
    })
});

function getTx(tx) {
    return new Promise(resolve => {
        resolve(knex('transactions').where('tx_hash', tx).select('*'));
    })
}
function getAddress(address) {  // fetch the address from the database -- probably will return more than one result.
    return new Promise(resolve => {
        resolve(knex('addresses').where('address', address).select('*'));
    })
}
/* api route for tx info */
app.get('/api/tx/:id', (req, res) => {
    getTx(req.params.id)
        .then((results) => {
            res.json({
                "height": results[0].block_height,
                "hash": results[0].tx_hash,
                "parent": results[0].parent_block,
                "txType": results[0].tx_type,
                "txTotal": results[0].tx_total,
                "minerFees": results[0].fees,
                "timestamp": results[0].timestamp
            });
        })

});
/* api route for address info */
app.get('/api/address/:addr', (req, res) => {
    res.json({
        "test": "fail"
    });
});
/* api route for contract info */
app.get('/api/contract/:contract', (req, res) => {
    res.json({
        "test": "fail"
    });
});