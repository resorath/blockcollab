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
                board[i][j] = JSON.parse(JSON.stringify(gems[gemKeys[pick]]));
            }
        }

        game.board = board;
    },
    
    isNeighbour: function(coord1, coord2)
    {
        return ((coord1.x == coord2.x && Math.abs(coord1.y - coord2.y) == 1) || (coord1.y == coord2.y && Math.abs(coord1.x - coord2.x) == 1));
    },

    boardHasSequence: function(board)
    {
        console.log("checking sequence");
        console.log(board[0][0].name);
        for(var x=0; x < board.length; x++)
        {
            for(var y=0; y < board[x].length; y++)
            {
                // horizontal and vertical counting - starts at 1 to include self
                var hcount = 1;
                var vcount = 1;
                var self = board[x][y].name;

                // check horizontal left
                for(var i = (x - 1); i >= 0; i--)
                {
                    if(board[i][y].name == self)
                        hcount++;
                    else   
                        break;
                }

                // check horizontal right
                for(var i = (x + 1); i < board.length; i++)
                {
                    if(board[i][y].name == self)
                        hcount++;
                    else   
                        break;
                }

                // check vertical up
                for(var i = (y - 1); i >= 0; i--)
                {
                    if(board[x][i].name == self)
                        vcount++;
                    else   
                        break;
                }

                // check horizontal right
                for(var i = (y + 1); i < board[x].length; i++)
                {
                    if(board[x][i].name == self)
                        vcount++;
                    else   
                        break;
                }


                if(hcount >= 3 || vcount >=3)
                {
                    board[x][y].insequence = true;
                    //console.log("detected colour: " + self + " x: " + x + " y: " + y);
                }


            }
        }

    }

    
};