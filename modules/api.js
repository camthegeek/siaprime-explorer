const express = require('express');
const app = express();
const support = require('./support.js');
const config = require('../config.json');
var cache = require('express-redis-cache')({ prefix: 'scpe' });
var scprimecoinprecision = config.general.precision;


/* all my shit has this block when you start it up. :) */
app.listen(config.api.port, () => {
    console.log('# # # # # # # # # # # # # # # # # # # # # #');
    console.log('# - - - - - - - S C P R I M E - - - - - - #');
    console.log('# - - - B L O C K - E X P L O R E R - - - #');
    console.log('# - - - - B Y - C A M T H E G E E K - - - #');
    console.log('# - - I S - B O O T I N G - U P - O N - - #');
    console.log('# - - - - - - P O R T - ' + config.api.port + ' - - - - - - #');
    console.log('## Process ID: '+ process.pid + ' # - - - #')
    console.log('# # # # # # # # # # # # # # # # # # # # # #');
});

/* api route for tx info */
app.get('/api/tx/:id', cache.route(), (req, res) => {
    support.getTx(req.params.id)
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

/* api route
    Get totals for single address
*/

app.get('/api/total/:addr', cache.route('addr'), (req, res) => {
    support.getAddressTotal(req.params.addr)
        .then((data) => {
            console.log(data);
            let returndata = {
                "address": data[0].address,
                "scp": data[0].totalscp / scprimecoinprecision,
                "spf": data[0].totalspf
            }

            res.send(returndata);
        })
})
/* api route for address info */
app.get('/api/address/:addr', cache.route({ expire: 60 }), async (req, res) => {
    console.log(req.params.addr); // let's see wtf is being req
    support.getAddress(req.params.addr)
        .then((results) => {
            console.log(results);
            let returnArray = {
                "address": results[0].address,
                "first_seen": address_totals[0].first_seen,
                "last_seen": address_totals[0].last_seen,
                "transactions": [],
                "totalSCP": []
            };
            let total = 0;
            console.log(results.length);
            for (b = 0; b < results.length; b++) {
                var item = {
                    "tx_hash": results[b].tx_hash,
                    "amount": results[b].amount / scprimecoinprecision,
                    "direction": results[b].direction
                }
                returnArray.transactions.push(item);
                if (results[b].direction == "in") {
                    total += results[b].amount;
                } else {
                    total -= results[b].amount;
                }
                //total += parseInt(results[b].amount/scprimecoinprecision);

            }
            returnArray.totalSCP.push(total / scprimecoinprecision);
            res.json({
                "data": returnArray
            })

        })
        .catch((error) => {
            console.log(error)
        })

});
/* api route for contract info */
app.get('/api/contract/:contract', cache.route(), (req, res) => {
    res.json({
        "test": "fail"
    });
});

/* api route for richlist lol */
app.get(['/api/richlist/:type/:amount', '/api/richlist/:type'], cache.route(), (req, res) => {
    let type = req.params.type;
    let amount = req.params.amount;
    
    if (amount > 250) {
        amount = 250;
    }
    if (!amount) { 
        amount = 5
    }

    switch (type) {
        case 'scp':
            // do scp things
            console.log('attempting scp richlist');
            support.genRichlistSCP(amount)
                .then((data) => {
                    console.log(data);
                    let returnArray = [];
                    for (x = 0; x < data.length; x++) {
                        returnArray.push({
                            "address": data[x].address,
                            "totalSCP": data[x].totalscp/config.general.precision
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

app.get('/api/health', async (req, res) => {
    let last_indexed = await support.getLastIndexed();
    let current_height = await support.getTopBlock();
    console.log(current_height);
    res.send({
        "current_block": current_height, // this gets last block from spd
        "last_indexed": last_indexed, // this gets last block for sql 

    });
})

/* when a user navigates to site.tld/ */
app.get('/', (req, res) => {
    res.json({
        "test": "fail"
    });
});
/* api route for block info */
app.get('/api/block/:id', cache.route(), (req, res) => {
    support.getInfoBlock(req.params.id).then((block) => {
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
})

/* api route
    fetches all addresses between two heights
*/
app.get('/api/between/:start/:end', cache.route(), async (req, res) => { 
    let start_height;
    let end_height;
    if (req.params.start) {
        start_height = req.params.start;
    } else {
        start_height = 0;
    }
    if (req.params.end) { 
        end_height = req.params.end;
    } else {
        end_height = 1;
    }
    if (start_height > end_height || end_height < start_height) {
        res.send({
            "error": "Start height must be less than end height"
        })
        return;
    }
    
    support.getAddressesBetweenBlocks(start_height, end_height)
    .then((data) => {
        let returnArray = {
            "count": data.length,
            "addresses": []
        }
        for (i=0;i<data.length;i++) {
            returnArray.addresses.push(data[i].address);
        }
        res.send({
            "data": returnArray
        })
    })
});