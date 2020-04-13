'use strict';

var fs = require('fs');
var express = require('express');
var app = express();
var https = require('https');

var privateKey = null;
var certificate =  null
var ca = null;

try
{
  privateKey = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem', 'utf8');
  certificate = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/cert.pem', 'utf8');
  ca = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/chain.pem', 'utf8');
}
catch(e)
{
  privateKey = fs.readFileSync('./key.key');
  certificate = fs.readFileSync('./cert.crt');
}

var server = https.createServer({
  key: privateKey,
  cert: certificate,
  ca: ca,
  requestCert: false,
  rejectUnauthorized: false
},app);
const io = require('socket.io')(server);

var components = require('./modules/Game');
var gamevars = require('./modules/gamevars');
var helpers = require('./modules/helpers');
var gems = require('./modules/gems');
var gameboard = require('./modules/gameboard');
var util = require('./modules/util');
var execution = require('./modules/execution');
var cfunc = require('./modules/commands');
var EventEmitter = require('events');

gamevars.games = [];

// matchmaking sockets
var matchmakingqueue = [];

// setup triggers class
class Trigger extends EventEmitter {}

gamevars.triggers = new Trigger();

var serverVersion = '0.0.1';

/*app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});*/

app.use(express.static(__dirname + '/'));

var port = process.env.PORT || 443;
server.listen(port, function(){
  console.log('listening on *:' + port);
});

io.on('connection', function(socket){

    console.log('a user connected ' + socket.id);
  
    // Disconnected user, remove them from the game
    socket.on('disconnect', function(){
      console.log('a user disconnected ' + socket.id);
  
      var playernum = helpers.getPlayerNumberBySocket(socket);
  
      if(playernum != null)
      {
        var agame = helpers.getGameBySocket(socket);
  
        if(agame != null)
        {
  
          if(playernum == 1)
          {
            console.log('Removing player 1 from ' + agame.name + ' due to disconnect');
            agame.p1socket = null;
          }
          else if(playernum == 2)
          {
            console.log('Removing player 2 from ' + agame.name + ' due to disconnect');
            agame.p2socket = null;
          }
  
          io.to(agame.name).emit('control', { command: 'opponentleft' });
  
          if(agame.p1socket == null && agame.p2socket == null)
          {
            console.log('Removing game ' + agame.name + ' because it is out of players');
            execution.quitGame(agame);
          }
  
          // can't resume a game if it hasn't started, so kill the game.
          if(agame.round == 0)
          {
            console.log('Removing game ' + agame.name + ' because a player left before it started');
            io.to(agame.name).emit('terminal', 'The game cannot continue because your opponent left before the game started! Retry making the game...\n');
  
            execution.quitGame(agame);
  
          }
        }
  
      };
  
  
    });
  
    socket.on('command', function(msg){
  
      var agame = helpers.getGameBySocket(socket);
      if(agame == null)
        return;
  
      if(!agame.everyoneConnected())
        return;
  
      console.log(agame.name + '-' + socket.player + ': ' + JSON.stringify(msg));
      
      parseCommand(msg, socket);
  
    });
  
    // join a room
    socket.on('join', function(roomname) {
      joinRoom(socket, roomname, false);
    });
  
    socket.on('control', function(msg) {
  
      if(msg == 'ready')
      {
        socket.emit('terminal', 'Server version ' + serverVersion + '\n');
  
    }
  
  
    });
  
  
  });
  
  function joinRoom(socket, roomname, ismatchmaking)
  {
        // check if room already exists:
    var found = false;
    var existinggame = null;
    var matchmakinggame = false;
  
    // check if the game name is empty, indicating matchmaking
    if(roomname == '')
    {
      // tell the user matchmaking is starting
      socket.emit('terminal', 'Joined matchmaking queue... waiting for an opponent...');
  
      // send the socket to the matchmaking queue and wait ...
      gamevars.triggers.emit('matchmaking', socket);
      
      return;
      
    }
  
    for(var game in gamevars.games)
    {
      var agame = gamevars.games[game];
      if(agame.name == roomname)
      {
        if(agame.p1socket == null)
        {
          agame.p1socket = socket;
          socket.player = 1;
          socket.game = agame.name;
          socket.join(roomname);
  
          if(ismatchmaking)
          {
            socket.emit('terminal', 'Opponent found! Joining game');
            socket.emit('terminal', 'You can resume your game by using game name: ' + roomname);
          }
          else
            socket.emit('terminal', 'Game joined! Your opponent is already here...');
  
          socket.emit('control', { command: 'assignplayer', player: 1 });
  
          console.log('Joining ' + socket.id + ' to existing game (' + roomname + ') as player 1');
  
          found = true;
          existinggame = agame;
  
          break;
        }
        else if(agame.p2socket == null)
        {
          agame.p2socket = socket;
          socket.player = 2;
          socket.game = agame.name;
          socket.join(roomname);
  
          if(ismatchmaking)
          {
            socket.emit('terminal', 'Opponent found! Joining game');
            socket.emit('terminal', 'You can resume your game by using game name: ' + roomname);
          }
          else
            socket.emit('terminal', 'Game joined! Your opponent is already here...');
  
          socket.emit('control', { command: 'assignplayer', player: 2 });
  
          console.log('Joining ' + socket.id + ' to existing game (' + roomname + ') as player 2');
  
          found = true;
          existinggame = agame;
  
          break;
        }
        else
        {
          console.log('Game ' + roomname + ' join failed, is full from ' + socket.id);
          socket.emit('control', { command: 'roomfull' });
          return;
        }
      }
  
    }
  
    // no existing room
    if(!found)
    {
      console.log('Joining ' + socket.id + ' to new game (' + roomname + ') as player 1');
      socket.join(roomname);
  
      var newgame = new components.Game(roomname);
      newgame.io = io;
      newgame.p1socket = socket;
      newgame.isNewGame = true;
      newgame.name = roomname;
      newgame.gems = gems.gems;
  
      socket.player = 1;
      socket.game = newgame.name;
  
      gamevars.games.push(newgame);
  
      if(ismatchmaking)
      {
        socket.emit('terminal', 'Opponent found! Joining game');
        socket.emit('terminal', 'You can resume your game by using game name: ' + roomname);
      }
      else
        socket.emit('terminal', 'Game joined! Waiting for an opponent...\nHint: Tell a friend to join the game using the same game name (' +  roomname + ')!');
      
      socket.emit('control', { command: 'assignplayer', player: 1 });
    }
    else
    {
      // a game is already in progress, rejoin
      if(existinggame.round > 0)
      {
        console.log('Resuming existing game ' + existinggame.round);
        existinggame.defaultPrompt(socket);
        io.to(roomname).emit('control', { command: 'resumegame' });
  
      }
    }
  
    var agame = helpers.getGameBySocket(socket);
    if(agame != null && agame.everyoneConnected())
    {
  
      if(agame.isNewGame)
      {
  
        // random first player
        agame.playerTurn = (util.Random(2) + 1);
        console.log(agame.name + ' player ' + agame.playerTurn + ' goes first!');
  
        // signal start.
        console.log('Game ' + roomname + ' ready to start');
        io.to(agame.name).emit('control', { command: 'startgame' });
  
        // both players pick deck
        //display.printAvailableDecks(agame.p1socket, gamevars.decks);
        //display.printAvailableDecks(agame.p2socket, gamevars.decks);
  
        //io.to(agame.name).emit('control', { command: 'prompt', prompt: 'Pick a deck> ' });
  
        //agame.p1socket.promptCallback = execution.pickDecks;
        //agame.p2socket.promptCallback = execution.pickDecks;
  
        agame.isNewGame = false;

        execution.startGame(agame);
  
      
      }
      else if(agame != null && !agame.everyoneConnected())
      {
        console.log('Game ' + roomname + ' resumed due to reconnect');
        io.to(agame.name).emit('control', { command: 'resumegame' });
      }
  
  
    }
  }

function parseCommand(command, socket)
{
  // check if the prompt callback override is set, and execute that instead
  // the callback function must accept the entire command
  if(socket.promptCallback != null)
  {
    console.log("prompt callback set for " + socket.id + " to " + socket.promptCallback.name);
    socket.promptCallback(command, socket);
    return;
  }

  var action = command.action;

  if(action == null)
  {
    console.log("Bad message");
    return;
  }

  if(typeof cfunc[action] === 'function')
    cfunc[action](socket, command)
  else
  {
    socket.emit('terminal', 'unknown command: \'' + JSON.stringify(action) + '\' try \'help\'\n');
    console.log("Command " + JSON.stringify(command) + " not recognized by " + socket.game + ":" + socket.player);
  }
}


gamevars.triggers.on('matchmaking', function(socket) {

    if(matchmakingqueue.length <= 0)
    {
        matchmakingqueue.push(socket);

        console.log('Joining socket ' + socket.id + ' to matchmaking queue because it is empty');

        return;
    }
    else
    {
        // pop the first in queue and join them together ('matchmaking')
        var p1 = matchmakingqueue.pop();

        var p2 = socket;

        // invent a game name
        var gamename = 'mm-' + guid();

        console.log('Matchmaking is putting ' + p1.id + ' and ' + socket.id + ' into game ' + gamename);

        // join both sockets to game
        joinRoom(p1, gamename, true);
        joinRoom(p2, gamename, true);

    }
});

  

// do things every 2 seconds
setInterval(function() {

    for(var i=0; i<gamevars.games.length; i++)
    {
        var game = gamevars.games[i];

        if(game.started)
        {

        }
    }


}, 2000);

function rand(low, high) {
    var r = (Math.random() * (high - low + 1)) + low;
    return r;
  }

  
function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }