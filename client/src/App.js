import React, { Component } from "react";
import io from 'socket.io-client';
import './App.css';

import Decks from './components/Decks';

class App extends Component {
  
  constructor() {
    super();
    this.state = {
      response: false
    };
  }
  componentDidMount() {
    // Try WS connect
    const socket = io('http://localhost:3001', {path: '/at-stake-socket/', 'reconnection': true,'reconnectionDelay': 500,'maxReconnectionAttempts':Infinity});

    socket.on('connect', ()=> {
      console.log('connected to socket client')        
      
      socket.on('ohhai', () => { 
        this.setState({ response: 'connected' });
      });

      socket.emit('hello');
    });
    
  }

  render() {
    const { response } = this.state;
      return (
        <div className="App">
            {response
              ? <p>
                Connected to socket
              </p>
              : <p>Loading...</p>}
        <Decks />
      </div>
    );
  }

}

export default App;
