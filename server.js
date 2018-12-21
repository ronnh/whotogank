const express = require('express');
const request = require('request');
const rp = require('request-promise');
const app = express();
const port = process.env.PORT || 5000;
const APIKEY = 'RGAPI-0929ea5a-2312-4472-ad5e-e6421d830e58';
const baseUrl = 'https://na1.api.riotgames.com';

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

// create a GET route
app.get('/express_backend', (req, res) => {
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});

app.get('/api/currentMatch/:name', function(req, res, next){
	//req.params.name
	/*
	getPlayersInMatch(req.params.name).then(function(participants){
		console.log(participants);
	}).catch(function (err) {
     console.log(err);
	});*/
	getPlayersInMatch(req.params.name)
        .then(checkForTilted)
        .catch(console.error)
})

function checkForTilted(players){
	var playerMatches = {};
	var promises = [];
	for(var i = 0; i < players.length; i++){
		var playerObj = JSON.parse(JSON.parse(players[i]));
		var accId = playerObj.accountId;
		playerMatches[accId] = [];
		promises.push(new Promise(function(resolve, reject){
			request.get({
				url: baseUrl + '/lol/match/v3/matchlists/by-account/' + accId + '?endIndex=10&api_key=' + APIKEY
			}, function(err, resp, body){
				/*
				var tempGameId = [];
				var matches = JSON.parse(JSON.stringify(body)).matches;

				for(var i = 0; i < matches.length; i++){
					tempGameId.push(matches[i].gameId);
				}
				resolve(tempGameId);
				
				var tempMatches = JSON.parse(JSON.parse(JSON.stringify(body))).matches;
				var tempGameIds = [];
				console.log("tempMatches == " + tempMatches)
				for(var j = 0; j < tempMatches.length; j++){
					tempGameIds.push(tempMatches[i].gameId);
				}
				*/
				resolve({accId: accId, matches: JSON.parse(JSON.parse(JSON.stringify(body))).matches});
			});
		}));
	}

	const allMatches = Promise.all(promises)
	.then(function(playerMatches){
		console.log(playerMatches[0].matches);
		for(var i = 0; i < playerMatches.length; i++){
			//var playerMatch = JSON.parse(JSON.parse(playerMatches[i]));
			//var matches = playerMatch.matches;
			
		}
	})
	.catch(console.error);
	

	//const 
}

//get all players in the match in accountIds
const getPlayersInMatch = async name => {
    const id = await rp(baseUrl + '/lol/summoner/v3/summoners/by-name/' + name + '?api_key=' + APIKEY)
    .then(res => JSON.parse(res).id);
    
    const participants = await rp(baseUrl + '/lol/spectator/v3/active-games/by-summoner/' + id + '?api_key=' + APIKEY)
        .then(res => JSON.parse(res).participants);
    //get account id from name
    var promises = [];
    for (var i = 0; i < participants.length; i++){
    	promises.push(new Promise(function(resolve, reject){
    		request.get({
    			url: baseUrl + '/lol/summoner/v3/summoners/by-name/' + participants[i].summonerName + '?api_key=' + APIKEY
    		}, function(err, resp, body){
    			//var bodyObj = JSON.parse(body);
    			resolve(JSON.stringify(body));
    			//resolve(body);
    		});
    	}));
    }
    const accId = await Promise.all(promises);

    return accId;
}