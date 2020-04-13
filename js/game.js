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
    dom: {
        createContainer: true
    },
    scene: [battle]
};

var rng = new Phaser.Math.RandomDataGenerator();
var player = 0;
var readystate = { game: false, socket: false }

console.log("%c  %c  %c  %c  %c  %c  %c  BlockCollab ",
    "background-color: yellow;",
    "background-color: red;",
    "background-color: teal;",
    "background-color: purple;",
    "background-color: limegreen;",
    "background-color: skyblue;",
    "background-color: black; color: white;")

var game = new Phaser.Game(config);


game.events.on('ready', function(){
    battle.waitText(true, 'Waiting on Socket...');
    readystate.game = true;
    checkReadyState();
})

function randInRange(f, c)
{
    return rng.frac() * (c - f + 1) + f;
}

var socket = null

if(window.location.href.indexOf("blockcollab.tophatandmonocle.com") > -1)
    socket = io('https://52.233.21.90/', { transports: ['websocket'], rejectUnauthorized: false });
else
    socket = io(); 


function checkReadyState()
{
    console.log(readystate)
    if(readystate.game && readystate.socket)
    {
        gameReadyContinue();
    }
}

function gameReadyContinue()
{
    socket.emit('control', 'ready');
    // Use matchmaking for now
    socket.emit('join', '');

    battle.waitText(true, 'Waiting on Matchmaking...');
}

socket.io.on('connect_error', function(err) {
    // handle server error here
    console.log('Error connecting to server');
    console.log(err);
});

socket.on('connect', function() {
    readystate.socket = true;
    checkReadyState();
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
        battle.hideGems();
        battle.waitText(true, 'Waiting on Opponent...');
    }

    if(msg.command == "resumegame")
    {
        battle.showGems();
        battle.waitText(false, null);
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
    battle.waitText(false, null);
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
});

socket.on('touchgem', function(coords) {
    console.log("Receive touch gem " + JSON.stringify(coords));
    battle.remoteTouchGem(coords);
});

socket.on('stoptouchgem', function(coords) {
    console.log("Receive stop touch gem " + JSON.stringify(coords));
    battle.remoteStopTouchGem(coords);
})

socket.on('availablemove', function(coords) {
    console.log("Receive available move " + JSON.stringify(coords));
    battle.showAvailableMove(coords);
})
