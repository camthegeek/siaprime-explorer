import React, {Component} from "react";
import NetworkData from '../Components/Network';
import LastBlocks from '../Components/LastBlocks';

class Home extends Component {
    render() {
        return(
            <section className="container">
                <NetworkData data={this.props.morestates}/>
                <LastBlocks woot={this.props.morestates}/>
            </section>
        )
    }
}

export default Home;