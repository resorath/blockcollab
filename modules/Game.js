// Game instance
module.exports = {

    Game: function(name) {
  
      // name of the game and room
      this.name = name;
  
      // whos turn it is
      this.playerTurn = 0;
  
      // and whos its not...
      this.playerTurnOpposite = function() { return (this.playerTurn == 1 ? 2 : 1); };
  
      // the IO object attached to this game
      this.io = null;
  
      // what round it is
      this.round = 0;

      // the board
      this.board = {};

      // the gems
      this.gems = null;
  
      // each player's hand
      this.spells = {
        p1: [],
        p2: []
      };
  
      // the player's actual characters
      this.player = {
        p1: {
          number: 1,
          character: null,
          health: 30,
          maxhealth: 30,
          mana: 0,
          maxmana: 0,
          armor: 0,
          fatigue: 0,
          spellpower: 0,
          overload: 0,
          status: [],
          secrets: [],
          weapon: null,
          canattack: true,
          heropower: null,
          emotes: null,
          lastemote: 0,
        },
        p2: {
          number: 2,
          character: null,
          health: 30,
          maxhealth: 30,
          attack: 0,
          mana: 0,
          maxmana: 0,
          armor: 0,
          fatigue: 0,
          spellpower: 0,
          overload: 0,
          status: [],
          secrets: [],
          weapon: null,
          canattack: true,
          heropower: null,
          emotes: null,
          lastemote: 0,
        }
      };
  
      // an array of card callbacks to be run when a card is played, attacks, or dies
      // header: callbackfunction(socket, card, action)
      // action is PLAY, DIES, ATTACKS
      this.cardcallbacks = [];
  
      // bind the sockets used for each player
      this.p1socket = null;
      this.p2socket = null;
  
      // mulligan storage
      this.mulligan = {
        p1: [],
        p2: []
      };
  
  
      // turn timer
      // 75 second turn, rope at 20 seconds
      this.turntimer = 55; 
      this.turntimerrope = 20;
  
      // timeout function holder
      this.turntimercallback = null;
  
      this.getHand = function (socket, getOppositeHand)
      {
        if( (socket.id == this.p1socket.id && !getOppositeHand) || (socket.id == this.p2socket.id && getOppositeHand) )
          return this.hand.p1;
        else
          return this.hand.p2;
      };
  
      this.getBoard = function (socket, getOppositeBoard)
      {
        if( (socket.id == this.p1socket.id && !getOppositeBoard) || (socket.id == this.p2socket.id && getOppositeBoard) )
          return this.board.p1;
        else
          return this.board.p2;
      };
  
      this.getDeck = function (socket, getOppositeDeck)
      {
        if( (socket.id == this.p1socket.id && !getOppositeDeck) || (socket.id == this.p2socket.id && getOppositeDeck) )
          return this.deck.p1;
        else
          return this.deck.p2;
      };
  
      this.getPlayer = function (socket, getOppositePlayer)
      {
        if( (socket.id == this.p1socket.id && !getOppositePlayer) || (socket.id == this.p2socket.id && getOppositePlayer) )
          return this.player.p1;
        else
          return this.player.p2;
      };
  
      this.getSocketByPlayerNumber = function (num)
      {
        if(num == 1)
          return this.p1socket;
        if(num == 2)
          return this.p2socket;
  
        return null;
      };
  
      this.everyoneConnected = function()
      {
        return (this.p1socket != null && this.p2socket != null);
      };
  
     
  
      this.isPlayerTurn = function (socket)
      {
        return (socket.player == this.playerTurn);
      };
  
      this.currentPlayer = function()
      {
        if(this.playerTurn == 1)
          return this.player.p1;
        else
          return this.player.p2;
      };
  
      this.oppositePlayer = function()
      {
        if(this.playerTurn == 1)
          return this.player.p2;
        else
          return this.player.p1;
      };
  
  
    }
  };