'use strict';

function getRequestField(req, field) {
	if (req.body && req.body[field] !== undefined)
		return req.body[field];
	if (req.fields && req.fields[field] !== undefined)
		return req.fields[field];
	if (req.query && req.query[field] !== undefined)
		return req.query[field];
	if (req.params && req.params[field] !== undefined)
		return req.params[field];

	return undefined;
}

function api (app, game) {
	var self = this;
	self.keys = {};

	// routes
	app.get('/', api_root);
	app.get('/connect', api_connect);
	app.get('/connected', api_connected);
	app.post('/key', api_key);
	app.get('/map', api_map);
	app.get('/turn', api_turn);
	app.get('/play', api_play);
	app.post('/play', api_play);
	app.get('/scores', api_score);
	app.get('/player_score', api_player_score);
	app.get('/subscribe/ready', api_subscribe_ready);
	app.post('/subscribe/ready', api_subscribe_ready);
	app.get('/subscribe/turn', api_subscribe_turn);
	app.post('/subscribe/turn', api_subscribe_turn);


	function api_root (req, res) {
	  res.send('Welcome to the gomoku game');
	}

	function api_connect (req, res) {
		var player = game.connectPlayer();
		if (player > 0) {
			var key = generateKey();
			self.keys[key] = player;
			res.status(200).send({player: player, key: key});
		}
		else
			res.status(403).send();
	}

	function api_connected (req, res) {
		res.status(200).send(game.getConnectedPlayers());
	}

	function api_key (req, res) {
		var key = getRequestField(req, 'key');
		var player = self._getPlayerFromKey(key);
		if (player === 1 || player === 2)
			res.status(200).send({player: player});
		else
			res.status(403).send({error: 'Bad key'});
	}

	function api_map (req, res) {
		res.status(200).send(game.getMap());
	}

	function api_turn (req, res) {
		res.status(200).send(game.getTurn());
	}

	function api_score (req, res) {
		res.status(200).send(game.getScore());
	}

	function api_player_score (req, res) {
		var key = getRequestField(req, 'key');

		if (!key)
			res.status(401).send({error: 'Bad player'});
		else {
			var player = self._getPlayerFromKey(key);
			if (player !== 1 && player !== 2)
				res.status(401).send({error: 'Bad player'});
			else {
				res.status(200).send({
					score: game.getScore()[['player1', 'player2'][player - 1]]
				});
			}
		}
	}


	function api_play (req, res) {
		var key = getRequestField(req, 'key');
		try {
			var position = JSON.parse(getRequestField(req, 'position'));
		}
		catch (e) {
			var position = undefined;
		}

		var player = self._getPlayerFromKey(key);
		if (player !== 1 && player !== 2)
			res.status(401).send({error: 'Bad player'});
		if (position && position['x'] !== undefined && position['y'] !== undefined) {
			// play
			game.play(position['x'], position['y'], player)
			.then((result) => {
				res.status(200).send(result);
			})
			.catch((error) => {
				console.log(error);
				res.status(403).send(error);
			})			
		}
		else
			res.status(403).send({error: 'Bad position'});
	}

	function api_subscribe_ready (req, res) {
		res.set('Cache-Control', 'no-cache, must-revalidate');

		var key = getRequestField(req, 'key');

		var player = self._getPlayerFromKey(key);
		if (player !== 1 && player !== 2)
			res.status(401).send();

		if (game.isReady()) {
			res.status(200).send();
		}

		game.once('ready', () => {
			res.status(200).send();
		});
	}

	function api_subscribe_turn (req, res) {
		res.set('Cache-Control', 'no-cache, must-revalidate');
		var key = getRequestField(req, 'key');

		var player = self._getPlayerFromKey(key);
		if (player !== 1 && player !== 2)
			res.status(401).send();

		if (game.getTurn().current === player)
			res.status(200).send();

		if (!game.isReady()) {
			res.status(403).send({error: 'Game not ready'});
		}

		function subscribe () {
			game.once('turn', (t) => {
				if (t.current === player)
					res.status(200).send();
				else
					subscribe();
			});
		}
		subscribe();

	}

	self._getPlayerFromKey = function(key) {
		return self.keys[key];
	}
}

function generateKey() {
	return Math.random().toString(36).slice(2, 12);
}

module.exports = api;
