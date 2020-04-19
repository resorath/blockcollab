var util = require('./util');

module.exports = {

    createBoard: function(rows, cols, gems, game)
    {
        var board = new Array(rows);

        for(var i = 0; i < rows; i++)
        {
            board[i] = new Array(cols);
            for(var j = 0; j < cols; j++)
            {
                board[i][j] = this.getRandomGem(gems);
            }
        }

        // iterate through board and regenerate flagged gems
        // Continue until no more gems are flagged
        var nosequence = true;
        do
        {
            nosequence = true;   
            this.checkBoardSequence(board, true);
            
            for(var i = 0; i < rows; i++)
            {
                for(var j = 0; j < cols; j++)
                {
                    if(board[i][j].insequence)
                    {
                        nosequence = false;
                        board[i][j] = this.getRandomGem(gems);
                    }
                }
            }
        } while(!nosequence);


        game.board = board;
    },

    getRandomGem: function(gems)
    {
        
        var gemKeys = Object.keys(gems);
        var pick = util.RandomInt(0, gemKeys.length - 1);
        return JSON.parse(JSON.stringify(gems[gemKeys[pick]]));
    },
    
    // determine if two coordinates are neighbours
    isNeighbour: function(coord1, coord2)
    {
        return ((coord1.x == coord2.x && Math.abs(coord1.y - coord2.y) == 1) || (coord1.y == coord2.y && Math.abs(coord1.x - coord2.x) == 1));
    },

    // determine if a move will result in gems being matched
    isLegalMove: function(board, origin, neighbour)
    {
        // clone the board
        var simulationboard = util.clone(board);

        // do the swap
        origin_g = simulationboard[origin.x][origin.y]
        neighbour_g =  simulationboard[neighbour.x][neighbour.y];

        simulationboard[origin.x][origin.y] = neighbour_g;
        simulationboard[neighbour.x][neighbour.y] = origin_g;

        // test
        return this.checkBoardSequence(simulationboard, false);
    },

    // delete gems that are flagged as sequenced
    boardCleanupAndNotify: function(game)
    {
        // identify destroyed gems and notify
        for(var i = 0; i < game.board.length; i++)
        {
            for(var j = 0; j < game.board[i].length; j++)
            {
                if(game.board[i][j].insequence)
                {
                    game.board[i][j] = null;
                    game.io.to(game.name).emit('destroygem', {x: i, y: j});
                }
            }
        }
    },

    // moves gems down and generates new ones to take the place
    boardDropGemsAndBackfillAndNotify(game, gems)
    {
        var nullfound = false;
        do
        {
            nullfound = false;

            for(var x = 0; x < game.board.length && !nullfound; x++)
            {
                // don't need to check bottom row, will never be null below it
                for(var y = 0; y < game.board[x].length - 1 && !nullfound; y++)
                {
                    // check if neighbour below is null
                    if(game.board[x][y+1] == null)
                    {
                        nullfound = true;
                        game.board[x][y+1] = game.board[x][y];
                        game.board[x][y] = null;
                        game.io.to(game.name).emit('drop', {x, y});

                    }

                    if(game.board[x][y] == null && y == 0)
                    {
                        game.board[x][y] = this.getRandomGem(game.gems)
                        game.io.to(game.name).emit('newgem', {x, y, gem: game.board[x][y]});
                    }
                }
            }

            
        }while(nullfound);

    },

    // flags sequenced gems
    checkBoardSequence: function(board, flagSequence)
    {
        //console.log("checking sequence");
        //console.log(board[0][0].name);
        var foundAtLeastOneSequence = false;
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

                // check vertical down
                for(var i = (y + 1); i < board[x].length; i++)
                {
                    if(board[x][i].name == self)
                        vcount++;
                    else   
                        break;
                }


                if(hcount >= 3 || vcount >=3)
                {
                    if(flagSequence)
                        board[x][y].insequence = true;
                    foundAtLeastOneSequence = true;
                    //console.log("detected colour: " + self + " x: " + x + " y: " + y);
                }


            }
        }

        return foundAtLeastOneSequence;

    },

    checkAnyValidMovesRemain: function(board) {
        // skip over edges, there will always be a neighbour in all directions
        for(var x=1; x < board.length - 1; x++)
        {
            for(var y=1; y < board[x].length - 1; y++)
            {
                // check if left and right neighbours are same, with top or bottom colour available
                if(board[x-1][y].name == board[x+1][y].name &&
                    (board[x][y+1].name == board[x-1][y].name))
                        return [{x,y}, {x, y: y+1}];

                if(board[x-1][y].name == board[x+1][y].name &&
                    (board[x][y-1].name == board[x-1][y].name))
                        return [{x,y}, {x, y: y-1}];
    
                // check if top and bottom neighbours are the same, with left or right colour available
                if(board[x][y-1].name == board[x][y+1].name &&
                    (board[x-1][y].name == board[x][y-1].name))
                        return [{x,y}, {x: x-1, y}];

                if(board[x][y-1].name == board[x][y+1].name &&
                    (board[x+1][y].name == board[x][y-1].name))
                        return [{x,y}, {x: x+1, y}];

                // check if im the same as left, with top right, bottom right, or far right colour available
                if(board[x][y].name == board[x-1][y].name &&
                    (board[x+1][y-1].name == board[x][y].name))
                    return [{x:x+1,y}, {x: x+1, y: y-1}];

                if(board[x][y].name == board[x-1][y].name &&
                    (board[x+1][y+1].name == board[x][y].name))
                    return [{x:x+1,y}, {x: x+1, y: y+1}];

                if(x <= board.length - 2 && board[x+2][y] != null) 
                {
                    if(board[x][y].name == board[x-1][y].name &&
                        (board[x+2][y].name == board[x][y].name))
                        return [{x: x+1,y}, {x: x+2, y}];
                }

                // check if im the same as right, with top left, bottom left, or far left colour available
                if(board[x][y].name == board[x+1][y].name &&
                    (board[x-1][y+1].name == board[x][y].name))
                    return [{x:x-1,y}, {x: x-1, y: y+1}];    

                if(board[x][y].name == board[x+1][y].name &&
                    (board[x-1][y-1].name == board[x][y].name))
                    return [{x:x-1,y}, {x: x-1, y: y-1}];    

                if(x >= 2 && board[x-2][y] != null) 
                {
                    if(board[x][y].name == board[x+1][y].name &&
                        (board[x-2][y].name == board[x][y].name))
                        return [{x: x-1,y}, {x: x-2, y}];
                }

                // check if I'm the same as the bottom, with far top available
                if(y <= board[x].length -2 && board[x][y+2] != null)
                {
                    if(board[x][y].name == board[x][y-1].name &&
                        (board[x][y].name == board[x][y+2].name))
                        return [{x, y:y+1}, {x, y: y+2}];
                }

                 // check if I'm the same as the top, with far bottom available
                 if(y >= 2 && board[x][y-2] != null)
                 {
                     if(board[x][y].name == board[x][y+1].name &&
                         (board[x][y].name == board[x][y-2].name))
                         return [{x, y:y-1}, {x, y: y-2}];
                 }

                /*
                // check if left and right neighbours are same, with top or bottom colour available
                if(board[x-1][y].name == board[x+1][y].name &&
                   (board[x][y+1].name == board[x-1][y].name || board[x][y-1].name == board[x-1][y].name))
                    return {x,y};

                // check if top and bottom neighbours are the same, with left or right colour available
                if(board[x][y-1].name == board[x][y+1].name &&
                    (board[x-1][y].name == board[x][y-1].name || board[x+1][y].name == board[x][y-1].name))
                    return {x,y};

                // check if im the same as left, with top right or bottom right colour available
                if(board[x][y].name == board[x-1][y].name &&
                    (board[x+1][y+1].name == board[x][y].name || board[x+1][y-1].name == board[x][y].name))
                    return {x:x+1,y};

                // check if im the same as right, with top left or bottom left colour available
                if(board[x][y].name == board[x+1][y].name &&
                    (board[x-1][y+1].name == board[x][y].name || board[x-1][y-1].name == board[x][y].name))
                    return {x:x-1,y};         
                */
            }
        }

        return null;
    }

    
};