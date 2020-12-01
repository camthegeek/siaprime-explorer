import React, {Component} from "react";

class Container extends Component {
    state = {
        blockData: ''
    };

    render() {
        return(
            <section className="block container">
                <h1>Hello world</h1>
            </section>
        );
    }
}

export default Container;