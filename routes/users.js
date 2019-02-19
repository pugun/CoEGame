var express = require('express');
var router = express.Router();
var db = require('./../models');
var sequelize = require('sequelize');
var passport = require('passport');
var loki = require('lokijs');
var imdb = new loki('loki.json');
var children = imdb.addCollection('children');
var geoLocation = imdb.addCollection("geoLocation");

router.get("/lokijuti", function (req, res) {
	children.insert({ name: 'Sleipnir', legs: 8 });
	children.insert({ name: 'Jormungandr', legs: 0 });
	children.insert({ name: 'Hel', legs: 2 });
	res.sendStatus(200);
});

router.get("/lokishow", function (req, res) {
	res.status(200).send(children.find());
});

/* GET users listing. */
router.get('/', function (req, res, next) {
	res.send('respond with a resource');
});


function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.sendStatus(401);
}

router.get("/isLogin", (req, res) => {
	if (req.isAuthenticated()) {
		res.sendStatus(200);
	}
	else {
		res.sendStatus(401);
	}
});

router.post("/login", passport.authenticate("local"), (req, res) => {
	res.send("Login successfully");
});

router.get("/logout", isLoggedIn, (req, res) => {
	req.logout();
	res.status(200).redirect("/");
});

router.post("/registerUser", (req, res) => {
	var bcrypt = require("bcryptjs");
	bcrypt.hash(req.body.password, 10).then(hash => {
		return db.User.create({
			username: req.body.username,
			password: hash,
			faculty: req.body.faculty,
			gender: req.body.gender
		});
	}).then((user) => {
		return db.Character.create({
			UserId: user.id,
			hp: 15
		});
	}).then(user => {
		res.sendStatus(200);
	}).catch((err) => {
		console.log(err);
		res.sendStatus(500);
	});
});

//isLoggedIn then next to this
router.post("/updateUserInfo", isLoggedIn, (req, res) => {
	return db.sequelize.transaction(function (t) {
		return db.User.update({
			username: req.body.username,
			faculty: req.body.faculty,
			gender: req.body.gender
		}, {
				where: { id: req.user.id }
			}, { transaction: t });
	}).then(result => {
		res.sendStatus(200);
	}).catch(err => {
		res.sendStatus(500);
		console.log(err);
	});
});

router.get("/getInventory", isLoggedIn, (req, res) => {
	db.Inventory.findAll({
		where: { UserId: req.user.id },
		raw: true,
		attributes: { exclude: ["id", "createdAt", "updatedAt", "UserId"]},
		include: [{
			model: db.Item,
			attributes: { exclude: ["createdAt", "updatedAt","id","UserId"]}
		}]
	}).then(user => {
		res.status(200).json(user);
	}, reason => {
		console.log(reason);
		res.sendStatus(500);
	});
});

router.post("/qrSent", isLoggedIn, (req, res) => {
	db.Qr.findOne({
		where: { qrcode: req.body.qrcode }
	}).then(qr => {
		return db.Inventory.create({
			UserId: req.user.id,
			ItemId: qr.ItemId
		});
	}).then(result => {
		res.sendStatus(200);
	}).catch(err => {
		res.sendStatus(500);
		console.log(err);
	});
});

router.post("/equipItem", isLoggedIn, (req, res) => {
	let field;
	if(req.body.slot === 1) {
		field = "head";
	} else if(req.body.slot === 2) {
		field = "body";
	} else if(req.body.slot === 3){
		field = "weapon";
	}
	db.Character.findOne({
		where: { UserId: req.user.id }
	}).then(result => {
		return result.update({
			head: req.body.itemId,
			body: req.body.itemId,
			weapon: req.body.itemId
		}, { fields: [field] });
	}).then(result => {
		res.sendStatus(200);
	}).catch(err => {
		res.sendStatus(500);
		console.log(err);
	});
});

//user belongs to passport
router.get("/getUserInfo", isLoggedIn, (req, res) => {
	let id = req.user.id;
	if (req.query.id != null) {
		id = req.query.id;
	}
	console.log(id);

	let data = {};
	db.User.findOne({
		where: { id: id }
	}).then(user => {
		data.username = user.username,
		data.id = user.id;
		return db.Character.findOne({
			where: { UserId: id }
		});
	}).then(character => {
		data.hp = character.hp;
		return db.Item.findOne({
			where: { id: character.head },
			raw: true
		}).then(head => {
			data.head = {};
			if (head === null) {
				data.head.attack = 0;
				data.head.mattack = 0;
				data.head.defend = 0;
				data.head.mdefend = 0;
				data.head.hp = 0;
			} else {
				data.head = head;
			}
			return db.Item.findOne({
				where: { id: character.body },
				raw: true
			});
		}).then(body => {
			data.body = {};
			if (body === null) {
				data.body.attack = 0;
				data.body.mattack = 0;
				data.body.defend = 0;
				data.body.mdefend = 0;
				data.body.hp = 0;
			} else {
				data.body = body;
			}
			return db.Item.findOne({
				where: { id: character.weapon },
				raw: true
			});
		}).then(weapon => {
			data.weapon = {};
			if (weapon === null) {
				data.weapon.attack = 0;
				data.weapon.mattack = 0;
				data.weapon.defend = 0;
				data.weapon.mdefend = 0;
				data.weapon.hp = 0;
			} else {
				data.weapon = weapon;
			}
		});
	}).then(result => {
		res.status(200).json(data);
	}).catch(err => {
		res.sendStatus(500);
		console.log(err);
	});
});

router.get("/findPlayer", isLoggedIn, (req, res) => {
	let promises = [];
	let players = [];
	let playersLocation = geoLocation.find();
	let myid = geoLocation.findOne({ id: req.user.id });
	function checkdistance(player) {
		if (player.id === req.user.id)
		{
			return;
		}
		let x1 = player.lat;
		let x2 = myid.lat;
		let y1 = player.long;
		let y2 = myid.long;
		console.log(`x1 = ${x1} x2 = ${x2} y1 = ${y1} y2 = ${y2}`);
		let result = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
		
		function pushPlayer(result)
		{
			return db.User.findOne({where: {id: player.id} , raw: true}).then(user => {
				if ( result <= 0.0006) {
					players.push({
						playerId: player.id,
						playerName: user.username
					});
				}
			});
		}

		promises.push(pushPlayer(result));
	}

	for (i = 0; i < playersLocation.length; i++)
	{
		checkdistance(playersLocation[i]);
	}

	Promise.all(promises).then(() => {
		console.log(players);
		res.status(200).json(players);
	}).catch(err => {
		console.log(err);
		res.sendStatus(500);
	});
	
});

router.post("/postGeo", isLoggedIn, (req, res) => {
	var user = geoLocation.findOne({ id: req.user.id });
	if(user === null) {
		geoLocation.insert({
			id: req.user.id ,
			lat: req.body.lat,
			long: req.body.long
		});
	}
	else {
		user.lat = req.body.lat;
		user.long = req.body.long;
		geoLocation.update(user);
	}
	
	res.status(200);
});

router.get("/getGeo", isLoggedIn, (reg, res) => {
	res.status(200).json(geoLocation);
});

module.exports = router;
