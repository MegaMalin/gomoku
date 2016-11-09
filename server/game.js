var EventEmitter = require('events').EventEmitter;
var util = require('util');


function Game () {
	EventEmitter.call(this);

	var self = this
	self.map = Array(19).fill(0).map(() => Array(19).fill(0))
	self.players = {1: false, 2: false}
	self.turn = 1

	self.connectPlayer = function connectPlayer() {
		if (!self.players[1]) {
			self.players[1] = true
			return 1
		}
		else if (!self.players[2]) {
			self.players[2] = true
			self.emit('ready')
			return 2
		}
		else
			return 0
	}

	self.getConnectedPlayers = function getConnectedPlayers() {
		return {
			player1: self.players[1],
			player2: self.players[2]
		}
	}

	self.isReady = function isReady() {
		return (self.players[1] === true && self.players[2] === true)
	}

	self.getMap = function getMap() {
		return {map: self.map}
	}

	self.getTurn = function getTurn() {
		return {current: (self.turn % 2 == 0) + 1, total: self.turn}
	}

	// async, because leo's functions could use some async functionalities
	self.play = function play(x, y, player) {
		return new Promise((resolve, reject) => {

			if (!self.isReady())
				reject({error: 'Game not ready'})
			else if (x < 0 || x > 18)
				reject({error: 'Bad position'})
			else if (y < 0 || y > 18)
				reject({error: 'Bad position'})
			else if (player !== 1 && player !== 2)
				reject({error: 'Bad player'})
			else if (self.map[y][x] !== 0)
				reject({error: 'There already is a stone there'})
			else {
				self.map[y][x] = player
				++self.turn
				self.emit('turn', self.getTurn())
				resolve({win: false, taken:[]})
			}
		})
	}
}

util.inherits(Game, EventEmitter);

module.exports = Game