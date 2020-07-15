const support = require('./support.js');
const config = require('../config.json');
var scprimecoinprecision = config.general.precision;

/* api route for tx info */
module.exports = function (app) {
    app.get('/api/tx/:id', (req, res) => {
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
    app.get('/api/total/:addr', (req, res) => {
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
    app.get('/api/address/:addr', (req, res) => {
        console.log(req.params.addr); // let's see wtf is being req
        support.getAddress(req.params.addr)
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
                support.genRichlistSCP(amount)
                    .then((data) => {
                        console.log(data);
                        let returnArray = [];
                        for (x = 0; x < data.length; x++) {
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

    app.get('/api/health', (req, res) => {
        res.send('alive');
    })

    /* when a user navigates to site.tld/ */
    app.get('/', (req, res) => {
        res.json({
            "test": "fail"
        });
    });
    /* api route for block info */
    app.get('/api/block/:id', (req, res) => {
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
};