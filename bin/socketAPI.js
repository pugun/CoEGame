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
    socket.on("start", function(state) {
		console.log(state);
        io.emit("start", {
            state: {
                atkTurn: Math.floor(Math.random() * 2),
                player:[
                    {
                        id: state.player[0].id,
                        hp: state.player[0].hp,
                        atk: state.player[0].atk,
                        matk: state.player[0].matk,
                        def: state.player[0].def,
                        mdef: state.player[0].mdef,
                        action: "Waiting"
                    },{
                        id: state.player[1].id,
                        hp: state.player[1].hp,
                        atk: state.player[1].atk,
                        matk: state.player[1].matk,
                        def: state.player[1].def,
                        mdef: state.player[1].mdef,
                        action: "Waiting"
                    }
                ]
            }
        });
    });
    socket.on("action", function(playerNum, state, action) {
        console.log(playerNum);
        console.log(state);
        console.log(action);
        state.player[playerNum].action = action;
        if (state.player[0].action !== "Waiting" && state.player[1].action !== "Waiting") {
            let atkPlayer = state.atkTurn;
            let defPlayer = (state.atkTurn === 0) ? 1 : 0;
            console.log("atacking: " + atkPlayer)
            console.log("defending: " + defPlayer);
            let atkAction = state.player[atkPlayer].action;
            let defAction = state.player[defPlayer].action;

            let atk = state.player[atkPlayer].atk;
            let matk = state.player[atkPlayer].matk;
            let def = state.player[defPlayer].def;
            let mdef = state.player[defPlayer].mdef;
            let damage;

            if (state.player[defPlayer].action === "def") { mdef = 0; }
            else { def = 0; }
            if (state.player[atkPlayer].action === "atk") { damage = atk - def }
            else { damage = matk - mdef }
            if (damage < 0) { damage = 0 };
            state.player[defPlayer].hp -= damage;

            if (state.player[defPlayer].hp <= 0) {    
                io.emit("end", {
                    winner: state.player[atkPlayer].id,
                    loser: state.player[defPlayer].id
                });
            }
            else {
                state.player[0].action = "Waiting";
                state.player[1].action = "Waiting";
                state.atkTurn = (state.atkTurn === 1) ? 0 : 1;
                io.emit("updateState",{
                    state: state
                });
            }
        }
        else {
            io.emit("updateState",{
                state: state
            });
        }
    });
});

socketApi.sendNotification = function() {
    io.sockets.emit("chat message", {msg: "Hello World!"});
}

let prepareFight = function() {

}

module.exports = socketApi;