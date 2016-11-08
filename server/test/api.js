'use strict'

require('events').EventEmitter.prototype._maxListeners = 100;

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var chaiHttp = require('chai-http');
chai.use(chaiAsPromised);
chai.use(chaiHttp);
var expect = chai.expect;
var request = chai.request;

var app = require('../server.js');

var player1Key;
var player2Key;

describe('api', function () {
	describe('/connect', function () {
		it('should allow for a user to connect', function (done) {		
			request(app)
			.get('/connect')
			.end(function (err, res) {
				expect(res.status).to.equal(200);
				expect(res).to.have.property('text');
				var objRes = JSON.parse(res.text);
				expect(objRes.player).to.equal(1);
				player1Key = objRes.key;
				done(err);
			});
		});

		// player1 connected

		it('should return a correct key', function (done) {
			request(app)
			.post('/key')
			.field('key', player1Key)
			.end(function (err, res) {
				expect(res.status).to.equal(200);
				expect(res).to.have.property('text');
				var objRes = JSON.parse(res.text);
				expect(objRes.player).to.equal(1);
				done(err);
			});
		});
	});

	describe('/key', function () {
		it('should return an error when sending a bad key', function (done) {
			request(app)
			.post('/key')
			.field('key', '0123456789')
			.end(function (err, res) {
				expect(res.status).to.equal(403);
				done();
			});
		});
	});

	describe('/connected', function () {
		it('should return the list of all connected players', function (done) {
			request(app)
			.get('/connected')
			.end(function (err, res) {
				expect(res.status).to.equal(200);
				expect(res).to.have.property('text');
				var objRes = JSON.parse(res.text);
				expect(objRes).to.have.property('player1');
				expect(objRes).to.have.property('player2');
				expect(objRes.player1).to.equal(true);
				expect(objRes.player2).to.equal(false);
				done(err);
			});
		});
	});

	describe('/subscribe/ready', function () {
		it('should fire when both players are connected', function (done) {

			var player2connected = false;

			request(app)
			.get('/subscribe/ready')
			.query({key: player1Key})
			.end(function (err, res) {
				expect(player2connected).to.equal(true);
				done(err);
			});

			setTimeout(() => {
				// wait 100ms and then connect player2
				player2connected = true;
				request(app)
				.get('/connect')
				.end(function (err, res) {
					var objRes = JSON.parse(res.text);
					player2Key = objRes.key;
				});				
			}, 100);

		});

		it('should fire instantly when the game is already ready', function (done) {
			request(app)
			.get('/subscribe/ready')
			.query({key: player1Key})
			.end(function (err, res) {
				done(err);
			});
		});
	});

	// player2 connected. Game ready

	describe('/play', function () {
		it('should refuse a player if it is not its turn', function (done) {
			request(app)
			.post('/play')
			.field('key', player2Key)
			.end(function (err, res) {
				expect(res.status).to.equal(403);
				done();
			});
		});

		it('should refuse a move if it\'s illegal (basic)', function (done) {
			request(app)
			.post('/play')
			.field('key', player1Key)
			.field('position', JSON.stringify({x: 42, y: 3}))
			.end(function (err, res) {
				expect(res.status).to.equal(403);
				done();
			});
		});

		it('should accept a move if it\'s legal (basic)', function (done) {
			request(app)
			.post('/play')
			.field('key', player1Key)
			.field('position', JSON.stringify({x: 3, y: 3}))
			.end(function (err, res) {
				expect(res.status).to.equal(200);
				expect(res).to.have.property('text');
				var objRes = JSON.parse(res.text);
				expect(objRes).to.have.property('win');
				done();
			});
		});
		
	});

	// player 2 turn. Tile 3/3 used

	describe('/turn', function (done) {
		it('should return the current and total turn', function (done) {
			request(app)
			.get('/turn')
			.end(function (err, res) {
				expect(res.status).to.equal(200);
				expect(res).to.have.property('text');
				var objRes = JSON.parse(res.text);
				expect(objRes).to.have.property('current');
				expect(objRes).to.have.property('total');

				expect(objRes.current).to.equal(2);
				expect(objRes.total).to.equal(2);
				done(err);
			});
		});
	});

	describe('/subscribe/turn', function () {
		it('should fire when it\'s the player\'s turn', function (done) {

			var player2Played = false;

			// subscribe as player1
			request(app)
			.get('/subscribe/turn')
			.query({key: player1Key})
			.end(function (err, res) {
				// expect(player2Played).to.equal(true);
				done();
			});

			setTimeout(() => {
				// wait 100ms and then connect player2
				player2Played = true;
				request(app)
				.post('/play')
				.field('key', player2Key)
				.field('position', JSON.stringify({x: 4, y: 4}))
				.end(() => {});
			}, 100);

		});

		it('should fire instantly when it\'s the player\'s turn', function (done) {
			request(app)
			.get('/subscribe/turn')
			.query({key: player1Key})
			.end(function (err, res) {
				done(err);
			});
		});
	});

	// player 1 turn. Tile 4/4 used.

	describe('/map', function () {
		it('should return the map', function (done) {
			request(app)
			.get('/map')
			.end(function (err, res) {
				expect(res.status).to.equal(200);
				expect(res).to.have.property('text');
				var objRes = JSON.parse(res.text);
				expect(objRes).to.have.property('map');


				expect(objRes.map.length).to.equal(19);
				objRes.map.forEach((row) => {
					expect(row.length).to.equal(19);
				});
				expect(objRes.map[0][0]).to.equal(0);
				expect(objRes.map[3][3]).to.equal(1);
				expect(objRes.map[4][4]).to.equal(2);

				done(err);
			});
		});
	});
});

