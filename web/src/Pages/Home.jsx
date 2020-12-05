import React, {Component} from "react";
import NetworkData from '../Components/Network';
import LastBlocks from '../Components/LastBlocks';
import LastTx from '../Components/LastTx';

class Home extends Component {
    render() {
        return(
            <section className="container">
                <NetworkData data={this.props.morestates}/>
                <div class="container-fluid">
                    <div className="row">
                <LastBlocks woot={this.props.morestates}/>
                <LastTx lasttx={this.props.morestates}/>
                </div>
                </div>
            </section>
        )
    }
}

export default Home;