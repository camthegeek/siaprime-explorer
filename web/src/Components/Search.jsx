import React, {Component} from "react";
import {Form, Button, Row, Col} from "react-bootstrap";

class Search extends Component {
    // default state values
    state = {
    }

    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    }

    render() {
        return (
            <Form className="search-form" >
                <Row type="flex" justify="center" align="center" className="hash">
                    <Col>
                        <Form.Control name="hashInput"
                                      type="text"
                                      placeholder="Search for address, block, transaction hash, contract ID, etc.."
                                      onChange={this.onChange}
                                      className="hashInput"/>
                    </Col>
                </Row>

                <Row type="flex" justify="center" align="center">
                    <Col span={4}>
                        <Button className="search-btn" variant="primary" type="submit">
                            Search
                        </Button>
                    </Col>
                </Row>

            </Form>
        );
    }
}

export default Search;