import React, {Component} from "react";
import axios from 'axios';
import config from '../config.json';

class TxInfo extends Component {
    state = {
        txtoQ: this.props.match.params.hash,
        txdata: '',
    }
    componentDidMount() {
        axios.get('https://'+config.api.url+':'+config.api.port+'/api/tx/'+this.state.txtoQ)
            .then(txinfo => {
                console.log(txinfo.data)
                this.setState({
                    txdata: txinfo.data
                })
            })
        }

    render() {
        return(
            <section className="txInfo">
                Transaction hash: {this.state.txdata.hash}<br/>
                Block#: {this.state.txdata.height}
                <br/>
                Hash: {this.state.txdata.hash}
                <br/>
                Transactions in block: need to code this into api
                <br/>
                bunch of other data needed.
                <br/>

                <br/>

                <br/>
            </section>
        )
    }
}

export default TxInfo;
