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
    },              // not sure we need this pool area
    pool: {         // we need to setup tests on this soon
        min: 0,
        max: 25,
        propagateCreateError: false // <- default is true, set to false
    },
});
const {attachOnDuplicateUpdate} = require('knex-on-duplicate-update'); 
attachOnDuplicateUpdate();
const express = require('express');
const app = express();
const cors = require('cors'); // I added cors just in case it's ever needed.. but thinking we don't need it, ever.
const Bottleneck = require('bottleneck');   // pending usage. 
const limiter = new Bottleneck({            // may be used at a later time. if not used when deployed, will be removed.
    minTime: 250,
    maxConcurrent: 2
});

function createBlockTable() {
    return knex.schema
        .createTable('blocks', function (table) {
            table.integer('height').primary();   // block.height
            table.string('hash', 64);   // block.blockid
            table.decimal('difficulty', 30, 0); // block.difficulty
            table.decimal('estimatedhashrate', 30, 0);  // block.estimatedhashrate
            table.bigInteger('maturitytimestamp');  // block.maturitytimestamp
            table.bigInteger('timestamp');  // block.rawblock.timestamp
            table.string('parentid', 64);   // block.rawblock.parentid
            table.decimal('totalcoins', 36, 0); // block.totalcoins
            table.integer('minerpayoutcount');   // block.minerpayoutcount
            table.integer('transactioncount');   // block.transactioncount
            table.integer('siacoininputcount');  // block.siacoininputcount
            table.integer('siacoinoutputcount'); // block.siacoinoutputcount
            table.integer('filecontractcount');  // block.filecontractcount
            table.integer('filecontractrevisioncount');  // block.filecontractrevisioncount
            table.integer('storageproofcount');  // block.storageproofcount
            table.integer('siafundinputcount');  // block.siafundinputcount
            table.integer('siafundoutputcount'); // block.siafundoutputcount
            table.decimal('minerfeecount', 36, 0);  // block.minerfeecount
            table.integer('arbitrarydatacount'); // block.arbitrarydatacount
            table.integer('transactionsignaturecount');  // block.transactionsiganturecount
            table.decimal('activecontractcost', 36, 0); // block.activecontractcost
            table.integer('activecontractcount'); // block.activecontractcount
            table.decimal('activecontractsize', 30, 0); // block.activecontractsize
            table.decimal('totalcontractcost', 36, 0);  // block.totalcontractcost
            table.decimal('totalcontractsize', 30, 0);  // block.totalcontractsize
            table.bigInteger('totalrevisionvolume');    // block.totalrevisionvolume
            table.string('minerarbitrarydata'); // too lazy to fill this in --cam 
        })
        .createTable('transactions', function (tx) {
            tx.integer('block_height');  // block.height
            tx.string('tx_hash', 64).primary();   // block.transactions.id
            tx.string('parent_block', 64); // block.trasactions.parent
            tx.string('tx_type', 10);
            tx.bigInteger('tx_total');  // block.transactions.rawtransaction.siacoinoutputs
            tx.decimal('fees', 36, 0);
            tx.bigInteger('timestamp'); // block.rawblock.timestamp
            /*tx.string('filecontractids');  // block.transactions.filecontractids
            tx.string('filecontractmissedproofoutputids');  // block.transactions.filecontractmissedproofoutputids
            tx.string('filecontractrevisionmissedproofoutputids');  // block.transactions.filecontractrevisionmissedproofoutputids
            tx.string('filecontractrevisionvalidproofoutputids');   // block.transactions.filecontractrevisionvalidproofoutputids
            tx.string('siacoininputoutputs');   // block.transactions.siacoininputoutputs
            tx.string('siacoinoutputids');  // block.transactions.siacoinoutputids
            tx.string('siafundclaimoutputids'); // block.transactions.siafundclaimoutputids
            tx.string('siafundinputoutputs');   // block.transactions.siafundinputoutputs
            tx.string('siafundoutputids');  // block.transactions.siafundoutputids
            tx.string('storageproofoutputids'); // block.transactions.storageproofoutputids
            tx.string('storageproofoutputs');   // block.transactions.storageproofoutputs*/
        })
        .createTable('address_history', function (addr) {
            addr.string('address', 76);
            addr.decimal('amount', 36, 0);
            addr.string('tx_hash', 64);
            addr.string('direction', 4);
            addr.string('type', 10);
            addr.integer('height');
            addr.index(['address','height'],'richlist');
        })
        .createTable('addressTotals', function (totals) {
            totals.string('address', 76).primary();
            totals.decimal('totalscp', 36, 0);
            totals.integer('totalspf');
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
        //let height = 42; // purely for testing
        startSync(height); // start syncing from total row height (last block in sql)
    }
}

// seems stuff during this interval loop. 74953. 
// fetches same blocks over and over. not sure why it happened yet.

startUp(); // run the damn thing when you launch.
setInterval(startUp, 60000); // run it every so often to catch new blocks

var scprimecoinprecision = 1000000000000000000000000000;
var baseCoinbase = 300;

function startSync(startHeight) { // start synchronizing blocks from startHeight
    sia.connect(config.daemon.ip + ':' + config.daemon.port) // connect to daemon
        .then((spd) => { // now that we're connected.. 
            spd.call('/consensus') // get consensus data
                .then((consensus) => { // with that data..
                    //var topHeight = 1400; // purely for testing
                    var topHeight = consensus.height; // we want to know the current height of the blockchain
                    // console.log('startHeight: ', startHeight);
                    // console.log('topHeight: ', topHeight);
                    if ((startHeight - 1) == topHeight) { // if our startheight (minus one, because we counted all the rows and found ourselves 1 ahead of the blockchain), is equal to consensus height
                        console.log('heights are the same, taking a break');
                        return; // lets not do a damn thing at all.
                    } else {
                    getBlocks(spd, topHeight, startHeight); // lets start processing the blocks starting at startHeight until we reach topHeight
                    }
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

async function getBlocks(spd, topHeight, startHeight) { // this function deserves a better name. gets block from sync, starts to process it.
    let blockNumber = startHeight; // we start syncing from this height (last block in sql)
    let ready = true;
    (async () => {
        try {
        if (blockNumber < topHeight) {
            for (i = 0; i < topHeight; i++) { // do all this stuff. . 
                if (ready == true) {
                    ready = false;
                    const blockInfo = await getBlockInfo(spd, blockNumber)
                            const parsed = await parseWholeBlock(blockInfo, blockNumber);
                            blockNumber++
                            ready = true;
                }
            }
        }
    } catch(error) {
        console.log(error);
    }
    })();
}

async function parseWholeBlock(blockInfo, height) {
    return new Promise((resolve) => {
        console.log('- - - - - - - -  - - - - - -  - - - - - - - -')
        console.log('processing starting on:', blockInfo.block.height);
        let transactions = blockInfo.block.transactions; // store all the block transactions in 1 temp variable
        let minerarbitrarydata = ''
        for (a = 0; a < transactions.length; a++) {
            if ((transactions[a].rawtransaction.arbitrarydata).length > 0) { // if arbitrary data has something
                minerarbitrarydata = transactions[a].rawtransaction.arbitrarydata; // assume it's arbitrarydata submitted by miner
            }
        }
        addToBlocks(blockInfo.block.height,
            blockInfo.block.blockid,
            blockInfo.block.difficulty,
            blockInfo.block.estimatedhashrate,
            blockInfo.block.maturitytimestamp,
            blockInfo.block.rawblock.timestamp,
            blockInfo.block.rawblock.parentid,
            blockInfo.block.totalcoins,
            blockInfo.block.minerpayoutcount,
            blockInfo.block.transactioncount,
            blockInfo.block.siacoininputcount,
            blockInfo.block.siacoinoutputcount,
            blockInfo.block.filecontractcount,
            blockInfo.block.filecontractrevisioncount,
            blockInfo.block.storageproofcount,
            blockInfo.block.siafundinputcount,
            blockInfo.block.siafundoutputcount,
            blockInfo.block.minerfeecount,
            blockInfo.block.arbitrarydatacount,
            blockInfo.block.transactionsignaturecount,
            blockInfo.block.activecontractcost,
            blockInfo.block.activecontractcount,
            blockInfo.block.activecontractsize,
            blockInfo.block.totalcontractcost,
            blockInfo.block.totalcontractsize,
            blockInfo.block.totalrevisionvolume,
            minerarbitrarydata)
            .then((added) => {
                //console.log(' [BLOCK] Added to database on height: '+blockInfo.block.height);
                processTransaction(transactions, blockInfo.block.rawblock.timestamp, blockInfo.block.rawblock.minerpayouts)
                    .then((txadded) => {
                        //console.log(txadded);
                        console.log('[TX]: Added all transactions for height:', blockInfo.block.height);
                        resolve('true');
                    }).catch((err) => console.log(err))
            }).catch((err) => console.log(err)); // add to block sql
    })
}

async function processTransaction(transactions, timestamp, minerpayouts) { // appropriately named function.
    return new Promise((resolve) => { 
    let minerFees = 0; // set minerFees to zero
    let txType = ''; // allows us to use the txType variable anywhere in this function

    for (t = 0; t < transactions.length; t++) { // for each transaction. . .
        console.log('[TX] Processing transactions on height:', transactions[t].height)
        let txTotal = 0; // set the tx total sent to 0;
        if (transactions[t].rawtransaction.minerfees != undefined) { // if the tx has miner fees..
            let fee = Number(transactions[t].rawtransaction.minerfees); // make sure they're number not string
            minerFees += fee; // add them all together.
        }
        if ((transactions[t].rawtransaction.minerfees).length === 0) { // if minerfees does not have anything in it
            minerFees = 0; // set fee to zero
        }
        if ((transactions[t].rawtransaction.siacoininputs).length === 0) { // if siacoinputs is empty
            txType = 'coinbase'; // assume it's a mined block with reward tx. block reward tx is 300 scp per block but goes down 0.001 per block
            if (transactions[t].height < 290000) { // so when we get to this height, there's a base of 10scp per block
                txTotal = baseCoinbase - (transactions[t].height * 0.001); // until then, do the math right.
            } else { // otherwise.. 
                txTotal = 10; // set the reward to flat 10 scp
            }
            /* here we will parse minerpayouts (block reward) */
            //console.log('begin processing for '+txType+ ' transaction with hash of '+transactions[t].id);
            /*  we COULD technically use a function to do this so we're not copy/pasting code 3 times
                but this block pretty much checks the json data for each address and sums up the total per address in the transaction.
                we don't need EVERY SINGLE CHANGE stored in sql. Just the change per tx
            */
            let minerpayouts_merged = Object.values(minerpayouts.reduce((cam, {unlockhash,value}) => {
                cam[unlockhash] = cam[unlockhash] || {unlockhash,total: 0} ;
                if (unlockhash == cam[unlockhash].unlockhash) {
                    cam[unlockhash].total += parseInt(value);
                } 
                return cam;
              }, {}));

            for (e = 0; e < minerpayouts_merged.length; e++) {
                //console.log('Wallet '+minerpayouts[e].unlockhash + ' was rewarded '+ minerpayouts[e].value/scprimecoinprecision+ ' under this transaction.')
                let addr = minerpayouts_merged[e].unlockhash;
                let amt = minerpayouts_merged[e].total;
                let txhash = transactions[t].id;
                let txHeight = transactions[t].height;
                addToAddress(addr, amt, txhash, 'in', txType, txHeight)
                .then((done) => {
                    calcTotals(addr, 'in', amt, txHeight, txhash)
                    .then((calc) => {

                    })
                    .catch((error) => { console.log(error);
                    })
                }).catch((errors) => { 
                    console.log(errors);
                })
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
        if (txType == 'tx') {
            /* cycle through addresses */
            /*  we COULD technically use a function to do this so we're not copy/pasting code 3 times
                but this block pretty much checks the json data for each address and sums up the total per address in the transaction.
                we don't need EVERY SINGLE CHANGE stored in sql. Just the change per tx
            */
            let inputoutputsjson = transactions[t].siacoininputoutputs;
            let siacoininputoutputs = Object.values(inputoutputsjson.reduce((cam, {unlockhash,value}) => {
                cam[unlockhash] = cam[unlockhash] || {unlockhash,total: 0} ;
                if (unlockhash == cam[unlockhash].unlockhash) {
                    cam[unlockhash].total += parseInt(value);
                } 
                return cam;
              }, {}));
            for (q = 0; q < siacoininputoutputs.length; q++) {
                /* send each sender to addresses table with amount */
                let addr = siacoininputoutputs[q].unlockhash;
                let amt = siacoininputoutputs[q].total;
                let txhash = transactions[t].id;
                let txHeight = transactions[t].height;

                addToAddress(addr, '-'+amt, txhash, 'out', txType, txHeight)
                .then((done) => {
                    calcTotals(addr, 'out', amt, txHeight, txhash)
                    .then((calc) => {

                    }).catch((error) => { 
                        console.log(error);
                    })
                })
                .catch((errors) => { 
                    console.log(errors);
                })
 
            }

            /*  we COULD technically use a function to do this so we're not copy/pasting code 3 times
                but this block pretty much checks the json data for each address and sums up the total per address in the transaction.
                we don't need EVERY SINGLE CHANGE stored in sql. Just the change per tx
            */
            let siacoinoutputsjson = transactions[t].rawtransaction.siacoinoutputs;
            let siacoinoutputs = Object.values(siacoinoutputsjson.reduce((cam, {unlockhash,value}) => {
                cam[unlockhash] = cam[unlockhash] || {unlockhash,total: 0} ;
                if (unlockhash == cam[unlockhash].unlockhash) {
                    cam[unlockhash].total += parseInt(value);
                } 
                return cam;
            }, {}));
            for (r = 0; r < siacoinoutputs.length; r++) {
                let addr = siacoinoutputs[r].unlockhash;
                let amt = siacoinoutputs[r].total;
                let txhash = transactions[t].id;
                let txHeight = transactions[t].height;

                addToAddress(addr, amt, txhash, 'in', txType, txHeight)
                .then((done) => {
                   calcTotals(addr, 'in',amt, txHeight, txhash)
                    .then((calc) => {

                    }).catch((error) => {
                        console.log(error);
                    })
                })
                .catch((errors) => { 
                    console.log(errors);
                })
            }
            
            addToTransactions(transactions[t].height, transactions[t].id, transactions[t].parent, txType, txTotal, minerFees / scprimecoinprecision, timestamp * 1000);
        }
    }



    async function addToTransactions(height, hash, parent, type, total, fees, timestamp, ) { // add to transactions table
        //console.log('attempting to add tx ' + hash + ' to database as a '+type+' transaction.' );
        return new Promise((resolve) => {
        knex('transactions').insert({
            block_height: height,
            tx_hash: hash,
            parent_block: parent,
            tx_type: type,
            tx_total: total,
            fees: fees,
            timestamp: timestamp
        }).then((results) => {
	    console.log(results);
            resolve('Inserted');//console.log(results)
        }).catch((error) => {
	    console.log(error);
            resolve('fail');// console.log(error)
        })
    })
    }

    async function addToAddress(address, amount, tx_hash, direction, type, height) {
        return new Promise((resolve) => {
        knex('address_history').insert({
            address: address,
            amount: amount,
            tx_hash: tx_hash,
            direction: direction,
            type: type,
            height: height
        }).then((res) => {
	    console.log(res);
            resolve('Inserted');//console.log(res)
        }).catch((err) => {
            console.log(err);
        })
    })
    }
    resolve('done');
    })

    
    async function calcTotals(address, direction, amountscp, height, tx_hash) {
        return new Promise((resolve) => {
            if (direction == 'out') {
                amountscp = '-' + amountscp;
            }
            knex('addressTotals')
                .select('*')
                .where('address', address)
                .then((success) => {
                    console.log('attempting totals: ' + address + 'balance: ' + amountscp / scprimecoinprecision)               
                    if (success.length === 0) {
                        console.log('Address ' + address + ' was not found, adding')
                        knex('addressTotals')
                            .insert({
                                address: address,
                                totalscp: amountscp / scprimecoinprecision
                            })
                            .then((added) => {
                                console.log('Added ' + address + ' with amount '+amountscp/scprimecoinprecision);
                            })
                            .catch((error) => {
                                console.log(error);
                            })
                    } else {
                        console.log('Address ' + address + ' already exists, updating.')
                        let currentamount = success[0].totalscp;
                        let converted = amountscp / scprimecoinprecision;
                        if (direction == 'in') {
                            let added = (currentamount + converted);
                            console.log('Incrementing ' + address + ' by ' + amountscp / scprimecoinprecision);
                            knex('addressTotals')
                                .where('address', address)
                                .update('totalscp', added)
                                .then(console.log);
                        }
                        if (direction == 'out') {

                            let removed = (currentamount + converted);
                            console.log('Starting amount: ', currentamount);
                            console.log('Decreasing ' + address + ' by ' + amountscp / scprimecoinprecision);
                            console.log('new amount', removed);
                            knex('addressTotals')
                                .where('address', address)
                                .update('totalscp', removed)
                                .then(console.log);
                        }
                    }
                })
                .catch((error) => {
                    console.log(error)
                })

        })
    }
}



async function addToBlocks(height, hash, difficulty, estimatedhashrate,
    maturitytimestamp, timestamp, parentid,
    totalcoins, minerpayoutcount, transactioncount, siacoininputcount,
    siacoinoutputcount, filecontractcount, filecontractrevisioncount, storageproofcount,
    siafundinputcount, siafundoutputcount, minerfeecount, arbitrarydatacount,
    transactionsignaturecount, activecontractcost, activecontractcount, activecontractsize,
    totalcontractcost, totalcontractsize, totalrevisionvolume, minerarbitrarydata) { // appropriately named function
    //console.log('attempting to add ' + height + ' to database');
    return new Promise((resolve) => {
        return knex('blocks').insert({
            height: height,
            hash: hash,
            difficulty: difficulty,
            estimatedhashrate: estimatedhashrate,
            maturitytimestamp: maturitytimestamp,
            timestamp: timestamp,
            parentid: parentid,
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
            totalrevisionvolume: totalrevisionvolume,
            minerarbitrarydata: minerarbitrarydata
        })
            .then((res) => {
                resolve('true');
            })
            .catch((error) => {
                throw (error);
            })
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
            "timestamp": block.timestamp,
            "parentid": block.parentid,
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
            "totalrevisionvolume": block.totalrevisionvolume,
            "minerarbitrarydata": block.minerarbitrarydata
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
        resolve(knex('address_history').where('address', address).select('*'));
    })
}

/* this function needs to be titled generateRIchlist
 * it pulls from table: totals
*/
function genRichlistSCP(limit) {
    return new Promise(resolve => {
        resolve(knex('addressTotals').select('*').orderBy('totalscp', 'desc').limit(limit));
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
                "timestamp": results[0].timestamp/*,
                *"filecontractids": results[0].filecontractids,
                "filecontractmissedproofoutputids": results[0].filecontractrevisionmissedproofoutputids,
                "filecontractrevisionmissedproofoutputids": results[0].filecontractrevisionmissedproofoutputids,
                "filecontractrevisionvalidproofoutputids": results[0].filecontractrevisionvalidproofoutputids,
                "siacoininputoutputs": results[0].siacoininputoutputs,
                "siacoinoutputids": results[0].siacoinoutputids,
                "siafundclaimoutputids": results[0].siafundclaimoutputids,
                "siafundinputoutputs": results[0].siafundinputoutputs,
                "siafundoutputids": results[0].siafundoutputids,
                "storageproofoutputids": results[0].storageproofoutputids,
                "storageproofoutputs": reuslts[0].storageproofoutputs*/

            });
        })
});
/* api route for address info */
app.get('/api/address/:addr', (req, res) => {
    console.log(req.params.addr); // let's see wtf is being req
    getAddress(req.params.addr)
        .then((results) => {
	    console.log(results);
            let returnArray = {
                "address": results[0].address,
                "transactions": [],
                "totalSCP": []
            };
            let total = 0;
            console.log(results.length);
            for (b = 0; b < results.length; b++) {
                var item = {
                    "tx_hash": results[b].tx_hash,
                    "amount": results[b].amount,
                    "direction": results[b].direction
                }
                returnArray.transactions.push(item);
                /*if (results[b].direction == "in") {
                    total += parseInt(results[b].amount);
                } else {
                    total -= parseInt(results[b].amount);
                }*/
                total += parseInt(results[b].amount/scprimecoinprecision);

            }
            returnArray.totalSCP.push(total);
            res.json({
                "data": returnArray
            })

        })
	.catch((error) => {
	console.log(error)
	})

});
/* api route for contract info */
app.get('/api/contract/:contract', (req, res) => {
    res.json({
        "test": "fail"
    });
});

/* api route for richlist lol */
app.get('/api/richlist/:type/:amount', (req, res) => {
    let type = req.params.type;
    let amount = req.params.amount;

    if (amount > 250) {
        amount = 250;
    }

    switch (type) { 
        case 'scp': 
            // do scp things
            console.log('attempting scp richlist');
            genRichlistSCP(amount)
            .then((data) => { 
                console.log(data);
                let returnArray = [];
                for (x=0;x<data.length; x++) {
                    returnArray.push({ 
                        "address": data[x].address,
                        "totalSCP": data[x].totalscp
                    })
                }                
                res.json({
                    "data": returnArray
                });
            })
            
        break;

        case 'spf':
            // do spf things
        break;

        case 'both':
            // do both things;
        break;

    }

});
