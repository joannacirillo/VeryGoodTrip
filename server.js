const express = require('express');
const body = require('body-parser');

const cors = require('cors');
const mongoose = require('mongoose');
const Places_Schemes = require('./places'); // on importe le modele

mongoose.set('debug', true);


mongoose.connect('mongodb://localhost:27017/pweb', {useNewUrlParser:true}); //ici changer le nom de la DB


let app = express();
app.use(body());
app.use(cors());
let port = 8080;

app.listen(port, () => {
    console.log('le serveur fonctionne')
});

var crypto = require('crypto');
app.use(cors());

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

  passport.use(new LocalStrategy(
    function(username, password, done) {
        Users_Schemes.findOne({username : username}, function(err, user) {
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

const Users_Schemes = require('./users'); //import model for user authentification
const Profiles_Schemes = require('./profiles'); //model for user preferences
mongoose.set('debug', true);

/*
----------------------------------------------------
Users : login and sign up
----------------------------------------------------
*/
app.post('/signup',function(req,res){

    username = req.body.username;
    password = req.body.password;

    if(password!=null){
        Users_Schemes.findOne({username : username}, function(err,user){
            if(err) throw err;
            if(user==null){
                var user_id = crypto.createHash('sha256').update(req.body.username).digest('hex');
                Users_Schemes.insertMany({username : req.body.username, user_id : user_id ,password : password});
                Profiles_Schemes.insertMany({user_id : user_id});
                res.redirect('/success?username='+username);
            } else {
                res.status(403).send("Nom d'utilisateur déjà utilisé, veuillez en saisir un autre.");
            }
        })
    } else {
        res.send("Veuillez saisir un mot de passe !");
    }
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/error' }),function(req, res) {
    res.redirect('/success?username='+req.user.username);
});

app.get('/success', function(req, res) {
    Users_Schemes.findOne({username : req.query.username}, function(err,user){
        if(err) throw err;
        res.send(user.user_id);
    });
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });


app.get('/error',function(req,res){
    res.status(401).send("Nom d'utilisateur ou mot de passe erroné");
});

/*
----------------------------------------------------
Users : preferences
----------------------------------------------------
*/

app.post('/preferences/get',function(req,res){
    Profiles_Schemes.find({user_id : req.body.user_id},function(err,result){
        if(err) throw err;
        res.send(result);
    })
});

//Input from client : JSON containing all the preferences
app.put('/preferences/set',function(req,res){
    
    cluster = req.body.cluster;
    interests = req.body.interests;
    culinary_pref = req.body.culinary_pref;
    historical = req.body.historical;
    disability = req.body.disability;

    Profiles_Schemes.updateOne(
        {user_id : req.body.user_id,},
        {$set : {cluster : cluster, interests : interests, culinary_pref : culinary_pref, historical : historical},
        $set : {disability : disability}}
        ,function(err){
            if(err) throw err;
            res.send("Préférences mises à jour !");
        }
    );
    
});



/*
----------------------------------------------------
get sur la BD pour récupérer coord + val_intérêt
----------------------------------------------------
*/

app.post('/:depart_long/:depart_lat/:arrivee_long/:arrivee_lat/:date/:duree/:CITY/:CULTURE/:DRINK/:EAT/:HISTORICAL/:NATURE/:RELIGIOUS/:SHOPPING/:SNACKS/:wheelchair/:transport', function(req, res) { // création de la route sous le verbe get
    //mongoose.set('debug', true);
    array = [];
    type = null;
    data_set = [];

    depart_long = req.params.depart_long;
    depart_lat = req.params.depart_lat;
    arrivee_long = req.params.arrivee_long;
    arrivee_lat = req.params.arrivee_lat;

    //console.log(mongoose.connection.readyState);

    //borne du rectangle de sélection des centres d'interet
    borne_inf_long = Math.min(depart_long, arrivee_long) - 0.003;
    //console.log(borne_inf_long);
    borne_inf_lat = Math.min(depart_lat, arrivee_lat) - 0.003;
    //console.log(borne_inf_lat);
    borne_sup_long = Math.max(depart_long, arrivee_long) + 0.003;
    //console.log(borne_sup_long);
    borne_sup_lat = Math.max(depart_lat, arrivee_lat) + 0.003;
    //console.log(borne_sup_lat);

    //GET VITESSE
    var vitesse = 0;
    if(req.params.transport == "VELO"){
        vitesse = 0.25;
    }else if(req.params.transport == "PIED"){
        vitesse = 0.083;
    }else if(req.params.transport == "VOITURE"){
        vitesse = 0.417;
    }

    //GET TEMPS
    var temps_parcours = req.params.duree;


    const object = {1:"CITY",2:"CULTURE",3:"DRINK",4:"EAT",5:"HISTORICAL",6:"NATURE",7:"RELIGIOUS",8:"SHOPPING",9:"SNACKS"};

    //REQUEST
    //On ne peut pas faire de requête avec null, sinon ne renvoie rien
    for(c=1;c<10;c++)
    {
        var clusterVal = 0;
        
        if(object[c]==="CITY"){
            clusterVal = req.params.CITY;
        }else if(object[c]==="CULTURE"){
            clusterVal = req.params.CULTURE;
        }else if(object[c]==="DRINK"){
            clusterVal = req.params.DRINK;
        }else if(object[c]==="EAT"){
            clusterVal = req.params.EAT;
        }else if(object[c]==="HISTORICAL"){
            clusterVal = req.params.HISTORICAL;
        }else if(object[c]==="NATURE"){
            clusterVal = req.params.NATURE;
        }else if(object[c]==="RELIGIOUS"){
            clusterVal = req.params.RELIGIOUS;
        }else if(object[c]==="SHOPPING"){
            clusterVal = req.params.SHOPPING;
        }else if(object[c]==="SNACKS"){
            clusterVal = req.params.SNACKS;
        }
        if(clusterVal > 0)
        {
            array.push(object[c]);
        }
    }

    // console.log(">>array");
    // console.log(array);
    // console.log(">>end of array");
    var interests = [];
    var culinary_pref_bd = []; //liste des mangers
    //Ici on affine les données en fonction des pref utilisateurs
    var id = req.body.id;
    if(id != 1)
    {
        Profiles_Schemes.find({"user_id":id},{"_id":0,"interests":1, "culinary_pref":1, "disability":1}, function(err, res){
            if (err) throw err;

            /*
            console.log(">>res");
            console.log(res);
            console.log(">>end of res");
            */
            interests = res[0].interests; //liste des interets

            var culinary_pref_user = res[0].culinary_pref;

            culinary_pref_user.forEach(function(c){
                if(c === "Americain"){
                    //console.log("America fuck yeah!");
                    culinary_pref_bd.push("american","bagel","burger","steak_house");
                }else if(c === "Asiatique"){
                    culinary_pref_bd.push("asian","korean","thai","vietnamese");
                }else if(c === "Chinois"){
                    culinary_pref_bd.push("chinese");
                }else if(c === "Friterie"){
                    culinary_pref_bd.push("belgian");
                }else if(c === "Italien"){
                    culinary_pref_bd.push("italian","pizza");
                }else if(c === "Japonais"){
                    culinary_pref_bd.push("japanese","sushi");
                }else if(c === "Mexicain"){
                    culinary_pref_bd.push("mexican");
                }else if(c === "Oriental"){
                    culinary_pref_bd.push("african","indian","lebanese","maghreb","tunisian","turkish");
                }else if(c === "Poissons"){
                    culinary_pref_bd.push("mediterranean","sea_food");
                }else if(c === "Regional"){
                    culinary_pref_bd.push("bistro","brasserie","french","regional");
                }else if(c === "Sandwich"){
                    culinary_pref_bd.push("greek","kebab","sandwich","spanish","tacos","tapas");
                }else if(c === "Vegetarien"){
                    culinary_pref_bd.push("salad","vegetarian;vegan");
                }
            });
        });
    }
    
    //console.log(mongoose.connection.readyState);

    Places_Schemes.find({$and:[{"geometry.coordinates": {
        $geoWithin: {
           $box: [
             [ borne_inf_long, borne_inf_lat],
             [ borne_sup_long, borne_sup_lat ]
           ]
        }
     }}, {type:{"$in":array}}]},{"_id":0,"geometry.coordinates":1, "type":1,"properties.name":1, "properties.type":1, "properties.cuisine":1},function(err, result){
        if (err) throw err;

        /*
        console.log(">>result");
        console.log(result);
        console.log(">>end of result");
        */
        
        //Setting points for the calculation
        result.forEach(function(doc){

            if(doc.type=="CITY"){
                clusterVal = req.params.CITY;
            }else if(doc.type=="CULTURE"){
                clusterVal = req.params.CULTURE;
            }else if(doc.type=="DRINK"){
                clusterVal = req.params.DRINK;
            }else if(doc.type=="EAT"){
                clusterVal = req.params.EAT;
            }else if(doc.type=="HISTORICAL"){
                clusterVal = req.params.HISTORICAL;
            }else if(doc.type=="NATURE"){
                clusterVal = req.params.NATURE;
            }else if(doc.type=="RELIGIOUS"){
                clusterVal = req.params.RELIGIOUS;
            }else if(doc.type=="SHOPPING"){
                clusterVal = req.params.SHOPPING;
            }else if(doc.type=="SNACKS"){
                clusterVal = req.params.SNACKS;
            }
            
            //GET COORD
            var long = doc.geometry.coordinates[0];
            var lat = doc.geometry.coordinates[1];
            var name = doc.properties.name;

            //GET INTEREST
            var i = parseInt(clusterVal);
            var cuisine = doc.properties.cuisine;
            var type = doc.properties.type;
            if(culinary_pref_bd.find(element => element === cuisine) !== undefined)
                i += 3;
            if(interests.find(element => element === type) !== undefined)
                i += 3;

            //GET TRAVEL TIME
            var time = 0;
            
            if(type === "memorial" || type === "monument" || type === "fountain" || type === "gate" || type === "bridge" || type === "building" || type === "city_gate")
                time = 5;
            else if(type === "shops" || type === "beauty" || type === "bakery" || type === "sugar" || type === "ice_cream" || type === "park")
                time = 10;
            else if(type === "ruins" || type === "church" || type === "place_of_worship" || type === "books" || type === "games" || type === "supermarket" || type === "pub" || type === "bar" || type === "biergarten" || type === "cafe")
                time = 15;
            else if(type === "art" || type === "archaeological_site" || type === "fast_food")
                time = 30;
            else if(type === "castle" || type === "museum" || type === "restaurant")
                time = 45;

            //IF TETE D'OR 
            if(name === "Parc de la Tête d'Or")
                time = 60;

            //CREATE NODE
            n = new algo.Node(long, lat, i, name, time);
            //console.log(n);
            data_set.push(n);
            //console.log();
            
        }); 
        //console.log(data_set); //contient tous les nodes
        console.log("*********************************************************************");

       

        //CALCUL du plus cours chemin de depart à arrivee, passant pas les points contenus dans result
        depart_node = new algo.Node(depart_long,depart_lat,0,"Depart");
        arrivee_node = new algo.Node(arrivee_long,arrivee_lat,0,"Arrivee",0);
        data_set.push(arrivee_node); //on ajoute le point d'arrivee a la liste

        //console.log(req.params.duree);
        algo.map.setData(data_set);  
        //console.log(algo.map); 
        var path = algo.pathFinder.findPath(depart_node, arrivee_node, temps_parcours, vitesse);
        //console.log(path); //ici le chemin (a traiter pour remonter dans la bd)
        
        console.log("Done");
        res.send(path);
        });
    });





/*
----------------------------------------------------
ALGO.js -> test d'implémentation
----------------------------------------------------
*/

var algo = algo || {};

//--------------------------------------

algo.Node = function (x, y, i=0, name, t=2) {
    this.long = x;
    this.lat = y;

    this.interest = i;
    this.travel_time = t;
    this.name = name;
    this.parent =null;
  
};

//--------------------------------------

var _private = {
    // Euclidean distance
    distanceE: function (current, target) {
        var dx = target.long - current.long, dy = target.lat - current.lat;
        return Math.sqrt((dx * dx) + (dy * dy));
    },

    // Manhattan distance
    distanceM: function (current, target) {
        var dx = Math.abs(target.long - current.long), dy = Math.abs(target.lat - current.lat);
        return dx + dy;
    },
    
    //Geographical distance
    distanceG: function (current, target){
        var dx = target.long-current.long;
        return Math.acos(Math.sin(this.radians(current.lat))*Math.sin(this.radians(target.lat)) + 
            Math.cos(this.radians(current.lat))*Math.cos(this.radians(target.lat)) * Math.cos(this.radians(dx)))*6371;
    },
    
    radians: function(degrees){
        var pi = Math.PI;
        return degrees * (pi/180);
    },

    outOfBounds: function (target) { // to code real coordinates
        return target.long < 0 || target.long >= 2000 ||
            target.lat < 0 || target.lat >= 2000;
    }
};

//--------------------------------------

algo.map = {
    // Current map
    data: null,

    setData: function (map) {
        this.data = map;
        return this;
    },

    blocked: function (target) {
        if (_private.outOfBounds(target)) {
            return true;
        }

        return false;
    },

    getNeighbors: function (target) {
        console.log(this.data);
        console.log("\n -------------------- \n");
        return this.data;
    },

    getHerustic: function (current_node, target_node, t_max, spd) {
        return target_node.interest*(1-(_private.distanceG(current_node, target_node)*spd/t_max)*(_private.distanceG(current_node, target_node)*spd/t_max));
    }
};



//--------------------------------------



// Pathfinder API - Returns a path to the target
algo.pathFinder = {
    // Visited nodes
    closed: [],

    // Available nodes 
    open: [],

    // Maximum time before shutting down a closed path
    time: 0,

    addOpen: function (node, parent=null) {
        node.parent = parent;
        this.open.push(node);
        return this;
    },

    // Remove a node that already exists
    removeOpen: function (node) {
        for (var i = 0; i < this.open.length; i++) {
            if (this.open[i] === node) this.open.splice(i, 1);
        }
        return this;
    },

    // Check if the node is already in the open set
    inOpen: function (node) {
        for (var i = 0; i < this.open.length; i++) {
            if (this.open[i].long === node.long && this.open[i].lat === node.lat)
                return this.open[i];
        }

        return false;
    },

    // Get the highest interest node in the open set
    getBestOpen: function (current_node, t_max, spd) {
        var bestNode = 0;
        for (var i = 0; i < this.open.length; i++) {
            if (algo.map.getHerustic(current_node, this.open[i], t_max, spd) > algo.map.getHerustic(current_node, this.open[bestNode], t_max, spd)) bestNode = i;
        }

        return this.open[bestNode];
    },

    addClosed: function (node) {
        this.closed.push(node);
        return this;
    },

    // Check if the node is already in the closed set
    inClosed: function (node) {
        for (var i = 0; i < this.closed.length; i++) {
            if (this.closed[i].long === node.long && this.closed[i].lat === node.lat)
                return this.closed[i];
        }

        return false;
    }, 

    findPath: function (current_node, target_node, t_max, spd) {     
        var current,
            best;
        var allowed;

        var has_snack = 0;
        var has_food = 0;
        var has_drink = 0;

        //Reset
        this.reset();

        //Initiate the first node
        current = current_node;

        while(this.open.length !== 0 || this.time < t_max) {
            allowed = true;
            best = this.getBestOpen(current, t_max, spd);
            //console.log("best node is : " + best.long + " " + best.lat);
            best.parent = current;

            if(best.long === target_node.long && best.lat === target_node.lat)
            {
                //return [this.buildPath(best, []), this.time + _private.distanceG(current,best)];
                return [best, this.time + _private.distanceG(current,best)/spd + best.travel_time];
            }

            if(this.time + _private.distanceG(current, best)/spd + _private.distanceG(best,target_node)/spd + best.travel_time <= t_max){
                if(best.name != null){
                    //CHECK REDUNDANT SNACKS
                    if(best.name.search("Boulangerie") != -1 || best.name.search("Glacier") != -1 || best.name.search("Sucrerie") != -1){
                        //console.log("BOULANGERIE!");
                        if(has_snack > 0)
                            allowed = false;
                        has_snack++;
                    }

                    //CHECK REDUNDANT EATING PLACES
                    if(best.name.search("Restaurant") != -1 || best.name.search("Cafe") != -1 || best.name.search("Fast food") != -1){
                        //console.log("RESTO!");
                        if(has_food > 0)
                            allowed = false;
                        has_food++;
                    }

                    //CHECK REDUNDANT DRINKING PLACES
                    if(best.name.search("Boire") != -1 || best.name.search("Cafe") != -1 || best.name.search("Pub") != -1 || best.name.search("Bar") != -1){
                        //console.log("BOIRE!");
                        if(has_drink > 0)
                            allowed = false;
                        has_drink++;

                    }
                }   

                //console.log(allowed);
                if(allowed){
                    this.time += _private.distanceG(current,best)/spd + best.travel_time;
                    console.log("==========");
                    console.log("new time is : " + this.time + " minutes");
                    console.log("from :" + current);
                    console.log("to :" + best);
                    console.log("==========");
                    current = best;
                }
            }
            this.removeOpen(best);
        }


    },

    /*
    // Recursive path buliding method
    buildPath: function (node, stack) {
        stack.push(node);
        //console.log(node);
        if (node.parent != null) {
            return this.buildPath(node.parent, stack);
        } else {
            return stack;
        }
    },
    */

    reset: function () {
        this.closed = [];
        this.open = algo.map.data;
        this.time = 0;
        return this;
    }
};
