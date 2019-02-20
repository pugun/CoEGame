var socket_io = require("socket.io");
var io = socket_io();
var socketApi = {};
var loki = require('lokijs');
var imdb = new loki('loki.json');
var gameRoom = imdb.addCollection("gameRoom");
var db = require('./models');
var sequelize = require('sequelize');
const util = require("util");


socketApi.io = io;

io.on("connection", function (socket) {
	console.log("A user connected");
	socket.on("disconnect", function () {
		console.log("user disconnected");
	});

	socket.on("chat message", function (msg) {
		console.log("message: " + msg);
	});

	socket.on("sendChallenge", function (challenger, reciever) {
		io.emit("recieveChallenge", challenger, reciever);


	});

	socket.on("answerChallenge", function (challenger, reciever, message) {
		console.log('got answer ' + message);
		if (message == 'accept') {
			(async () => {
				try {
					let userChallenger = await db.User.findOne({
						where: { id: challenger },
						raw: true,
						include: [{
							model: db.Character,
							attributes: { exclude: ["createdAt", "updatedAt", "id", "UserId"] }
						}]
					});
					let userReciever = await db.User.findOne({
						where: { id: reciever },
						raw: true,
						include: [{
							model: db.Character,
							attributes: { exclude: ["createdAt", "updatedAt", "id", "UserId", ""] }
						}]
					});
					let userChallengerEquipment = await db.Item.findAll({
						where: sequelize.or({ id: userChallenger["Characters.head"] }, { id: userChallenger["Characters.body"] }, { id: userChallenger["Characters.weapon"] })
						, raw: true
					});
					let userRecieverEquipment = await db.Item.findAll({
						where: sequelize.or({ id: userReciever["Characters.head"] }, { id: userReciever["Characters.body"] }, { id: userReciever["Characters.weapon"] })
						, raw: true
					});
					let userChallengerPower = {
						hp: 0,
						attack: 0,
						mattack: 0,
						defend: 0,
						mdefend: 0
					}, userRecieverPower = {
						hp: 0,
						attack: 0,
						mattack: 0,
						defend: 0,
						mdefend: 0
					};
					for (let i = 0; i < userChallengerEquipment.length; i++) {
						userChallengerPower.hp += userChallengerEquipment[i].hp;
						userChallengerPower.attack += userChallengerEquipment[i].attack;
						userChallengerPower.mattack += userChallengerEquipment[i].mattack;
						userChallengerPower.defend += userChallengerEquipment[i].defend;
						userChallengerPower.mdefend += userChallengerEquipment[i].mdefend;
					}

					for (let i = 0; i < userRecieverEquipment.length; i++) {
						userRecieverPower.hp += userRecieverEquipment[i].hp;
						userRecieverPower.attack += userRecieverEquipment[i].attack;
						userRecieverPower.mattack += userRecieverEquipment[i].mattack;
						userRecieverPower.defend += userRecieverEquipment[i].defend;
						userRecieverPower.mdefend += userRecieverEquipment[i].mdefend;
					}

					console.log("before create room");
					// if (gameRoom.find({ challenger: { '$in': [challenger, reciever] } }) == null) {
					console.log("create room");
					gameRoom.insert({
						challenger: Number(challenger),
						reciever: Number(reciever),
						atkTurn: Math.floor(Math.random() * 2),
						state: [
							{
								hp: 15 + userChallengerPower.hp,
								atk: 3 + userChallengerPower.attack,
								matk: 2 + userChallengerPower.mattack,
								def: 1 + userChallengerPower.defend,
								mdef: 1 + userChallengerPower.mdefend,
								action: "Waiting"
							},
							{
								hp: 15 + userRecieverPower.hp,
								atk: 3 + userRecieverPower.attack,
								matk: 2 + userRecieverPower.mattack,
								def: 1 + userRecieverPower.defend,
								mdef: 1 + userRecieverPower.mdefend,
								action: "Waiting"
							}
						]
					});
					io.emit('roomCreated', challenger, reciever);
					console.log('roomCreted emited!!');
					// }
				}
				catch (err) {
					console.log(err);
				}
			})();
		} else if (message == 'reject') {

		}
		io.emit("answerChallenge", challenger, reciever, message);
	});

	socket.on("cancelChallenge", function (challenger, reciever) {
		console.log('got cancel');
		io.emit("cancelChallenge", challenger, reciever);
	});

	socket.on("findRoom", function (userId) {
		console.log("USER ID " + userId);
		let state = gameRoom.findOne({ challenger: Number(userId) });
		console.log("State Gameroom");
		console.log(state);
		console.log("State All GameRoom");
		console.log(gameRoom.find());
		//util.inspect(state, false, null)
		io.emit("start", state);
	});

	socket.on("action", function (playerNum, action, userId) {
		let state = gameRoom.findOne({ challenger: Number(userId) });
		console.log(playerNum);
		console.log(state);
		console.log(action);
		try {
			state.state[playerNum].action = action;
		} catch (err) {

		}
		gameRoom.update(state);
		if (state.state[0].action !== "Waiting" && state.state[1].action !== "Waiting") {
			let atkPlayer = state.atkTurn;
			let defPlayer = state.atkTurn === 0 ? 1 : 0;
			console.log("atacking: " + atkPlayer);
			console.log("defending: " + defPlayer);
			let atkAction = state.state[atkPlayer].action;
			let defAction = state.state[defPlayer].action;

			let atk = state.state[atkPlayer].atk;
			let matk = state.state[atkPlayer].matk;
			let def = state.state[defPlayer].def;
			let mdef = state.state[defPlayer].mdef;
			let damage;

			if (state.state[defPlayer].action === "def") { mdef = 0; }
			else { def = 0; }
			if (state.state[atkPlayer].action === "atk") { damage = atk - def; }
			else { damage = matk - mdef; }
			if (damage < 0) { damage = 0; }
			state.state[defPlayer].hp -= damage;

			if (state.state[defPlayer].hp <= 0) {
				ลอค(state.state);
				io.emit("end", {
					winner: state.state[atkPlayer].id,
					loser: state.state[defPlayer].id
				});
			}
			else {
				state.state[0].action = "Waiting";
				state.state[1].action = "Waiting";
				state.atkTurn = state.atkTurn === 1 ? 0 : 1;
				io.emit("updateState", state);
			}
		}
		else {
			// io.emit("updateState", {
			// 	state: state
			// });
			// donothing
		}
		console.log("state after updateState");
		console.log(state);
	});

	socket.on("unavailableHandler", function(recv, send) {
		io.emit("answerChallenge", send, recv, "unavailable");
	});

	socket.on("finishAnimation", function (id) {
		let state = getPlayerState();
	});
});

// ดึงสถานะผู้เล่น
// ข้อมูลเหมือน state

function getPlayerState() {

}

socketApi.sendNotification = function () {
	io.sockets.emit("chat message", { msg: "Hello World!" });
};

let prepareFight = function () {

};

function ลอค(any) {
	console.log(any);
}

module.exports = socketApi;