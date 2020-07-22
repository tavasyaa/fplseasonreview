import React from 'react';
import {Line, Doughnut} from 'react-chartjs-2';

export default class Home extends React.Component {

	constructor() {
		super();
		this.state = {
			total_points: 0, 
			id: null,
			overall_rank: 0,
			best_overall_rank: 0, best_overall_rank_gw: 0,
			best_points: 0, best_points_gw: 0,
			best_gameweek_rank: 0, best_gameweek_rank_gw: 0,
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
			mostpickedplayer: '', mostpickedtimes: 0,
			mostcaptainedplayer: '', captainedtimes: 0,
			maxplayerpoints: 0, maxplayerpointsname: '', maxplayerpointsgw: 0,
			// let's use an array to store gameweek, points, average points
			triplecaptainstats: [],
			benchboostgw: 0,
			freehitgw: 0,
			triplecapgw: 0,
			wildcardstats: [],
			doughnut: {
				labels: ['GK', 'DEF', 'MID', 'ST'],
				datasets: [
					{
						label: 'Points from Positions',
						data: [],
						backgroundColor: ['Red', 'Blue', 'Green', 'Yellow'], 
						hoverBackgroundColor: ['Red', 'Blue', 'Green', 'Yellow']
					}
				]
			}
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

	countInArray(arr, item) {
		var count = 0;
		for(var i = 0; i < arr.length; ++i){
    		if(arr[i] === item)
       	 count++;
		}
		return count
	}

	// fetching data, fix CORS without the browser hacky approach
	getData = async() => {

		// getting the current data
		const response1 = await fetch('https://fantasy.premierleague.com/api/entry/' + this.state.id + '/event/46/picks/', {method: 'GET'})
		const jsonResponse1 = await response1.json()

		// getting the history data
		const historydata = await fetch('https://fantasy.premierleague.com/api/entry/' + this.state.id + '/history/', {method:'GET'})
		const jsonhistorydata = await historydata.json()

		// bootstrap static, this is the big store of info
		const bootstrapdata = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/', {method: 'GET'})
		const jsonbootstrapdata = await bootstrapdata.json()

		this.setState({total_points: jsonResponse1.entry_history.total_points, overall_rank: jsonResponse1.entry_history.overall_rank})

		// getting best overall rank
		var bestrank = 10000000, bestrankgameweek = 0
		// getting highest points for a single gameweek
		var bestpoints = 0, bestpointsgameweek = 0
		// getting highest gameweek rank
		var bestgwrank = 100000000, bestgwrankgameweek = 0


		for (var i = 0; i < jsonhistorydata.current.length; i++){

			if(jsonhistorydata.current[i].overall_rank < bestrank){
				bestrank = jsonhistorydata.current[i].overall_rank
				bestrankgameweek = i+1
				if (bestrankgameweek > 30){
					bestrankgameweek = bestrankgameweek - 9
				}
			}

			if(jsonhistorydata.current[i].points > bestpoints){
				bestpoints = jsonhistorydata.current[i].points
				bestpointsgameweek = i+1
				if (bestpointsgameweek > 30){
					bestpointsgameweek = bestpointsgameweek - 9
				}
			}
			
			if(i < 30 || i > 38){
				if(jsonhistorydata.current[i].rank < bestgwrank){
					bestgwrank = jsonhistorydata.current[i].rank
					bestgwrankgameweek = i+1
					if (bestgwrankgameweek > 30){
						bestgwrankgameweek = bestgwrankgameweek - 9
					}
				}
			}
		}

		this.setState({best_overall_rank: bestrank, best_overall_rank_gw: bestrankgameweek, best_points: bestpoints, 
			best_points_gw: bestpointsgameweek, best_gameweek_rank: bestgwrank,best_gameweek_rank_gw: bestgwrankgameweek})

		// getting points and rank data from previous and current seasons for the graphs
		var pointshistory = []
		var rankhistory = []

		for (var j = 0; j < jsonhistorydata.past.length; j++){
			pointshistory.push(jsonhistorydata.past[j].total_points)
			rankhistory.push(jsonhistorydata.past[j].rank)
			this.state.pointschart.labels.push(jsonhistorydata.past[j].season_name)
			this.state.rankchart.labels.push(jsonhistorydata.past[j].season_name)
		}

		pointshistory.push(this.state.total_points)
		rankhistory.push(this.state.overall_rank)
		this.state.pointschart.labels.push("2019/20")
		this.state.rankchart.labels.push("2019/20")
		this.state.pointschart.datasets[0].data = pointshistory
		this.state.rankchart.datasets[0].data = rankhistory

		// player and captain picks now, these are all aligned by index
		var picks = []
		var positions = []
		var gameweeks = []
		var multipliers = []
		var points = []

		var captains = []

		var gkpoints = 0, defpoints = 0, midpoints = 0, fwdpoints = 0


		// this loop sucks, draw this out and see if you can figure a way better than a triple loop :(
		// earlier we had a problem with k so we missed gw 29 but that's fixed now. disparity between total points and this
		// is because of deducted points for extra transfers
		// we still have a one point discrepancy, but i think that's because of update lag, check later
		for (var k = 1; k < 47; k++){
			if (k < 30 || k > 38){
				const response3 = await fetch('https://fantasy.premierleague.com/api/entry/' + this.state.id + '/event/' + k + '/picks/', 
					{method: 'GET'})
				const jsonResponse3 = await response3.json()
				// crashes when you haven't played the whole season, Soli is missing a GW
				for (var l = 0; l < jsonResponse3.picks.length; l++){
					if (jsonResponse3.picks[l].multiplier !== 0){
						// append the element id into the picks array
						picks.push(jsonResponse3.picks[l].element)
						multipliers.push(jsonResponse3.picks[l].multiplier)
						gameweeks.push(jsonResponse3.entry_history.event)

						const response5 = await fetch('https://fantasy.premierleague.com/api/event/' + jsonResponse3.entry_history.event + '/live/', {method: 'GET'})
						const jsonResponse5 = await response5.json()

						// updating points, but this takes way too long
						points.push(jsonResponse5.elements.find(o => o.id === jsonResponse3.picks[l].element).stats.total_points*jsonResponse3.picks[l].multiplier)
						positions.push(jsonbootstrapdata.elements.find(o => o.id === jsonResponse3.picks[l].element).element_type)

						if (jsonbootstrapdata.elements.find(o => o.id === jsonResponse3.picks[l].element).element_type === 1){
							gkpoints = gkpoints + jsonResponse5.elements.find(o => o.id === jsonResponse3.picks[l].element).stats.total_points*jsonResponse3.picks[l].multiplier
						} else if(jsonbootstrapdata.elements.find(o => o.id === jsonResponse3.picks[l].element).element_type === 2) {
							defpoints = defpoints + jsonResponse5.elements.find(o => o.id === jsonResponse3.picks[l].element).stats.total_points*jsonResponse3.picks[l].multiplier
						} else if(jsonbootstrapdata.elements.find(o => o.id === jsonResponse3.picks[l].element).element_type === 3) {
							midpoints = midpoints + jsonResponse5.elements.find(o => o.id === jsonResponse3.picks[l].element).stats.total_points*jsonResponse3.picks[l].multiplier
						} else {
							fwdpoints = fwdpoints + jsonResponse5.elements.find(o => o.id === jsonResponse3.picks[l].element).stats.total_points*jsonResponse3.picks[l].multiplier
						}

					}

					if (jsonResponse3.picks[l].is_captain === true){
						captains.push(jsonResponse3.picks[l].element)
					}
				}
			}
		}

		// updating the donut
		this.state.doughnut.datasets[0].data.push(gkpoints, defpoints, midpoints, fwdpoints)

		// these are still in ID form, a number
		var mfcaptainid = this.mostFrequentElement(captains)
		// how many times was he captained?
		var mfcaptainnumber = this.countInArray(captains, mfcaptainid)
		var mfpickid = this.mostFrequentElement(picks)
		// how many appearances did this dude make?
		var mfpicknumber = this.countInArray(picks, mfpickid)

		// getting the player w max points in one gw
		this.setState({maxplayerpoints:Math.max(...points), mostpickedtimes: mfpicknumber, captainedtimes: mfcaptainnumber})
		var maxpointsplayerid = picks[this.indexOfMax(points)]
		this.setState({maxplayerpointsgw: gameweeks[this.indexOfMax(points)]})


		// getting the names from the IDs
		for (var m = 0; m < jsonbootstrapdata.elements.length; m++){
			if (mfcaptainid === jsonbootstrapdata.elements[m].id){
				this.setState({mostcaptainedplayer: jsonbootstrapdata.elements[m].web_name})
			}

			if (mfpickid === jsonbootstrapdata.elements[m].id){
				this.setState({mostpickedplayer: jsonbootstrapdata.elements[m].web_name})
			}

			if (maxpointsplayerid === jsonbootstrapdata.elements[m].id){
				this.setState({maxplayerpointsname: jsonbootstrapdata.elements[m].web_name})
			}
		}
	}

	render() {
		if (this.state.doughnut.datasets[0].data.length === 0){
			return(
				<div className="inputsection">
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
					<h3> Overview </h3>
					Total points: {this.state.total_points}<br/>
					Overall Rank: {this.state.overall_rank}<br/>
					Best Overall Rank: {this.state.best_overall_rank}, obtained in gameweek {this.state.best_overall_rank_gw} <br />
					Best points in one GW: {this.state.best_points}, obtained in gameweek {this.state.best_points_gw} <br />
					Highest gameweek rank: {this.state.best_gameweek_rank}, obtained in gameweek {this.state.best_gameweek_rank_gw} <br />
					<h3> History </h3>
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
					<h3> Player picks </h3>
					The player with the most appearances was: {this.state.mostpickedplayer}, with {this.state.mostpickedtimes} appearances <br />
					Most frequently captained: {this.state.mostcaptainedplayer}, {this.state.captainedtimes} times <br />
					Maximum points by one player: {this.state.maxplayerpoints}, by {this.state.maxplayerpointsname} in gameweek {this.state.maxplayerpointsgw} <br />
					<h3> Points by Position</h3>
					<Doughnut data={this.state.doughnut} />

					<h3> Chips </h3>
					You used your wildcard in gameweek , and got points, more than average <br />
					You used your free hit in gameweek , and got points, more than average <br />
					You used your bench boost in gameweek , and got points, more than average <br />

				</div>
			);
		}
	}
}