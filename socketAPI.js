var socket_io = require("socket.io");
var io = socket_io();
var socketApi = {};

socketApi.io = io;

io.on("connection", function(socket) {
    console.log("A user connected");
    socket.on("disconnect", function() {
        console.log("user disconnected");
    });
    socket.on("chat message", function(msg) {
        console.log("message: " + msg);
    });
    socket.on("start", function(player1, player2) {
        io.emit("start", {player1: player1, player2: player2});
    });
    socket.on("action", function() {
        //io.emit("action", {player1: ,player2: ,state: })
    })
});

socketApi.sendNotification = function() {
    io.sockets.emit("chat message", {msg: "Hello World!"});
}

let prepareFight = function() {

}

module.exports = socketApi;