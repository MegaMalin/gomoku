'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');


function Game () {
	EventEmitter.call(this);

	var self = this;
	self.map = Array(19).fill(0).map(() => Array(19).fill(0));
	self.players = {1: false, 2: false};
	self.score = {1: 0, 2: 0};
	self.turn = 1;
	self.optionalRules = {
		fiveBreakable: true,
		threeDouble: true
	};

	self.DIRECTIONS = {
		VERTICAL: 0,
		HORIZONTAL: 1,
		LEFT_DIAGONAL: 2,
		RIGHT_DIAGONAL: 3
	};

	self.previousWinArray = {
		1: [],
		2: []
	};
	self.breakable = {
		1: false,
		2: false
	};

	self.setOptionalRules = function setOptionalRules(fiveBreakable, threeDouble) {
		self.optionalRules.fiveBreakable = fiveBreakable;
		self.optionalRules.threeDouble = threeDouble;
	};
	self.win = 0;

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

	self.getScore = function getScore() {
		return {
			player1: self.score[1],
			player2: self.score[2]
		};
	};

	// async, because leo's functions could use some async functionalities
	self.play = function play(x, y, player) {
		console.log('play start ', x, y, player);
			let taken = [];
			let enemy = player === 1 ? 2 : 1;

			if (!self.isReady())
				throw ({error: 'Game not ready'});
			else if (x < 0 || x > 18)
				throw ({error: 'Bad position'});
			else if (y < 0 || y > 18)
				throw ({error: 'Bad position'});
			else if (player !== 1 && player !== 2)
				throw ({error: 'Bad player'});
			else if (player !== self.getTurn().current)
				throw ({error: 'Bad turn'});
			else if (self.map[y][x] !== 0)
				throw ({error: 'There already is a stone there'});
			else {
				self.map[y][x] = player;
				if (self.optionalRules.threeDouble && !self.checkValidMove(player)) {
					self.map[y][x] = 0;
					console.log('double three reject');
					throw ({error: 'Double three'});
				}
				console.log('start checkTakeStone : ', x, y, player);
				try {
                    taken = self.checkTakeStone({x: x, y: y}, player);
				} catch(err) {
                    console.log('ERROR', err.stack);
                }
                ++self.turn;
                self.emit('turn', self.getTurn());
				let toto = self.checkWin({x: x, y: y}, player, taken);
				if (toto.win)
					self.win = player;
				if (self.breakable[enemy]) {
					if (self.previousWinArray[enemy].filter(pos => {return self.map[pos.y][pos.x] === enemy}).length >= 5) {
						self.win = toto.win ? player : enemy;
                    }
				} else {
					self.previousWinArray[enemy] = [];
				}
                console.log('end play --- won = ', self.win);
                return (toto);
			}
	};

	// TODO: add all checks in play func here
	self.checkValidMove = function (player) {
		let myMap = self.map.map((line, y) => {
			return line.map((value, x) => {
				return {value: value, pos: {x: x, y: y}}
			});
		});

		let arr = [];

		for (let i = 0; i < myMap.length; ++i) {
			arr = arr.concat(self.checkDoubleThreePattern(myMap[i], i, player));
		}

		let arr45 = rot45(myMap);
        for (let i = 0; i < arr45.length; ++i) {
            arr = arr.concat(self.checkDoubleThreePattern(arr45[i], i, player));
        }

        let arr90 = rot90(myMap);
        for (let i = 0; i < arr90.length; ++i) {
            arr = arr.concat(self.checkDoubleThreePattern(arr90[i], i, player));
        }

        let arr135 = rot45(arr90);
        for (let i = 0; i < arr135.length; ++i) {
            arr = arr.concat(self.checkDoubleThreePattern(arr135[i], i, player));
        }

        let counter = {};
        arr.forEach(obj => {
        	let key = JSON.stringify(obj);
        	counter[key] = (counter[key] || 0) + 1;
		});

        return !(Object.keys(counter).filter(key => counter[key] > 1).length > 0);
    };

	self.checkDoubleThreePattern = function(line, y, player) {
		let str = line.map((obj) => obj.value).join('');
		let ret = [];
		let match = null;
		let patterns = [
			[0, player, player, player, 0].join(''),
			[0, player, player, 0, player, 0].join(''),
			[0, player, 0, player, player, 0].join('')
		];

		for (let i = 0; i < patterns.length; ++i) {
			match = str.match(patterns[i]);
			if (match) {
				for (let j = 0; j < patterns[i].length; ++j) {
					if (patterns[i][j] == player) {
						ret.push(line[j + match.index].pos);
					}
				}
			}
		}

		return ret;
	};

	 function rot90(map) {
		let newMap = map.map((arr) => {return arr.slice()});

		for (let i = 0; i < 19; ++i) {
			for (let j = 0; j < 19; ++j) {
				newMap[i][j] = map[19 - j - 1][i];
			}
		}

		return newMap;
	}

    function zip(arrays) {
        return Array
            .apply(null,Array(arrays[0].length))
            .map(function(_,i){
                return arrays.reverse()
                    .map(function(array){return array[i]})
            });
    }

    function rot45(arr2d) {
        return zip(
            arr2d.map((_arr, index) => {
                return Array(index).fill({value: 0, pos: {}})
                    .concat(
                        _arr.concat(
                            Array(arr2d.length - 1 - index).fill({value: 0, pos: {}})
                        )
                    );
            })
        );
    }

    /**
	 * Check if the player won the game with the move He just made
	 *
     * @param {Object} stonePos			- Pos of the stone the player just played
     * @param {Number} player			- ID of the player that just played
     * @param {Array.<Object>} taken	- Array containing the pos of the stones the player took
     * @returns {Object}
     */
	self.checkWin = function (stonePos, player, taken) {
		let winArray = [];
		let startPos = {x: 0, y: 0};
		let endPos = {x: 0, y: 0};
		let nbAligned = 0;

        if (self.score[player] >= 10) {
            return {win: true, taken: taken};
        }
		else if ((nbAligned = self.checkNorth(stonePos, player) + self.checkSouth(stonePos, player)) >= 4)
		{
			for (let i = stonePos.y; i >= 0 && self.map[i][stonePos.x] === player; --i) {
				startPos.y = i;
			}
			startPos.x = endPos.x = stonePos.x;
			endPos.y = startPos.y + nbAligned;
			for (let i = startPos.y; i <= endPos.y; ++i) {
				winArray.push({x: stonePos.x, y: i});
			}
            return {win: (!self.isBreakable(winArray, player)), taken: taken};
        }
		else if ((nbAligned = self.checkWest(stonePos, player) + self.checkEast(stonePos, player)) >= 4)
		{
			for (let i = stonePos.x; i >= 0 && self.map[stonePos.y][i] === player; --i) {
				startPos.x = i;
			}
			startPos.y = endPos.y = stonePos.y;
			endPos.x = startPos.x + nbAligned;
			for (let i = startPos.x; i <= endPos.x; ++i) {
				winArray.push({x: i, y: stonePos.y});
			}
            return {win: (!self.isBreakable(winArray, player)), taken: taken};
        }
		else if ((nbAligned = self.checkNorthWest(stonePos, player) + self.checkSouthEast(stonePos, player)) >= 4)
		{
			let i = stonePos.x;
			let j = stonePos.y;
			while (i >= 0 && j >= 0 && self.map[j][i] === player) {
				startPos.x = i;
				startPos.y = j;
				--i;
				--j;
			}
			endPos = {x: startPos.x + nbAligned, y: startPos.y + nbAligned};
			i = startPos.x;
			j = startPos.y;
			while (i <= endPos.x && j <= endPos.y) {
				winArray.push({x: i, y: j});
				++i;
				++j;
			}
            return {win: (!self.isBreakable(winArray, player)), taken: taken};
        }
		else if ((nbAligned = self.checkNorthEast(stonePos, player) + self.checkSouthWest(stonePos, player)) >= 4)
		{
            let i = stonePos.x;
            let j = stonePos.y;
            while (i <= 18 && j >= 0 && self.map[j][i] === player) {
                startPos.x = i;
                startPos.y = j;
                ++i;
                --j;
            }
            endPos = {x: startPos.x - nbAligned, y: startPos.y + nbAligned};
            i = startPos.x;
            j = startPos.y;
            while (i >= endPos.x && j <= endPos.y) {
                winArray.push({x: i, y: j});
                --i;
                ++j;
            }
            return {win: (!self.isBreakable(winArray, player)), taken: taken};
        }
		return {win: false, taken: taken};
	};

    /**
	 *
     * @param winArray
     * @param player
     * @param direction
     */
	self.isBreakable = function(winArray, player) {
		if (!self.optionalRules.fiveBreakable || self.breakable[player]) {
			self.breakable[player] = false;
            return false;
		}

		let enemy = player === 1 ? 2 : 1;
		let rez = false;
		try {
            winArray.forEach(stone => {
            	let len = 0;
				if (((len = self.checkNorth(stone, player)) > 0) && (len % 2 !== 0)) {
					if ((stone.y - (len + 1) >= 0 && stone.y + 1 <= 18)
						&& ((self.map[stone.y - (len + 1)][stone.x] === enemy && self.map[stone.y + 1][stone.x] === 0)
						|| (self.map[stone.y - (len + 1)][stone.x] === 0 && self.map[stone.y + 1][stone.x] === enemy))) {
						rez = true;
					}
				} else if (((len = self.checkSouth(stone, player)) > 0) && (len % 2 !== 0)) {
 					if ((stone.y + (len + 1) <= 18 && stone.y - 1 >= 0) &&
						(self.map[stone.y + (len + 1)][stone.x] === enemy && self.map[stone.y - 1][stone.x] === 0)
						|| (self.map[stone.y + (len + 1)][stone.x] === 0 && self.map[stone.y - 1][stone.x] === enemy)) {
 						rez = true;
					}
				} else if (((len = self.checkEast(stone, player)) > 0) && (len % 2 !== 0)) {
					if ((stone.x + (len + 1) <= 18 && stone.x - 1 >= 0)
						&& (self.map[stone.y][stone.x + (len + 1)] === enemy && self.map[stone.y][stone.x - 1] === 0)
						|| (self.map[stone.y][stone.x + (len + 1)] === 0 && self.map[stone.y][stone.x - 1]) === enemy) {
						rez = true;
					}
				} else if (((len = self.checkWest(stone, player)) > 0) && (len % 2 !== 0)) {
					if ((stone.x - (len + 1) >= 0 && stone.x + 1 <= 18)
						&& (self.map[stone.y][stone.x - (len + 1)] === enemy && self.map[stone.y][stone.x + 1] === 0)
						|| (self.map[stone.y][stone.x - (len + 1)] === 0 && self.map[stone.y][stone.x + 1] === enemy)) {
						rez = true;
					}
				} else if (((len = self.checkSouthEast(stone, player)) > 0) && (len % 2 !== 0)) {
					if ((stone.y + (len + 1) <= 18 && stone.x + (len + 1) <= 18 && stone.x - 1 >= 0 && stone.y - 1 >= 0)
						&& (self.map[stone.y + (len + 1)][stone.x + (len + 1)] === enemy && self.map[stone.y - 1][stone.x - 1] === 0)
						|| (self.map[stone.y + (len + 1)][stone.x + (len + 1)] === 0 && self.map[stone.y - 1][stone.x - 1] === enemy)) {
						rez = true;
					}
				} else if (((len = self.checkSouthWest(stone, player)) > 0) && (len % 2 !== 0)) {
					if ((stone.x - (len + 1) >= 0 && stone.y + (len + 1) <= 18 && stone.x + 1 <= 18 && stone.y - 1 >= 0)
						&& (self.map[stone.y + (len + 1)][stone.x - (len + 1)] === enemy && self.map[stone.y - 1][stone.x + 1] === 0)
						|| (self.map[stone.y + (len + 1)][stone.x - (len + 1)] === 0 && self.map[stone.y - 1][stone.x + 1] === enemy)) {
						rez = true;
					}
				} else if (((len = self.checkNorthEast(stone, player)) > 0) && (len % 2 !== 0)) {
					if ((stone.x + (len + 1) <= 18 && stone.y - (len + 1) >= 0 && stone.x - 1 >= 0 && stone.y + 1 <= 18)
						&& (self.map[stone.y - (len + 1)][stone.x + (len + 1)] === enemy && self.map[stone.y + 1][stone.x - 1] === 0)
						|| (self.map[stone.y - (len + 1)][stone.x + (len + 1)] === 0 && self.map[stone.y + 1][stone.x - 1] === enemy)) {
						rez = true;
					}
				} else if (((len = self.checkNorthWest(stone, player)) > 0) && (len % 2 !== 0)) {
					if ((stone.x - (len + 1) >= 0 && stone.y - (len + 1) >= 0 && stone.x + 1 <= 18 && stone.y + 1 <= 18)
						&& (self.map[stone.y - (len + 1)][stone.x - (len + 1)] === enemy && self.map[stone.y + 1][stone.x + 1] === 0)
						|| (self.map[stone.y - (len + 1)][stone.x - (len + 1)] === 0 && self.map[stone.y + 1][stone.x + 1] === enemy)) {
						rez = true;
					}
				}
            });
        } catch (err) {
			console.log(err);
		}
		self.breakable[player] = rez;
		if (rez)
			self.previousWinArray[player] = winArray;
		return rez;
	};

    /**
     * @param {Object} startPos			- The starting pos of the check
     * @param stoneColor				- ID of the player
     * @returns {number}				- Number of contiguous stones of stoneColor in that direction
     */
	self.checkNorth = function (startPos, stoneColor) {
		let count = 0;

		for (var i = startPos.y - 1; i >= 0 && self.map[i][startPos.x] === stoneColor; --i) {
			++count;
		}
		return count;
	};

	self.checkSouth = function (startPos, stoneColor) {
		let count = 0;

		for (var i = startPos.y + 1; i <= 18 && self.map[i][startPos.x] === stoneColor; ++i) {
			++count;
		}
		return count;
	};

	self.checkWest = function (startPos, stoneColor) {
		let count = 0;

		for (var i = startPos.x - 1; i >= 0 && self.map[startPos.y][i] === stoneColor; --i) {
			++count;
		}
		return count;
	};

	self.checkEast = function (startPos, stoneColor) {
		let count = 0;

		for (var i = startPos.x + 1; i <= 18 && self.map[startPos.y][i] === stoneColor; ++i) {
			++count;
		}
		return count;
	};

	self.checkNorthWest = function (startPos, stoneColor) {
		let count = 0;
		let i = startPos.x - 1;
		let j = startPos.y - 1;

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
		let j = startPos.y - 1;

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
		let j = startPos.y + 1;

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
		let j = startPos.y + 1;

		while (i <= 18 && j <= 18 && self.map[j][i] === stoneColor) {
			++count;
			++i;
			++j;
		}
		return count;
	};

    /**
	 * Check if the player took stones with the move He just made
	 *
     * @param stonePos
     * @param player
     * @returns {Array}
     */
	self.checkTakeStone = function (stonePos, player) {
		console.log('start checkTakeSTone');

		let taken = [];
		const enemy = player === 1 ? 2 : 1;

		let adjacentEnemyStones = self.checkNorth(stonePos, enemy);
		if (adjacentEnemyStones === 2
			&& stonePos.y - adjacentEnemyStones > 0
			&& self.map[stonePos.y - (adjacentEnemyStones + 1)][stonePos.x] === player) {
			taken = taken.concat(self.takeNorth(stonePos, adjacentEnemyStones));
			self.score[player] += adjacentEnemyStones;
		}

		adjacentEnemyStones = self.checkSouth(stonePos, enemy);
		if (adjacentEnemyStones === 2
			&& stonePos.y + adjacentEnemyStones < 18
			&& self.map[stonePos.y + (adjacentEnemyStones + 1)][stonePos.x] === player) {
			taken = taken.concat(self.takeSouth(stonePos, adjacentEnemyStones));
			self.score[player] += adjacentEnemyStones;
		}

		adjacentEnemyStones = self.checkWest(stonePos, enemy);
		if (adjacentEnemyStones === 2
			&& stonePos.x - adjacentEnemyStones > 0
			&& self.map[stonePos.y][stonePos.x - (adjacentEnemyStones + 1)] === player) {
			taken = taken.concat(self.takeWest(stonePos, adjacentEnemyStones));
			self.score[player] += adjacentEnemyStones;
		}

		adjacentEnemyStones = self.checkEast(stonePos, enemy);
		if (adjacentEnemyStones === 2
			&& stonePos.x + adjacentEnemyStones < 18
			&& self.map[stonePos.y][stonePos.x + (adjacentEnemyStones + 1)] === player) {
			taken = taken.concat(self.takeEast(stonePos, adjacentEnemyStones));
			self.score[player] += adjacentEnemyStones;
		}

		adjacentEnemyStones = self.checkNorthWest(stonePos, enemy);
		if (adjacentEnemyStones === 2
			&& stonePos.x - adjacentEnemyStones > 0
			&& stonePos.y - adjacentEnemyStones > 0
			&& self.map[stonePos.y - (adjacentEnemyStones + 1)][stonePos.x - (adjacentEnemyStones + 1)] === player) {
			taken = taken.concat(self.takeNorthWest(stonePos, adjacentEnemyStones));
			self.score[player] += adjacentEnemyStones;
		}

		adjacentEnemyStones = self.checkNorthEast(stonePos, enemy);
		if (adjacentEnemyStones === 2
			&& stonePos.x + adjacentEnemyStones < 18
			&& stonePos.y - adjacentEnemyStones > 0
			&& self.map[stonePos.y - (adjacentEnemyStones + 1)][stonePos.x + (adjacentEnemyStones + 1)] === player) {
			taken = taken.concat(self.takeNorthEast(stonePos, adjacentEnemyStones));
			self.score[player] += adjacentEnemyStones;
		}

		adjacentEnemyStones = self.checkSouthWest(stonePos, enemy);
		if (adjacentEnemyStones === 2
			&& stonePos.x - adjacentEnemyStones > 0
			&& stonePos.y + adjacentEnemyStones < 18
			&& self.map[stonePos.y + (adjacentEnemyStones + 1)][stonePos.x - (adjacentEnemyStones + 1)] === player) {
			taken = taken.concat(self.takeSouthWest(stonePos, adjacentEnemyStones));
			self.score[player] += adjacentEnemyStones;
		}

		adjacentEnemyStones = self.checkSouthEast(stonePos, enemy);
		if (adjacentEnemyStones === 2
			&& stonePos.x + adjacentEnemyStones < 18
			&& stonePos.y + adjacentEnemyStones < 18
			&& self.map[stonePos.y + (adjacentEnemyStones + 1)][stonePos.x + (adjacentEnemyStones + 1)] === player) {
			taken = taken.concat(self.takeSouthEast(stonePos, adjacentEnemyStones));
			self.score[player] += adjacentEnemyStones;
		}

        console.log('end checkTakeSTone');
        return taken;
	};

    /**
	 * Take stones in that direction and returns them as an array of pos
	 *
     * @param pos					- Pos from which to start taking stones
     * @param {Number} nbStones		- Number of stones to be taken
     * @returns {Array.<Object>}
     */
	self.takeNorth = function (pos, nbStones) {
		if (nbStones === 0) {
			return [];
		}
		self.map[pos.y - 1][pos.x] = 0;
		return self.takeNorth({x: pos.x, y: pos.y - 1}, nbStones - 1)
			.concat([{x: pos.x, y: pos.y - 1}]);
	};

	self.takeSouth = function (pos, nbStones) {
		if (nbStones === 0) {
			return [];
		}
		self.map[pos.y + 1][pos.x] = 0;
		return self.takeSouth({x: pos.x, y: pos.y + 1}, nbStones - 1)
			.concat([{x: pos.x, y: pos.y + 1}]);
	};

	self.takeWest = function (pos, nbStones) {
		if (nbStones === 0) {
			return [];
		}
		self.map[pos.y][pos.x - 1] = 0;
		return self.takeWest({x: pos.x - 1, y: pos.y}, nbStones - 1)
			.concat([{x: pos.x - 1, y: pos.y}]);
	};

	self.takeEast = function (pos, nbStones) {
		if (nbStones === 0) {
			return [];
		}
		self.map[pos.y][pos.x + 1] = 0;
		return self.takeEast({x: pos.x + 1, y: pos.y}, nbStones - 1)
			.concat([{x: pos.x + 1, y: pos.y}]);
	};

	self.takeNorthWest = function (pos, nbStones) {
		if (nbStones === 0) {
			return [];
		}
		self.map[pos.y - 1][pos.x - 1] = 0;
		return self.takeNorthWest({x: pos.x - 1, y: pos.y - 1}, nbStones - 1)
			.concat([{x: pos.x - 1, y: pos.y - 1}]);
	};

	self.takeNorthEast = function (pos, nbStones) {
		if (nbStones === 0) {
			return [];
		}
		self.map[pos.y - 1][pos.x + 1] = 0;
		return self.takeNorthEast({x: pos.x + 1, y: pos.y - 1}, nbStones - 1)
			.concat([{x: pos.x + 1, y: pos.y - 1}]);
	};

	self.takeSouthWest = function (pos, nbStones) {
		if (nbStones === 0) {
			return [];
		}
		self.map[pos.y + 1][pos.x - 1] = 0;
		return self.takeSouthWest({x: pos.x - 1, y: pos.y + 1}, nbStones - 1)
			.concat([{x: pos.x - 1, y: pos.y + 1}]);
	};

	self.takeSouthEast = function (pos, nbStones) {
		if (nbStones === 0) {
			return [];
		}
		self.map[pos.y + 1][pos.x + 1] = 0;
		return self.takeSouthEast({x: pos.x + 1, y: pos.y + 1}, nbStones - 1)
			.concat([{x: pos.x + 1, y: pos.y + 1}]);
	};
}

util.inherits(Game, EventEmitter);

module.exports = Game;
