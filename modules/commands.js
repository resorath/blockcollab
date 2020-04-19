var helpers = require('./helpers');
var speaker = require('./speaker');
var gameboard = require('./gameboard');
var execution = require('./execution');

module.exports = {

    swap: function(socket, command)
    {
        
        console.log(JSON.stringify(command))
        
        var r_active = command.activeCoord;
        var r_neighbour = command.neighbourCoord;

        execution.swap(socket, r_active, r_neighbour);
    },

    touchgem(socket, command)
    {
        var game = helpers.getGameBySocket(socket);

        var coord = command.activeCoord;

        var opposite = helpers.getOppositePlayerSocket(socket);

        speaker.sendTouchGem(opposite, coord);
    },

    stoptouchgem(socket, command)
    {
        var game = helpers.getGameBySocket(socket);

        var coord = command.activeCoord;

        var opposite = helpers.getOppositePlayerSocket(socket);

        speaker.sendStopTouchGem(opposite, coord);
    }

}