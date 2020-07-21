import React from 'react';
import {Line} from 'react-chartjs-2';

export default class Home extends React.Component {

	constructor() {
		super();
		this.state = {
			total_points: 0, 
			id: null,
			overall_rank: 0,
			best_overall_rank: 0,
			best_overall_rank_gw: 0,
			pointschart: {
				labels: [],
				datasets: [
					{
						label: 'Points',
						fill: false,
						lineTension: 0,
						backgroundColor: 'rgba(75,192,192,1)',
						borderColor: 'rgba(0,0,0,1)',
						borderWidth: 2,
						data: []
					}
				]
			},
			rankchart: {
				labels: [],
				datasets: [
					{
						label: 'Rank',
						fill: false,
						lineTension: 0,
						backgroundColor: 'rgba(75,192,192,1)',
						borderColor: 'rgba(0,0,0,1)',
						borderWidth: 2,
						data: []
					}
				]
			},
			mostpickedplayer: '',
			mostcaptainedplayer: '', 
			maxplayerpoints: 0,
			maxplayerpointsname: '',
			maxplayerpointsgw: 0
		};

		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(event) {
    	this.setState({id: event.target.value});
	}

	indexOfMax(arr) {
		if (arr.length === 0) {
			return -1;
		}

		var max = arr[0];
		var maxIndex = 0;

		for (var i = 1; i < arr.length; i++) {
			if (arr[i] > max) {
				maxIndex = i;
				max = arr[i];
			}
		}

    	return maxIndex;
	}

	mostFrequentElement(arr) {
		var mf = 1;
		var m = 0;
		var item;

		for (var i = 0; i < arr.length; i++) {
			for (var j = i; j < arr.length; j++) {
				if (arr[i] === arr[j]) m++;
				if (mf < m) {
					mf = m;
					item = arr[i];
				}
  			}
  			m = 0;
		}
		return item
	}

	// fetching data, fix CORS without the browser hacky approach
	getData = async() => {

		// getting the current data
		const response1 = await fetch('https://fantasy.premierleague.com/api/entry/' + this.state.id + '/event/46/picks/', {method: 'GET'})
		const jsonResponse1 = await response1.json()

		// getting the history data
		const response2 = await fetch('https://fantasy.premierleague.com/api/entry/' + this.state.id + '/history/', {method:'GET'})
		const jsonResponse2 = await response2.json()

		// bootstrap static, this is the big store of info
		const response4 = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/', {method: 'GET'})
		const jsonResponse4 = await response4.json()

		this.setState({total_points: jsonResponse1.entry_history.total_points, overall_rank: jsonResponse1.entry_history.overall_rank})

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

		// getting points and rank data from previous and current seasons for the graphs
		var pointshistory = []
		var rankhistory = []

		for (var j = 0; j < jsonResponse2.past.length; j++){
			pointshistory.push(jsonResponse2.past[j].total_points)
			rankhistory.push(jsonResponse2.past[j].rank)
			this.state.pointschart.labels.push(jsonResponse2.past[j].season_name)
			this.state.rankchart.labels.push(jsonResponse2.past[j].season_name)
		}

		pointshistory.push(this.state.total_points)
		rankhistory.push(this.state.overall_rank)
		this.state.pointschart.labels.push("2019/20")
		this.state.rankchart.labels.push("2019/20")
		this.state.pointschart.datasets[0].data = pointshistory
		this.state.rankchart.datasets[0].data = rankhistory

		// player and captain picks now
		var picks = []
		var captains = []
		// use the following two to get points, ciao for now!
		var gameweeks = []
		var multipliers = []
		var points = []

		// this loop sucks, draw this out and see if you can figure a way better than a triple loop :(
		for (var k = 1; k < 47; k++){
			if (k < 30 || k > 38){
				const response3 = await fetch('https://fantasy.premierleague.com/api/entry/' + this.state.id + '/event/' + k + '/picks/', 
					{method: 'GET'})
				const jsonResponse3 = await response3.json()

				for (var l = 0; l < jsonResponse3.picks.length; l++){
					if (jsonResponse3.picks[l].multiplier != 0){
						// append the element id into the picks array
						picks.push(jsonResponse3.picks[l].element)
						multipliers.push(jsonResponse3.picks[l].multiplier)
						gameweeks.push(jsonResponse3.entry_history.event)

						const response5 = await fetch('https://fantasy.premierleague.com/api/event/' + jsonResponse3.entry_history.event + '/live/', {method: 'GET'})
						const jsonResponse5 = await response5.json()

						// updating points, but this takes way too long
						points.push(jsonResponse5.elements.find(o => o.id === jsonResponse3.picks[l].element).stats.total_points*jsonResponse3.picks[l].multiplier)
					}

					if (jsonResponse3.picks[l].is_captain == true){
						captains.push(jsonResponse3.picks[l].element)
					}
				}
			}
		}

		// these are still in ID form, a number
		var mfcaptainid = this.mostFrequentElement(captains)
		var mfpickid = this.mostFrequentElement(picks)

		// getting the player w max points in one gw
		this.setState({maxplayerpoints:Math.max(...points)})
		var maxpointsplayerid = picks[this.indexOfMax(points)]


		// getting the names from the IDs
		for (var m = 0; m < jsonResponse4.elements.length; m++){
			if (mfcaptainid === jsonResponse4.elements[m].id){
				this.setState({mostcaptainedplayer: jsonResponse4.elements[m].web_name})
			}

			if (mfpickid === jsonResponse4.elements[m].id){
				this.setState({mostpickedplayer: jsonResponse4.elements[m].web_name})
			}

			if (maxpointsplayerid === jsonResponse4.elements[m].id){
				this.setState({maxplayerpointsname: jsonResponse4.elements[m].web_name})
			}
		}
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
			        <Line data={this.state.pointschart}
						options={{
							title:{
								display:true,
								text:'Points History',
								fontSize:20
							},
							legend: {
							display: false						
							}
					}} />
			        <Line data={this.state.rankchart}
						options={{
							title:{
								display: true,
								text: 'Rank History',
								fontSize: 20
							},
							legend: {
							display: false						
							}
					}}/>
					The player with the most appearances was: {this.state.mostpickedplayer}<br />
					Most frequently captained: {this.state.mostcaptainedplayer}<br />
					Maximum points by one player: {this.state.maxplayerpoints}, by {this.state.maxplayerpointsname} in gameweek

				</div>
			);
		}
	}
}