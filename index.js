const sia = require('siaprime.js');
const config = require('./config.json');
const mysql = require('mysql');
const knex = require('knex')({
    client: 'mysql',
    connection: {
      host : config.sql.ip,
      user : config.sql.user,
      password : config.sql.pass,
      database : config.sql.database
    }
});
const mustacheExpress = require('mustache-express');
const express = require('express');
const app = express();
const cors = require('cors');

function createBlockTable() {
    return knex.schema
    .createTable('blocks', function(table) {
    table.increments('id');
    table.string('height');
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
  }).then((created) => { console.log(created)
  });
}

/*
    manually triggering this while in development
*/
createBlockTable().then((woo) => {
    startSync();
})

/* 
    might need this sometime. although isn't this equiv to 10^26?
*/
var scprimecoinprecision = 1000000000000000000000000000

/* 
    main function to start syncing blocks based on consensus height
*/
function startSync() {
    console.log(' - - - s t a r t s y n c s t a r t e d - - - ')
    sia.connect(config.daemon.ip + ':' + config.daemon.port)
        .then((spd) => {
            spd.call('/consensus')
                .then((consensus) => {
                    // console.log(consensus);
                    var topHeight = consensus.height;//consensus.height aka TARGET;
                    //var topHeight = 66408;
                    console.log('starting getBlocks');
                    getBlocks(spd, topHeight).then((eachBlock) => {
                        //console.log(eachBlock);
                    })
                }).catch((error) => { console.log(error) })
        })
}

/* 
    helper function
    get raw block information and send it back
*/
function getBlockInfo(spd, blockNumber) {
    console.log('blockNumber: ', blockNumber)
    return new Promise((resolve, reject) => {
        let number = parseInt(blockNumber);
        //console.log('getBlockInfo called on block ' + blockNumber);
        spd.call({
            url: '/explorer/blocks/' + number,
            method: 'GET'
        })
            .then((rawblock) => {
                resolve(rawblock);
            })
    })
}

/* 
    the point of this function is to get blocks in order 
    and wait for it to finish before doing the next
*/
function getBlocks(spd, topHeight) { 
    return new Promise(resolve => {
        (async () => {
            let blockNumber = 0; /* height to start sync from; eventually will pull from last sql entry */
            /*console.log(blockNumber);
            console.log(topHeight);*/
            do {
                await getBlockInfo(spd, blockNumber).then((blockInfo) => {
                    //console.log(blockInfo);
                    console.log('Block ID: '+blockInfo.block.height+' ::: Hash: '+blockInfo.block.blockid+' ::: Diff: '+blockInfo.block.difficulty);
                    /* add blocks to database */
                    addToBlocks(blockInfo.block.height, blockInfo.block.blockid, blockInfo.block.difficulty, blockInfo.block.estimatedhashrate, blockInfo.block.maturitytimestamp, blockInfo.block.totalcoins, blockInfo.block.minerpayoutcount, blockInfo.block.transactioncount, blockInfo.block.siacoininputcount, blockInfo.block.siacoinoutputcount, blockInfo.block.filecontractcount, blockInfo.block.filecontractrevisioncount,blockInfo.block.storageproofcount,blockInfo.block.siafundinputcount, blockInfo.block.siafundoutputcount,blockInfo.block.minerfeecount,blockInfo.block.arbitrarydatacount, blockInfo.block.transactionsignaturecount,blockInfo.block.activecontractcost,blockInfo.block.activecontractcount, blockInfo.block.activecontractsize,blockInfo.block.totalcontractcost,blockInfo.block.totalcontractsize, blockInfo.block.totalrevisionvolume)
                        .then((results) => { console.log(results) })
                });
                blockNumber++; /* increase block counter in do/while statement */
            } while (blockNumber <= topHeight)
            console.log('ding!')
        })();
    }).catch((error) => { console.log(error) })
}

/* leaving this empty. i had an idea but lost it. it might come back */
function parseBlock(block) {
    return new Promise(resolve=>{ 

    })
}
/* fat ass block to add to database */
function addToBlocks(height, hash, difficulty, estimatedhashrate, maturitytimestamp, totalcoins, minerpayoutcount, transactioncount, siacoininputcount, siacoinoutputcount, filecontractcount, filecontractrevisioncount, storageproofcount, siafundinputcount, siafundoutputcount, minerfeecount, arbitrarydatacount, transactionsignaturecount, activecontractcost, activecontractcount, activecontractsize, totalcontractcost, totalcontractsize, totalrevisionvolume) {
    console.log('attempting to add '+height+' to database');
    return  knex('blocks').insert({
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
/* I suck at naming functions. this gets info on a block hash or height, assuming hash = 64 characters long. */
function getInfoBlock(id) {
    return new Promise(resolve => {
        if (id.length === 64) {
            resolve(knex('blocks').where('hash', id).select('*'));
        } else {
            resolve(knex('blocks').where('height', id).select('*'));
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
        console.log(block);
    res.json({
        "block_height": block[0].height
    });
})
});

/* api route for tx info */
app.get('/api/tx/:id', (req, res) => {
    res.json({
        "test": "fail" 
    });
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