import React, {Component} from "react";
import NetworkData from '../Components/Network';
import LastBlocks from '../Components/LastBlocks';
import LastTx from '../Components/LastTx';
import MarketData from '../Components/Market';
import MarketChart from '../Components/MarketChart';
import { Helmet } from 'react-helmet';

class Home extends Component {
    render() {
        return(
            <section className="container">
                <Helmet>
                    <meta charSet="utf-8" />
                    <title>ScPrime Block Explorer - Home</title>
                    <meta name="description" content="ScPrime Explorer - A faster, more efficient solution to browsing the ScPrime blockchain." />
                </Helmet>
                <MarketData data={this.props.morestates}/>
                <MarketChart data={this.props.morestates}/>
                <NetworkData data={this.props.morestates}/>
                <div className="container-fluid">
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