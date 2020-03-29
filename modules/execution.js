var helpers = require('./helpers');
var util = require('./util');
var gamevars = require('./gamevars');

module.exports = {

    startGame: function(game)
    {
        // set round 1
        agame.round = 1;

        // start timer
	      this.activateTurnTimer(agame);
    },

    quitGame: function(game)
    {
        game.io.to(game.name).emit("control", {command: "endgame"} );

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

}