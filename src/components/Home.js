import React from 'react';

export default class Home extends React.Component {

	constructor() {
		super();
		this.state = {
			total_points: 0, 
			id: null,
			overall_rank: 0,
			best_overall_rank: 0,
			best_overall_rank_gw: 0,
			pointshistory: [],
			rankhistory: []
		};

		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(event) {
    	this.setState({id: event.target.value});
	}

// fetching data, fix CORS without the browser hacky approach
	getData = async() => {

		// getting the general data
		const response1 = await fetch('https://fantasy.premierleague.com/api/entry/' + this.state.id + '/event/46/picks/', 
			{method: 'GET'})
		const jsonResponse1 = await response1.json()
		console.log(jsonResponse1)
		this.setState({total_points: jsonResponse1.entry_history.total_points, overall_rank: jsonResponse1.entry_history.overall_rank})

		// getting history data
		const response2 = await fetch('https://fantasy.premierleague.com/api/entry/' + this.state.id + '/history/', {method:'GET'})
		const jsonResponse2 = await response2.json()
		console.log(jsonResponse2)

		// getting best overall rank
		var bestrank = 10000000
		var bestrankgameweek = 0

		for (var i = 0; i < jsonResponse2.current.length; i++){
			if(jsonResponse2.current[i].overall_rank < bestrank){
				bestrank = jsonResponse2.current[i].overall_rank
				bestrankgameweek = i+1
				if (bestrankgameweek > 30){
					bestrankgameweek = bestrankgameweek - 9
				}
			}
		}

		this.setState({best_overall_rank: bestrank, best_overall_rank_gw: bestrankgameweek})

		// getting points and rank data from previous seasons
		var pointshistory = []
		var rankhistory = []

		for (var j = 0; j < jsonResponse2.past.length; j++){
			pointshistory.push(jsonResponse2.past[j].total_points)
			rankhistory.push(jsonResponse2.past[j].rank)
		}

		pointshistory.push(this.state.total_points)
		rankhistory.push(this.state.overall_rank)

		this.setState({pointshistory: pointshistory, rankhistory: rankhistory})
	}

	render() {
		if (this.state.total_points === 0){
			return(
				<div>
					<form>
						<label>
							Team ID:
							<input type="text" name={this.state.id} onChange={this.handleChange} />
						</label>
						<input type="button" value="Submit" onClick={this.getData}/>
					</form>			
				</div>
			);
		}

		else {

			return(
				<div>
					Total points: {this.state.total_points}<br/>
					Overall Rank: {this.state.overall_rank}<br/>
					Best Overall Rank: {this.state.best_overall_rank}, obtained in gameweek {this.state.best_overall_rank_gw} <br />

				</div>
			);
		}
	}
}