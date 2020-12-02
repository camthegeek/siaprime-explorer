import React, {Component} from 'react';
import Search from './Search';
import { Navbar, NavbarBrand, Nav } from 'react-bootstrap';

class Header extends Component {
    render() {
        return (
            <Navbar bg="light" expand="lg">
                <NavbarBrand href="/">ScPrime Explorer</NavbarBrand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link href="/">Dashboard</Nav.Link>
                        <Nav.Link href="/storage">Storage</Nav.Link>
                        <Nav.Link href="/mining">Mining</Nav.Link>
                        <Nav.Link href="/tokenomics">Tokenomics</Nav.Link>
                    </Nav>
                <Search/>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}
export default Header;