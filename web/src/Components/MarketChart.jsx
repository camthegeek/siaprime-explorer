import React, { Component } from "react";
import axios from 'axios';
import Chart from "react-apexcharts";
import NumberFormat from "react-number-format";

let dataPoints = []; 
let usdPoints = [];
class MarketCharts extends Component {
    constructor(props) {
        super(props);
        this.state = {
          series: [
                {
                    name: 'Bitcoin value',
                    data: []
                },
                {
                    name: 'USD value',
                    data: []
                }

        ],
          options: {
            chart: {
                id: 'scp-test',
                type: 'line',
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
            colors: ['#FF9900', '#00FF00'],
            grid: {
                show: false,
                strokeDashArray: 1,
                borderColor: "#00ff00",
                xaxis: {
                    lines: {
                        show: true
                    }
                },
                yaxis: {
                    lines: {
                        show: true
                    }
                },
            },
            tooltip: {
              enabled: true,
              style: {
                fontSize: '12px',
                fontFamily: undefined
            },
            },
            stroke: {
                curve: 'smooth',
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
                    seriesName: 'Bitcoin value'
                },
                {
                    seriesName: 'USD value',
                    opposite: true
                }
            ]          
                   
          }
        }
      }
    componentDidMount(){
		axios.get('https://api.aeon.run/api/market/287')
		.then((response) => {
			return response.data.data;
		})
		.then((data) => {
			for (var i = 0; i < data.length; i++) {
				dataPoints.push({
					x: new Date(data[i].timestamp*1).getTime(),
					y: data[i].btc_value
                });
                usdPoints.push({
                    x: new Date(data[i].timestamp*1).getTime(),
                    y: data[i].usd_value
                })
            }
            this.setState({
                series: [{
                    name: 'Bitcoin value',
                    data: dataPoints
                },
                {
                    name: 'USD value',
                    data: usdPoints
                }]
            })
			
        })
    }
    resetSomething = () => {
        this.setState({
            series: [
                {
                name: '',
                data: []
            },    
            {
                name: '',
                data: []
            }
        ]
        })
    }
    getHourly = () => {
        dataPoints = [];
        usdPoints = [];
        this.resetSomething();
        console.log('get hourly poked');
        axios.get('https://api.aeon.run/api/market/13')
		.then((response) => {
			return response.data.data;
		})
		.then((data) => {
			for (var i = 0; i < data.length; i++) {
				dataPoints.push({
					x: new Date(data[i].timestamp*1).getTime(),
					y: data[i].btc_value
                });
                usdPoints.push({
                    x: new Date(data[i].timestamp*1).getTime(),
                    y: data[i].usd_value
                })
            }
            this.setState({
                series: [{
                    name: 'Bitcoin value',
                    data: dataPoints
                },
                {
                    name: 'USD value',
                    data: usdPoints
                }]
            })
        })
    }
    getDaily = () => {
        console.log('get daily poked');
        dataPoints = [];
        usdPoints = [];
        this.resetSomething();
        axios.get('https://api.aeon.run/api/market/289')
		.then((response) => {
			return response.data.data;
		})
		.then((data) => {
			for (var i = 0; i < data.length; i++) {
				dataPoints.push({
					x: new Date(data[i].timestamp*1).getTime(),
					y: data[i].btc_value
                });
                usdPoints.push({
                    x: new Date(data[i].timestamp*1).getTime(),
                    y: data[i].usd_value
                })
            }
            this.setState({
                series: [{
                    name: 'Bitcoin value',
                    data: dataPoints
                },
                {
                    name: 'USD value',
                    data: usdPoints
                }]
            })
        })
    }
    getWeekly = () => {
        console.log('get weekly poked');
        dataPoints = [];
        usdPoints = [];
        this.resetSomething();
        axios.get('https://api.aeon.run/api/market/2016')
		.then((response) => {
			return response.data.data;
		})
		.then((data) => {
			for (var i = 0; i < data.length; i++) {
				dataPoints.push({
					x: new Date(data[i].timestamp*1).getTime(),
					y: data[i].btc_value
                });
                usdPoints.push({
                    x: new Date(data[i].timestamp*1).getTime(),
                    y: data[i].usd_value
                })
            }
            this.setState({
                series: [{
                    name: 'Bitcoin value',
                    data: dataPoints
                },
                {
                    name: 'USD value',
                    data: usdPoints
                }]
            })
        })
    }
    getMonthly = () => {
        console.log('get monthly poked');
        dataPoints = [];
        usdPoints = [];
        this.resetSomething();
        axios.get('https://api.aeon.run/api/market/8640')
		.then((response) => {
			return response.data.data;
		})
		.then((data) => {
			for (var i = 0; i < data.length; i++) {
				dataPoints.push({
					x: new Date(data[i].timestamp*1).getTime(),
					y: data[i].btc_value
                });
                usdPoints.push({
                    x: new Date(data[i].timestamp*1).getTime(),
                    y: data[i].usd_value
                })
            }
            this.setState({
                series: [{
                    name: 'Bitcoin value',
                    data: dataPoints
                },
                {
                    name: 'USD value',
                    data: usdPoints
                }]
            })
        })
    }
    getYearly = () => {
        console.log('get year poked');
        dataPoints = [];
        usdPoints = [];
        this.resetSomething();
        axios.get('https://api.aeon.run/api/market/103680')
		.then((response) => {
			return response.data.data;
		})
		.then((data) => {
			for (var i = 0; i < data.length; i++) {
				dataPoints.push({
					x: new Date(data[i].timestamp*1).getTime(),
					y: data[i].btc_value
                });
                usdPoints.push({
                    x: new Date(data[i].timestamp*1).getTime(),
                    y: data[i].usd_value
                })
            }
            this.setState({
                series: [{
                    name: 'Bitcoin value',
                    data: dataPoints
                },
                {
                    name: 'USD value',
                    data: usdPoints
                }]
            })
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
                    </div>
                    </div>
                    <div className="row">
                        <div className="col-xl-2 col-sm-6 col-2">
                        <h6 className="text-muted">Market Cap</h6> <br/>
                        <NumberFormat value={this.props.data.market.market_data.market_cap.usd} displayType={'text'} thousandSeparator={true} prefix={'$'}/>
                        </div>
                        <div className="col-xl-2 col-sm-6 col-2">
                        <h6 className="text-muted">Total Volume (24h)</h6> <br/>
                        <NumberFormat value={this.props.data.market.market_data.total_volume.usd}  displayType={'text'} thousandSeparator={true} prefix={'$'}/>
                        </div>
                        <div className="col-xl-3 col-sm-6 col-2">
                        <h6 className="text-muted">Change (Market Cap 24h)</h6> <br/>
                        <NumberFormat value={this.props.data.market.market_data.market_cap_change_24h} displayType={'text'} thousandSeparator={true} prefix={'$'}/>
                        </div>
                        <div className="col-xl-3 col-sm-6 col-2">
                        <h6 className="text-muted">Circulating Supply</h6><br/>
                        <NumberFormat value={this.props.data.market.market_data.circulating_supply} displayType={'text'} thousandSeparator={true} suffix={' SCP'}/>
                        </div>
                        <div className="col-xl-2 col-sm-6 col-2">
                        <h6 className="text-muted">All Time High</h6><br/>
                        <NumberFormat value={this.props.data.market.market_data.ath.usd} displayType={'text'} thousandSeparator={true} prefix={'$'}/>
                        </div>
                    </div>
                    </div>
                </div>
            </div>

        )
    }
}

export default MarketCharts;