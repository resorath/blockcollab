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
        delta.x = Math.abs(gameObject.x - dragX);
        delta.y = Math.abs(gameObject.y - dragY);

        // If horizontal drag lock is set, only move horizontal
        if(battle.dragState.currentDragLock == 'horizontal')
        {
            // don't go beyond 80 pixels
            if(battle.dragState.startX - dragX <= battle.dragwidth && battle.dragState.startX - dragX >= -battle.dragwidth)
                gameObject.x = dragX;
        }
        // If vertical drag lock is set, only move vertical
        else if(battle.dragState.currentDragLock == 'vertical')
        {
            // don't go beyond 80 pixels
            if(battle.dragState.startY - dragY <= battle.dragwidth && battle.dragState.startY - dragY >= -battle.dragwidth)
                gameObject.y = dragY;
        }
        // If no drag lock has been set, determine which one to set based on initial movements
        else
        {
            // store original coords
            battle.dragState.startX = gameObject.x;
            battle.dragState.startY = gameObject.y;

            // determine drag
            if(delta.x >= delta.y)
                battle.dragState.currentDragLock = 'horizontal';
            else
                battle.dragState.currentDragLock = 'vertical';

        }


    });

    this.input.on('dragend', function (pointer, gameObject)
    {
        if(battle.dragState.currentDragLock == 'horizontal')
        {
            // snap lock to new location X (left)
            if(battle.dragState.startX - gameObject.x >= (battle.dragwidth / 2))
            {
                gameObject.x = battle.dragState.startX - battle.dragwidth;
            }
            // snap lock to new location X (right)
            else if(battle.dragState.startX + gameObject.x >= (battle.dragwidth / 2))
            {
                gameObject.x = battle.dragState.startX + battle.dragwidth;
            }
            // snap lock to old location (not enough drag) X
            else
            {
                gameObject.x = battle.dragState.startX
            }
        }

        else if(battle.dragState.currentDragLock == 'vertical')
        {
            // snap lock to new location Y (down)
            if(battle.dragState.startY - gameObject.y >= (battle.dragwidth / 2))
            {
                gameObject.y = battle.dragState.startY - battle.dragwidth;
            }
            // snap lock to new location Y (up)
            else if(battle.dragState.startY + gameObject.y >= (battle.dragwidth / 2))
            {
                gameObject.y = battle.dragState.startY + battle.dragwidth;
            }
            // snap lock to old location (not enough drag) Y
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
        }
    }

    this.boardState.initiallyPopulated = true;
    
}

battle.update = function() 
{
    if(battle.boardState.ready && !battle.boardState.initiallyPopulated)
        this.populateInitialGrid();


};
