import 'babel-polyfill';
import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { HashRouter, Switch, Route } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import ReactGA from 'react-ga';

import SchematicViewerContainer from './components/schematic/SchematicViewerContainer';
import DataVizViewerContainer from './components/dataviz/DataVizViewerContainer';
import initialState from './initialState';
import rootReducer from './reducers';
import DemoNavBar from "./components/nav/DemoNavBar";

/* INITIALIZE REDUX **************************************************************/
const cacheStore = window.sessionStorage.getItem('atlas');
const loadedState = cacheStore ?
    JSON.parse(cacheStore) :
    initialState;

const store = applyMiddleware(thunk)(createStore)(
    rootReducer,
    loadedState,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

const saveState = () => {
    window.sessionStorage.setItem('atlas', JSON.stringify(store.getState()));
};

store.subscribe(saveState);

const GA_TRACKING_ID = 'UA-124331187-6';
ReactGA.initialize(GA_TRACKING_ID);

/* APP COMPONENT *****************************************************************/
class App extends Component {
  render() {
    return (
        <Provider store={store}>
            <HashRouter basename={`${process.env.PUBLIC_URL}`}>
                <Container fluid>
                    <DemoNavBar />
                    <Switch>
                      <Route exact path="/" component={SchematicViewerContainer} />
                      <Route path="/data/:cellName" component={DataVizViewerContainer} />
                    </Switch>
                </Container>
            </HashRouter>
        </Provider>
    );
  }
}

export default App;
