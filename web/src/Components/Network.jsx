import { Component } from 'react';
import axios from 'axios';
import { Wallet2, Hdd, HddFill, PeopleFill, Justify, BarChartFill, Server } from 'react-bootstrap-icons';

class NetworkData extends Component {
    state = {
        netdata: [],
        hashrate: '',
        totalStorage: '',
        usedStorage: '',
    }
    componentDidMount() {
        axios.get('http://localhost:42424/api/health')
            .then(blockStuff => {
                let hr = getReadableHashRateString(blockStuff.data.difficulty / blockStuff.data.blockfrequency);
                let sb = getReadableStorageString(blockStuff.data.totalStorage);
                let us = getReadableStorageString(blockStuff.data.usedStorage);
                this.setState({
                    netdata: blockStuff.data,
                    hashrate: hr,
                    totalStorage: sb,
                    usedStorage: us,
                })
            }).catch((err) => { 
                console.log(err);
            })
    }

    render() {
        return (
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12 mt-3 mb-1">
                        <h2 class="card-title">
                            <Server className="float-left" size={32}/>
                        Network Stats</h2>
                    </div>
                </div>
                <div class="row">
                    <div class="col-xl-4 col-sm-6 col-12">
                        <div class="card network_stats mt-2">
                            <div class="card-content">
                                <div class="card-body">
                                    <div class="media d-flex">
                                        <div class="align-self-center">
                                            <Justify className="float-left" size={32}/>
                                        </div>
                                        <div class="media-body text-right float-right">
                                            <h4 className="font-weight-bold">{this.state.netdata.current_block}</h4> <span>Blockchain Height</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-4 col-sm-6 col-12">
                        <div class="card network_stats mt-2">
                            <div class="card-content">
                                <div class="card-body">
                                    <div class="media d-flex">
                                        <div class="align-self-center">
                                            <BarChartFill className="float-left" size={32} />
                                        </div>
                                        <div class="media-body text-right float-right">
                                            <h4 className="font-weight-bold">{this.state.hashrate}</h4> <span>Hashrate</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div class="col-xl-4 col-sm-6 col-12">
                        <div class="card network_stats mt-2">
                            <div class="card-content">
                                <div class="card-body">
                                    <div class="media d-flex">
                                        <div class="align-self-center">
                                            <Wallet2 className="float-left" size={32} />
                                        </div>
                                        <div class="media-body text-right float-right">
                                            <h4 className="font-weight-bold">{this.state.netdata.btcValue}</h4> <span>Bitcoin Value</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-4 col-sm-6 col-12">
                        <div class="card network_stats mt-2">
                            <div class="card-content">
                                <div class="card-body">
                                    <div class="media d-flex">
                                        <div class="align-self-center">
                                            <PeopleFill className="float-left" size={32} />
                                        </div>
                                        <div class="media-body text-right float-right">
                                            <h4 className="font-weight-bold">{this.state.netdata.hostCount}</h4> <span>Total Hosts</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-4 col-sm-6 col-12">
                        <div class="card network_stats mt-2">
                            <div class="card-content">
                                <div class="card-body">
                                    <div class="media d-flex">
                                        <div class="align-self-center">
                                            <Hdd className="float-left" size={32} />
                                        </div>
                                        <div class="media-body text-right float-right">
                                            <h4 className="font-weight-bold">{this.state.totalStorage}</h4> <span>Total Storage</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-4 col-sm-6 col-12">
                        <div class="card network_stats mt-2">
                            <div class="card-content">
                                <div class="card-body">
                                    <div class="media d-flex">
                                        <div class="align-self-center">
                                            <HddFill className="float-left" size={32} />
                                        </div>
                                        <div class="media-body text-right float-right">
                                            <h4 className="font-weight-bold">{this.state.usedStorage}</h4> <span>Used Storage</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        )
    }
}

export function getReadableHashRateString(hr) {
    var i = 0;
    var byteUnits = [' H', ' KH', ' MH', ' GH', ' TH', ' PH'];
    while (hr > 1000) {
        hr = hr / 1000;
        i++;
    }
    return hr.toFixed(2) + byteUnits[i];
}

export function getReadableStorageString(storage) {
    var i = 0;
    var byteUnits = [' bytes', ' KB', ' MB', ' GB', ' TB', ' PB'];
    while (storage > 1024) {
        storage = storage / 1024;
        i++;
    }
    return storage.toFixed(2) + byteUnits[i];
}
export default NetworkData;