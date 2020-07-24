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
			most_bench_points: 0, most_bench_points_gw: 0,
			currentpointschart: {
				labels: [],
				datasets: [
					{
						label: 'Team Points',
						fill: false,
						lineTension: 0,
						backgroundColor: 'rgba(246,8,8,1)',
						borderColor: 'rgba(246,8,8,1)',
						borderWidth: 2,
						data: []
					},
					{
						label: 'GW Average',
						fill: false,
						lineTension: 0,
						backgroundColor: 'rgba(75,192,192,1)',
						borderColor: 'rgba(0,0,0,1)',
						borderWidth: 2,
						data: []
					}
				]
			},
			currentrankchart: {
				labels: [],
				datasets: [
					{
						label: 'Rank',
						fill: false,
						lineTension: 0,
						backgroundColor: 'rgba(0,0,0,1)',
						borderColor: 'rgba(0,0,0,1)',
						borderWidth: 2,
						data: []
					}
				]
			},
			pastpointschart: {
				labels: [],
				datasets: [
					{
						label: 'Points',
						fill: false,
						lineTension: 0,
						backgroundColor: 'rgba(3, 61, 22,1)',
						borderColor: 'rgba(3, 61, 22, 1)',
						borderWidth: 2,
						data: []
					}
				]
			},
			pastrankchart: {
				labels: [],
				datasets: [
					{
						label: 'Rank',
						fill: false,
						lineTension: 0,
						backgroundColor: 'rgba(0,0,0,1)',
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
			benchboostgw: 0, benchboostpoints: 0, benchboostavg: 0,
			freehitgw: 0, freehitpoints: 0, freehitavg: 0,
			triplecapgw: 0, triplecappoints: 0, triplecapavg: 0,
			wildcardgw: [], wildcardpoints: [],
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

	// fetching data, fix the localhost thing to use the heroku app when you launch this
	getData = async() => {

		// getting the current data
		var proxyurl = 'http://localhost:8080/'
		const response1 = await fetch(proxyurl + 'https://fantasy.premierleague.com/api/entry/' + this.state.id + '/event/46/picks/', {method: 'GET'})
		const jsonResponse1 = await response1.json()
		this.setState({total_points: jsonResponse1.entry_history.total_points, overall_rank: jsonResponse1.entry_history.overall_rank})

		// getting the history data
		const historydata = await fetch(proxyurl + 'https://fantasy.premierleague.com/api/entry/' + this.state.id + '/history/', {method:'GET'})
		const jsonhistorydata = await historydata.json()

		// bootstrap static, this is the big store of info
		const bootstrapdata = await fetch(proxyurl + 'https://fantasy.premierleague.com/api/bootstrap-static/', {method: 'GET'})
		const jsonbootstrapdata = await bootstrapdata.json()


		// getting best overall rank
		var bestrank = 10000000, bestrankgameweek = 0
		// getting highest points for a single gameweek
		var bestpoints = 0, bestpointsgameweek = 0
		// getting highest gameweek rank
		var bestgwrank = 100000000, bestgwrankgameweek = 0
		// most bench points, rip
		var mostbenchpoints = 0, mostbenchpointsgw = 0

		// chips
		var wildcardgw = [], wildcardpoints = []
		var triplecapgw = 0, benchboostgw = 0, freehitgw = 0
		var triplecappoints = 0, benchboostpoints = 0, freehitpoints = 0

		for(var n = 0; n < jsonhistorydata.chips.length; n++){
			if(jsonhistorydata.chips[n].name === "bboost"){
				benchboostgw = jsonhistorydata.chips[n].event
			} else if(jsonhistorydata.chips[n].name === "3xc") {
				triplecapgw = jsonhistorydata.chips[n].event
			} else if(jsonhistorydata.chips[n].name === "freehit"){
				freehitgw = jsonhistorydata.chips[n].event
			} else {
				wildcardgw.push(jsonhistorydata.chips[n].event)
			}
		}

		var currentpointshistory = [], currentavgpoints = [], currentrankhistory = []

		for (var i = 0; i < jsonhistorydata.current.length; i++){

			if(jsonhistorydata.current[i].event === triplecapgw){
				triplecappoints = jsonhistorydata.current[i].points
			} else if(jsonhistorydata.current[i].event === benchboostgw){
				benchboostpoints = jsonhistorydata.current[i].points
			} else if(jsonhistorydata.current[i].event === freehitgw){
				freehitpoints = jsonhistorydata.current[i].points
			} else if (wildcardgw.includes(jsonhistorydata.current[i].event)){
				wildcardpoints.push(jsonhistorydata.current[i].points)
			}

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

			if(jsonhistorydata.current[i].points_on_bench > mostbenchpoints){
				mostbenchpoints = jsonhistorydata.current[i].points_on_bench
				mostbenchpointsgw = i+1
				if (mostbenchpointsgw > 30){
					mostbenchpointsgw = mostbenchpointsgw - 9
				}
			}
			
			if(i < 29 || i > 37){
				if(jsonhistorydata.current[i].rank < bestgwrank){
					bestgwrank = jsonhistorydata.current[i].rank
					bestgwrankgameweek = i+1
					if (bestgwrankgameweek > 30){
						bestgwrankgameweek = bestgwrankgameweek - 9
					}
				}

				if(i < 29){
					this.state.currentpointschart.labels.push(jsonhistorydata.current[i].event)
					this.state.currentrankchart.labels.push(jsonhistorydata.current[i].event)
				} else {
					this.state.currentpointschart.labels.push(jsonhistorydata.current[i].event - 9)
					this.state.currentrankchart.labels.push(jsonhistorydata.current[i].event - 9)
				}
				currentpointshistory.push(jsonhistorydata.current[i].points)
				currentrankhistory.push(jsonhistorydata.current[i].rank)
			}
		}

		// populating average scores, change this for final gameweek too
		for(var b = 0; b < 46; b++){
			if(jsonbootstrapdata.events[b].id < 30 || jsonbootstrapdata.events[b].id > 38){
				currentavgpoints.push(jsonbootstrapdata.events[b].average_entry_score)
			}

		}

		this.state.currentrankchart.datasets[0].data = currentrankhistory
		this.state.currentpointschart.datasets[0].data = currentpointshistory
		this.state.currentpointschart.datasets[1].data = currentavgpoints

		this.setState({best_overall_rank: bestrank, best_overall_rank_gw: bestrankgameweek, best_points: bestpoints, 
			best_points_gw: bestpointsgameweek, best_gameweek_rank: bestgwrank,best_gameweek_rank_gw: bestgwrankgameweek, 
			most_bench_points: mostbenchpoints, most_bench_points_gw: mostbenchpointsgw, triplecapgw: triplecapgw, 
			triplecappoints: triplecappoints, benchboostgw: benchboostgw, benchboostpoints: benchboostpoints, 
			freehitgw: freehitgw, freehitpoints: freehitpoints, wildcardgw: wildcardgw, wildcardpoints: wildcardpoints})

		// getting points and rank data from previous and current seasons for the graphs
		var pastpointshistory = [], pastrankhistory = []

		for (var j = 0; j < jsonhistorydata.past.length; j++){
			pastpointshistory.push(jsonhistorydata.past[j].total_points)
			pastrankhistory.push(jsonhistorydata.past[j].rank)
			this.state.pastpointschart.labels.push(jsonhistorydata.past[j].season_name)
			this.state.pastrankchart.labels.push(jsonhistorydata.past[j].season_name)
		}

		pastpointshistory.push(this.state.total_points)
		pastrankhistory.push(this.state.overall_rank)
		this.state.pastpointschart.labels.push("2019/20")
		this.state.pastrankchart.labels.push("2019/20")
		this.state.pastpointschart.datasets[0].data = pastpointshistory
		this.state.pastrankchart.datasets[0].data = pastrankhistory

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
		// you probably have to update this part to get gameweek 38
		for (var k = 1; k < 47; k++){
			if (k < 30 || k > 38){
				const response3 = await fetch(proxyurl + 'https://fantasy.premierleague.com/api/entry/' + this.state.id + '/event/' + k + '/picks/', 
					{method: 'GET'})
				const jsonResponse3 = await response3.json()
				// crashes when you haven't played the whole season, Soli is missing a GW
				for (var l = 0; l < jsonResponse3.picks.length; l++){
					if (jsonResponse3.picks[l].multiplier !== 0){
						// append the element id into the picks array
						picks.push(jsonResponse3.picks[l].element)
						multipliers.push(jsonResponse3.picks[l].multiplier)
						gameweeks.push(jsonResponse3.entry_history.event)

						const response5 = await fetch(proxyurl + 'https://fantasy.premierleague.com/api/event/' + jsonResponse3.entry_history.event + '/live/', {method: 'GET'})
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
					<div className="overview">
						<h3> Overview </h3>
						Total points: {this.state.total_points}<br/>
						Overall Rank: {this.state.overall_rank}<br/>
						Best Overall Rank: {this.state.best_overall_rank}, obtained in gameweek {this.state.best_overall_rank_gw} <br />
						Best points in one GW: {this.state.best_points}, obtained in gameweek {this.state.best_points_gw} <br />
						Highest gameweek rank: {this.state.best_gameweek_rank}, obtained in gameweek {this.state.best_gameweek_rank_gw} <br />
						You got the most points on your bench in gameweek {this.state.most_bench_points_gw}, a whopping {this.state.most_bench_points} points. Unlucky! <br />
					</div>
					<div className="seasonreview">
						<h3> Season Review </h3>
				        <Line data={this.state.currentpointschart}
							options={{
								title:{
									display:true,
									text:'Team Points vs Avg Points/Gameweek',
									fontSize:20
								},
								legend: {
								display: true						
								}
						}} />
				        <Line data={this.state.currentrankchart}
							options={{
								title:{
									display:true,
									text:'Rank/Gameweek',
									fontSize:20
								},
								legend: {
								display: false						
								}
						}} />
					</div>
					<div className="seasonhistory">
						<h3> Team History </h3>
				        <Line data={this.state.pastpointschart}
							options={{
								title:{
									display:true,
									text:'Points/Season',
									fontSize:20
								},
								legend: {
								display: false						
								}
						}} />
				        <Line data={this.state.pastrankchart}
							options={{
								title:{
									display: true,
									text: 'Rank/Season',
									fontSize: 20
								},
								legend: {
								display: false						
								}
						}}/>
					</div>
					<div className="picks">
						<h3> Player picks </h3>
						The player with the most appearances was: {this.state.mostpickedplayer}, with {this.state.mostpickedtimes} appearances <br />
						Most frequently captained: {this.state.mostcaptainedplayer}, {this.state.captainedtimes} times <br />
						Maximum points by one player: {this.state.maxplayerpoints}, by {this.state.maxplayerpointsname} in gameweek {this.state.maxplayerpointsgw} <br />
					</div>
					<div className="positiondonut">
						<h3> Points by Position</h3>
						<Doughnut data={this.state.doughnut} />
					</div>
					<div className="chips">
						<h3> Chips </h3>
						You used your wildcard in gameweek(s) {this.state.wildcardgw}, and got {this.state.wildcardpoints} points. <br />
						You used your free hit in gameweek {this.state.freehitgw}, and got {this.state.freehitpoints} points. <br />
						You used your bench boost in gameweek {this.state.benchboostgw}, and got {this.state.benchboostpoints} points.<br />
						You used your triple captain in gameweek {this.state.triplecapgw}, and got {this.state.triplecappoints} points. <br />
					</div>
				</div>
			);
		}
	}
}