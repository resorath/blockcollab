var battle = new Phaser.Scene('Battle');

battle.gems = {}

battle.board = {}
battle.boardState = {
    ready: false,
    initiallyPopulated: false,
    dirty: false,
    currentDragLock: 'none'
};

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

        if(battle.boardState.currentDragLock == 'horizontal')
        {
            gameObject.x = dragX;
        }
        else if(battle.boardState.currentDragLock == 'vertical')
        {
            gameObject.y = dragY;
        }
        else
        {
            // determine drag
            if(delta.x >= delta.y)
                battle.boardState.currentDragLock = 'horizontal';
            else
                battle.boardState.currentDragLock = 'vertical';

        }


    });

    this.input.on('dragend', function (pointer, gameObject)
    {
        battle.boardState.currentDragLock = 'none';
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
