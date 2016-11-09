var EventEmitter = require('events').EventEmitter;
var util = require('util');


function Game () {
	EventEmitter.call(this);

	var self = this;
	self.map = Array(19).fill(0).map(() => Array(19).fill(0));
	self.players = {1: false, 2: false};
	self.score = {1: 0, 2: 0};
	self.turn = 1;

	self.connectPlayer = function connectPlayer() {
		if (!self.players[1]) {
			self.players[1] = true;
			return 1;
		}
		else if (!self.players[2]) {
			self.players[2] = true;
			self.emit('ready');
			return 2;
		}
		else
			return 0
	};

	self.getConnectedPlayers = function getConnectedPlayers() {
		return {
			player1: self.players[1],
			player2: self.players[2]
		};
	};

	self.isReady = function isReady() {
		return (self.players[1] === true && self.players[2] === true);
	};

	self.getMap = function getMap() {
		return {map: self.map};
	};

	self.getTurn = function getTurn() {
		return {current: (self.turn % 2 == 0) + 1, total: self.turn};
	};

	// async, because leo's functions could use some async functionalities
	self.play = function play(x, y, player) {
		return new Promise((resolve, reject) => {
			let taken = [];

			if (!self.isReady())
				reject({error: 'Game not ready'});
			else if (x < 0 || x > 18)
				reject({error: 'Bad position'});
			else if (y < 0 || y > 18)
				reject({error: 'Bad position'});
			else if (player !== 1 && player !== 2)
				reject({error: 'Bad player'});
			else if (self.map[y][x] !== 0)
				reject({error: 'There already is a stone there'});
			else {
				self.map[y][x] = player;
				taken = self.checkTakeStone({x: x, y: y}, player);
				++self.turn;
				self.emit('turn', self.getTurn());
				resolve(self.checkWin({x: x, y: y}, player, taken));
			}
		})
	};

	// TODO: add all checks in play func here
	self.checkValidMove = function () {
		return true;
	};

	// TODO: add 5 breakable rule
	self.checkWin = function (stonePos, player) {
		if (self.score[player] >= 10)
			return {win: true, taken: taken};
		else if (self.checkNorth(stonePos, player) + self.checkSouth(stonePos, player) >= 4)
			return {win: true, taken: taken};
		else if (self.checkWest(stonePos, player) + self.checkEast(stonePos, player) >= 4)
			return {win: true, taken: taken};
		else if (self.checkNorthWest(stonePos, player) + self.checkSouthEast(stonePos, player) >= 4)
			return {win: true, taken: taken};
		else if (self.checkNorthEast(stonePos, player) + self.checkSouthWest(stonePos, player) >= 4)
			return {win: true, taken: taken};
		return {win: false, taken: taken};
	};

	self.checkNorth = function (startPos, stoneColor) {
		let count = 0;

		for (i = startPos.y - 1; i >= 0 && self.map[i][startPos.x] === stoneColor; --i) {
			++count;
		}
		return count;
	};

	self.checkSouth = function (startPos, stoneColor) {
		let count = 0;

		for (i = startPos.y + 1; i <= 18 && self.map[i][startPos.x] === stoneColor; ++i) {
			++count;
		}
		return count;
	};

	self.checkWest = function (startPos, stoneColor) {
		let count = 0;

		for (i = startPos.x - 1; i >= 0 && self.map[startPos.y][i] === stoneColor; --i) {
			++count;
		}
		return count;
	};

	self.checkEast = function (startPos, stoneColor) {
		let count = 0;

		for (i = startPos.x + 1; i <= 18 && self.map[startPos.y][i] === stoneColor; ++i) {
			++count;
		}
		return count;
	};

	self.checkNorthWest = function (startPos, stoneColor) {
		let count = 0;
		let i = startPos.x - 1;
		let y = startPos.y - 1;

		while (i >= 0 && j >= 0 && self.map[j][i] === stoneColor) {
			++count;
			--i;
			--j;
		}
		return count;
	};

	self.checkNorthEast = function (startPos, stoneColor) {
		let count = 0;
		let i = startPos.x + 1;
		let y = startPos.y - 1;

		while (i <= 18 && j >= 0 && self.map[j][i] === stoneColor) {
			++count;
			++i;
			--j;
		}
		return count;
	};

	self.checkSouthWest = function (startPos, stoneColor) {
		let count = 0;
		let i = startPos.x - 1;
		let y = startPos.y + 1;

		while (i >= 0 && j <= 18 && self.map[j][i] === stoneColor) {
			++count;
			--i;
			++j;
		}
		return count;
	};

	self.checkSouthEast = function (startPos, stoneColor) {
		let count = 0;
		let i = startPos.x + 1;
		let y = startPos.y + 1;

		while (i <= 18 && j <= 18 && self.map[j][i] === stoneColor) {
			++count;
			++i;
			++j;
		}
		return count;
	};

	self.checkTakeStone = function (stonePos, player) {
		let taken = [];

		let adjacentEnemyStones = self.checkNorth(stonePos, player);
		if (adjacentEnemyStones > 0 && adjacentEnemyStones % 2 === 0
			&& stonePos.y - adjacentEnemyStones >= 0
			&& self.map[stonePos.y - adjacentEnemyStones][stonePos.x] === player) {
			taken = taken.concat(self.takeNorth(stonePos, adjacentEnemyStones));
			self.score[player] += adjacentEnemyStones;
		}

		adjacentEnemyStones = self.checkSouth(stonePos, player);
		if (adjacentEnemyStones > 0 && adjacentEnemyStones % 2 === 0
			&& stonePos.y + adjacentEnemyStones <= 18
			&& self.map[stonePos.y + adjacentEnemyStones][stonePos.x] === player) {
			taken = taken.concat(self.takeSouth(stonePos, adjacentEnemyStones));
			self.score[player] += adjacentEnemyStones;
		}

		adjacentEnemyStones = self.checkWest(stonePos, player);
		if (adjacentEnemyStones > 0 && adjacentEnemyStones % 2 === 0
			&& stonePos.x - adjacentEnemyStones >= 0
			&& self.map[stonePos.y][stonePos.x - adjacentEnemyStones] === player) {
			taken = taken.concat(self.takeWest(stonePos, adjacentEnemyStones));
			self.score[player] += adjacentEnemyStones;
		}

		adjacentEnemyStones = self.checkEast(stonePos, player);
		if (adjacentEnemyStones > 0 && adjacentEnemyStones % 2 === 0
			&& stonePos.x + adjacentEnemyStones <= 18
			&& self.map[stonePos.y][stonePos.x - adjacentEnemyStones] === player) {
			taken = taken.concat(self.takeEast(stonePos, adjacentEnemyStones));
			self.score[player] += adjacentEnemyStones;
		}

		adjacentEnemyStones = self.checkNorthWest(stonePos, player);
		if (adjacentEnemyStones > 0 && adjacentEnemyStones % 2 === 0
			&& stonePos.x - adjacentEnemyStones >= 0
			&& stonePos.y - adjacentEnemyStones >= 0
			&& self.map[stonePos.y - adjacentEnemyStones][stonePos.x - adjacentEnemyStones] === player) {
			taken = taken.concat(self.takeNorthWest(stonePos, adjacentEnemyStones));
			self.score[player] += adjacentEnemyStones;
		}

		adjacentEnemyStones = self.checkNorthEast(stonePos, player);
		if (adjacentEnemyStones > 0 && adjacentEnemyStones % 2 === 0
			&& stonePos.x + adjacentEnemyStones <= 18
			&& stonePos.y - adjacentEnemyStones >= 0
			&& self.map[stonePos.y - adjacentEnemyStones][stonePos.x + adjacentEnemyStones] === player) {
			taken = taken.concat(self.takeNorthEast(stonePos, adjacentEnemyStones));
			self.score[player] += adjacentEnemyStones;
		}

		adjacentEnemyStones = self.checkSouthWest(stonePos, player);
		if (adjacentEnemyStones > 0 && adjacentEnemyStones % 2 === 0
			&& stonePos.x - adjacentEnemyStones >= 0
			&& stonePos.y + adjacentEnemyStones <= 18
			&& self.map[stonePos.y + adjacentEnemyStones][stonePos.x - adjacentEnemyStones] === player) {
			taken = taken.concat(self.takeSouthWest(stonePos, adjacentEnemyStones));
			self.score[player] += adjacentEnemyStones;
		}

		adjacentEnemyStones = self.checkSouthEast(stonePos, player);
		if (adjacentEnemyStones > 0 && adjacentEnemyStones % 2 === 0
			&& stonePos.x + adjacentEnemyStones <= 18
			&& stonePos.y + adjacentEnemyStones <= 18
			&& self.map[stonePos.y + adjacentEnemyStones][stonePos.x + adjacentEnemyStones] === player) {
			taken = taken.concat(self.takeSouthEast(stonePos, adjacentEnemyStones));
			self.score[player] += adjacentEnemyStones;
		}

		return taken;
	};

	self.takeNorth = function (pos, nbStones) {
		if (nbStones === 0) {
			return [];
		}
		self.map[pos.y][pos.x] = 0;
		return self.takeNorth({x: pos.x, y: pos.y - 1}, nbStones - 1).concat([pos]);
	};

	self.takeSouth = function (pos, nbStones) {
		if (nbStones === 0) {
			return [];
		}
		self.map[pos.y][pos.x] = 0;
		return self.takeNorth({x: pos.x, y: pos.y + 1}, nbStones - 1).concat([pos]);
	};

	self.takeWest = function (pos, nbStones) {
		if (nbStones === 0) {
			return [];
		}
		self.map[pos.y][pos.x] = 0;
		return self.takeNorth({x: pos.x - 1, y: pos.y}, nbStones - 1).concat([pos]);
	};

	self.takeEast = function (pos, nbStones) {
		if (nbStones === 0) {
			return [];
		}
		self.map[pos.y][pos.x] = 0;
		return self.takeNorth({x: pos.x, y: pos.y + 1}, nbStones - 1).concat([pos]);
	};

	self.takeNorthWest = function (pos, nbStones) {
		if (nbStones === 0) {
			return [];
		}
		self.map[pos.y][pos.x] = 0;
		return self.takeNorth({x: pos.x - 1, y: pos.y - 1}, nbStones - 1).concat([pos]);
	};

	self.takeNorthEast = function (pos, nbStones) {
		if (nbStones === 0) {
			return [];
		}
		self.map[pos.y][pos.x] = 0;
		return self.takeNorth({x: pos.x + 1, y: pos.y - 1}, nbStones - 1).concat([pos]);
	};

	self.takeSouthWest = function (pos, nbStones) {
		if (nbStones === 0) {
			return [];
		}
		self.map[pos.y][pos.x] = 0;
		return self.takeNorth({x: pos.x - 1, y: pos.y + 1}, nbStones - 1).concat([pos]);
	};

	self.takeSouthEast = function (pos, nbStones) {
		if (nbStones === 0) {
			return [];
		}
		self.map[pos.y][pos.x] = 0;
		return self.takeNorth({x: pos.x + 1, y: pos.y + 1}, nbStones - 1).concat([pos]);
	};
}

util.inherits(Game, EventEmitter);

module.exports = Game;