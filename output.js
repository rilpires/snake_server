
function getHoraAtual(){
    var d = new Date()
    return d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
}

module.exports = function( msg ){
    console.log("[" + getHoraAtual() + "] - " + msg )
}
