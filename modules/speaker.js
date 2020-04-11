module.exports = {

    sendInitialBoardState: function(game)
    {
        console.log('Sending board state');
        game.io.to(game.name).emit('initialBoardState', game.board);
    },

    sendBoardMove: function(socket, move)
    {
        socket.emit('move', move);
    },

    sendTouchGem: function(socket, coord)
    {
        socket.emit('touchgem', coord);
    },

    sendStopTouchGem: function(socket, coord)
    {
        socket.emit('stoptouchgem', coord);
    },

    sendAvailableMove: function(game, coord)
    {
        game.io.to(game.name).emit('availablemove', coord);
    }

}