var bCrypt = require("bcryptjs");
const util = require("util")

module.exports = function(passport,user){
    var User = user;
    var LocalStrategy = require("passport-local").Strategy;
    // var FacebookStrategy = require("passport-facebook").Strategy;
  
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
  
    passport.deserializeUser(function(id, done) {
        User.findById(id).then(function(user) {
            if(user){
                done(null, user.get());
            }
            else{
                done(user.errors,null);
            }
        });
    });

    // passport.use("facebook", new FacebookStrategy({
    //     // clientID        : "148303692510367",
    //     // clientSecret    : "1e71006976ad83aff0666c64c45730bb",
    //     clientID        : "245313219344056",
    //     clientSecret    : "a89630447a805b8f53b8ea92feb2a9fe",
    //     callbackURL     : "http://localhost:3000/api/auth/facebook/callback",
    //     profileFields   : ["id", "displayName", "email", "first_name", "last_name"]
    // }, function(accessToken, refreshToken, profile, cb) {
    //     User.findOne({
    //         where : { FacebookID : profile._json.id }
    //     }).then(function(user){
    //         if (user) {
    //             return cb(null, user);
    //         } else {
    //             User.create({
    //                 FacebookID : profile._json.id,
    //                 Username : profile._json.name,
    //                 Password : "Facebook",
    //                 FacebookID : profile._json.id,
    //                 FirstName : profile._json.first_name,
    //                 LastName : profile._json.last_name,
    //                 Email : profile._json.email
    //             }).then(function(newUser){
    //                 return cb(null, newUser);
    //             }, reason => {
    //                 console.log(reason);
    //             });
    //         }
    //     }), reason => {
    //         console.log(reason);
    //     };
    // }));

    //check login
    passport.use("local", new LocalStrategy(  
    {
        usernameField : "username",
        passwordField : "password"
    },
    function(username, password, done) {
        var User = user;
        var isValidPassword = function(userpass,password){
            return bCrypt.compareSync(password, userpass);
        }

        User.findOne({ where : { username: username}}).then(function (user) {
            if (!user) {
                return done(null, false, { message: "User does not exist" });
            }
            if (!isValidPassword(user.password, password)) {    
                return done(null, false, { message: "Incorrect password." });
            }
            if (user.Activated == 0) {    
                return done(null, false, { message: "Not activated." });
            }
  
            var userinfo = user.get();
  
            return done(null,userinfo);
  
        }).catch(function(err){
            console.log("Error:",err);
            return done(null, false, { message: "Something went wrong with your Signin" });
        });  
    }));
}