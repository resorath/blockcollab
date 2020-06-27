var helpers = require('./helpers');
var util = require('./util');
var gamevars = require('./gamevars');
var gameboard = require('./gameboard');
var gems = require ('./gems');
var speaker = require('./speaker');

module.exports = {

    startGame: function(game)
    {
        // set round 1
        game.round = 1;

        // start timer
        this.activateTurnTimer(game);
        
        console.log('Starting game');

        gameboard.createBoard(12, 12, gems.gems, game);

        speaker.sendInitialBoardState(game);

        game.started = true;
    },

    swap: function(socket, activeCoord, neighbourCoord)
    {
      var game = helpers.getGameBySocket(socket);
      var swap = {
        'activeCoord': activeCoord,
        'neighbourCoord': neighbourCoord
      };

      // verify neighbours
      if(gameboard.isNeighbour(activeCoord, neighbourCoord) && gameboard.isLegalMove(game.board, activeCoord, neighbourCoord))
      {
          //console.log("valid swap");

          var s_active = game.board[activeCoord.x][activeCoord.y];
          var s_neighbour = game.board[neighbourCoord.x][neighbourCoord.y];
 
          game.board[neighbourCoord.x][neighbourCoord.y] = s_active;
          game.board[activeCoord.x][activeCoord.y] = s_neighbour;

          // broadcast changes
          var opposite = helpers.getOppositePlayerSocket(socket);
          speaker.sendBoardMove(opposite, swap);

          var sequencesRemain = false;
          do
          {
              sequencesRemain = gameboard.checkBoardSequence(game.board, true);

              gameboard.boardCleanupAndNotify(game);

              gameboard.boardDropGemsAndBackfillAndNotify(game);


          }
          while(sequencesRemain);

          var position = gameboard.checkAnyValidMovesRemain(game.board);
          if(position == null)
          {
              console.log('WARN: Stalemate');
          }
          else
          {
              speaker.sendAvailableMove(game, position[0]);
          }

      }
      else
      {
          console.log('invalid swap');
          // reject change
          var oppositeswap = {
              'activeCoord': neighbourCoord,
              'neighbourCoord': activeCoord
          };

          speaker.sendBoardMove(socket, oppositeswap);

      }
    },

    quitGame: function(game)
    {
        game.io.to(game.name).emit('control', {command: 'endgame'} );

        util.filterInPlace(gamevars.games, function (el) {
          return el.name != game.name;
        });
    },

    endTurn: function(socket)
    {

    },

    activateTurnTimer: function(agame)
	{
	  var that = this;

	  // start turn timer
	  agame.turntimercallback = setTimeout(function() {

	    // do rope stuff
	    // trigger character rope speech TBD

	    //agame.io.to(agame.name).emit('terminal', '\n[[b;orange;]There is only ' + agame.turntimerrope + ' seconds left in the turn!\n]');

	    agame.turntimercallback = setTimeout(function() {

	      //agame.io.to(agame.name).emit('terminal', 'End of turn by timeout');

	      var currentplayersocket = agame.getSocketByPlayerNumber(agame.playerTurn);

	      //currentplayersocket.emit('terminal', '\n[[b;red;]You ran out of time on your turn!]\n');
	      
	      that.endTurn(currentplayersocket);

	    }, agame.turntimerrope * 1000);

	  }, agame.turntimer * 1000);
	},

};