import React, { Component } from 'react';

class Decks extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: null,
		};
		this.baseUrl = process.env.NODE_ENV === 'production' ? 'https://aaa.bbb' : 'http://localhost:3001';

	}
	componentDidMount() {
		// TODO: ASYNC
		// let data = await fetch(this.baseUrl + '/api/generate');
		// let decks = data.json().decks; 
		// console.log(data)
		// this.setState({
		// 	data: decks
		// });
		
		fetch(this.baseUrl + '/api/generate')
			.then((response) => {
				return response.json()
			})
			.then((response) => {
				this.setState({
					data: response
				});
			})
	}

	render() {
			return (
		this.state.data && this.state.data.decks.map((deck, i) => {
			return (
				<h2 className="deck" data-id="{deck._id}}">
			<div className="header">
			  <span>{deck.name}</span>
			  {/* {{{cloudinaryUrl 'v1540488090/at-stake/icons/magnify' className='open' format='svg' alt='Magnifying glass icon'}}} */}
			</div>
		
			<div className="description">
			  {deck.description}
			</div>
		  </h2>
			)
		})
	)
  }
}
export default Decks;
