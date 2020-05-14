const express = require('express');
let app = express();
const body = require('body-parser');
app.use(body());
app.use(body.urlencoded({ extended: true }));

var crypto = require('crypto');

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

  passport.use(new LocalStrategy(
    function(username, password, done) {
        Users.findOne({username : username}, function(err, user) {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false,{ message: 'Incorrect username.' });
            }

            if (user.password != password) {
                return done(null, false,{ message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
  ));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
  });
  
passport.deserializeUser(function(id, cb) {
    User.findById(id, function(err, user) {
        cb(err, user);
    });
});

const mongoose = require('mongoose');
const Users = require('./users'); //import model for user authentification
mongoose.set('debug', true);

mongoose.connect('mongodb://localhost/DatabaseTMP',{useNewUrlParser:true});


let port = 8080;

app.listen(port, () => {
    console.log('le serveur fonctionne')
});

/*
----------------------------------------------------
Users
----------------------------------------------------
*/
app.get('/',function(req,res){
    res.send("Bienvenue sur VeryGoodTrip !");
});


app.post('/signup',function(req,res){

    username = req.body.username;
    
    Users.findOne({username : username}, function(err,user){
        if(err) throw err;
        if(user==null){
            var user_id = crypto.createHash('md5').update(req.body.username).digest('hex');
            var password = crypto.createHash('md5').update(req.body.password).digest('hex');
            Users.insertMany({username : req.body.username, user_id : user_id ,password : password})
            res.redirect('/success?username='+username);
        } else {
            res.send("Nom d'utilisateur déjà utilisé, veuillez en saisir un autre.");
        }
    })
})

app.post('/login', passport.authenticate('local', { successRedirect: '/',failureRedirect: '/error' }),function(req, res) {
    res.redirect('/success?username='+req.user.username);
});

app.get('/success', (req, res) => res.send("Welcome "+req.query.username+"!!"));

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });


app.get('/error',function(req,res){
    res.status(401).send("Nom d'utilisateur ou mot de passe erroné");
});