var log = require('./output')

const GRID_WIDTH = 32
const GRID_HEIGHT = 24
const DIRECTION_RIGHT = 0
const DIRECTION_UP = 1
const DIRECTION_LEFT = 2
const DIRECTION_DOWN = 3


var all_snakes = {}
var food = Vector2(0,0)
var active = false

var grid = {}
grid.width = GRID_WIDTH
grid.height = GRID_HEIGHT
grid.cells = {}

function Vector2( x , y ){
    return {
        x:x,
        y:y,
        normalize(){
            if( this.x != 0 || this.y != 0 ){
                var length = Math.pow( Math.pow( this.x , 2 ) + Math.pow( this.y , 2 ) , 0.5 )
                this.x = this.x / length
                this.y = this.y / length
            }
            return this 
        },
        ortogonalize(){
            if( this.x == 0 && this.y == 0 ){
                return this
            }
            this.normalize()
            const sin45 = Math.sin( Math.PI * 0.25 )
            if( this.x >= sin45 ){
                this.x = 1 ; this.y = 0;
            }else if( this.x < -sin45 ){
                this.x = -1 ; this.y = 0;
            }else if( this.y >= sin45 ){
                this.x = 0 ; this.y = 1;
            }else{
                this.x = 0 ; this.y = -1;
            }
            return this
        },
        toString(){
            return "(" + this.x + "," + this.y + ")"
        },
        getCopy(){
            return Vector2(this.x,this.y);
        },
        equals(other){
            return (this.x == other.x && this.y == other.y)
        }
    }
}
function DirectionFromInteger( int ){
    switch(int){
        case DIRECTION_UP:
            return Vector2(0,-1)
        case DIRECTION_DOWN:
            return Vector2(0,1)
        case DIRECTION_LEFT:
            return Vector2(-1,0)
        case DIRECTION_RIGHT:
            return Vector2(1,0)
    }
}
function getRandomPosition(){
    return Vector2( Math.floor(Math.random() * GRID_WIDTH) , Math.floor(Math.random() * GRID_HEIGHT) )
}

function createSnake( id , pos ){
    return {
        id : id,
        direction : Vector2(0,0),
        new_direction : null,
        positions : [ pos ],
        gainSize(){
            var last_pos = this.positions[ this.positions.length-1 ]
            var new_pos = Vector2( last_pos.x , last_pos.y )
            this.positions.push( new_pos )
        },
        reset( pos ){
            this.direction = Vector2(0,0)
            this.positions = [ pos ]
            this.new_direction = null
        }
    }
}

function updateSnake( snake ){
    for( var i = snake.positions.length-1 ; i >= 1 ; i-- ){
        var new_pos = snake.positions[i-1].getCopy()
        snake.positions[i] = new_pos
        grid.cells[ new_pos.x + GRID_WIDTH*new_pos.y ] = snake.id
    }

    if( snake.new_direction ){
        snake.direction = snake.new_direction.getCopy()
        snake.new_direction = null
    }

    snake.positions[0].x = snake.positions[0].x + snake.direction.x
    while( snake.positions[0].x < 0 )snake.positions[0].x+= GRID_WIDTH
    while( snake.positions[0].x >= GRID_WIDTH )snake.positions[0].x-= GRID_WIDTH

    snake.positions[0].y = snake.positions[0].y + snake.direction.y
    while( snake.positions[0].y < 0 )snake.positions[0].y += GRID_HEIGHT
    while( snake.positions[0].y >= GRID_HEIGHT )snake.positions[0].y -= GRID_HEIGHT
    
    var loc = snake.positions[0].x + snake.positions[0].y*GRID_WIDTH
    if( typeof( grid.cells[loc] ) == "number" ){
        //Collided
        snake.reset( getRandomPosition() )
    }else{
        grid.cells[loc] = snake.id
        if( snake.positions[0].equals(food) ){
            snake.gainSize()
            snake.gainSize()
            snake.gainSize()
            food = getRandomPosition()
        }
    }

    //console.log(snake.positions[0].x + " , " + snake.positions[0].y )
}

this.mainLoop = function( ){
    grid.cells = {}
    active = false
    for( var player_id in all_snakes ){
        var snake = all_snakes[player_id]
        if( snake.positions.length > 0 ){
            updateSnake(snake)
            active = true
        }
    }
}
this.getState = function(){
    var ret = {}
    ret.food = food
    ret.grid = grid
    return ret
}

this.receiveInput = function( player_id , input ){
    var snake = all_snakes[player_id]
    var current_direction = snake.direction
    var new_direction = DirectionFromInteger(input)
    if( snake.positions.length > 1 && 
        ( current_direction.x == -new_direction.x || current_direction.y == -new_direction.y ) ){
        return
    }
    snake.new_direction = new_direction   
}
this.newPlayer = function( player_id ){
    all_snakes[ player_id ] = createSnake( player_id , Vector2(10,10) )
}
this.exitedPlayer = function( player_id ){
    delete all_snakes[player_id]
}
this.isActive = function(){
    var number_of_players = Object.keys( all_snakes ).length
    return number_of_players > 0
}