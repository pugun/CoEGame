var express = require('express');
var router = express.Router();
var db = require('./../models');
var sequelize = require('sequelize');
var passport = require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("Not login");
}

router.post("/login", passport.authenticate("local"), (req, res) => {
	res.send("Login successfully");
});

router.get("/logout", isLoggedIn, (req, res) => {
	req.logout();
	res.status(200).redirect("/");
});

router.post("/registerUser", (req, res) =>{
  var bcrypt = require("bcryptjs");
  bcrypt.hash(req.body.password, 10).then(hash => {
    return db.User.create({
      username: req.body.username,
      password: hash,
      faculty: req.body.faculty,
      gender: req.body.gender

    }).then(user => {
      res.sendStatus(200);
    }, reason =>{
      console.log(reason);
      res.sendStatus(500);
    });
  }, reason => {
    console.log(reason);
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

module.exports = router;
