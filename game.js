'use strict';

const Hoek = require('hoek');

const internals = {};

exports.Player = module.exports.Player = internals.Player = function (id) {

    Hoek.assert(this instanceof internals.Player, 'Player must be instantiated using new');
    this.id = id;
};

exports.Team = module.exports.Team = internals.Team = function (id) {

    Hoek.assert(this instanceof internals.Team, 'Team must be instantiated using new');
    this.id = id;
    this.players = [];
    this.spyMaster = null;
};

exports.BoardElement = module.exports.BoardElement = internals.BoardElement = function (value, type) {

    Hoek.assert(this instanceof internals.BoardElement, 'BoardElement must be instantiated using new');
    this.value = value;
    this.type = type;
};

//--    Game
exports.Game = module.exports.Game = internals.Game = function (id, creator) {

    Hoek.assert(this instanceof internals.Game, 'Game must be instantiated using new');
    this.id = id;
    this.players = new Map();
    this.players.set(creator.id, creator);
    this.teams = [new internals.Team(0), new internals.Team(1)];  //note hardcoded to 2 teams
    this.unteamedPlayerCount = 1;
    //count down to 0 when all conditions to start game is meet
    //1 count for spymasters chosen, which requires players to have teamed up already
    const READY_TO_START_CONDITION_MAX = 1;
    this.readyToStart = READY_TO_START_CONDITION_MAX;
    this.gameStarted = false;

    this.BOARD_SIZE = 25;
};

//--    Game setup
internals.Game.prototype.AddPlayer = function (player) {

    this.players.set(player.id, player);
    ++(this.unteamedPlayerCount);
};

internals.Game.prototype.AssignPlayerToTeam = function (playerId, teamId) {

    const otherTeamId = (teamId === 0) ? 1 : 0;    //note: hardcoded to 2 teams
    if (this.teams[otherTeamId].players.indexOf(playerId) !== -1) {
        this.teams[otherTeamId].players.delete(playerId);
    }

    if (this.teams[teamId].players.indexOf(playerId) === -1) {
        this.teams[teamId].players.push(playerId);
        --(this.unteamedPlayerCount);
    }
};

internals.Game.prototype.ChooseSpyMasters = function () {

    if (this.unteamedPlayerCount !== 0) {
        let verb = 'are';
        if (this.unteamedPlayerCount === 1) {
            verb = 'is';
        }
        throw 'Players need to team up first. There ' + verb + 'players unteamed.';
    }

    let randomIndex = Math.floor(Math.random() * this.teams[0].size);
    this.teams[0].spyMaster = this.players[randomIndex];

    randomIndex = Math.floor(Math.random() * this.teams[1].size);
    this.teams[1].spyMaster = this.players[randomIndex];

    this._CreditReadyToStartCondition();
};

internals.Game.prototype.Start = function (board) {

    if (this.IsReadyToStart() === false) {
        throw 'Start game requirements has not been met.';
    }

    this.board = board;

    this.activeTeam = 0;    //team to start first

    this.gameStarted = true;
};

internals.Game.prototype.IsReadyToStart = function () {

    return (this.readyToStart === 0);
};

internals.Game.prototype.SubmitChoice = function (elementValue) {

    const index = this.board.indexOf(elementValue);
    if (index === -1) {
        Hoek.assert(0, 'Value submitted does not exist.');
    }

    const otherTeamId = (teamId === 0) ? 1 : 0;    //note: hardcoded to 2 teams
    this.activeTeam = otherTeamId;

    return (this.board[index]);
};

internals.Game.prototype._CreditReadyToStartCondition = function () {

    Hoek.assert(this.IsReadyToStart() === false, 'Ready to start condition out of sync');
    --this.readyToStart;
};

internals.Game.prototype._DebitReadyToStartCondition = function () {

    Hoek.assert(this.readyToStart !== READY_TO_START_CONDITION_MAX, 'Ready to start condition out of sync');
    ++this.readyToStart;
};
