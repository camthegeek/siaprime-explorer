import React, {Component} from 'react';
import Search from './Search';

class Header extends Component {
    render() {
        return (
            <section className="header">
                <a href="/">
                    <h1>ScPrime Explorer</h1>
                </a>
                <Search/>
            </section>
        )
    }
}
export default Header;