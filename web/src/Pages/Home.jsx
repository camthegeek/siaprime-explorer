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
                <div className="row">
                    <MarketData data={this.props.morestates}/>
                </div>
                <div className="row">
                    <MarketChart data={this.props.morestates}/>
                </div>
                <div className="row">
                    <NetworkData data={this.props.morestates}/>
                </div>
                <div className="row">
                    <LastTx lasttx={this.props.morestates}/>
                    <LastBlocks woot={this.props.morestates}/>
                </div>
            </section>
        )
    }
}

export default Home;