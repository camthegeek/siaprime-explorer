const sia = require('siaprime.js');
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
const { attachOnDuplicateUpdate } = require('knex-on-duplicate-update');
attachOnDuplicateUpdate();
const cors = require('cors'); // I added cors just in case it's ever needed.. but thinking we don't need it, ever.

function createBlockTable() {
    return knex.schema
        .createTable('blocks', function (table) {
            table.integer('height').primary();   // block.height
            table.string('hash', 64);   // block.blockid
            table.decimal('difficulty', 30, 0); // block.difficulty
            table.decimal('estimatedhashrate', 30, 0);  // block.estimatedhashrate
            table.string('maturitytimestamp');  // block.maturitytimestamp
            table.string('timestamp');  // block.rawblock.timestamp
            table.string('parentid', 64);   // block.rawblock.parentid
            table.decimal('totalcoins', 36, 0); // block.totalcoins
            table.string('minerpayoutaddr', 76); // block.rawblock.minerpayouts[0].unlockhash
            table.string('minerpayoutaddr2', 76); // block.rawblock.minerpayouts[1].unlockhash
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
            table.string('totalrevisionvolume');    // block.totalrevisionvolume
            table.string('minerarbitrarydata'); // too lazy to fill this in --cam 
        })
        .createTable('transactions', function (tx) {
            tx.integer('block_height');  // block.height
            tx.string('tx_hash', 64).primary();   // block.transactions.id
            tx.string('parent_block', 64); // block.trasactions.parent
            tx.string('tx_type', 16);
            tx.string('tx_total');  // block.transactions.rawtransaction.siacoinoutputs
            tx.decimal('fees', 36, 0);
            tx.string('timestamp'); // block.rawblock.timestamp
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
            addr.decimal('amount', null);
            addr.string('tx_hash', 64);
            addr.string('direction', 4);
            addr.string('type', 16);
            addr.integer('height');
            addr.index(['address', 'height'], 'richlist');
        })
        .createTable('address_totals', function (totals) {
            totals.string('address', 76).primary();
            totals.decimal('totalscp', null);
            totals.integer('totalspf');
            totals.string('first_seen', 12);
            totals.string('last_seen', 12);
        })
        .createTable('host_info', function(hai){
            hai.string('tx_hash', 64).primary();
            hai.string('hash_syn');
            hai.integer('height');
            hai.bigInteger('timestamp');
            hai.decimal('fees', 36, 0);
            hai.string('ip');
            hai.index(['height'], 'IX_hai');
        })
        .createTable('contracts', function(ci){
            ci.string('master_hash', 64).primary();
            ci.string('contract_id', 64);
            ci.string('allowance_addr', 76);
            ci.decimal('renter_value', 36, 0);
            ci.string('collateral_addr', 76);
            ci.decimal('host_value', 36, 0);
            ci.decimal('fees', 36, 0);
            ci.integer('window_start');
            ci.integer('window_end');
            ci.integer('revision_num');
            ci.decimal('original_filesize', 24, 0);
            ci.decimal('current_filesize', 24, 0);
            ci.string('valid_proof1_address', 76);
            ci.decimal('valid_proof1_value', 36, 0);
            ci.string('valid_proof2_address', 76);
            ci.decimal('valid_proof2_value', 36, 0);
            ci.string('missed_proof1_address', 76);
            ci.decimal('missed_proof1_value', 36, 0);
            ci.string('missed_proof2_address', 76);
            ci.decimal('missed_proof2_value', 36, 0);
            ci.string('missed_proof3_address', 76);
            ci.decimal('missed_proof3_value', 36, 0);
            ci.integer('height');
            ci.bigInteger('timestamp');
            ci.string('status', 15);
            ci.tinyint('renew');
            ci.index(['height'], 'IX_ci');
            ci.index(['contract_id'], 'IX_ci1');
            ci.index(['window_end'], 'IX_ci2');
        })
        .createTable('resolutions', function(cr){
            cr.string('master_hash', 64).primary();
            cr.string('contract_id', 64);
            cr.decimal('fees', 36, 0);
            cr.string('result', 15);
            cr.integer('height');
            cr.bigInteger('timestamp');
            cr.string('output0_address', 76);
            cr.decimal('output0_value', 36, 0);
            cr.string('output1_address', 76);
            cr.decimal('output1_value', 36, 0);
            cr.string('output2_address', 76);
            cr.decimal('output2_value', 36, 0);
            cr.index(['height'], 'IX_cr');
            cr.index(['contract_id'], 'IX_cr1');
        })
        .createTable('revisions', function(rv){
            rv.string('master_hash', 64).primary();
            rv.string('contract_id', 64);
            rv.decimal('fees', 36, 0);
            rv.integer('new_revision_num');
            rv.decimal('new_filesize', 24, 0);
            rv.string('valid_proof1_address', 76);
            rv.decimal('valid_proof1_value', 36, 0);
            rv.string('valid_proof2_address', 76);
            rv.decimal('valid_proof2_value', 36, 0);
            rv.string('missed_proof1_address', 76);
            rv.decimal('missed_proof1_value', 36, 0);
            rv.string('missed_proof2_address', 76);
            rv.decimal('missed_proof2_value', 36, 0);
            rv.string('missed_proof3_address', 76);
            rv.decimal('missed_proof3_value', 36, 0);
            rv.integer('height');
            rv.bigInteger('timestamp');
            rv.string('hash_syn');
            rv.index(['height'], 'IX_rv');
            rv.index(['contract_id'], 'IX_rv1');
        })
        .createTable('storageproofs', function(sp){
            sp.string('master_hash', 64).primary();
            sp.string('contract_id', 64);
            sp.string('hash_syn');
            sp.integer('height');
            sp.bigInteger('timestamp');
            sp.decimal('fees', 36, 0);
            sp.index(['height'], 'IX_sp');
            sp.index(['contract_id'], 'IX_sp1');
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

startUp(); // run the damn thing when you launch.

var scprimecoinprecision = config.general.precision;
var baseCoinbase = 300;

function startSync(startHeight) { // start synchronizing blocks from startHeight
    sia.connect(config.daemon.ip + ':' + config.daemon.port) // connect to daemon
        .then((spd) => { // now that we're connected.. 
            spd.call('/consensus') // get consensus data
                .then((consensus) => { // with that data..
                    //var topHeight = 100; // purely for testing
                    var topHeight = consensus.height; // we want to know the current height of the blockchain
                    //console.log('startHeight:', startHeight);
                   // console.log('topHeight:', topHeight);
                    if ((startHeight) == topHeight) { // if our startheight (minus one, because we counted all the rows and found ourselves 1 ahead of the blockchain), is equal to consensus height
                        console.log('['+new Date().toLocaleString()+'] heights are the same, taking a break');
                        setTimeout(startUp, 60000); // run startUp once if heights ~1 block difference or even. startUp loops back around to startSync..
                        //return; // lets not do a damn thing at all.
                    } else {
                        getBlocks(spd, topHeight, Number(startHeight)+1); // lets start processing the blocks starting at startHeight until we reach topHeight
                    }
                })
                .catch((error) => {  // if there's an error. . . 
                    console.log(error);  // scream about it
                })
        })
        .catch((error) => {
            console.log(error);
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
            .catch((error) => {
                // console.log(error);
                resolve('error');
            })
    })
}

async function getBlocks(spd, topHeight, startHeight) { // this function deserves a better name. gets block from sync, starts to process it.
    let blockNumber = startHeight; // we start syncing from this height (last block in sql)\
    let ready = true;
    (async () => {
        try {
            if (blockNumber <= topHeight) {
                for (i = 0; i < topHeight; i++) { // do all this stuff. . 
                    if (ready == true) {
                        ready = false;
                        const blockInfo = await getBlockInfo(spd, blockNumber);
                        if (blockInfo != "error") { 
                            const parsed = await parseWholeBlock(blockInfo, blockNumber);
                            blockNumber++
                            ready = true;
                        } else {
                            setTimeout(startUp, 60000);
                        }
                    }
                }
            }
        } catch (error) {
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
            if (transactions[a].rawtransaction.arbitrarydata.length > 0
            && transactions[a].rawtransaction.filecontractrevisions.length == 0
            && transactions[a].rawtransaction.filecontracts.length == 0
            && transactions[a].rawtransaction.minerfees.length == 0
            && transactions[a].rawtransaction.siacoininputs.length == 0
            && transactions[a].rawtransaction.siacoinoutputs.length == 0
            && transactions[a].rawtransaction.siafundinputs.length == 0
            && transactions[a].rawtransaction.siafundoutputs.length == 0
            && transactions[a].rawtransaction.storageproofs.length == 0
            && transactions[a].rawtransaction.transactionsignatures.length == 0
            ) { // if arbitrary data has something && everything else blank
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
            blockInfo.block.rawblock.minerpayouts[0].unlockhash,
            blockInfo.block.rawblock.minerpayouts[1].unlockhash,
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
        if ((transactions[t].rawtransaction.siacoininputs).length === 0 && transactions[t].height > 0) { // if siacoinputs is empty
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
            let minerpayouts_merged = Object.values(minerpayouts.reduce((cam, { unlockhash, value }) => {
                cam[unlockhash] = cam[unlockhash] || { unlockhash, total: 0 };
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

                    })
                    .catch((errors) => {
                        console.log(errors);
                    });
                let totals3 = await calcTotals(addr, 'in', amt, txHeight, txhash, txType);
            }
        } 
        if (transactions[t].rawtransaction.siacoininputs) {
            if (transactions[t].rawtransaction.siacoininputs.length != 0
                    && transactions[t].rawtransaction.filecontracts.length == 0
                    && transactions[t].rawtransaction.filecontractrevisions.length == 0
                    && transactions[t].rawtransaction.storageproofs.length == 0
                    && transactions[t].rawtransaction.siafundinputs.length == 0 
                    && transactions[t].rawtransaction.siafundoutputs.length == 0) {
                    txType = 'sctx'; // mark it as a sc transaction
            }
        }
        if (transactions[t].rawtransaction.siafundinputs.length > 0 && transactions[t].siafundinputoutputs.length > 0) {
            console.log(transactions[t].id +' identified as a sf tx');
                 txType = 'sftx'; // mark it as a sf transaction
            }
        if (transactions[t].rawtransaction.filecontracts) {
            if (transactions[t].rawtransaction.filecontracts.length != 0) {
                console.log(transactions[t].id +' identified as a contract');
                txType = 'contract';
            }
        }
        if (transactions[t].filecontractrevisions) {
            if (transactions[t].filecontractrevisions.length != 0) {
                console.log(transactions[t].id +' identified as a revision');
                txType = 'revision';
            }
        }
        if (transactions[t].storageproofs) {         
            if (transactions[t].storageproofs.length != 0) {
                console.log(transactions[t].id +' identified as a storage proof');
                    txType = 'storageproof';
            }
        }
        for (tt = 0; tt < transactions[t].rawtransaction.siacoinoutputs.length; tt++) {  // for each siacoinoutput. . 
            txTotal += transactions[t].rawtransaction.siacoinoutputs[tt].value / scprimecoinprecision; // lets save how much each tx had in it
        }
        if (txType == 'sctx') {
            /* cycle through addresses */
            /*  we COULD technically use a function to do this so we're not copy/pasting code 3 times
                but this block pretty much checks the json data for each address and sums up the total per address in the transaction.
                we don't need EVERY SINGLE CHANGE stored in sql. Just the change per tx
            */
            // determining if tx is a host ann
            let hostAnnBool = false
            let decodedIp;
            let arbData = transactions[t].rawtransaction.arbitrarydata
            let hashSyn = []         
            let inputoutputsjson = transactions[t].siacoininputoutputs;
            let siacoininputoutputs = Object.values(inputoutputsjson.reduce((cam, { unlockhash, value }) => {
                cam[unlockhash] = cam[unlockhash] || { unlockhash, total: 0 };
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

                addToAddress(addr, '-' + amt, txhash, 'out', txType, txHeight)
                    .then((done) => {
                        // do something
                    })
                    .catch((errors) => {
                        console.log(errors);
                    });
                let totals2 = await calcTotals(addr, 'out', amt, txHeight, txhash, txType);
            }
            hashSyn.push(transactions[t].id)
            /*  we COULD technically use a function to do this so we're not copy/pasting code 3 times
                but this block pretty much checks the json data for each address and sums up the total per address in the transaction.
                we don't need EVERY SINGLE CHANGE stored in sql. Just the change per tx
            */
            let siacoinoutputsjson = transactions[t].rawtransaction.siacoinoutputs;
            let siacoinoutputs = Object.values(siacoinoutputsjson.reduce((cam, { unlockhash, value }) => {
                cam[unlockhash] = cam[unlockhash] || { unlockhash, total: 0 };
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

                    })
                    .catch((errors) => {
                        console.log(errors);
                    });
                let totals1 = await calcTotals(addr, 'in', amt, txHeight, txhash, txType);
            }
            if (arbData.length > 0){
                slice = arbData[0].slice(0,14)
                if (slice == "SG9zdEFubm91bm") {
                    hostAnnBool = true
                    txType = 'hostann'

                    hostIp = arbData[0].slice(32)
                    let s = hostIp.search("AAAAAAAAAA")
                    hostIp = hostIp.slice(0, (s-9))
                    decodedIp = Buffer.from(hostIp, 'base64').toString('ascii')
                }
            }
            if (hostAnnBool == true) {
                // host_info
                addToHost(masterHash, hashSyn, txHeight, timestamp, minerFees, decodedIp)
                // transactions
                let transacted = await addToTransactions(txHeight, transactions[t].id, transactions[t].parent, txType, txTotal, minerFees, timestamp)
            } else {
            let transacted = await addToTransactions(transactions[t].height, transactions[t].id, transactions[t].parent, txType, txTotal, minerFees, timestamp);
            }
        }
        if (txType == 'sftx') {
            console.log('processing sf stuff on ',transactions[t].id);
            for (s = 0; s < transactions[t].siafundinputoutputs.length; s++){
                let addr_spf_out = transactions[t].siafundinputoutputs[s].unlockhash;
                let amt_spf_out = transactions[t].siafundinputoutputs[s].value;
                let txhash_spf_out = transactions[t].id;
                let txHeight_spf_out = transactions[t].height;
                console.log('inserting values for spf stuff. addr: '+addr_spf_out+ ' with amt: '+amt_spf_out+' on height: '+txHeight_spf_out)
                addToAddress(addr_spf_out, '-' + amt_spf_out, txhash_spf_out, 'out', txType, txHeight_spf_out)
                    .then((done) => {
                        // do something
                    })
                    .catch((errors) => {
                        console.log(errors);
                    });
                    let total_spf_out = await calcTotals(addr_spf_out, 'out', amt_spf_out, txHeight_spf_out, txhash_spf_out, txType);
            }
            let sfoutputsjson = transactions[t].rawtransaction.siafundoutputs;
            for (u = 0; u < sfoutputsjson.length; u++) {
                let addr_spf = sfoutputsjson[u].unlockhash;
                let amt_spf = sfoutputsjson[u].value;
                let txhash_spf = transactions[t].id;
                let txHeight_spf = transactions[t].height;

                addToAddress(addr_spf, amt_spf, txhash_spf, 'in', txType, txHeight_spf)
                    .then((done) => {

                    })
                    .catch((errors) => {
                        console.log(errors);
                    })
                let totalspf_in = await calcTotals(addr_spf, 'in', amt_spf, txHeight_spf, txhash_spf, txType);
            }

            let transacted = await addToTransactions(transactions[t].height, transactions[t].id, transactions[t].parent, txType, txTotal, minerFees, timestamp);
        }
        if (txType == 'contract'){
            let masterHash = transactions[t].id;
            let txHeight = transactions[t].height;
            let parent = transactions[t].parent;
            let revisionNum = parseInt(transactions[t].rawtransaction.filecontracts[0].revisionnumber);
            let windowStart = parseInt(transactions[t].rawtransaction.filecontracts[0].windowstart); // block that opens the window for submitting the storage proof
            let windowEnd = parseInt(transactions[t].rawtransaction.filecontracts[0].windowend);
            let fileSize = parseInt(transactions[t].rawtransaction.filecontracts[0].filesize); // contract size in current revision
            if (fileSize == 0) {
                var renewBool = 0 // boolean to mark this contract as a renewal
            } else {
                var renewBool = 1
            }
            let contractId = transactions[t].filecontractids[0]
            let allowancePostingHash;
            let collateralPostingHash;
            let validProof1Value;
            let validProof1Address;
            let validProof2Value;
            let validProof2Address;        
            let missedProof1Value;
            let missedProof1Address;
            let missedProof2Value;
            let missedProof2Address;
            let missedProof3Value;
            let missedProof3Address;
            let totalTransacted;


            if (transactions[t].rawtransaction.siacoininputs.length >= 2) {
                var link = []
                link[0] = transactions[t].rawtransaction.siacoininputs[0].parentid // renter tx
                link[1] = transactions[t].rawtransaction.siacoininputs[1].parentid // host tx
                
                for (q = 0; q < link.length; q++) { // for both links
                    let matchBool = false
                    for (m = 0; m < transactions.length; m++) { // iterate on each tx 
                        if (transactions[m].siacoinoutputids != null) { // avoid errors as some txs dont have siacoin outputs
                            if (link[q] == transactions[m].siacoinoutputids[0]) {
                                matchBool = true // found matching tx
                                let linkId = ""
                                if (q == 0) {
                                    linkId = "allowance" // renter
                                } else {
                                    linkId = "collateral" // host
                                }
                                // senders
                                let inputoutputsjson = transactions[m].siacoininputoutputs;
                                let siacoininputoutputs = Object.values(inputoutputsjson.reduce((cam, { unlockhash, value }) => {
                                    cam[unlockhash] = cam[unlockhash] || { unlockhash, total: 0 };
                                    if (unlockhash == cam[unlockhash].unlockhash) {
                                        cam[unlockhash].total += parseInt(value);
                                    }
                                    return cam;
                                }, {}));
                                for (z = 0; z < siacoininputoutputs.length; z++) {
                                    /* send each sender to addresses table with amount */
                                    let addr = siacoininputoutputs[z].unlockhash;
                                    let amt = siacoininputoutputs[z].total;
                    
                                    addToAddress(addr, '-' + amt, masterHash, 'out', linkId, txHeight)
                                        .then((done) => {
                                            // do something
                                        })
                                        .catch((errors) => {
                                            console.log(errors);
                                        });
                                    let contract_totals_out = await calcTotals(addr, 'out', amt, txHeight, masterHash, linkId);
                                }
                                // receivers
                                let siacoinoutputsjson = transactions[m].rawtransaction.siacoinoutputs;
                                let siacoinoutputs = Object.values(siacoinoutputsjson.reduce((cam, { unlockhash, value }) => {
                                    cam[unlockhash] = cam[unlockhash] || { unlockhash, total: 0 };
                                    if (unlockhash == cam[unlockhash].unlockhash) {
                                        cam[unlockhash].total += parseInt(value);
                                    }
                                    return cam;
                                }, {}));
                                for (r = 0; r < siacoinoutputs.length; r++) {
                                    let addr = siacoinoutputs[r].unlockhash;
                                    let amt = siacoinoutputs[r].total;
                                    if (r == 0) {
                                        linkId = txType
                                    }

                                    addToAddress(addr, amt, masterHash, 'in', linkId, txHeight)
                                        .then((done) => {

                                        })
                                        .catch((errors) => {
                                            console.log(errors);
                                        });
                                    let contract_totals_in = await calcTotals(addr, 'in', amt, txHeight, masterHash, linkId);
                                }
                            }
                        }
                    }
                    if (matchBool == false) {
                        if (transactions[t].siacoininputoutputs[0]) { 
                            allowancePostingHash = transactions[t].siacoininputoutputs[0].unlockhash;
                        }
                        if (transactions[t].siacoininputoutputs[1]) {
                            collateralPostingHash = transactions[t].siacoininputoutputs[1].unlockhash;
                        }

                    }
                }

                renterAllowanceValue = parseInt(transactions[t].siacoininputoutputs[0].value)
                renterAllowanceSender = transactions[t].siacoininputoutputs[0].unlockhash

                hostCollateralValue = parseInt(transactions[t].siacoininputoutputs[1].value)
                hostCollateralSender = transactions[t].siacoininputoutputs[1].unlockhash
                totalTransacted = renterAllowanceValue + hostCollateralValue

                // storage proof results
                validProof1Value = transactions[t].rawtransaction.filecontracts[0].validproofoutputs[0].value
                validProof1Address = transactions[t].rawtransaction.filecontracts[0].validproofoutputs[0].unlockhash

                validProof2Value = transactions[t].rawtransaction.filecontracts[0].validproofoutputs[1].value
                validProof2Address = transactions[t].rawtransaction.filecontracts[0].validproofoutputs[1].unlockhash
                
                missedProof1Value = transactions[t].rawtransaction.filecontracts[0].missedproofoutputs[0].value
                missedProof1Address = transactions[t].rawtransaction.filecontracts[0].missedproofoutputs[0].unlockhash

                missedProof2Value = transactions[t].rawtransaction.filecontracts[0].missedproofoutputs[1].value
                missedProof2Address = transactions[t].rawtransaction.filecontracts[0].missedproofoutputs[1].unlockhash

                missedProof3Value = transactions[t].rawtransaction.filecontracts[0].missedproofoutputs[2].value
                missedProof3Address = transactions[t].rawtransaction.filecontracts[0].missedproofoutputs[2].unlockhash

                // address_history changes
                addToAddress(renterAllowanceSender, '-' + renterAllowanceValue, masterHash, 'out', txType, txHeight)
                addToAddress(hostCollateralSender, '-' + hostCollateralValue, masterHash, 'out', txType, txHeight)

                // Exception: some modern contracts have a renter-returning output. `us` contracts can do this
                if (transactions[t].siacoinoutputs != null) {
                    for (var i = 0; i < transactions[t].siacoinoutputs.length; i++) {
                        addToAddress(transactions[t].siacoinoutputs[i].unlockhash, transactions[t].siacoinoutputs[i].value, masterHash, 'out', txType, txHeight)
                    }
                }
            } else if (transactions[t].rawtransaction.siacoininputs.length == 1) {
                allowancePostingHash = transactions[t].siacoininputoutputs[0].unlockhash
                collateralPostingHash = "unknown"
                renterAllowanceSender = transactions[t].siacoininputoutputs[0].unlockhash
                renterAllowanceValue = parseInt(transactions[t].siacoininputoutputs[0].value)
                hostCollateralValue = 0
                hostCollateralSender = "unknown"
                totalTransacted = renterAllowanceValue
                let linkId = "allowance"

                // storageproof outputs
                validProof1Value = transactions[t].rawtransaction.filecontracts[0].validproofoutputs[0].value
                validProof1Address = transactions[t].rawtransaction.filecontracts[0].validproofoutputs[0].unlockhash

                validProof2Value = transactions[t].rawtransaction.filecontracts[0].validproofoutputs[1].value
                validProof2Address = transactions[t].rawtransaction.filecontracts[0].validproofoutputs[1].unlockhash
                
                missedProof1Value = transactions[t].rawtransaction.filecontracts[0].missedproofoutputs[0].value
                missedProof1Address = transactions[t].rawtransaction.filecontracts[0].missedproofoutputs[0].unlockhash

                missedProof2Value = transactions[t].rawtransaction.filecontracts[0].missedproofoutputs[1].value
                missedProof2Address = transactions[t].rawtransaction.filecontracts[0].missedproofoutputs[1].unlockhash

                missedProof3Value = transactions[t].rawtransaction.filecontracts[0].missedproofoutputs[2].value
                missedProof3Address = transactions[t].rawtransaction.filecontracts[0].missedproofoutputs[2].unlockhash

                // address_history changes
                addToAddress(renterAllowanceSender, '-' + renterAllowanceValue, masterHash, 'out', linkId, txHeight)
            }
            // TxID and contractID as a hash type (both can be searched as synonyms)

            // Tx inside a block (addToTransactions)
            addToTransactions(txHeight, masterHash, parent, txType, totalTransacted, minerFees, timestamp);

            // Contract info insert
            addToContracts(masterHash, contractId, allowancePostingHash, renterAllowanceValue, collateralPostingHash, hostCollateralValue,
                minerFees, windowStart, windowEnd, revisionNum, fileSize, fileSize, validProof1Address, validProof1Value, validProof2Address, validProof2Value,
                missedProof1Address, missedProof1Value, missedProof2Address, missedProof2Value, missedProof3Address, missedProof3Value, txHeight, timestamp, 'ongoing', renewBool)
        }
        if (txType == 'revision'){
            let hashSyn;
            let totalTransacted;
            let txHeight = transactions[t].height;
            let parent = transactions[t].parent;
            let masterHash = transactions[t].id
            let contradId = transactions[t].rawtransaction.filecontractrevisions[0].parentid
            let newRevision = parseInt(transactions[t].rawtransaction.filecontractrevisions[0].newrevisionnumber)
            let newFileSize = parseInt(transactions[t].rawtransaction.filecontractrevisions[0].newfilesize)
            let validProof1Value;
            let validProof1Address;
            let validProof2Value;
            let validProof2Address;        
            let missedProof1Value;
            let missedProof1Address;
            let missedProof2Value;
            let missedProof2Address;
            let missedProof3Value;
            let missedProof3Address;

            // storageproof outputs
            if (transactions[t].rawtransaction.filecontractrevisions[0].newmissedproofoutputs.length > 2 || newRevision >= 18446744073709551616) {
                if (newRevision >= 18446744073709551616) {
                    // If the revision number is Max Uint64, this is a "Renew and Clear" Revision style. This is a new format intriduced on 2020,
                    // and they don't include a MissedOutpu3 (burnt coins), as this contract is agreed between host and renter to be succeded, and
                    // will not even have an in-chain storage proof
                    validProof1Value = transactions[t].rawtransaction.filecontractrevisions[0].newvalidproofoutputs[0].value
                    validProof1Address = transactions[t].rawtransaction.filecontractrevisions[0].newvalidproofoutputs[0].unlockhash
                    validProof2Value = transactions[t].rawtransaction.filecontractrevisions[0].newvalidproofoutputs[1].value
                    validProof2Address = transactions[t].rawtransaction.filecontractrevisions[0].newvalidproofoutputs[1].unlockhash
                    missedProof1Value = transactions[t].rawtransaction.filecontractrevisions[0].newmissedproofoutputs[0].value
                    missedProof1Address = transactions[t].rawtransaction.filecontractrevisions[0].newmissedproofoutputs[0].unlockhash
                    missedProof2Value = transactions[t].rawtransaction.filecontractrevisions[0].missedproofoutputs[1].value
                    missedProof2Address = transactions[t].rawtransaction.filecontractrevisions[0].missedproofoutputs[1].unlockhash
                    missedProof3Value = 0
                    missedProof3Address = "(renew and clear revision)"
                } else {
                    validProof1Value = transactions[t].rawtransaction.filecontractrevisions[0].newvalidproofoutputs[0].value
                    validProof1Address = transactions[t].rawtransaction.filecontractrevisions[0].newvalidproofoutputs[0].unlockhash
                    validProof2Value = transactions[t].rawtransaction.filecontractrevisions[0].newvalidproofoutputs[1].value
                    validProof2Address = transactions[t].rawtransaction.filecontractrevisions[0].newvalidproofoutputs[1].unlockhash
                    missedProof1Value = transactions[t].rawtransaction.filecontractrevisions[0].newmissedproofoutputs[0].value
                    missedProof1Address = transactions[t].rawtransaction.filecontractrevisions[0].newmissedproofoutputs[0].unlockhash
                    missedProof2Value = transactions[t].rawtransaction.filecontractrevisions[0].missedproofoutputs[1].value
                    missedProof2Address = transactions[t].rawtransaction.filecontractrevisions[0].missedproofoutputs[1].unlockhash
                    missedProof3Value = transactions[t].rawtransaction.filecontractrevisions[0].newmissedproofoutputs[2].value
                    missedProof3Address = transactions[t].rawtransaction.filecontractrevisions[0].newmissedproofoutputs[2].unlockhash
                }

                // finding linked tx (the sending tx)
                let matchBool = false
                if (transactions[t].rawtransaction.siacoininputs.length != 0) {
                    let match = transactions[t].siacoininputs[0].parentid
                    let addr = []
                    let amt = []
                    for (m =0; m < transactions.length; m++){
                        if (transactions[m].siacoinoutputids != null){
                            if (match == transactions[m].siacoinoutputids[0]) {
                                matchBool = true
                                hashSyn = transactions[m].id

                                let inputoutputsjson = transactions[m].siacoininputoutputs;
                                let siacoininputoutputs = Object.values(inputoutputsjson.reduce((cam, { unlockhash, value }) => {
                                    cam[unlockhash] = cam[unlockhash] || { unlockhash, total: 0 };
                                    if (unlockhash == cam[unlockhash].unlockhash) {
                                        cam[unlockhash].total += parseInt(value);
                                    }
                                    return cam;
                                }, {}));
                                for (z = 0; z < siacoininputoutputs.length; z++) {
                                    /* send each sender to addresses table with amount */
                                    addr = siacoininputoutputs[z].unlockhash;
                                    amt = siacoininputoutputs[z].total;
                                    totalTransacted = totalTransacted + amt
                    
                                    addToAddress(addr, '-' + amt, masterHash, 'out', txType, txHeight)
                                        .then((done) => {
                                            // do something
                                        })
                                        .catch((errors) => {
                                            console.log(errors);
                                        });
                                    let revision_totals_out = await calcTotals(addr, 'out', amt, txHeight, masterHash, txType);
                                }
                            }
                        }
                    }
                }
                if (matchBool == false) {
                    hashSyn = ""
                    if (transactions[t].rawtransaction.siacoininputs.length != 0) {
                        let inputoutputsjson = transactions[m].siacoininputoutputs;
                        let siacoininputoutputs = Object.values(inputoutputsjson.reduce((cam, { unlockhash, value }) => {
                            cam[unlockhash] = cam[unlockhash] || { unlockhash, total: 0 };
                            if (unlockhash == cam[unlockhash].unlockhash) {
                                cam[unlockhash].total += parseInt(value);
                            }
                            return cam;
                        }, {}));
                        for (z = 0; z < siacoininputoutputs.length; z++) {
                            /* send each sender to addresses table with amount */
                            addr = siacoininputoutputs[z].unlockhash;
                            amt = siacoininputoutputs[z].total;
                            totalTransacted = totalTransacted + amt
            
                            addToAddress(addr, '-' + amt, masterHash, 'out', txType, txHeight)
                                .then((done) => {
                                    // do something
                                })
                                .catch((errors) => {
                                    console.log(errors);
                                });
                            let revision_totals_out = await calcTotals(addr, 'out', amt, txHeight, masterHash, txType);
                        }
                    }
                }
            }

            // tx and synonym as hashtypes
            // tx inside a block
            addToTransactions(txHeight, masterHash, parent, txType, totalTransacted, minerFees, timestamp)
            // revision info. The field "synonyms" includes only the contractId to link this TX to the contract created
            addToRevisions(masterHash, contradId, minerFees, newRevision, newFileSize, validProof1Address, validProof1Value,
                validProof2Address, validProof2Value, missedProof1Address, missedProof1Value, missedProof2Address, 
                missedProof2Value, missedProof3Address, missedProof3Value, txHeight, timestamp, hashSyn)
            // updating contracts with new data
            updateContracts(newRevision, newFileSize, validProof1Address, validProof1Value, validProof2Address, 
                validProof2Value, missedProof1Address, missedProof1Value, missedProof2Address, 
                missedProof2Value, missedProof3Address, missedProof3Value, contradId, txType)
        }
        if (txType == 'storageproof'){
            let totalTransacted = 0
            let masterHash = transactions[t].id
            let contractId = transactions[t].rawtransaction.storageproofs[0].parentid
            let hashSyn = masterHash
            let txHeight = transactions[t].height

            // finding linked tx (the sending tx)
            if (transactions[t].rawtransaction.siacoininputs.length > 0) {
                let match = transactions[t].rawtransaction.siacoininputs[0].parentid
                for (m = 0; m < transactions.length; m++) {
                    if (transactions[m].siacoinoutputids != null) {
                        if (match == transactions[m].siacoinoutputids[0]) {
                            eTx = transactions[m]
                            let extraHash = eTx.id
                            hashSyn = hashSyn + ', ' + extraHash

                            // senders
                            let inputoutputsjson = transactions[m].siacoininputoutputs;
                            let siacoininputoutputs = Object.values(inputoutputsjson.reduce((cam, { unlockhash, value }) => {
                                cam[unlockhash] = cam[unlockhash] || { unlockhash, total: 0 };
                                if (unlockhash == cam[unlockhash].unlockhash) {
                                    cam[unlockhash].total += parseInt(value);
                                }
                                return cam;
                            }, {}));
                            for (z = 0; z < siacoininputoutputs.length; z++) {
                                /* send each sender to addresses table with amount */
                                let addr = siacoininputoutputs[z].unlockhash;
                                let amt = siacoininputoutputs[z].total;
                
                                addToAddress(addr, '-' + amt, masterHash, 'out', txType, txHeight)
                                    .then((done) => {
                                        // do something
                                    })
                                    .catch((errors) => {
                                        console.log(errors);
                                    });
                                let storageproof_totals_out = await calcTotals(addr, 'out', amt, txHeight, masterHash, txType);
                            }

                            // receiver: only 2nd output (wallet return), as first are miner Fees
                            let addr = eTx.rawtransaction.siacoinoutputs[1].unlockhash
                            let amt = parseInt(eTx.rawtransaction.siacoinoutputs[1].value)
                            totalTransacted = minerFees + amt
                            addToAddress(addr, amt, masterHash, 'in', txType, txHeight)
                                .then((done) => {
                                }).catch((errors) => {
                                    console.log(errors);
                                });
                            let storageproof_totals_in = await calcTotals(addr, 'in', amt, txHeight, masterHash, txType)
                        }
                    }
                }
            }
            // masterhash as hashtype
            // tx inside a block
            addToTransactions(txHeight, masterHash, parent, txType, totalTransacted, minerFees, timestamp)
            // storageproofs
            addToStorageproofs(masterHash, contractId, hashSyn, txHeight, timestamp, minerFees)

        }
    }
    async function addToHost(masterHash, hashSyn, txHeight, timestamp, minerFees, decodedIp) {
        return new Promise((resolve) => {
            knex('host_info').insert({
                tx_hash: masterHash,
                hash_syn: hashSyn,
                height: txHeight,
                timestamp: timestamp,
                fees: minerFees,
                ip: decodedIp
            }).then((results) => {
                resolve('Inserted');
            }).catch((error) => {
                console.log(error);
                resolve('Fail');
            })
        })
    }
    async function addToStorageproofs(masterHash, contractId, hashSyn, txHeight, timestamp, minerFees) {
        return new Promise((resolve) => {
            knex('storageproofs').insert({
                master_hash: masterHash,
                contract_id: contractId, 
                hash_syn: hashSyn, 
                height: txHeight,
                timestamp: timestamp,
                fees: minerFees
            }).then((results) => {
                resolve('Inserted');
            }).catch((error) => {
                console.log(error);
                resolve('Fail');
            })
        })
    }
    async function addToRevisions(masterHash, contractId, fees, newRevision, newFileSize, validProof1Address, validProof1Value,
        validProof2Address, validProof2Value, missedProof1Address, missedProof1Value, missedProof2Address, missedProof2Value, 
        missedProof3Address, missedProof3Value, height, timestamp, hashSyn) {
            return new Promise((resolve) => {
                knex('revisions').insert({
                    master_hash: masterHash,
                    contract_id: contractId,
                    fees: fees,
                    new_revision_num: newRevision,
                    new_filesize: newFileSize,
                    valid_proof1_address: validProof1Address,
                    valid_proof1_value: validProof1Value,
                    valid_proof2_address: validProof2Address,
                    valid_proof2_value: validProof2Value,
                    missed_proof1_address: missedProof1Address,
                    missed_proof1_value: missedProof1Value,
                    missed_proof2_address: missedProof2Address,
                    missed_proof2_value: missedProof2Value, 
                    missed_proof3_address: missedProof3Address, 
                    missed_proof3_value: missedProof3Value, 
                    height: height,
                    timestamp: timestamp,
                    hash_syn: hashSyn
                }).then((results) => {
                    resolve('Inserted');
                }).catch((error) => {
                    console.log(error);
                    resolve('Fail');
                })
            })
        }
    async function addToContracts(masterHash, contractId, allowancePosting, renterValue, collateralPosting, hostValue,
        fees, windowStart, windowEnd, revisionNum, originalFileSize, currentFileSize, 
        validProof1Address, validProof1Value, validProof2Address, validProof2Value,
        missedProof1Address, missedProof1Value, missedProof2Address,
        missedProof2Value, missedProof3Address, missedProof3Value, height, timestamp, status, renew) {
        return new Promise((resolve) => {
            knex('contracts').insert({
                master_hash: masterHash,
                contract_id: contractId,
                allowance_addr: allowancePosting,
                renter_value: renterValue,
                collateral_addr: collateralPosting,
                host_value: hostValue,
                fees: fees,
                window_start: windowStart,
                window_end: windowEnd,
                revision_num: revisionNum,
                original_filesize: originalFileSize,
                current_filesize: currentFileSize,
                valid_proof1_address: validProof1Address,
                valid_proof1_value: validProof1Value,
                valid_proof2_address: validProof2Address,
                valid_proof2_value: validProof2Value,
                missed_proof1_address: missedProof1Address,
                missed_proof1_value: missedProof1Value,
                missed_proof2_address: missedProof2Address,
                missed_proof2_value: missedProof2Value,
                missed_proof3_address: missedProof3Address,
                missed_proof3_value: missedProof3Value,
                height: height,
                timestamp: timestamp,
                status: status,
                renew: renew
            }).then((results) => {
                resolve('Inserted');
            }).catch((error) => {
                console.log(error);
                resolve('fail');
            })
        })
    }
    async function updateContracts(revisionNum, currentFileSize, validProof1Address, validProof1Value,
        validProof2Address, validProof2Value, missedProof1Address, missedProof1Value, missedProof2Address, 
        missedProof2Value, missedProof3Address, missedProof3Value, contractId, tx_type) {
            return new Promise((resolve) => {
                knex('contracts')
                .select('*')
                .where('contract_id', contractId)
                .then((success) => {
                    if (success.length === 0){

                    } else {
                        switch (tx_type) {
                            case 'revision':
                            console.log('Contract revision - Updating contract ' + contractId);
                            knex('contracts')
                            .where('contract_id', contractId)
                            .update({
                                revision_num: revisionNum,
                                current_filesize: currentFileSize, 
                                valid_proof1_address: validProof1Address,
                                valid_proof1_value: validProof1Value, 
                                valid_proof2_address: validProof2Address,
                                valid_proof2_value: validProof2Value, 
                                missed_proof1_address: missedProof1Address, 
                                missed_proof1_value: missedProof1Value, 
                                missed_proof2_address: missedProof2Address, 
                                missed_proof2_value: missedProof2Value, 
                                missed_proof3_address: missedProof3Address,
                                missed_proof3_value: missedProof3Value
                            }).then((results) => {
                                resolve('Updated')
                            }).catch((err) => {
                                console.log(err);
                            })
                        }

                    }
                })
            }).catch((error) => {
                console.log(error);
            })
    }
    async function addToTransactions(height, hash, parent, type, total, fees, timestamp) { // add to transactions table
        console.log('['+type.toUpperCase()+'] attempting to add tx ' + hash + ' to database as a '+type+' transaction.' );
        return new Promise((resolve) => {
            knex('transactions')
            .select('*')
            .where('tx_hash', hash)
            .then((success) => {
                if (success.length != 0) {
                    console.log('Updating ['+type.toUpperCase()+'] with hash of '+hash);
                    knex('transactions')
                    .where('tx_hash', hash)
                    .update({
                        tx_type: type
                    })
                    .then((results) => {
                        resolve('Inserted')
                    })
                    .catch((err) => {
                        console.log(err);
                    })
                } else { 
            knex('transactions').insert({
                block_height: height,
                tx_hash: hash,
                parent_block: parent,
                tx_type: type,
                tx_total: total,
                fees: fees,
                timestamp: timestamp
            }).then((results) => {
                //console.log(results);
                resolve('Inserted');//console.log(results)
            }).catch((error) => {
                console.log(error);
                resolve('fail');// console.log(error)
            })
        }
        })
        .catch((error) => { 
            console.log(error);
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
                //console.log(res);
                resolve('Inserted');//console.log(res)
            }).catch((err) => {
                console.log(err);
            })
        })
    }
    async function calcTotals(address, direction, amount, height, tx_hash, tx_type) {
        return new Promise((resolve) => {
            knex('address_totals')
                .select('*')
                .where('address', address)
                .then((success) => {
                    if (success.length === 0) {
                        console.log('Address ' + address + ' was not found, adding on height', height)
                        switch(tx_type) {
                            case 'sctx':
                                case 'coinbase':
                                case 'contract':
                                case 'collateral':
                                case 'allowance':
                                case 'storageproof':
                                if (direction == 'in') {
                                    knex('address_totals')
                                        .insert({
                                            address: address,
                                            totalscp: amount,
                                            first_seen: height,
                                            last_seen: height
                                        })
                                        .then((added) => {
                                            console.log('[SCP] Added ' + address + ' with amount ' + amount / scprimecoinprecision);
                                            resolve('added');
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                        })
                                }
                                if (direction == 'out') {
                                    knex('address_totals')
                                        .insert({
                                            address: address,
                                            totalscp: '-' + amount,
                                            first_seen: height,
                                            last_seen: height
                                        })
                                        .then((added) => {
                                            console.log('[SCP] Added ' + address + ' with amount ' + amount / scprimecoinprecision);
                                            resolve('added');
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                        })
                                }
                            break;

                            case 'sftx':
                                if (direction == 'in') {
                                    console.log('[SPF] Attempt to added first time SF TX for address ', address);
                                    knex('address_totals')
                                        .insert({
                                            address: address,
                                            totalspf: amount,
                                            first_seen: height,
                                            last_seen: height
                                        })
                                        .then((added) => {
                                            console.log('[SPF] Added ' + address + ' with amount ' + amount );
                                            resolve('added');
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                        })
                                }
                                if (direction == 'out') {
                                    knex('address_totals')
                                        .insert({
                                            address: address,
                                            totalspf: '-' + amount,
                                            first_seen: height,
                                            last_seen: height
                                        })
                                        .then((added) => {
                                            console.log('[SPF] Address ' + address + ' sent amount ' + amount);
                                            resolve('added');
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                        })
                                }
                             break;
                        }
                    } else {
                        switch (tx_type) {
                            case 'sctx':
                                case 'coinbase':
                                case 'contract':
                                case 'collateral':
                                case 'allowance':
                                case 'revision':
                                case 'storageproof':
                                console.log('[SCP] Address ' + address + ' already exists, updating.')
                                let currentamountscp = Number(success[0].totalscp);
                                let convertedscp = amount;
                                if (direction == 'in') {
                                    let added = (currentamountscp + convertedscp);
                                    console.log('[SCP] Incrementing ' + address + ' by ' + amount / scprimecoinprecision);
                                    knex('address_totals')
                                        .where('address', address)
                                        .update({
                                            'totalscp': added,
                                            'last_seen': height
                                        })
                                        .then(resolve('updated'))
                                        .catch((error) => {
                                            console.log(error);
                                        });
                                }
                                if (direction == 'out') {
                                    let removed = currentamountscp - convertedscp;
                                    console.log('[SCP] Decreasing ' + address + ' by ' + amount / scprimecoinprecision);
                                    knex('address_totals')
                                        .where('address', address)
                                        .update({
                                            'totalscp': removed,
                                            "last_seen": height
                                        })
                                        .then(resolve('updated'))
                                        .catch((error) => {
                                            console.log(error);
                                        })
                                }
                            break;

                            case 'sftx':
                                console.log('[SPF] Address ' + address + ' already exists, updating.')
                                let currentamountspf = Number(success[0].totalspf);
                                if (direction == 'in') {
                                    let added = (currentamountspf + Number(amount));
                                    console.log('[SPF] Incrementing ' + address + ' by ' + amount);
                                    knex('address_totals')
                                        .where('address', address)
                                        .update({
                                            'totalspf': added,
                                            'last_seen': height
                                        })
                                        .then(resolve('updated'))
                                        .catch((error) => {
                                            console.log(error);
                                        });
                                }
                                if (direction == 'out') {
                                    let removed = currentamountspf - Number(amount);
                                    console.log('[SPF] Decreasing ' + address + ' by ' + amount);
                                    knex('address_totals')
                                        .where('address', address)
                                        .update({
                                            'totalspf': removed,
                                            "last_seen": height
                                        })
                                        .then(resolve('updated'))
                                        .catch((error) => {
                                            console.log(error);
                                        })
                                }
                                break;
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
    totalcoins, minerpayoutaddr, minerpayoutaddr2, minerpayoutcount, transactioncount, siacoininputcount,
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
            minerpayoutaddr: minerpayoutaddr,
            minerpayoutaddr2: minerpayoutaddr2,
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
                console.log(error);
            })
    })
}
