var globals = {
    width: 1900,
    height: 1050
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
        default: 'matter',
        matter: {
            gravity: {
                scale: 0
            },
            plugins: {
                attractors: true
            },
            debug: true,
            debugShowInternalEdges: true,
            debugShowConvexHulls: true
        }
    },
    scene: [battle]
};

var rng = new Phaser.Math.RandomDataGenerator();
var player = 0;
var game = {};

function randInRange(f, c)
{
    return rng.frac() * (c - f + 1) + f;
}

var socket = io("http://localhost:3000");

socket.on('connect', function() {
    socket.emit('control', 'ready');

    // Use matchmaking for now
    socket.emit('join', '');

});

socket.on('terminal', function(message) {
    console.log(message)
})

socket.on('control', function(message) {

    if(message.command == "assignplayer")
    {
        console.log("Assigned player " + message.player);
        player = message.player;
    }

    if(message.command == "startgame")
    {
        console.log("Starting game...");
        game = new Phaser.Game(config);
        
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

