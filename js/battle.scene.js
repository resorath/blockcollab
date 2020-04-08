var battle = new Phaser.Scene('Battle');
var Matter = Phaser.Physics.Matter.Matter;

battle.gems = {}

battle.board = {}
battle.boardState = {
    ready: false,
    initiallyPopulated: false,
    dirty: false,
};
battle.dragState = {

    currentDragLock: 'none',
    startX: 0,
    startY: 0
}

battle.dragwidth = 80;

battle.preload = function()
{
    this.load.image('gems/red', 'img/gems/red.png');
    this.load.image('gems/green', 'img/gems/green.png');
    this.load.image('gems/purple', 'img/gems/purple.png');
    this.load.image('gems/teal', 'img/gems/teal.png');
    this.load.image('gems/yellow', 'img/gems/yellow.png');
    this.load.image('gems/blue', 'img/gems/blue.png');
    
},

battle.create = function()
{
    this.registerDragHandles();
},

battle.update = function() 
{

    if(battle.boardState.ready && !battle.boardState.initiallyPopulated)
        this.populateInitialGrid();

    if(!battle.animationRunning && battle.animationQueue.length > 0)
        battle.runAnimationQueue();


},


battle.registerDragHandles = function()
{
    this.input.on('dragstart', function (pointer, gameObject)
    {

    });

    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
        
        var delta = {};
        delta.x = gameObject.x - dragX;
        // 0 = no movement, negative = right, positive = left

        delta.y = gameObject.y - dragY;
        // 0 = no movement, negative = up, positive = down

        var selfcoords = battle.getGemCoordinateFromSprite(gameObject);

        if(battle.dragState.currentDragLock == 'left')
        {
            if(selfcoords.x != 0)
            {
                var neighbour = battle.board[selfcoords.x - 1][selfcoords.y].sprite;

                // don't go beyond 80 pixels
                if(battle.dragState.startX - dragX >= 0 && battle.dragState.startX - dragX <= battle.dragwidth)
                {
                    var distance = Math.abs(gameObject.x - dragX);
                    gameObject.x = dragX;       
                    neighbour.x = neighbour.x + distance;
                }
            }
        }
        else if(battle.dragState.currentDragLock == 'right')
        {
            if(selfcoords.x != battle.board[0].length - 1)
            {
                var neighbour = battle.board[selfcoords.x + 1][selfcoords.y].sprite;

                // don't go beyond 80 pixels
                if(battle.dragState.startX - dragX <= 0 && battle.dragState.startX - dragX >= -battle.dragwidth)
                {
                    var distance = Math.abs(gameObject.x - dragX);
                    gameObject.x = dragX;       
                    neighbour.x = neighbour.x - distance;
                }
            }
        }
        else if(battle.dragState.currentDragLock == 'up')
        {
            if(selfcoords.y != 0)
            {
                var neighbour = battle.board[selfcoords.x][selfcoords.y - 1].sprite;

                // don't go beyond 80 pixels
                if(battle.dragState.startY - dragY >= 0 && battle.dragState.startY - dragY <= battle.dragwidth)
                {
                    var distance = Math.abs(gameObject.y - dragY);
                    gameObject.y = dragY;       
                    neighbour.y = neighbour.y + distance;
                }
            }
        }
        else if(battle.dragState.currentDragLock == 'down')
        {
            if(selfcoords.y != battle.board[selfcoords.x][0].length - 1)
            {
                var neighbour = battle.board[selfcoords.x][selfcoords.y + 1].sprite;

                // don't go beyond 80 pixels
                if(battle.dragState.startY - dragY <= 0 && battle.dragState.startY - dragY >= -battle.dragwidth)
                {
                    var distance = Math.abs(gameObject.y - dragY);
                    gameObject.y = dragY;       
                    neighbour.y = neighbour.y - distance;
                }
            }
        }
        // If no drag lock has been set, determine which one to set based on initial movements
        else
        {
            // store original coords
            battle.dragState.startX = gameObject.x;
            battle.dragState.startY = gameObject.y;

            // determine drag
            if(delta.x > 0)
                battle.dragState.currentDragLock = 'left';
            else if(delta.x < 0)
                battle.dragState.currentDragLock = 'right';
            else if(delta.y > 0)
                battle.dragState.currentDragLock = 'up';
            else if(delta.y < 0)
                battle.dragState.currentDragLock = 'down';

        }


    });

    this.input.on('dragend', function (pointer, gameObject)
    {
        if(battle.dragState.currentDragLock == 'left')
        {
            var selfCoords = battle.getGemCoordinateFromSprite(gameObject);

            if(selfCoords.x != 0)
            {                   
                var neighbour = battle.board[selfCoords.x - 1][selfCoords.y];
                var self = battle.board[selfCoords.x][selfCoords.y];
                // snap lock to new location X (left)
                if(battle.dragState.startX - gameObject.x >= (battle.dragwidth / 2))
                {
                    gameObject.x = battle.dragState.startX - battle.dragwidth;

                    neighbour.sprite.x = battle.dragState.startX;

                    // update locations
                    battle.swap(self, neighbour)

                }
                // snap lock to old location (not enough drag) X
                else
                {
                    gameObject.x = battle.dragState.startX;

                    neighbour.sprite.x = battle.dragState.startX - battle.dragwidth;
                }
            }

        }
        else if(battle.dragState.currentDragLock == 'right')
        {
            var selfCoords = battle.getGemCoordinateFromSprite(gameObject);

            if(selfCoords.x != battle.board[0].length - 1)
            {
                var neighbour = battle.board[selfCoords.x + 1][selfCoords.y];
                var self = battle.board[selfCoords.x][selfCoords.y];

                // snap lock to new location X (right)
                if(battle.dragState.startX - gameObject.x <= -(battle.dragwidth / 2))
                {
                    gameObject.x = battle.dragState.startX + battle.dragwidth;

                    neighbour.sprite.x = battle.dragState.startX;

                    // update locations
                    battle.swap(self, neighbour)

                }
                // snap lock to old location (not enough drag) X
                else
                {
                    gameObject.x = battle.dragState.startX;

                    neighbour.sprite.x = battle.dragState.startX + battle.dragwidth;
                }
            }
        }

        else if(battle.dragState.currentDragLock == 'up')
        {
            var selfCoords = battle.getGemCoordinateFromSprite(gameObject);

            if(selfCoords.y != 0)
            {
                var neighbour = battle.board[selfCoords.x][selfCoords.y - 1];
                var self = battle.board[selfCoords.x][selfCoords.y];

                // snap lock to new location Y (up)
                if(battle.dragState.startY - gameObject.y >= (battle.dragwidth / 2))
                {
                    gameObject.y = battle.dragState.startY - battle.dragwidth;


                    
                    neighbour.sprite.y = battle.dragState.startY;

                    // update locations
                    battle.swap(self, neighbour)

                }
                // snap lock to old location (not enough drag) X
                else
                {
                    gameObject.y = battle.dragState.startY;

                    neighbour.sprite.y = battle.dragState.startY - battle.dragwidth;
                }
            }

        }else if(battle.dragState.currentDragLock == 'down')
        {
            var selfCoords = battle.getGemCoordinateFromSprite(gameObject);

            if(selfCoords.y != battle.board[selfCoords.x][0].length - 1)
            {
                var neighbour = battle.board[selfCoords.x][selfCoords.y + 1];
                var self = battle.board[selfCoords.x][selfCoords.y];

                // snap lock to new location Y (down)
                if(battle.dragState.startY - gameObject.y <= -(battle.dragwidth / 2))
                {
                    gameObject.y = battle.dragState.startY + battle.dragwidth;

                    neighbour.sprite.y = battle.dragState.startY;

                    // update locations
                    battle.swap(self, neighbour)

                }
                // snap lock to old location (not enough drag) X
                else
                {
                    gameObject.y = battle.dragState.startY;

                    neighbour.sprite.y = battle.dragState.startY + battle.dragwidth;
                }
            }
        }

        
        battle.dragState.currentDragLock = 'none';


    });
}

battle.swap = function(active, neighbour)
{
    var activeCoord = this.getGemCoordinateFromObject(active)
    var neighbourCoord = this.getGemCoordinateFromObject(neighbour)

    var command = {
        'action': 'swap',
        'activeCoord': activeCoord,
        'neighbourCoord': neighbourCoord
    }

    socket.emit('command', command);

    battle.board[activeCoord.x][activeCoord.y] = neighbour;
    battle.board[neighbourCoord.x][neighbourCoord.y] = active;

    //@todo update server
}

battle.getGemCoordinateFromObject = function(o)
{
    for(var i = 0; i < battle.board.length; i++)
    {
        for(var j=0; j < battle.board[i].length; j++)
        {
            if(battle.board[i][j] == o)
            {
                return {x: i, y: j};
            }
        }
    }
}

battle.getGemCoordinateFromSprite = function(sprite)
{
    for(var i = 0; i < battle.board.length; i++)
    {
        for(var j=0; j < battle.board[i].length; j++)
        {
            if(battle.board[i][j].sprite == sprite)
            {
                return {x: i, y: j};
            }
        }
    }

}

battle.populateInitialGrid = function()
{
    for(var i = 0; i < battle.board.length; i++)
    {
        for(var j=0; j < battle.board[i].length; j++)
        {
            var sprite = this.physics.add.sprite(i * battle.dragwidth, j * battle.dragwidth, battle.board[i][j].imagePath).setOrigin(0, 0).setInteractive();
            this.input.setDraggable(sprite);
            battle.board[i][j].sprite = sprite;
        }
    }

    this.boardState.initiallyPopulated = true;
    
};

battle.remoteSwap = function(swap)
{
    this.queueAnimation(function(params) {
        var activeCoord = params.swap.activeCoord;
        var neighbourCoord = params.swap.neighbourCoord;

        var active = battle.board[activeCoord.x][activeCoord.y];
        var neighbour = battle.board[neighbourCoord.x][neighbourCoord.y]

        battle.board[activeCoord.x][activeCoord.y] = neighbour;
        battle.board[neighbourCoord.x][neighbourCoord.y] = active;

        battle.tweens.add({
            targets: active.sprite,
            x: neighbourCoord.x * battle.dragwidth,
            y: neighbourCoord.y * battle.dragwidth,
            duration: 200
        });

        battle.tweens.add({
            targets: neighbour.sprite,
            x: activeCoord.x * battle.dragwidth,
            y: activeCoord.y * battle.dragwidth,
            duration: 200
        });
    }, 'swap', 0, 1000, {swap}); 

}

battle.remoteDestroy = function(coords)
{
    this.queueAnimation(function(params) {
        var o = battle.board[params.coords.x][params.coords.y];

        battle.board[params.coords.x][params.coords.y] = null;

        o.sprite.destroy();
    }, 'destroy', 1, 1, {coords});
}

battle.remoteDrop = function(coords)
{
    //o.sprite.y = o.sprite.y + battle.dragwidth
    this.queueAnimation(function(params) {
        var o = battle.board[params.coords.x][params.coords.y];

        battle.board[params.coords.x][params.coords.y + 1] = o;
        battle.board[params.coords.x][params.coords.y] = null;

        //o.sprite.y = o.sprite.y + battle.dragwidth

        if(o == null)
            return;
        
        battle.tweens.add({
            targets: o.sprite,
            y: ((params.coords.y * battle.dragwidth) + battle.dragwidth),
            duration: 200,
            ease: function(t) {
                return t*t;
            }
        });
    }, 'drop', 1, 1, {coords});

}

battle.addGem = function(gemdata)
{
    this.queueAnimation(function(params) {
        var i = params.gemdata.x;
        var j = params.gemdata.y;
        var gem = params.gemdata.gem;
    
        battle.board[i][j] = gem;

        var sprite = battle.physics.add.sprite(i * 80, -1 * battle.dragwidth, battle.board[i][j].imagePath).setOrigin(0, 0).setInteractive();
        battle.input.setDraggable(sprite);
        battle.board[i][j].sprite = sprite;

        battle.tweens.add({
            targets: sprite,
            y: 0,
            duration: 200
        });

    }, 'addgem', 1, 1, {gemdata});

}

battle.animationQueue = [];
battle.animationRunning = false;
battle.animationSorted = false;
battle.animationSortingOrder = ['swap', 'destroy', 'drop', 'addgem'];

battle.queueAnimation = function(callback, chainIdentifier, chainDelay, chainEndDelay, params)
{
    if(params == null)
        params = {};
    this.animationQueue.push({callback, chainIdentifier, chainDelay, chainEndDelay, params});
    this.animationSorted = false;
}

battle.runAnimationQueue = function()
{
    if(battle.animationQueue.length == 0)
        return;

    if(battle.animationRunning)
        return;

    var t = [];
    if(!battle.animationSorted)
    {
        /*
        for(var i = 0; i < battle.animationSortingOrder.length; i++)
        {
            var f = (battle.animationQueue.filter(function(e) {
                return (e.chainIdentifier == battle.animationSortingOrder[i]);
            }));
            t = t.concat(f);
        }
        
        battle.animationQueue = t;*/

        battle.animationSorted = true;
    }

    var animObject = battle.animationQueue.shift();
    
    var chainIdentifier = animObject.chainIdentifier;   // name of chain for chained animations
    var chainDelay = animObject.chainDelay;             // delay between chained animations
    var chainEndDelay = animObject.chainEndDelay;       // delay if next animation is not in the chain

    var delay = 0;

    // if the next animation is part of the chain, use the chain delay
    if(battle.animationQueue.length > 0 && battle.animationQueue[0].chainIdentifier == chainIdentifier)
        delay = chainDelay;
    // otherwise use the chain end delay
    else
        delay = chainEndDelay;


    var callback = animObject.callback;
    var params = animObject.params;

    battle.animationRunning = true;
    callback(params);

    window.setTimeout(function() {
        battle.animationRunning = false;
        //battle.runAnimationQueue();
    }, delay);
}