const io = require("socket.io");
const server = io.listen(3000);

var games = []

server.on("connection", function(socket) {
    console.log("user connected");

    if(games.length == 0 || games[games.length -1].sockets.length == 2)
    {
        game = new Game();
        game.sockets.push(socket);
        socket.game = game;
        socket.player = 1;
        games.push(game);
        console.log("Adding user to new game... waiting" + game.sockets[0].player);

        socket.emit("player", 1);
    }
    else
    {
        game = games[games.length - 1];
        game.sockets.push(socket);
        socket.game = game;
        socket.player = 2;

        game.started = true;
        
        console.log("Game made!");

        socket.emit("player", 2);
    }


    socket.on("position", function(p) {
        if(!socket.game.started)
            return;

        socket.position = p;
        
        opsocket = getOppositeSocket(socket.game, socket.player);

        opsocket.emit("opponent.position", p);
    });

    socket.on("attractorActive", function(a) {
        if(!socket.game.started)
            return;

        socket.attractorActive = a;
        
        opsocket = getOppositeSocket(socket.game, socket.player);

        opsocket.emit("opponent.attractorActive", a);
    });
});


function getOppositeSocket(game, player)
{
    oppositeplayer = player == 1 ? 2 : 1;

    return game.sockets[oppositeplayer - 1];
}

// do things every 0.5 seconds
setInterval(function() {

    for(i=0; i<games.length; i++)
    {
        game = games[i];

        if(game.started)
        {
            asteroid = {
                position: {
                    x: rand(200, 1800),
                    y: rand(50, 800)
                },
                size: 1,
                velocity: {
                    x: rand(-2, 2),
                    y: rand(-2, 2)
                }
            };

            for(j=0;j<game.sockets.length;j++)
            {
                game.sockets[j].emit("asteroid.make", asteroid);
            }
        }
    }


}, 2000);


function Game() {
    this.sockets = [];
    this.started = false;
}

function rand(low, high) {
    var r = (Math.random() * (high - low + 1)) + low;
    return r;
  }