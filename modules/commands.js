var helpers = require('./helpers');
var speaker = require('./speaker')

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
        if((r_active.x == r_neighbour.x && Math.abs(r_active.y - r_neighbour.y) == 1)
        || (r_active.y == r_neighbour.y && Math.abs(r_active.x - r_neighbour.x) == 1))
        {
            console.log("valid swap");

            var s_active = game.board[r_active.x][r_active.y]
            var s_neighbour = game.board[r_neighbour.x][r_neighbour.y]

            game.board[r_neighbour.x][r_neighbour.y] = s_active;
            game.board[r_neighbour.x][r_neighbour.y] = s_neighbour;

            // broadcast changes
            var opposite = helpers.getOppositePlayerSocket(socket);
            speaker.sendBoardMove(opposite, swap)

        }
        else
        {
            console.log('invalid swap');
            // reject change

        }
        
    }

}