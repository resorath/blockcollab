module.exports = {

    createBoard: function(rows, cols, gems, game)
    {
        var board = new Array(rows);

        for(var i = 0; i < rows; i++)
        {
            board[i] = new Array(cols);
            for(var j = 0; j < cols; j++)
            {
                board[i][j] = 0;
            }
        }

        game.board = board;
    }

    
};