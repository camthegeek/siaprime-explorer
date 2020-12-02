import React, { Component } from 'react';

class Footer extends Component {
    render() {
        return (
            <footer className="footer b-0 position-absolute mt-auto py-3 bg-dark text-white">
                <div className="container">
                    <div className="row">
                        <div className="col-4 mt-3 mb-1">
                            Reserved
                        </div>
                        <div className="col-4 mt-3 mb-1">
                            Reserved
                        </div>
                        <div className="col-4 mt-3 mb-1">
                            Reserved
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12 mt-3 mb-1 text-center">
                            Copyright 2020 camthegeek
                        </div>
                    </div>
                </div>
            </footer>
        )
    }
}
export default Footer;