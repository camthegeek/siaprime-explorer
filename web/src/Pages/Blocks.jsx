import React, {Component} from "react";
import axios from 'axios';

class BlockInfo extends Component {
    state = {
        blocktoQ: this.props.match.params.id,
        blockdata: '',
    }
    componentDidMount() {
        axios.get('http://192.168.1.2:42424/api/block/'+this.state.blocktoQ)
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