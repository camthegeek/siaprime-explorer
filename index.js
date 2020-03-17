const sia = require('siaprime.js');
var config = require('./config.json');

var sqlLogin = {
    server: config.sqlserver_ip, // localhost <- default
    database: config.sqlserver_db,
    user: config.sqlserver_user, // CHANGE THIS in config.json
    password: config.sqlserver_pass, // CHANGE THIS in config.json
    port: config.sqlserver_port,
    connectionTimeout: 600000,
    requestTimeout: 600000,
    options: {
        encrypt: false
    },
    pool: {
        max: 1000,
        min: 0,
        idleTimeoutMillis: 300000
    }
};


let startHeight = 0;
var scprimecoinprecision = 1000000000000000000000000000

async function startSync() {
    console.log(' - - - s t a r t s y n c s ta a r t e d - - - ')
    sia.connect(config.daemon.ip + ':' + config.daemon.port)
        .then((spd) => {
            spd.call('/consensus')
                .then((consensus) => {
                    var topHeight = 10;//consensus.height aka TARGET;
                    
                    (async () => {
                        let blockNumber = 0;
                        do {
                            console.log('getting info on height', blockNumber)
                            await getBlockInfo(spd, blockNumber).then((blockInfo) =>{
                                console.log(blockInfo.height)
                            });
                            blockNumber++;
                        } while (blockNumber < topHeight)
                        console.log('ding!')
                    })
                }).catch((error) => {console.log(error)})
                
                
        }).catch((error) => { console.log(error) })
}

function getBlockInfo(spd, blockNumber) {
    return new Promise((resolve, reject) => {
        console.log('getBlockInfo called on block ' + blockNumber);
        spd.call({
            url: '/explorer/blocks/' + blockNumber,
            method: 'GET'
        })
            .then((rawblock) => {
                resolve(rawblock);
            })
    })
}


startSync();