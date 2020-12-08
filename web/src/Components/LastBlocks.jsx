import React, {Component} from "react";
import {Link} from 'react-router-dom';
import { Box } from 'react-bootstrap-icons';

class LastBlocks extends Component {
    render() {
        return (

            <div className="col-xl-6 col-sm-6 col-12 mt-2 mb-2">
                <div className="card">
                <div className="card-body">
                <h3 className="card-title">Last 10 Blocks</h3>
                <table className="overflow-auto">
                    <thead>
                        <tr>
                            <th>Maturity</th>
                            <th>Height</th>
                            <th>Datetime</th>
                        </tr>
                </thead>
                <tbody>
                {this.props.woot.lastblocks.map((block) => 
                <tr>
                    <td>{(Number(`${this.props.woot.netdata.current_block}`)-(Number(`${block.height}`))) > 72 ? <Box color="green" size={24} /> : <Box color="red" size={24} /> } </td>
                    <td><Link to={`/block/${block.height}`} key={block.height}>{block.height}</Link></td>
                    <td>{new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(`${block.timestamp}`*1000)} </td>
                </tr>
                
                )}
                </tbody>
                </table>
                </div>
                </div>
            </div>
        )
    }
}

export function readableDateTime(dt){ 
    return new Date(dt)
}

export default LastBlocks;