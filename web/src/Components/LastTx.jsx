import React, { Component } from "react";
import { Link } from 'react-router-dom';
//import { Check, Box } from 'react-bootstrap-icons';

class LastTx extends Component {
    render() {
        return (
            <div className="col-xl-12 col-sm-12 col-12 mt-2 mb-2">
                <div className="card">
                    <div className="card-body">
                        <h3 className="card-title">Latest Transactions</h3>
                        <table className="overflow-auto">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Height</th>
                                    <th>Datetime</th>
                                    <th>Amount</th>
                                    <th>Hash</th>
                                </tr>
                            </thead>
                            <tbody>
                            {this.props.lasttx.lasttx.map((tx) => {
                                let type = '';
                                switch (tx.tx_type) {
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
                                }
                                return (
                                    <tr>
                                        <td>{type}</td>
                                        <td><Link to={`/block/${tx.block_height}`} key={tx.block_height}>{tx.block_height}</Link></td>
                                        <td>{new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(`${tx.timestamp}`)} </td>
                                        <td>{tx.tx_total}</td>
                                        <td><Link to={`/block/${tx.tx_hash}`} key={tx.tx_hash}>{tx.tx_hash}</Link></td>
                                    </tr>
                                )
                            }
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        )
    }
}

export function readableDateTime(dt) {
    return new Date(dt)
}

export default LastTx;