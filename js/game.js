var globals = {
    width: 1024,
    height: 1024
}

var config = {
    type: Phaser.AUTO,
    debug: true,
    scale: {
        mode: Phaser.Scale.FIT,
        width: globals.width,
        height: globals.height
    },
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0},
            debug: false,
        }
    },
    scene: [battle]
};

var rng = new Phaser.Math.RandomDataGenerator();
var player = 0;

var game = new Phaser.Game(config);


function randInRange(f, c)
{
    return rng.frac() * (c - f + 1) + f;
}

var host = "http://localhost:8000"
//var host = "https://blockcollab.azurewebsites.net:443/"

var socket = io(host);

socket.io.on('connect_error', function(err) {
    // handle server error here
    console.log('Error connecting to server');
  });

socket.on('connect', function() {
    console.log(socket.connected);
    socket.emit('control', 'ready');
    // Use matchmaking for now
    socket.emit('join', '');

});

socket.on('terminal', function(message) {
    console.log(message)
})

socket.on('control', function(msg) {

    if(msg.command == "assignplayer")
    {
        console.log("Assigned player " + msg.player);
        player = msg.player;
    }

    if(msg.command == "startgame")
    {
        console.log("Starting game...");
        
    }

    if(msg.command == "roomfull")
    {
    }

    if(msg.command == "opponentleft")
    {
    }

    if(msg.command == "resumegame")
    {
    }

    if(msg.command == "suspend")
    {
    }

    if(msg.command == "resume")
    {
    }

    if(msg.command == "prompt")
    {
    }

    if(msg.command == "endgame")
    {
    }

    if(msg.command == "serverrestart")
    {
    }

})

socket.on('initialBoardState', function(message) {
    
    console.log("Receiving boardstate")
    battle.board = message;
    battle.boardState.ready = true;

});

socket.on('move', function(swap) {
    console.log("Receive move " + JSON.stringify(swap));
    battle.remoteSwap(swap);
});

socket.on('destroygem', function(coords) {
    console.log("Receive destroy " + JSON.stringify(coords))
    battle.remoteDestroy(coords);
});

socket.on('drop', function(coords) {
    console.log("Receive drop" + JSON.stringify(coords));
    battle.remoteDrop(coords);
});

socket.on('newgem', function(gemdata) {
    console.log("Receive gem " + JSON.stringify(gemdata));
    battle.addGem(gemdata);
})

