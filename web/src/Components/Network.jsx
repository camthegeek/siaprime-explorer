import { Component } from 'react';
import axios from 'axios';
import { InfoSquare, Hdd, HddFill, PeopleFill } from 'react-bootstrap-icons';

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
            })
    }

    render() {
        return (
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12 mt-3 mb-1">
                        <h2 class="card-title">
                            <svg width="1em" height="1em" viewBox="0 0 16 16" class="float-left bi bi-server" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" d="M1.333 2.667C1.333 1.194 4.318 0 8 0s6.667 1.194 6.667 2.667V4C14.665 5.474 11.68 6.667 8 6.667 4.318 6.667 1.333 5.473 1.333 4V2.667zm0 3.667v3C1.333 10.805 4.318 12 8 12c3.68 0 6.665-1.193 6.667-2.665V6.334c-.43.32-.931.58-1.458.79C11.81 7.684 9.967 8 8 8c-1.967 0-3.81-.317-5.21-.876a6.508 6.508 0 0 1-1.457-.79zm13.334 5.334c-.43.319-.931.578-1.458.789-1.4.56-3.242.876-5.209.876-1.967 0-3.81-.316-5.21-.876a6.51 6.51 0 0 1-1.457-.79v1.666C1.333 14.806 4.318 16 8 16s6.667-1.194 6.667-2.667v-1.665z" />
                            </svg>
                        Network Stats</h2>
                    </div>
                </div>
                <div class="row">
                    <div class="col-xl-4 col-sm-6 col-12">
                        <div class="card network_stats">
                            <div class="card-content">
                                <div class="card-body">
                                    <div class="media d-flex">
                                        <div class="align-self-center">
                                            <InfoSquare className="float-left" size={64} />
                                        </div>
                                        <div class="media-body text-right float-right">
                                            <h4 className="font-weight-bold">{this.state.netdata.current_block}</h4> <span>Current Height</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4 col-sm-6 col-12">
                        <div class="card network_stats">
                            <div class="card-content">
                                <div class="card-body">
                                    <div class="media d-flex">
                                        <div class="align-self-center">
                                            <InfoSquare className="float-left" size={64} />
                                        </div>
                                        <div class="media-body text-right float-right">
                                            <h4 className="difficulty font-weight-bold">{this.state.netdata.difficulty}</h4> <span>Difficulty</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-4 col-sm-6 col-12">
                        <div class="card network_stats">
                            <div class="card-content">
                                <div class="card-body">
                                    <div class="media d-flex">
                                        <div class="align-self-center">
                                            <InfoSquare className="float-left" size={64} />
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
                        <div class="card network_stats">
                            <div class="card-content">
                                <div class="card-body">
                                    <div class="media d-flex">
                                        <div class="align-self-center">
                                            <PeopleFill className="float-left" size={64} />
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
                        <div class="card network_stats">
                            <div class="card-content">
                                <div class="card-body">
                                    <div class="media d-flex">
                                        <div class="align-self-center">
                                            <Hdd className="float-left" size={64} />
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
                        <div class="card network_stats">
                            <div class="card-content">
                                <div class="card-body">
                                    <div class="media d-flex">
                                        <div class="align-self-center">
                                            <HddFill className="float-left" size={64} />
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