import React, {Component} from "react";
import {Link} from 'react-router-dom';

class LastBlocks extends Component {
    render() {
        return (
            <div className="col-xl-6 col-sm-6 col-12">
                <div className="card">
                <div class="card-body">
                <h3 className="card-title">Last 10 Blocks</h3>
                <table className="overflow-auto">
                    <td>Height</td>
                    <td>Datetime</td>
                    <td>Maturity</td>
                {this.props.woot.lastblocks.map((block) => 
                <tr>
                <td><Link to={`/block/${block.height}`} key={block.height}>{block.height}</Link></td>
                <td>{new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(`${block.timestamp}`*1000)} </td>
                <td> {(Number(`${this.props.woot.netdata.current_block}`)-(Number(`${block.height}`)))}</td>
                </tr>
                
                )}
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