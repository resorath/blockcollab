var battle = new Phaser.Scene('Battle');

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
    this.input.on('dragstart', function (pointer, gameObject)
    {

    });

    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
        
        var delta = {};
        delta.x = gameObject.x - dragX;
        // 0 = no movement, negative = right, positive = left

        delta.y = gameObject.y - dragY;
        // 0 = no movement, negative = up, positive = down

        var selfx = gameObject.data.get('grid-x');
        var selfy = gameObject.data.get('grid-y');

        // If vertical drag lock is set, only move vertical
        if(battle.dragState.currentDragLock == 'left')
        {
            // don't go beyond 80 pixels
            if(battle.dragState.startX - dragX <= battle.dragwidth && battle.dragState.startX - dragX >= 0)
                gameObject.x = dragX;
        }
        // If vertical drag lock is set, only move vertical
        else if(battle.dragState.currentDragLock == 'right')
        {
            if(selfx == battle.board[0].length - 1)
                return;

            var neighbour = battle.board[selfx + 1][selfy].sprite;



            // don't go beyond 80 pixels
            if(battle.dragState.startX - dragX <= 0 && battle.dragState.startX - dragX >= -battle.dragwidth)
            {

                var distance = Math.abs(gameObject.x - dragX);

                gameObject.x = dragX;
            
                neighbour.x = neighbour.x - distance;
            }
        }
        // If vertical drag lock is set, only move vertical
        else if(battle.dragState.currentDragLock == 'up')
        {
            // don't go beyond 80 pixels
            if(battle.dragState.startY - dragY <= battle.dragwidth && battle.dragState.startY - dragY >= 0)
                gameObject.y = dragY;
        }
        // If vertical drag lock is set, only move vertical
        else if(battle.dragState.currentDragLock == 'down')
        {
            // don't go beyond 80 pixels
            if(battle.dragState.startY - dragY <= 0 && battle.dragState.startY - dragY >= -battle.dragwidth)
                gameObject.y = dragY;
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
            // snap lock to new location X (left)
            if(battle.dragState.startX - gameObject.x >= (battle.dragwidth / 2))
            {
                gameObject.x = battle.dragState.startX - battle.dragwidth;
            }
            else
            {
                gameObject.x = battle.dragState.startX
            }

        }
        else if(battle.dragState.currentDragLock == 'right')
        {
            var selfx = gameObject.data.get('grid-x');
            var selfy = gameObject.data.get('grid-y');

            // snap lock to new location X (right)
            if(battle.dragState.startX - gameObject.x <= -(battle.dragwidth / 2))
            {
                gameObject.x = battle.dragState.startX + battle.dragwidth;

                var neighbour = battle.board[selfx + 1][selfy];
                
                neighbour.sprite.x = battle.dragState.startX;

                // update locations
                var self = battle.board[selfx][selfy];

                self.sprite.data.set('grid-x', selfx + 1)
                neighbour.sprite.data.set('grid-x', selfx)

                battle.board[selfx][selfy] = neighbour
                battle.board[selfx + 1][selfy] = self

            }
            // snap lock to old location (not enough drag) X
            else
            {
                gameObject.x = battle.dragState.startX

                var neighbour = battle.board[selfx + 1][selfy].sprite;
                
                neighbour.x = battle.dragState.startX + battle.dragwidth;
            }
        }

        else if(battle.dragState.currentDragLock == 'up')
        {
            // snap lock to new location X (right)
            if(battle.dragState.startY - gameObject.y >= (battle.dragwidth / 2))
            {
                gameObject.y = battle.dragState.startY - battle.dragwidth;
            }
            // snap lock to old location (not enough drag) X
            else
            {
                gameObject.y = battle.dragState.startY
            }

        }else if(battle.dragState.currentDragLock == 'down')
        {
            // snap lock to new location X (right)
            if(battle.dragState.startY - gameObject.y <= -(battle.dragwidth / 2))
            {
                gameObject.y = battle.dragState.startY + battle.dragwidth;
            }
            // snap lock to old location (not enough drag) X
            else
            {
                gameObject.y = battle.dragState.startY
            }
        }

        
        battle.dragState.currentDragLock = 'none';


    });
},

battle.populateInitialGrid = function()
{
    for(var i = 0; i < battle.board.length; i++)
    {
        for(var j=0; j < battle.board[i].length; j++)
        {
            var sprite = this.add.sprite(i * 80, j * 80, battle.board[i][j].imagePath).setOrigin(0, 0).setInteractive();
            this.input.setDraggable(sprite);
            sprite.setDataEnabled();
            sprite.data.set('grid-x', i);
            sprite.data.set('grid-y', j);
            battle.board[i][j].sprite = sprite;
        }
    }

    this.boardState.initiallyPopulated = true;
    
}

battle.update = function() 
{
    if(battle.boardState.ready && !battle.boardState.initiallyPopulated)
        this.populateInitialGrid();


};
