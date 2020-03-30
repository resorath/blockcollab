module.exports = {

    sendInitialBoardState: function(game)
    {
        console.log("Sending board state");
        game.io.to(game.name).emit('initialBoardState', game.board);
    }

}