var expect = require('chai').expect;
var Game = require('../game.js');
var game = new Game();

describe('referee', function() {
    game.players[1] = true;
    game.players[2] = true;

    describe('map', function() {
        it ('should be a 19 / 19 board', function(done) {
            expect(game.map.length).to.equal(19);
            game.map.forEach( line => {
                expect(line.length).to.equal(19);
            });
            done();
        });
        it('sould be filled with 0s', function(done) {
            game.map.forEach(y => {
                y.forEach(x => {
                    expect(x).to.equal(0);
                });
            });
            done();
        });
    });

    describe('check horizontal win', function() {
        describe('checkWest', function() {
            it('should return 4', function(done) {
                game.map[0][0] = 1;
                game.map[0][1] = 1;
                game.map[0][2] = 1;
                game.map[0][3] = 1;
                expect(game.checkWest({x: 4, y: 0}, 1)).to.equal(4);
                done();
            });
            it('sould return 3', function(done) {
                game.map[0][0] = 2;
                expect(game.checkWest({x: 4, y: 0}, 1)).to.equal(3);
                done();
            });
        });
        describe('checkEast', function() {
            it('should return 4', function(done) {
                game.map[0][0] = 0;
                game.map[0][4] = 1;
                expect(game.checkEast({x: 0, y: 0}, 1)).to.equal(4);
                done();
            });
        });
    });

    describe('check vertical win', function() {
        describe('checkNorth', function() {
            it('should return 4', function(done) {
                game.map[0][0] = 1;
                game.map[1][0] = 1;
                game.map[2][0] = 1;
                game.map[3][0] = 1;
                expect(game.checkNorth({x:0, y: 4}, 1)).to.equal(4);
                done();
            });
            it('should return 0', function(done) {
                game.map[3][0] = 2;
                expect(game.checkNorth({x: 0, y: 4}, 1)).to.equal(0);
                done();
            });
        });
        describe('checkSouth', function() {
            it('should return 5', function(done) {
                game.map[3][0] = 1;
                game.map[4][0] = 1;
                game.map[5][0] = 1;
                expect(game.checkSouth({x: 0, y: 0}, 1)).to.equal(5);
                done();
            });
            it('should return 0', function(done) {
                expect(game.checkSouth({x: 0, y: 18}, 1)).to.equal(0);
                done();
            });
        });
    });
    describe('check diagonal win', function() {
        describe('checkNorthWest', function() {
            it('should return 0', function(done) {
                game.map = Array(19).fill(0).map(() => Array(19).fill(0));
                expect(game.checkNorthWest({x: 18, y: 0}, 0)).to.equal(0);
                done();
            });
            it('should return 18', function(done) {
                expect(game.checkNorthWest({x: 18, y: 18}, 0)).to.equal(18);
                done();
            });
        });
        describe('checkNorthEast', function() {
            it('should return 0', function(done) {
                expect(game.checkNorthEast({x: 18, y: 0}, 0)).to.equal(0);
                done();
            });
            it('should return 18', function(done) {
                expect(game.checkNorthEast({x: 0, y: 18}, 0)).to.equal(18);
                done();
            });
            it('should return 5', function(done) {
                expect(game.checkNorthEast({x: 0, y: 5}, 0)).to.equal(5);
                done();
            });
        });
        describe('checkSouthWest', function() {
            it('should return 0', function(done) {
                expect(game.checkSouthWest({x: 5, y: 18}, 0)).to.equal(0);
                done();
            });
            it('should return 18', function(done) {
                expect(game.checkSouthWest({x: 18, y: 0}, 0)).to.equal(18);
                done();
            });
        });
        describe('checkSouthEast', function() {
            it('should return 0', function(done) {
                expect(game.checkSouthEast({x: 5, y: 18}, 0)).to.equal(0);
                done();
            });
            it('should return 18', function(done) {
                expect(game.checkSouthEast({x: 0, y: 0}, 0)).to.equal(18);
                done();
            });
        });
    });
});