import React, { Component } from "react";
import axios from 'axios';
import Chart from "react-apexcharts";
import NumberFormat from "react-number-format";

/*
    The variables never get reset but they can.
    There's probably an easier way to calculate dates and junk too 
*/

let today = new Date(); // returns a full datetime string
let now = +new Date(); // same as above but in JS timestamp
let monthago = new Date().setDate(today.getDate()-30); // get date 30 days from today.
let dayago = new Date().setDate(today.getDate()-1); // get date 1 day from today.
let weekago = new Date().setDate(today.getDate()-7); // get date 7 days from today.
let hourago = new Date().setHours(today.getHours()-1); // get date 1 hour from today.
let yearago = new Date().setDate(today.getDate()-365); // get date 1 year from today.
let all = new Date('2018-10-30'); // untested

let cgPrice = []; // array for coingecko coin price in USD.
let cgMarketcap = []; // array for coingecko coin market_cap in USD.
let cgVolumes = []; // array for coingecko coin total_volumes in USD.
let cgBtcprice = []; // array for coingecko coin price in BTC.

class MarketCharts extends Component {
    constructor(props) {
        super(props);
        this.state = {
          series: [
                {
                    name: 'Bitcoin value',
                    data: [],
                    type: 'line',
                },
                {
                    name: 'USD value',
                    data: [],
                    type: 'line'
                },
                {
                    name: 'Volume',
                    data: [],
                    type: 'area'
                }
        ],
        series2: [
            {
                name: 'Market Cap',
                data: [],
                type: 'area'
            }
        ],
          options: {
            chart: {
                id: 'scp',
                animations: {
                    enabled: true,
                    easing: 'linear',
                    dynamicAnimation: {
                        speed: 1000
                    }
                },
            },
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true
                },
            },
            zoom: {
                enabled: true
            },
            colors: ['#FF9900', '#00FF00', '#0F00FF'],
            tooltip: {
              enabled: true,
              style: {
                fontSize: '12px',
                fontFamily: undefined
                },
                x: {
                    formatter: function (timestamp) {
                        return new Date(timestamp);
                    }, 
                }
            },
            stroke: {
                curve: 'straight',
                width: 2  
            },
            xaxis: {
                type: 'datetime',
                lines: {
                    show: true               
                }                
            },
            yaxis: [
                {
                    seriesName: 'Bitcoin value',
                    show: false,
                    labels: {
                        formatter: (val, index) => {
                            return val.toFixed(8); },
                        }
                },
                {
                    seriesName: 'USD value',
                    show: false,
                    labels: {
                        formatter: (val, index) => {
                            return '$'+val.toLocaleString(); },
                        }
                },
                {
                    seriesName: 'Volume',
                    opposite: true,
                    show: false,
                    labels: {
                    formatter: (val, index) => {
                        return '$'+val.toLocaleString(); },
                    }
                }                
            ]      
          },
          options2: {
            chart: {
                id: 'scp-mc',
                animations: {
                    enabled: true,
                    easing: 'linear',
                    dynamicAnimation: {
                        speed: 1000
                    }
                },
            },
            toolbar: {
                show: false,
                tools: {
                    download: false,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false
                },
            },
            colors: ['#d1d1d1'],
            tooltip: {
              enabled: true,
              style: {
                fontSize: '12px',
                fontFamily: undefined
                },
                x: {
                    formatter: function (timestamp) {
                        return new Date(timestamp)
                    }, 
                }
            },
            stroke: {
                curve: 'straight',
                width: 2  
            },
            xaxis: {
                type: 'datetime',
                lines: {
                    show: true               
                }                
            },
            yaxis: [
                {
                    seriesName: 'Market Cap',
                    show: false,
                    labels: {
                    formatter: (val, index) => {
                        return '$'+val.toLocaleString(); },
                    }
                }
                
            ]          
                   
          }
        }
      }
    componentDidMount(){
		axios.get('https://api.coingecko.com/api/v3/coins/siaprime-coin/market_chart/range?vs_currency=USD&from='+parseInt(dayago/1000)+'&to='+parseInt(now/1000))
		.then((response) => {
			return response.data;
		})
		.then((data) => {
			for (var i = 0; i < data.prices.length; i++) {
				cgPrice.push({
                    x: new Date(data.prices[i]["0"]).getTime(),
					y: data.prices[i]["1"]
                });
            }
            for (var i = 0; i < data.total_volumes.length; i++) {
                cgVolumes.push({
                    x: new Date(data.total_volumes[i]["0"]).getTime(),
                    y: data.total_volumes[i]["1"]
                })
            }
            for (var i = 0; i < data.market_caps.length; i++) {
                cgMarketcap.push({
                    x: new Date(data.market_caps[i]["0"]).getTime(),
                    y: data.market_caps[i]["1"]
                });
             }
             axios.get('https://api.coingecko.com/api/v3/coins/siaprime-coin/market_chart/range?vs_currency=BTC&from='+parseInt(dayago/1000)+'&to='+parseInt(now/1000))
                .then((response) => {
                    return response.data;
                })
                .then((data) => {
                    for (var i = 0; i < data.prices.length; i++) {
                        cgBtcprice.push({
                            x: new Date(data.prices[i]["0"]).getTime(),
                            y: data.prices[i]["1"]
                        });
                    }
                this.setState({
                    series: [
                        {
                        name: 'Bitcoin value',
                        data: cgBtcprice,
                        type: 'line'
                    },
                    {
                        name: 'USD value',
                        data: cgPrice,
                        type: 'line'
                    },
                    {
                        name: 'Volume',
                        data: cgVolumes,
                        type: 'area'
                    },
                ],
                series2: [
                    {
                        name: 'Market Cap',
                        data: cgMarketcap,
                        type: 'bar'
                    }]
                })
            })
			
        })
        .catch((error) => {
            console.log(error)
        })
    }
    resetSomething = () => {
        cgPrice = [];
        cgMarketcap = [];
        cgVolumes = [];
        cgBtcprice = [];
        this.setState({
            series: [
                {
                name: '',
                data: [],
                type: 'line'
            },    
            {
                name: '',
                data: [],
                type: 'line'
            },
            {
                name: '',
                data: [],
                type: 'area'
            }],
            series2: [
            {
                name: '',
                data: [],
                type: 'bar'
            }
        ]
        })
    }
    getHourly = () => {
        this.resetSomething();
        console.log('get hourly poked');
        axios.get('https://api.coingecko.com/api/v3/coins/siaprime-coin/market_chart/range?vs_currency=USD&from='+parseInt(hourago/1000)+'&to='+parseInt(now/1000))
		.then((response) => {
			return response.data;
		})
		.then((data) => {
			for (var i = 0; i < data.prices.length; i++) {
				cgPrice.push({
                    x: new Date(data.prices[i]["0"]).getTime(),
					y: data.prices[i]["1"]
                });
            }
            for (var i = 0; i < data.total_volumes.length; i++) {
                cgVolumes.push({
                    x: new Date(data.total_volumes[i]["0"]).getTime(),
                    y: data.total_volumes[i]["1"]
                })
            }
            for (var i = 0; i < data.market_caps.length; i++) {
                cgMarketcap.push({
                    x: new Date(data.market_caps[i]["0"]).getTime(),
                    y: data.market_caps[i]["1"]
                });
             }
             axios.get('https://api.coingecko.com/api/v3/coins/siaprime-coin/market_chart/range?vs_currency=BTC&from='+parseInt(hourago/1000)+'&to='+parseInt(now/1000))
                .then((response) => {
                    return response.data;
                })
                .then((data) => {
                    for (var i = 0; i < data.prices.length; i++) {
                        cgBtcprice.push({
                            x: new Date(data.prices[i]["0"]).getTime(),
                            y: data.prices[i]["1"]
                        });
                    }
                this.setState({
                    series: [
                        {
                        name: 'Bitcoin value',
                        data: cgBtcprice,
                        type: 'line'
                    },
                    {
                        name: 'USD value',
                        data: cgPrice,
                        type: 'line'
                    },
                    {
                        name: 'Volume',
                        data: cgVolumes,
                        type: 'area'
                    },
                ],
                series2: [
                    {
                        name: 'Market Cap',
                        data: cgMarketcap,
                        type: 'bar'
                    }]
                })
            })
			
        })
        .catch((error) => {
            console.log(error)
        })
    }
    getDaily = () => {
        this.resetSomething();
        console.log('get hourly poked');
        axios.get('https://api.coingecko.com/api/v3/coins/siaprime-coin/market_chart/range?vs_currency=USD&from='+parseInt(dayago/1000)+'&to='+parseInt(now/1000))
		.then((response) => {
			return response.data;
		})
		.then((data) => {
			for (var i = 0; i < data.prices.length; i++) {
				cgPrice.push({
                    x: new Date(data.prices[i]["0"]).getTime(),
					y: data.prices[i]["1"]
                });
            }
            for (var i = 0; i < data.total_volumes.length; i++) {
                cgVolumes.push({
                    x: new Date(data.total_volumes[i]["0"]).getTime(),
                    y: data.total_volumes[i]["1"]
                })
            }
            for (var i = 0; i < data.market_caps.length; i++) {
                cgMarketcap.push({
                    x: new Date(data.market_caps[i]["0"]).getTime(),
                    y: data.market_caps[i]["1"]
                });
             }
             axios.get('https://api.coingecko.com/api/v3/coins/siaprime-coin/market_chart/range?vs_currency=BTC&from='+parseInt(dayago/1000)+'&to='+parseInt(now/1000))
                .then((response) => {
                    return response.data;
                })
                .then((data) => {
                    for (var i = 0; i < data.prices.length; i++) {
                        cgBtcprice.push({
                            x: new Date(data.prices[i]["0"]).getTime(),
                            y: data.prices[i]["1"]
                        });
                    }
                this.setState({
                    series: [
                        {
                        name: 'Bitcoin value',
                        data: cgBtcprice,
                        type: 'line'
                    },
                    {
                        name: 'USD value',
                        data: cgPrice,
                        type: 'line'
                    },
                    {
                        name: 'Volume',
                        data: cgVolumes,
                        type: 'area'
                    },
                ],
                series2: [
                    {
                        name: 'Market Cap',
                        data: cgMarketcap,
                        type: 'bar'
                    }]
                })
            })
			
        })
        .catch((error) => {
            console.log(error)
        })
    }
    getWeekly = () => {
        this.resetSomething();
        console.log('get hourly poked');
        axios.get('https://api.coingecko.com/api/v3/coins/siaprime-coin/market_chart/range?vs_currency=USD&from='+parseInt(weekago/1000)+'&to='+parseInt(now/1000))
		.then((response) => {
			return response.data;
		})
		.then((data) => {
			for (var i = 0; i < data.prices.length; i++) {
				cgPrice.push({
                    x: new Date(data.prices[i]["0"]).getTime(),
					y: data.prices[i]["1"]
                });
            }
            for (var i = 0; i < data.total_volumes.length; i++) {
                cgVolumes.push({
                    x: new Date(data.total_volumes[i]["0"]).getTime(),
                    y: data.total_volumes[i]["1"]
                })
            }
            for (var i = 0; i < data.market_caps.length; i++) {
                cgMarketcap.push({
                    x: new Date(data.market_caps[i]["0"]).getTime(),
                    y: data.market_caps[i]["1"]
                });
             }
             axios.get('https://api.coingecko.com/api/v3/coins/siaprime-coin/market_chart/range?vs_currency=BTC&from='+parseInt(weekago/1000)+'&to='+parseInt(now/1000))
                .then((response) => {
                    return response.data;
                })
                .then((data) => {
                    for (var i = 0; i < data.prices.length; i++) {
                        cgBtcprice.push({
                            x: new Date(data.prices[i]["0"]).getTime(),
                            y: data.prices[i]["1"]
                        });
                    }
                this.setState({
                    series: [
                        {
                        name: 'Bitcoin value',
                        data: cgBtcprice,
                        type: 'line'
                    },
                    {
                        name: 'USD value',
                        data: cgPrice,
                        type: 'line'
                    },
                    {
                        name: 'Volume',
                        data: cgVolumes,
                        type: 'area'
                    },
                ],
                series2: [
                    {
                        name: 'Market Cap',
                        data: cgMarketcap,
                        type: 'bar'
                    }]
                })
            })
			
        })
        .catch((error) => {
            console.log(error)
        })
    }
    getMonthly = () => {
        console.log('get monthly poked');
        this.resetSomething();
        console.log('get hourly poked');
        axios.get('https://api.coingecko.com/api/v3/coins/siaprime-coin/market_chart/range?vs_currency=USD&from='+parseInt(monthago/1000)+'&to='+parseInt(now/1000))
		.then((response) => {
			return response.data;
		})
		.then((data) => {
			for (var i = 0; i < data.prices.length; i++) {
				cgPrice.push({
                    x: new Date(data.prices[i]["0"]).getTime(),
					y: data.prices[i]["1"]
                });
            }
            for (var i = 0; i < data.total_volumes.length; i++) {
                cgVolumes.push({
                    x: new Date(data.total_volumes[i]["0"]).getTime(),
                    y: data.total_volumes[i]["1"]
                })
            }
            for (var i = 0; i < data.market_caps.length; i++) {
                cgMarketcap.push({
                    x: new Date(data.market_caps[i]["0"]).getTime(),
                    y: data.market_caps[i]["1"]
                });
             }
             axios.get('https://api.coingecko.com/api/v3/coins/siaprime-coin/market_chart/range?vs_currency=BTC&from='+parseInt(monthago/1000)+'&to='+parseInt(now/1000))
                .then((response) => {
                    return response.data;
                })
                .then((data) => {
                    for (var i = 0; i < data.prices.length; i++) {
                        cgBtcprice.push({
                            x: new Date(data.prices[i]["0"]).getTime(),
                            y: data.prices[i]["1"]
                        });
                    }
                this.setState({
                    series: [
                        {
                        name: 'Bitcoin value',
                        data: cgBtcprice,
                        type: 'line'
                    },
                    {
                        name: 'USD value',
                        data: cgPrice,
                        type: 'line'
                    },
                    {
                        name: 'Volume',
                        data: cgVolumes,
                        type: 'area'
                    },
                ],
                series2: [
                    {
                        name: 'Market Cap',
                        data: cgMarketcap,
                        type: 'bar'
                    }]
                })
            })
			
        })
        .catch((error) => {
            console.log(error)
        })
    }
    getYearly = () => {
        console.log('get year poked');
        this.resetSomething();
        console.log('get hourly poked');
        axios.get('https://api.coingecko.com/api/v3/coins/siaprime-coin/market_chart/range?vs_currency=USD&from='+parseInt(yearago/1000)+'&to='+parseInt(now/1000))
		.then((response) => {
			return response.data;
		})
		.then((data) => {
			for (var i = 0; i < data.prices.length; i++) {
				cgPrice.push({
                    x: new Date(data.prices[i]["0"]).getTime(),
					y: data.prices[i]["1"]
                });
            }
            for (var i = 0; i < data.total_volumes.length; i++) {
                cgVolumes.push({
                    x: new Date(data.total_volumes[i]["0"]).getTime(),
                    y: data.total_volumes[i]["1"]
                })
            }
            for (var i = 0; i < data.market_caps.length; i++) {
                cgMarketcap.push({
                    x: new Date(data.market_caps[i]["0"]).getTime(),
                    y: data.market_caps[i]["1"]
                });
             }
             axios.get('https://api.coingecko.com/api/v3/coins/siaprime-coin/market_chart/range?vs_currency=BTC&from='+parseInt(yearago/1000)+'&to='+parseInt(now/1000))
                .then((response) => {
                    return response.data;
                })
                .then((data) => {
                    for (var i = 0; i < data.prices.length; i++) {
                        cgBtcprice.push({
                            x: new Date(data.prices[i]["0"]).getTime(),
                            y: data.prices[i]["1"]
                        });
                    }
                this.setState({
                    series: [
                        {
                        name: 'Bitcoin value',
                        data: cgBtcprice,
                        type: 'line'
                    },
                    {
                        name: 'USD value',
                        data: cgPrice,
                        type: 'line'
                    },
                    {
                        name: 'Volume',
                        data: cgVolumes,
                        type: 'area'
                    },
                ],
                series2: [
                    {
                        name: 'Market Cap',
                        data: cgMarketcap,
                        type: 'bar'
                    }]
                })
            })
			
        })
        .catch((error) => {
            console.log(error)
        })
    }
    render() {
        if (!this.props.data.market.market_data) {
            return null;
        }
        return (
            <div className="col-xl-12 col-sm-12 col-12 mt-2 mb-2">
                <div className="card">
                    <div className="card-body">
                    <div className="row">
                        <span className="btn btn-light" onClick={this.getHourly}>Hour</span>
                        <span className="btn btn-light" onClick={this.getDaily}>Day</span>
                        <span className="btn btn-light" onClick={this.getWeekly}>Week</span>
                        <span className="btn btn-light" onClick={this.getMonthly}>Month</span>
                        <span className="btn btn-light" onClick={this.getYearly}>Year</span>
                        <span className="btn btn-light">All</span> 
                    </div>
                    <div className="row">
                        <div className="col-xl-12 col-12">
                    <Chart
                    options={this.state.options}
                    series={this.state.series}
                    height='400'
                    width='100%'
                    />
                    <Chart
                    options={this.state.options2}
                    series={this.state.series2}
                    height='100'
                    width='100%'
                    />
                    </div>
                    </div>
                    <div className="row">
                        <div className="col-xl-2 col-sm-12 mb-2">
                        <h6 className="text-muted">Market Cap</h6>
                        <NumberFormat decimalScale={'2'} value={this.props.data.market.market_data.market_cap.usd} displayType={'text'} thousandSeparator={true} prefix={'$'}/>
                        </div>
                        <div className="col-xl-2 col-sm-12 mb-2">
                        <h6 className="text-muted">Total Volume (24h)</h6>
                        <NumberFormat decimalScale={'2'} value={this.props.data.market.market_data.total_volume.usd}  displayType={'text'} thousandSeparator={true} prefix={'$'}/>
                        </div>
                        <div className="col-xl-3 col-sm-12 mb-2">
                        <h6 className="text-muted">Change (Market Cap 24h)</h6>
                        <NumberFormat decimalScale={'2'} value={this.props.data.market.market_data.market_cap_change_24h} displayType={'text'} thousandSeparator={true} prefix={'$'} className={(this.props.data.market.market_data.market_cap_change_24h < 0) ? 'text-danger font-weight-bold' : 'text-success font-weight-bold' }/>
                        </div>
                        <div className="col-xl-3 col-sm-12 mb-2">
                        <h6 className="text-muted">Circulating Supply</h6>
                        <NumberFormat value={this.props.data.market.market_data.circulating_supply} displayType={'text'} thousandSeparator={true} suffix={' SCP'}/>
                        </div>
                        <div className="col-xl-2 col-sm-12 mb-2">
                        <h6 className="text-muted">All Time High</h6>
                        <NumberFormat decimalScale={'2'} value={this.props.data.market.market_data.ath.usd} displayType={'text'} thousandSeparator={true} prefix={'$'}/>
                        </div>
                    </div>
                    </div>
                </div>
            </div>

        )
    }
}

export default MarketCharts;