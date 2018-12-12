var express = require('express');
var router = express.Router();
var db = require('./../models');
var sequelize = require('sequelize');
var passport = require('passport');


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
})

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
		attributes: { exclude: ["id", "createdAt", "updatedAt", "UserId", "ItemId"]},
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
		where: { qrcode: req.body.qrcode },
	}).then(qr => {
		return db.Inventory.create({
			UserId: req.user.id,
			ItemId: qr.ItemId
		})
	}).then(result => {
		res.sendStatus(200);
	}).catch(err => {
		res.sendStatus(500);
		console.log(err);
	});
});

router.post("/equipItem", isLoggedIn, (req, res) => {
	let field;
	if(req.body.slot == 1) {
		field = "head";
	} else if(req.body.slot == 2) {
		field = "body";
	} else if(req.body.slot == 3){
		field = "weapon";
	}
	db.Character.findOne({
		where: { UserId: req.user.id },
	}).then(result => {
		return result.update({
			head: req.body.itemId,
			body: req.body.itemId,
			weapon: req.body.itemId
		}, {fields: [field]})
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
	let data = {};
	db.User.findOne({
		where: { id: id }
	}).then(user => {
		data.username = user.username;
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
				data.head.attack = 0,
				data.head.mattack = 0,
				data.head.defend = 0,
				data.head.mdefend = 0,
				data.head.hp = 0
			} else {
				data.head = head;
			}
			return db.Item.findOne({
				where: { id: character.body },
				raw: true
			})
		}).then(body => {
			data.body = {};
			if (body === null) {
				data.body.attack = 0,
				data.body.mattack = 0,
				data.body.defend = 0,
				data.body.mdefend = 0,
				data.body.hp = 0
			} else {
				data.body = body;
			}
			return db.Item.findOne({
				where: { id: character.weapon },
				raw: true
			})
		}).then(weapon => {
			data.weapon = {};
			if (weapon === null) {
				data.weapon.attack = 0,
				data.weapon.mattack = 0,
				data.weapon.defend = 0,
				data.weapon.mdefend = 0,
				data.weapon.hp = 0
			} else {
				data.weapon = weapon;
			}
		});
	}).then(result => {
		res.status(200).json(data);
	}).catch(err => {
		console.log(err);
		res.sendStatus(500);
	});
});

router.post("/findPlayer", isLoggedIn, (req, res) => {
	res.status(200).json({playerId: 15});
});

router.get("/getOpponent", isLoggedIn, (req,res) => {
	res.status(200).json({playerId: 14});
});


module.exports = router;
