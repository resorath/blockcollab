var util = require('./util');

module.exports = {

    createBoard: function(rows, cols, gems, game)
    {
        var board = new Array(rows);
        var gemKeys = Object.keys(gems);

        for(var i = 0; i < rows; i++)
        {
            board[i] = new Array(cols);
            for(var j = 0; j < cols; j++)
            {
                var pick = util.RandomInt(0, gemKeys.length - 1);
                board[i][j] = gems[gemKeys[pick]];
            }
        }

        game.board = board;
    }

    
};