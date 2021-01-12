import React, {Component} from "react";
import axios from 'axios';
import config from '../config.json';

class BlockInfo extends Component {
    state = {
        blocktoQ: this.props.match.params.id,
        blockdata: '',
    }
    componentDidMount() {
        axios.get('https://'+config.api.url+':'+config.api.port+'/api/block/'+this.state.blocktoQ)
            .then(blockStuff => {
                console.log(blockStuff.data)
                this.setState({
                    blockdata: blockStuff.data
                })
            })
        }

    render() {
        return(
            <section className="blockInfo">
                Block#: {this.state.blockdata.height}
                <br/>
                Hash: {this.state.blockdata.hash}
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

export default BlockInfo;
