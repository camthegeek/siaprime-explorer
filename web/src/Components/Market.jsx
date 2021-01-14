import { Component } from 'react';
import NumberFormat from 'react-number-format';
import { Cash } from 'react-bootstrap-icons';

class MarketData extends Component {
    render() {
        if (!this.props.data.market.market_data) {
            return null;
        }
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xl-12 col-sm-12 col-12">
                        <div className="card mt-2">
                            <div className="card-content">
                                <div className="card-body">
                                    <div className="media d-flex">
                                        <div className="align-self-center">
                                            <Cash className="float-left" size={32}/>
                                        </div>
                                        <div className="media-body ml-3">
                                            <h4 className="font-weight-bold">ScPrime Price (SCP)</h4> <NumberFormat decimalScale={'2'} value={this.props.data.market.market_data.current_price.usd} thousandSeparator={true} displayType={'text'} prefix={'$'}/> (<NumberFormat value={this.props.data.market.market_data.price_change_percentage_24h} displayType={'text'} suffix={'%'} decimalScale={'2'} className={(this.props.data.market.market_data.price_change_percentage_24h < 0) ? 'text-danger' : 'text-success' }/ >)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default MarketData;