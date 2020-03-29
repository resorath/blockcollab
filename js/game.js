var globals = {
    width: 1900,
    height: 1050,
    opponentposition: {
        x: 1850,
        y: 525
    }
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
function randInRange(f, c)
{
    return rng.frac() * (c - f + 1) + f;
}

var socket = io("http://localhost:3000");

socket.on('connect', function() {
    player = 0;

    socket.emit('control', 'ready');
    socket.emit('join', '');

});

var game = new Phaser.Game(config);

