import React from 'react'
import App from 'next/app'

const io = require('socket.io-client');

/* 
  Associate provided data object with current game ID
*/
var emitData = function(data) {

  if(gameCode === undefined && typeof(data.code) !== 'undefined')
    gameCode = 'AAAA';

  return { gameId: gameCode, msgData: data };

};
  
class MyApp extends App {
  // Only uncomment this method if you have blocking data requirements for
  // every single page in your application. This disables the ability to
  // perform automatic static optimization, causing every page in your app to
  // be server-side rendered.
  //
  // static async getInitialProps(appContext) {
  //   // calls page's `getInitialProps` and fills `appProps.pageProps`
  //   const appProps = await App.getInitialProps(appContext);
  //
  //   return { ...appProps }
  // }

  state = {
      socket: null
  }

  componentDidMount() {

    // Try WS connect
    const socket = io('http://localhost:3000', {path: '/at-stake-socket/', 'reconnection': true,'reconnectionDelay': 500,'maxReconnectionAttempts':Infinity});

    socket.on('connect', ()=> {
      console.log('connected to socket client')        
      
      socket.on('ohhai', () => { 
      console.log('server responds: oh, hai')
      });
      socket.emit('hello');
    });
    this.setState({ socket });

  }

  componentWillUnmount() {

  }

  componentDidCatch(error, _errorInfo) {
    throw error;
  }

  render() {
    const {
      router,
      Component,
      pageProps
    } = this.props;
    const url = createUrl(router);
    return _react.default.createElement(Component, (0, _extends2.default)({}, pageProps, {
      url: url
    }));
  }

  render() {
    const { Component, pageProps } = this.props
    return <Component {...pageProps} />
  }
}

export default MyApp
