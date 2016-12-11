'use strict';

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
        describe('checkWin', function() {
            it('should return true if score == 10', function(done) {
                game.score[1] = 10;
                expect(game.checkWin({x: 0, y: 0}, 1, []).win).to.equal(true);
                done();
            });
            it('should return true if 5 stones aligned', function(done) {
                game.map = Array(19).fill(0).map(() => Array(19).fill(0));
                game.map[0][18] = 1;
                game.map[1][17] = 1;
                game.map[2][16] = 1;
                game.map[3][15] = 1;
                expect(game.checkWin({x: 14, y: 4}, 1, []).win).to.equal(true);
                done();
            });
        });
        describe('checkWin 5 breakable rule', function() {
            it('vertical should return false', function(done) {
                game.score[1] = 0;
                game.score[2] = 0;
                game.map = Array(19).fill(0).map(() => Array(19).fill(0));
                game.map[0][5] = 1;
                game.map[1][5] = 1;
                game.map[2][5] = 1;
                game.map[3][5] = 1;
                game.map[4][5] = 1;

                game.map[0][4] = 2;
                game.map[0][6] = 1;
                expect(game.checkWin({x: 5, y: 4}, 1, []).win).to.equal(false);
                done();
            });
        });
        describe('Double three rule', function() {
            it ('sould return false', function(done) {
                game.map = Array(19).fill(0).map(() => Array(19).fill(0));
                game.map[1][1] = 1;
                game.map[2][2] = 1;
                game.map[4][5] = 1;
                game.map[4][6] = 1;
                try {
                    game.play(4, 4, 1);
                } catch (err) {
                    expect(err.error).to.equal('Double three');
                }
                done();
            });
        });
    });

    describe('take stones', function() {
        describe('takeNorth', function() {
            it('should take 2', function(done) {
                game.map = Array(19).fill(0).map(() => Array(19).fill(0));
                game.map[0][0] = 1;
                game.map[1][0] = 2;
                game.map[2][0] = 2;
                let taken = game.takeNorth({x: 0, y: 3}, 2);
                expect(taken.length).to.equal(2);
                expect(taken[0].x).to.equal(0);
                expect(taken[0].y).to.equal(1);
                expect(taken[1].x).to.equal(0);
                expect(taken[1].y).to.equal(2);
                done();
            });
            it('should take the right stones', function(done) {
                game.map = Array(19).fill(0).map(() => Array(19).fill(0));
                game.map[0][0] = 1;
                game.map[1][0] = 2;
                game.map[2][0] = 2;
                let taken = game.takeNorth({x: 0, y: 3}, 2);
                expect(taken[0].x).to.equal(0);
                expect(taken[0].y).to.equal(1);
                expect(taken[1].x).to.equal(0);
                expect(taken[1].y).to.equal(2);
                expect(game.map[1][0]).to.equal(0);
                expect(game.map[2][0]).to.equal(0);
                done();
            });
        });
        describe('takeSouth', function() {
            it('should take 2', function(done) {
                game.map = Array(19).fill(0).map(() => Array(19).fill(0));
                game.map[1][0] = 2;
                game.map[2][0] = 2;
                game.map[3][0] = 1;
                let taken = game.takeSouth({x: 0, y: 0}, 2);
                expect(taken.length).to.equal(2);
                expect(taken[0].x).to.equal(0);
                expect(taken[0].y).to.equal(2);
                expect(taken[1].x).to.equal(0);
                expect(taken[1].y).to.equal(1);
                done();
            });
            it('should take the right stones', function(done) {
                game.map = Array(19).fill(0).map(() => Array(19).fill(0));
                game.map[1][0] = 2;
                game.map[2][0] = 2;
                game.map[3][0] = 1;
                let taken = game.takeSouth({x: 0, y: 0}, 2);
                expect(taken[0].x).to.equal(0);
                expect(taken[0].y).to.equal(2);
                expect(taken[1].x).to.equal(0);
                expect(taken[1].y).to.equal(1);
                expect(game.map[1][0]).to.equal(0);
                expect(game.map[2][0]).to.equal(0);
                done();
            });
        });
        describe('takeWest', function() {
            it('should take 2', function(done) {
                game.map = Array(19).fill(0).map(() => Array(19).fill(0));
                game.map[0][0] = 1;
                game.map[0][1] = 2;
                game.map[0][2] = 2;
                let taken = game.takeWest({x: 3, y: 0}, 2);
                expect(taken.length).to.equal(2);
                expect(taken[0].x).to.equal(1);
                expect(taken[0].y).to.equal(0);
                expect(taken[1].x).to.equal(2);
                expect(taken[1].y).to.equal(0);
                done();
            });
            it('should take the right stones', function(done) {
                game.map = Array(19).fill(0).map(() => Array(19).fill(0));
                game.map[0][0] = 1;
                game.map[0][1] = 2;
                game.map[0][2] = 2;
                let taken = game.takeWest({x: 3, y: 0}, 2);
                expect(taken[0].x).to.equal(1);
                expect(taken[0].y).to.equal(0);
                expect(taken[1].x).to.equal(2);
                expect(taken[1].y).to.equal(0);
                expect(game.map[0][1]).to.equal(0);
                expect(game.map[0][2]).to.equal(0);
                done();
            });
        });
        describe('takeEast', function() {
            it('should take 2', function(done) {
                game.map = Array(19).fill(0).map(() => Array(19).fill(0));
                game.map[0][1] = 2;
                game.map[0][2] = 2;
                game.map[0][3] = 1;
                let taken = game.takeEast({x: 0, y: 0}, 2);
                expect(taken.length).to.equal(2);
                expect(taken[0].x).to.equal(2);
                expect(taken[0].y).to.equal(0);
                expect(taken[1].x).to.equal(1);
                expect(taken[1].y).to.equal(0);
                done();
            });
            it('should take the right stones', function(done) {
                game.map = Array(19).fill(0).map(() => Array(19).fill(0));
                game.map[0][1] = 2;
                game.map[0][2] = 2;
                game.map[0][3] = 1;
                let taken = game.takeEast({x: 0, y: 0}, 2);
                expect(taken[0].x).to.equal(2);
                expect(taken[0].y).to.equal(0);
                expect(taken[1].x).to.equal(1);
                expect(taken[1].y).to.equal(0);
                expect(game.map[0][1]).to.equal(0);
                expect(game.map[0][2]).to.equal(0);
                done();
            });
        });
        describe('takeNorthWest', function() {
            it('should take 2', function(done) {
                game.map = Array(19).fill(0).map(() => Array(19).fill(0));
                game.map[0][0] = 1;
                game.map[1][1] = 2;
                game.map[2][2] = 2;
                let taken = game.takeNorthWest({x: 3, y: 3}, 2);
                expect(taken.length).to.equal(2);
                expect(taken[0].x).to.equal(1);
                expect(taken[0].y).to.equal(1);
                expect(taken[1].x).to.equal(2);
                expect(taken[1].y).to.equal(2);
                done();
            });
            it('should take the right stones', function(done) {
                game.map = Array(19).fill(0).map(() => Array(19).fill(0));
                game.map[0][0] = 1;
                game.map[1][1] = 2;
                game.map[2][2] = 2;
                let taken = game.takeNorthWest({x: 3, y: 3}, 2);
                expect(taken[0].x).to.equal(1);
                expect(taken[0].y).to.equal(1);
                expect(taken[1].x).to.equal(2);
                expect(taken[1].y).to.equal(2);
                expect(game.map[1][1]).to.equal(0);
                expect(game.map[2][2]).to.equal(0);
                done();
            });
        });
        describe('takeNorthEast', function() {
            it('should take 2', function(done) {
                game.map = Array(19).fill(0).map(() => Array(19).fill(0));
                game.map[0][18] = 1;
                game.map[1][17] = 2;
                game.map[2][16] = 2;
                let taken = game.takeNorthEast({x: 15, y: 3}, 2);
                expect(taken.length).to.equal(2);
                expect(taken[0].x).to.equal(17);
                expect(taken[0].y).to.equal(1);
                expect(taken[1].x).to.equal(16);
                expect(taken[1].y).to.equal(2);
                done();
            });
            it('should take the right stones', function(done) {
                game.map = Array(19).fill(0).map(() => Array(19).fill(0));
                game.map[0][18] = 1;
                game.map[1][17] = 2;
                game.map[2][16] = 2;
                let taken = game.takeNorthEast({x: 15, y: 3}, 2);
                expect(taken[0].x).to.equal(17);
                expect(taken[0].y).to.equal(1);
                expect(taken[1].x).to.equal(16);
                expect(taken[1].y).to.equal(2);
                expect(game.map[1][17]).to.equal(0);
                expect(game.map[2][18]).to.equal(0);
                done();
            });
        });
        describe('takeSouthEast', function() {
            it('should take 2', function(done) {
                game.map = Array(19).fill(0).map(() => Array(19).fill(0));
                game.map[1][1] = 2;
                game.map[2][2] = 2;
                game.map[3][3] = 1;
                let taken = game.takeSouthEast({x: 0, y: 0}, 2);
                expect(taken.length).to.equal(2);
                expect(taken[0].x).to.equal(2);
                expect(taken[0].y).to.equal(2);
                expect(taken[1].x).to.equal(1);
                expect(taken[1].y).to.equal(1);
                done();
            });
            it('should take the right stones', function(done) {
                game.map = Array(19).fill(0).map(() => Array(19).fill(0));
                game.map[1][1] = 2;
                game.map[2][2] = 2;
                game.map[3][3] = 1;
                let taken = game.takeSouthEast({x: 0, y: 0}, 2);
                expect(taken[0].x).to.equal(2);
                expect(taken[0].y).to.equal(2);
                expect(taken[1].x).to.equal(1);
                expect(taken[1].y).to.equal(1);
                expect(game.map[1][1]).to.equal(0);
                expect(game.map[2][2]).to.equal(0);
                done();
            });
        });
        describe('takeSouthWest', function() {
            it('should take 2', function(done) {
                game.map = Array(19).fill(0).map(() => Array(19).fill(0));
                game.map[1][17] = 2;
                game.map[2][16] = 2;
                game.map[3][15] = 1;
                let taken = game.takeSouthWest({x: 18, y: 0}, 2);
                expect(taken.length).to.equal(2);
                expect(taken[0].x).to.equal(16);
                expect(taken[0].y).to.equal(2);
                expect(taken[1].x).to.equal(17);
                expect(taken[1].y).to.equal(1);
                done();
            });
            it('should take the right stones', function(done) {
                game.map = Array(19).fill(0).map(() => Array(19).fill(0));
                game.map[1][17] = 2;
                game.map[2][16] = 2;
                game.map[3][15] = 1;
                let taken = game.takeSouthWest({x: 18, y: 0}, 2);
                expect(taken[0].x).to.equal(16);
                expect(taken[0].y).to.equal(2);
                expect(taken[1].x).to.equal(17);
                expect(taken[1].y).to.equal(1);
                expect(game.map[1][17]).to.equal(0);
                expect(game.map[2][16]).to.equal(0);
                done();
            });
        });
        describe('checkTakeStone', function() {
           it('sould return 2 stones taken', function(done) {
               game.map = Array(19).fill(0).map(() => Array(19).fill(0));
               game.map[0][18] = 1;
               game.map[1][17] = 2;
               game.map[2][16] = 2;
               let taken = game.takeNorthEast({x: 15, y: 3}, 2);
               expect(taken.length).to.equal(2);
               done();
           });
            it('sould return 4 stones taken', function(done) {
                game.map = Array(19).fill(0).map(() => Array(19).fill(0));
                game.map[0][18] = 1;
                game.map[1][17] = 2;
                game.map[2][16] = 2;
                game.map[3][15] = 2;
                game.map[4][14] = 2;
                let taken = game.takeNorthEast({x: 13, y: 5}, 4);
                expect(taken.length).to.equal(4);
                done();
            });
            it('sould return 6 stones taken', function(done) {
                game.map = Array(19).fill(0).map(() => Array(19).fill(0));
                game.map[0][18] = 1;
                game.map[1][17] = 2;
                game.map[2][16] = 2;
                game.map[3][15] = 2;
                game.map[4][14] = 2;
                game.map[5][13] = 2;
                game.map[6][12] = 2;
                let taken = game.takeNorthEast({x: 11, y: 7}, 6);
                expect(taken.length).to.equal(6);
                done();
            });
        });
    });
});