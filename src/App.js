import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {
    Switch,
    HashRouter,
    Route,
    Redirect,
} from "react-router-dom";
import history from './components/Utils/history';
import Header from './components/Header';
import ViewPool from './components/ViewPool';
import CreatePool from './components/CreatePool';
import HomePage from './components/HomePage';
import TokenFaucet from './components/TokenFaucet';

export default function App() {
    const routes = (
        <Switch>
            <Route path="/" exact>
                <HomePage />
            </Route>
            <Route path="/home" exact>
                <ViewPool />
            </Route>
            <Route path="/create-pool" exact>
                <CreatePool />
            </Route>
            <Route path="/view/:poolAddress" exact>
                <ViewPool />
            </Route>
            <Route path="/token-faucet" exact>
                <TokenFaucet />
            </Route>
            <Redirect to="/" />
        </Switch>
    );

    return (
        <div className="App">
            <HashRouter history={history}>
                <Header />
                {routes}
            </HashRouter>
        </div>
    );
}
