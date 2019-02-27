var log = require("./output")
var express = require("express")

var gamecontroller = require("./gamecontroller")

var app = express()
var http = require("http").Server(app)
var io = require("socket.io")(http)

var main_loop_timer = null
var open_id = 0
var id_from_address = {}

//83973833

app.use('/', express.static( __dirname + '/'));
app.get( "/" , function(req,res) {
    //log("Recebi um request: " + explica(req.connection.address().address ) )
    res.sendFile( "/index.html" )
})
http.listen( 80 , "0.0.0.0" )
io.on("connection",function( socket ){
    if( !gamecontroller.isActive() ){
        wake()
        open_id = 0
    }

    var player_id = open_id++
    log( socket.conn.remoteAddress + " connected" )
    id_from_address[ socket.conn.remoteAddress ] = player_id
    gamecontroller.newPlayer( player_id )
    socket.emit("id",player_id)
    socket.on("input",function( msg ){
        if( gamecontroller.active == false ){
            wake()
        }
        gamecontroller.receiveInput( player_id , msg )
    })
    socket.on("disconnecting",function(msg){
        log( socket.conn.remoteAddress + " disconnected" )
        gamecontroller.exitedPlayer( player_id , msg )
    })
})

function wake(){
    log("waking")
    if( main_loop_timer == null )
        main_loop_timer = setInterval( mainLoop , 150)
}
function rest(){
    log("resting...")
    clearInterval( main_loop_timer )
    main_loop_timer = null
}
function mainLoop(){
    gamecontroller.mainLoop()
    if( !gamecontroller.isActive() ){
        rest()
    }
    io.emit( "gamestate" , { for: "everyone" , data: gamecontroller.getState() } )
}