import { Component } from 'react';

import { Wallet2, Hdd, HddFill, PeopleFill, Justify, BarChartFill, Server } from 'react-bootstrap-icons';

class NetworkData extends Component {
    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 mt-3 mb-1">
                        <h2 className="card-title">
                            <Server className="float-left" size={32}/>
                            Network Stats
                        </h2>
                    </div>
                </div>
                
                <div className="row">
                    <div className="col-xl-4 col-sm-6 col-12">
                        <div className="card network_stats mt-2">
                            <div className="card-content">
                                <div className="card-body">
                                    <div className="media d-flex">
                                        <div className="align-self-center">
                                            <Justify className="float-left" size={32}/>
                                        </div>
                                        <div className="media-body text-right float-right">
                                            <h4 className="font-weight-bold">{this.props.data.netdata.current_block}</h4> <span>Blockchain Height</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-4 col-sm-6 col-12">
                        <div className="card network_stats mt-2">
                            <div className="card-content">
                                <div className="card-body">
                                    <div className="media d-flex">
                                        <div className="align-self-center">
                                            <BarChartFill className="float-left" size={32} />
                                        </div>
                                        <div className="media-body text-right float-right">
                                            <h4 className="font-weight-bold">{this.props.data.hashrate}</h4> <span>Hashrate</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-4 col-sm-6 col-12">
                        <div className="card network_stats mt-2">
                            <div className="card-content">
                                <div className="card-body">
                                    <div className="media d-flex">
                                        <div className="align-self-center">
                                            <Wallet2 className="float-left" size={32} />
                                        </div>
                                        <div className="media-body text-right float-right">
                                            <h4 className="font-weight-bold">{this.props.data.netdata.btcValue}</h4> <span>Bitcoin Value</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-4 col-sm-6 col-12">
                        <div className="card network_stats mt-2">
                            <div className="card-content">
                                <div className="card-body">
                                    <div className="media d-flex">
                                        <div className="align-self-center">
                                            <PeopleFill className="float-left" size={32} />
                                        </div>
                                        <div className="media-body text-right float-right">
                                            <h4 className="font-weight-bold">{this.props.data.netdata.hostCount}</h4> <span>Total Hosts</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-4 col-sm-6 col-12">
                        <div className="card network_stats mt-2">
                            <div className="card-content">
                                <div className="card-body">
                                    <div className="media d-flex">
                                        <div className="align-self-center">
                                            <Hdd className="float-left" size={32} />
                                        </div>
                                        <div className="media-body text-right float-right">
                                            <h4 className="font-weight-bold">{this.props.data.totalStorage}</h4> <span>Total Storage</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-4 col-sm-6 col-12">
                        <div className="card network_stats mt-2">
                            <div className="card-content">
                                <div className="card-body">
                                    <div className="media d-flex">
                                        <div className="align-self-center">
                                            <HddFill className="float-left" size={32} />
                                        </div>
                                        <div className="media-body text-right float-right">
                                            <h4 className="font-weight-bold">{this.props.data.usedStorage}</h4> <span>Used Storage</span>
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

export default NetworkData;