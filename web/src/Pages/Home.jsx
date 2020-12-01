import React, {Component} from "react";
import NetworkData from '../Components/Network';

class Home extends Component {
    render() {
        return(
            <section className="container">
                <NetworkData/>
                <div>
                    More shit to go here.
                </div>
            </section>
        )
    }
}

export default Home;