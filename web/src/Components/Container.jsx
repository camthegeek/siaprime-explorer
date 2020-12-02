import React, {Component} from "react";
import { Switch, Route } from 'react-router-dom';

import Home from '../Pages/Home';
import BlockInfo from '../Pages/Blocks';
import NotFound from '../Pages/404';

class Container extends Component {
    render() {
        return(
            <Switch> {/* The Switch decides which component to show based on the current URL.*/}
                <Route exact path='/' component={Home}></Route>
                <Route exact path='/block/:id' component={BlockInfo}></Route>
                <Route component={NotFound} />
            </Switch>
        );
    }
}

export default Container;