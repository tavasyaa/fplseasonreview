import React from 'react';
import {Line, Doughnut} from 'react-chartjs-2';
import M from 'materialize-css';
import { Button, TextInput, Navbar, NavItem, Icon, Footer } from 'react-materialize';
import BounceLoader from "react-spinners/ClipLoader";

export default class Home extends React.Component {

	constructor() {
		super();
		this.state = {
			loading: false,
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
						backgroundColor: 'rgba(0,0,0,1)',
						borderColor: 'rgba(0,0,0,1)',
						borderWidth: 2,
						data: []
					}
				]
			},
			currentgwrankchart: {
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
			currentoverallrankchart: {
				labels: [],
				datasets: [
					{
						label: 'Rank',
						fill: false,
						lineTension: 0,
						backgroundColor: 'rgb(1,87,155)',
						borderColor: 'rgb(1,87,155)',
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
						backgroundColor: 'rgba(246,8,8,1)',
						borderColor: 'rgba(246,8,8,1)',
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

	printString(arr){
		if(arr.length === 1){
			return arr[0]
		} else if (arr.length === 0) {
			return 'NA'
		} else {
			var output = arr[0].toString() + ' and ' + arr[1].toString()
			return output
		}
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
		this.setState({loading: true})
		console.log('boom')
		// getting the current data
		var proxyurl = 'http://localhost:8080/'
		const response1 = await fetch(proxyurl + 'https://fantasy.premierleague.com/api/entry/' + this.state.id + '/event/47/picks/', {method: 'GET'})
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

		var currentpointshistory = [], currentavgpoints = [], currentgwrankhistory = [], currentoverallrankhistory = []

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
					this.state.currentgwrankchart.labels.push(jsonhistorydata.current[i].event)
					this.state.currentoverallrankchart.labels.push(jsonhistorydata.current[i].event)
				} else {
					this.state.currentpointschart.labels.push(jsonhistorydata.current[i].event - 9)
					this.state.currentgwrankchart.labels.push(jsonhistorydata.current[i].event - 9)
					this.state.currentoverallrankchart.labels.push(jsonhistorydata.current[i].event - 9)
				}
				currentpointshistory.push(jsonhistorydata.current[i].points)
				currentgwrankhistory.push(jsonhistorydata.current[i].rank)
				currentoverallrankhistory.push(jsonhistorydata.current[i].overall_rank)
			}
		}

		// populating average scores, change this for final gameweek too
		for(var b = 0; b < 47; b++){
			if(jsonbootstrapdata.events[b].id < 30 || jsonbootstrapdata.events[b].id > 38){
				currentavgpoints.push(jsonbootstrapdata.events[b].average_entry_score)
			}

		}

		this.state.currentgwrankchart.datasets[0].data = currentgwrankhistory
		this.state.currentoverallrankchart.datasets[0].data = currentoverallrankhistory
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
		for (var k = 1; k < 48; k++){
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
		if (this.state.doughnut.datasets[0].data.length === 0 && this.state.loading === false){
			return(
				<div className="inputsection">
					<div className="formstuff">
						<form className="inputform">
							<TextInput id="TextInput-4" label="Team ID" onChange={this.handleChange} className="textinput"/>
	 						<Button type="button" waves="light" onClick={this.getData}>Submit</Button>				
	  					</form>	
	  					<br />
	  					Your team ID is the number in the URL when you view your points page on FPL. <br />
	  					For example, the URL https://fantasy.premierleague.com/entry/124252/event/47 means your ID is 124252. <br />
	  					If you just wanted to check out the site, use ID 2612666!
	  				</div>


				</div>
			);

		} else if (this.state.doughnut.datasets[0].data.length === 0 && this.state.loading === true){
			return(
				<div className="inputsection">
					<BounceLoader size={150} color={"#123abc"} loading={this.state.loading} /> <br/>
					<h6>This can take up to a minute, hang on tight!</h6>
				</div>
			);
		} else if (this.state.doughnut.datasets[0].data.length > 0){
			return(
				<div className="home">
					<Navbar
						alignLinks="right"
						className="navbar"
						brand={<a className="brand-logo" href="#">FPLGraphs</a>}
						id="mobile-nav"
						menuIcon={<Icon>menu</Icon>}>
						<NavItem href="#seasonreview">
							2019/20
						</NavItem>
						<NavItem href="#seasonhistory">
							Past Seasons
						</NavItem>
						<NavItem href="#positiondonut">
							Points by Position
						</NavItem>
					</Navbar>
					<div className="overview">
						<div className="overviewcontent">
							<h3> Overview </h3>
							Total points: {this.state.total_points}<br/>
							Overall Rank: {this.state.overall_rank}<br/>
							Best Overall Rank: {this.state.best_overall_rank}, obtained in gameweek {this.state.best_overall_rank_gw} <br />
							Best points in one GW: {this.state.best_points}, obtained in gameweek {this.state.best_points_gw} <br />
							Highest gameweek rank: {this.state.best_gameweek_rank}, obtained in gameweek {this.state.best_gameweek_rank_gw} <br />
							You got the most points on your bench in gameweek {this.state.most_bench_points_gw}, a whopping {this.state.most_bench_points} points. Unlucky! <br />
						</div>
					</div>
					<div className="seasonreview" id="seasonreview">
						<div className="seasonreviewcontent">
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
					        <Line data={this.state.currentgwrankchart}
								options={{
									title:{
										display:true,
										text:'GW Rank/GW #',
										fontSize:20
									},
									legend: {
									display: false						
									}
							}} />
					        <Line data={this.state.currentoverallrankchart}
								options={{
									title:{
										display:true,
										text:'Overall Rank/GW #',
										fontSize:20
									},
									legend: {
									display: false						
									}
							}} />
						</div>
					</div>
					<div className="seasonhistory" id="seasonhistory">
						<div className="seasonhistorycontent">
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
										text: 'Overall Rank/Season',
										fontSize: 20
									},
									legend: {
									display: false						
									}
							}}/>
						</div>
					</div>
					<div className="picks">
						<div className="pickscontent">
							<h3> Player picks </h3>
							The player with the most appearances was: {this.state.mostpickedplayer}, with {this.state.mostpickedtimes} appearances <br />
							Most frequently captained: {this.state.mostcaptainedplayer}, {this.state.captainedtimes} times <br />
							Maximum points by one player: {this.state.maxplayerpoints}, by {this.state.maxplayerpointsname} in gameweek {this.state.maxplayerpointsgw}
						</div>
					</div>
					<div className="positiondonut" id="positiondonut">
						<div className="positiondonutcontent">
							<h3> Points by Position</h3>
							<Doughnut className ="doughnut" data={this.state.doughnut} 
								options={{
									legend: {
										display: true
									}
								}}/>
						</div>
					</div>
					<div className="chips">
						<div className="chipscontent">
							<h3> Chips </h3>
							You used your wildcard in gameweek(s) {this.printString(this.state.wildcardgw)}, and got {this.printString(this.state.wildcardpoints)} points respectively. <br />
							You used your free hit in gameweek {this.state.freehitgw}, and got {this.state.freehitpoints} points. <br />
							You used your bench boost in gameweek {this.state.benchboostgw}, and got {this.state.benchboostpoints} points.<br />
							You used your triple captain in gameweek {this.state.triplecapgw}, and got {this.state.triplecappoints} points. <br />
						</div>
					</div>
					<Footer className="footer">
						<p className="grey-text text-lighten-4">
							Email me at fplgraphs@gmail.com to give me feedback!
							Copyright 2020, TA.
						</p>
					</Footer>
				</div>
			);
		}
	}
}