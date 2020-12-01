import {Component} from 'react';
import axios from 'axios';

class BlockData extends Component {
    state = {
        blockdata: [],
    }
    componentDidMount() {
        axios.get('http://192.168.1.2:42424/api/health')
        .then(blockStuff => {
            console.log(blockStuff.data);
            this.setState({ blockdata: blockStuff.data })
        })

    }
    render () {
        return (
            <section className="BlockData">
                <span>bLOCK hEIGHT: {this.state.blockdata.height}</span>

                <span>Difficulty: {this.state.blockdata.difficulty}</span>
                
            </section>
        )
    }



}

export default BlockData;