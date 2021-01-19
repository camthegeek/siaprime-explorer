import React, {Component} from "react";
import axios from 'axios';
import config from '../config.json';
import { Box } from 'react-bootstrap-icons';
import TimeAgo from 'react-timeago'
import NumberFormat from 'react-number-format';
import { Link } from 'react-router-dom';

class BlockInfo extends Component {
    state = {
        blocktoQ: this.props.match.params.id,
        blockdata: '',
        current: [],
        blockTxs: [],
        contractCount: 0,
        txCount: 0
    }
    componentDidMount() {
        axios.get('https://'+config.api.url+':'+config.api.port+'/api/block/'+this.state.blocktoQ)
            .then(blockStuff => {
                console.log(blockStuff.data)
                this.setState({
                    blockdata: blockStuff.data
                })
            })
            .catch((error) => {
                console.log(error)
            })
            axios.get('https://'+config.api.url+':'+config.api.port+'/api/health')
            .then((current) => {
                this.setState({
                    current: current.data
                })
            })
            .catch((nasty) => {
                console.log(nasty)
            })
            axios.get('https://'+config.api.url+':'+config.api.port+'/api/tx/'+this.state.blocktoQ)
            .then((txs) => {
                let cCount = 0;
                for (var i = 0; i<txs.data.length;i++) {
                    if (txs.data[i].type == 'contract') {
                        cCount++
                    }
                }
                this.setState({
                    blockTxs: txs.data,
                    contractCount: cCount,
                    txCount: txs.data.length
                })
            })
            .catch((nasty) => {
                console.log(nasty)
            })
        }

    render() {
        let blockTime = new Date(Number(`${this.state.blockdata.timestamp*1000}`));
        let averageCosts = this.state.blockdata.activecontractcost / this.state.blockdata.activecontractcount;
        if (!this.state.blockdata || !this.state.current || !this.state.blockTxs) {
            return null;
        }
        return(
            <section className="blockInfo container">
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-content">
                                <div className="row">
                                    <div className="col-xl-8 col-sm-12 d-flex">
                                        <Box size={36} className="mr-4" /> <h2>Block #{this.state.blockdata.height}</h2>
                                    </div>
                                    <div className="col-xl-4 col-sm-12">
                                        <a href={`/block/${this.state.blockdata.height-1}`}>{this.state.blockdata.height-1}</a>
                                        - 
                                        this block 
                                        - 
                                        Mining?
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mt-2">
                    <div className="col-12 p-2">
                        <div className="card">
                            <div className="card-content">
                                <div className="row">
                                    <div className="col-xl-12 col-sm-12 d-flex">
                                        <span className="badge badge-success">Hash</span> <span className="text-muted">{this.state.blockdata.hash}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mt-2">
                    <div className="col-12 p-2">
                        <div className="card">
                            <div className="card-content">
                                        <div className="row">                                    
                                        <div className="col-xl-12 col-sm-12">
                                     <h4>Summary</h4>
                                    </div>
                                            <div className="col-xl-12 col-sm-12">
                                        <table className="table table-borderless table-responsive">
                                        <tbody>
                                            <tr>
                                                <th scope="row">Age</th>
                                                <td className="text-right">
                                                    <span>
                                                       <TimeAgo date={blockTime}/>
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Date</th>
                                                <td className="text-right">
                                                    <span>
                                                        {blockTime.toString()}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Height</th>
                                                <td className="text-right">
                                                    <span>
                                                        {this.state.blockdata.height}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Confirmations</th>
                                                <td className="text-right">
                                                    <span>
                                                        {`${this.state.current.current_block}` - `${this.state.blockdata.height}`}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Difficulty</th>
                                                <td className="text-right">
                                                    <span>
                                                    {getReadableHashRateString(`${this.state.blockdata.difficulty}`)}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Hashrate</th>
                                                <td className="text-right">
                                                    <span>
                                                    {getReadableHashRateString(`${this.state.blockdata.estimatedhashrate}`)}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Circulating SCP</th>
                                                <td className="text-right">
                                                    <span>
                                                    <NumberFormat value={this.state.blockdata.totalcoins} displayType={'text'} thousandSeparator={true} decimalScale="2"/>
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Historic Tx Count</th>
                                                <td className="text-right">
                                                    <span>
                                                    <NumberFormat value={this.state.blockdata.transactioncount} displayType={'text'} thousandSeparator={true} decimalScale="2"/>
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Historic Contracts</th>
                                                <td className="text-right">
                                                    <span>
                                                    <NumberFormat value={this.state.blockdata.filecontractcount} displayType={'text'} thousandSeparator={true} decimalScale="2"/>
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Historic Contract Volume</th>
                                                <td className="text-right">
                                                    <span>
                                                    {this.state.blockdata.totalcontractsize}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Historic Contract Costs</th>
                                                <td className="text-right">
                                                    <span>
                                                    <NumberFormat value={this.state.blockdata.totalcontractcost} displayType={'text'} thousandSeparator={true} suffix={' SCP'} decimalScale="2"/>
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Historic Revisions</th>
                                                <td className="text-right">
                                                    <span>
                                                    <NumberFormat value={this.state.blockdata.filecontractrevisioncount} displayType={'text'} thousandSeparator={true} decimalScale="2"/>
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Historic Revisions Volume</th>
                                                <td className="text-right">
                                                    <span>
                                                    {this.state.blockdata.totalrevisionvolume}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Historic Revisions</th>
                                                <td className="text-right">
                                                    <span>
                                                    <NumberFormat value={this.state.blockdata.filecontractrevisioncount} displayType={'text'} thousandSeparator={true} decimalScale="2"/>
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Historic Storage PRoofs</th>
                                                <td className="text-right">
                                                    <span>
                                                    <NumberFormat value={this.state.blockdata.storageproofcount} displayType={'text'} thousandSeparator={true} decimalScale="2"/>
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Active contract count</th>
                                                <td className="text-right">
                                                    <span>
                                                    <NumberFormat value={this.state.blockdata.activecontractcount} displayType={'text'} thousandSeparator={true} decimalScale="2"/>
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Active contract size</th>
                                                <td className="text-right">
                                                    <span>
                                                    {this.state.blockdata.activecontractsize}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Active contract cost</th>
                                                <td className="text-right">
                                                    <span>
                                                    <NumberFormat value={this.state.blockdata.activecontractcost} displayType={'text'} thousandSeparator={true} suffix={' SCP'} decimalScale="2"/>
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Average contract cost</th>
                                                <td className="text-right">
                                                    <span>
                                                    <NumberFormat value={averageCosts} displayType={'text'} thousandSeparator={true} suffix={' SCP'} decimalScale="2"/>
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>

                                                <th scope="row">Contains Contract(s)</th>
                                                <td className="text-right">
                                                    <span>
                                                        {this.state.contractCount > 0 ? "Yes" : "No"}
                                                    </span>
                                                </td>

                                            </tr>
                                            <tr>
                                                <th scope="row">Transactions in block</th>
                                                    <td className="text-right">
                                                        <span>
                                                            {this.state.txCount}
                                                        </span>
                                                    </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                        </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="row mt-2">
                    <div className="col-12 p-2">
                        <div className="card">
                            <div className="card-content">
                                <div className="row">
                                    <div className="col-xl-12 col-sm-12 d-flex">
                                        <h3>Transactions</h3>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xl-12 col-sm-12 d-flex">
                                        <table className="table table-borderless layout-fixed">
                                            <thead>
                                                <tr>
                                                    <th>Type</th>
                                                    <th>Total</th>
                                                    <th>Hash</th>
                                                    <th>Fee</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.state.blockTxs.map((tx, i) => {
                                                    let type = '';
                                                    switch (tx.type) {
                                                        case 'sctx':
                                                            type = 'SCP';
                                                            break;

                                                        case 'coinbase':
                                                            type = "Miner Payout"
                                                            break;

                                                        case 'hostann':
                                                            type = "Host Ann"
                                                        break;

                                                        case 'sftx':
                                                            type = "SPF"
                                                        break;

                                                        case 'contract':
                                                            type = "Contract"

                                                        break;

                                                        case 'revision':
                                                            type = "Revision"
                                                        break;

                                                        case 'storageproof':
                                                            type = "Storage Proof"
                                                        break;
                                                    }
                                                    return (
                                                        <tr key={i}>
                                                            <td>{type}</td>
                                                            <td>{tx.total}</td>
                                                            <td><Link to={`/tx/${tx.hash}`} key={tx.hash}>{tx.hash}</Link></td>
                                                            <td>{tx.fees}</td>
                                                        </tr>
                                                    )

                                                })} 
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

export function getReadableHashRateString(hr) {
    var i = 0;
    var byteUnits = [' H', ' KH', ' MH', ' GH', ' TH', ' PH', ' EH'];
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

export default BlockInfo;
