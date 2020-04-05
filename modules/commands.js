var helpers = require('./helpers');
var speaker = require('./speaker');
var gameboard = require('./gameboard');

module.exports = {

    swap: function(socket, command)
    {
        var game = helpers.getGameBySocket(socket);
        console.log(JSON.stringify(command))
        
        var r_active = command.activeCoord;
        var r_neighbour = command.neighbourCoord;
        var swap = {
            'activeCoord': r_active,
            'neighbourCoord': r_neighbour
        }

        // verify neighbours
        if(gameboard.isNeighbour(r_active, r_neighbour))
        {
            console.log("valid swap");

            var s_active = game.board[r_active.x][r_active.y]
            var s_neighbour = game.board[r_neighbour.x][r_neighbour.y]

            game.board[r_neighbour.x][r_neighbour.y] = s_active;
            game.board[r_active.x][r_active.y] = s_neighbour;

            // broadcast changes
            var opposite = helpers.getOppositePlayerSocket(socket);
            speaker.sendBoardMove(opposite, swap);

            gameboard.boardFlagSequence(game.board);

            gameboard.boardCleanupAndNotify(game);

            gameboard.boardDropGemsAndBackfillAndNotify(game);

        }
        else
        {
            console.log('invalid swap');
            // reject change

        }
        
    }

}