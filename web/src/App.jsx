import React, {Component} from 'react';
import './Stylesheets/App.css';
import Container from "./Components/Container";
import axios from 'axios';
import config from './config.json'
import {Helmet} from "react-helmet";

class App extends Component {
  state = {
    netdata: [],
    hashrate: '',
    totalStorage: '',
    usedStorage: '',
    lastblocks: [],
    lasttx: [],
    market: [],
}
componentDidMount() {
    axios.get('https://'+config.api.url+':'+config.api.port+'/api/health')
        .then(blockStuff => {
            let hr = getReadableHashRateString(blockStuff.data.difficulty / blockStuff.data.blockfrequency);
            let sb = getReadableStorageString(blockStuff.data.totalStorage);
            let us = getReadableStorageString(blockStuff.data.usedStorage);
            console.log(blockStuff.data)
            this.setState({
                netdata: blockStuff.data,
                hashrate: hr,
                totalStorage: sb,
                usedStorage: us,
            })
        }).catch((err) => { 
            console.log(err);
        })

        axios.get('https://'+config.api.url+':'+config.api.port+'/api/last/10/blocks')
        .then(lastBlocks => {
            this.setState({
                lastblocks: lastBlocks.data
            })
        }).catch((err) => { 
            console.log(err);
        })

        axios.get('https://'+config.api.url+':'+config.api.port+'/api/last/20/tx')
        .then(lastTxs => {
          
            this.setState({
              lasttx: lastTxs.data
            })
        }).catch((err) => { 
            console.log(err);
        })

        axios.get('https://api.coingecko.com/api/v3/coins/siaprime-coin')
        .then(marketData => {
            //console.log(JSON.parse(JSON.stringify(marketData.data)));
            this.setState({
              market: JSON.parse(JSON.stringify(marketData.data))
            })
        }).catch((err) => { 
            console.log(err);
        })
}

  render() { 
      return (
    <div className="App flex-fill">
      <Helmet>
        <meta charSet="utf-8" />
        <title>ScPrime Block Explorer</title>
      </Helmet>
      <Container data={this.state}/>
    </div>
  );
}
}

export function getReadableHashRateString(hr) {
  var i = 0;
  var byteUnits = [' H', ' KH', ' MH', ' GH', ' TH', ' PH', ' EH'];
  while (hr > 1000) {
      hr = hr / 1000;
      i++;
  }
  return hr.toFixed(2) + byteUnits[i];
}

export function getReadableStorageString(storage) {
  var i = 0;
  var byteUnits = [' bytes', ' KB', ' MB', ' GB', ' TB', ' PB'];
  while (storage > 1024) {
      storage = storage / 1024;
      i++;
  }
  return storage.toFixed(2) + byteUnits[i];
}

export default App;
