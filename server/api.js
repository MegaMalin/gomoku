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

	app.get('/', function (req, res) {
	  res.send('Welcome to the gomoku game');
	});

	app.get('/connect', function (req, res) {
		var player = game.connectPlayer();
		if (player > 0) {
			var key = generateKey();
			self.keys[key] = player;
			res.status(200).send({player: player, key: key});
		}
		else
			res.status(403).send();
	});

	app.get('/connected', function (req, res) {
		res.status(200).send(game.getConnectedPlayers());
	});

	app.post('/key', function (req, res) {
		var key = getRequestField(req, 'key');
		var player = self._getPlayerFromKey(key);
		if (player === 1 || player === 2)
			res.status(200).send({player: player});
		else
			res.status(403).send({error: 'Bad key'});
	});

	app.get('/map', function (req, res) {
		res.status(200).send(game.getMap());
	});

	app.get('/turn', function (req, res) {
		res.status(200).send(game.getTurn());
	});

	app.post('/play', function (req, res) {
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
				res.status(403).send(error);
			})			
		}
		else
			res.status(403).send({error: 'Bad position'});
	});

	app.get('/subscribe/turn', function (req, res) {
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

	});

	app.get('/subscribe/ready', function (req, res) {
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
	});

	self._getPlayerFromKey = function(key) {
		return self.keys[key];
	}
}

function generateKey() {
	return Math.random().toString(36).slice(2, 12);
}

module.exports = api;
