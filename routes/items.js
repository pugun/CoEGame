var express = require('express');
var router = express.Router();
var db = require('../models');
var sequelize = require('sequelize');
var passport = require('passport');


function isLoggedIn(req, res, next) {
  return next();
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("Not login");
}

router.post("/addItem", isLoggedIn, (req, res) => {
  db.Item.create({
    attack: req.body.attack,
    mattack: req.body.mattack,
    defend: req.body.defend,
    mdefend: req.body.mdefend,
    hp: req.body.hp,
    slot: req.body.slot,
    description: req.body.description,
    AbilityId: req.body.AbilityId,
    name: req.body.name,
	pic: req.body.pic,
	tier: req.body.tier
  }).then(result => {
    res.sendStatus(200);
  }).catch(err => {
    res.sendStatus(500);
    console.log(err);
  });
});

router.post("/updateItem", isLoggedIn, (req, res) => {
  return db.sequelize.transaction(function (t) {
    return db.User.update({
      attack: req.body.attack,
      mattack: req.body.mattack,
      defend: req.body.defend,
      mdefend: req.body.mdefend,
      hp: req.body.hp,
      slot: req.body.slot,
      description: req.body.description,
      AbilityId: req.body.AbilityId,
	  name: req.body.name,
	  pic: req.body.pic,
	  tier: req.body.tier
    }, {
        where: { id: req.body.id }
      }, { transaction: t });
  }).then(result => {
    res.sendStatus(200);
  }).catch(err => {
    res.sendStatus(500);
    console.log(err);
  });
});

router.post("/qrGen", isLoggedIn, (req, res) => {
  db.Qr.create({
    qrcode: makeid(),
    ItemId: req.body.ItemId
  }).then(result => {
    res.sendStatus(200);
  }).catch(err => {
    res.sendStatus(500);
    console.log(err);
  });
});

//random qrcode
function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

module.exports = router;
