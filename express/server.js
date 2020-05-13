const express = require('express');
const body = require('body-parser');
const cors = require('cors');

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {
    Users.findOne({ "username" : username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user._id);
    });
  }
));


const mongoose = require('mongoose');
const Schemes = require('./places'); // on importe le modele
const Users = require('./users');

mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser:true}); //ici changer le nom de la DB


let app = express();
app.use(body());
app.use(cors());
let port = 8080;

app.listen(port, () => {
    console.log('le serveur fonctionne')
});

/*
----------------------------------------------------
Gestion Utilisateurs
----------------------------------------------------
*/

app.post('/login',function(req, res){
        
    console.log("Post ok !");
    passport.authenticate("local"),function(err,user,info){
        console.log("Ici 0 !")
        if(err) {
            console.log("Ici 1 !");
            return res.status(400).json({errors :err});
        }

        if(!user){
            console.log("Ici 2 !");
            return res.status(400).json({errors : "No user found"});
        }
        req.logIn(user,function(err){
            if(err) {
                console.log("Ici 3 !");
                return res.status(400).json({errors : err});
            }

            console.log("Ici 4 !");

            return res.status(200).json({success : 'logged in ${user.id}'});
        })
        res.redirect('/users/' + req.user.userid);
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
----------------------------------------------------
get sur la BD pour récupérer coord + val_intérêt
----------------------------------------------------
*/

app.get('/:depart_long/:depart_lat/:arrivee_long/:arrivee_lat/:date/:duree/:CITY/:CULTURE/:CULTURE_SHOPS/:DRINK/:EAT/:HISTORICAL/:NATURE/:RELIGIOUS/:SHOPPING/:SNACKS/:wheelchair/:takeaway/:cuisine', function(req, res) { // création de la route sous le verbe get
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

    const object = {1:"CITY",2:"CULTURE",3:"CULTURE_SHOPS",4:"DRINK",5:"EAT",6:"HISTORICAL",7:"NATURE",8:"RELIGIOUS",9:"SHOPPING",10:"SNACKS"};

    //REQUEST
    //On ne peut pas faire de requête avec null, sinon ne renvoie rien
    for(c=1;c<11;c++)
    {
        var clusterVal = 0;
        
        if(object[c]==="CITY"){
            clusterVal = req.params.CITY;
        }else if(object[c]==="CULTURE"){
            clusterVal = req.params.CULTURE;
        }else if(object[c]==="CULTURE_SHOPS"){
            clusterVal = req.params.CULTURE_SHOPS;
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

    //console.log(mongoose.connection.readyState);

    Schemes.find({$and:[{"geometry.coordinates": {
        $geoWithin: {
           $box: [
             [ borne_inf_long, borne_inf_lat],
             [ borne_sup_long, borne_sup_lat ]
           ]
        }
     }}, {type:{"$in":array}}]},{"_id":0,"geometry.coordinates":1, "type":1,"properties.name":1},function(err, result){
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
            }else if(doc.type=="CULTURE_SHOPS"){
                clusterVal = req.params.CULTURE_SHOPS;
            }else if(doc.type=="DRINK"){
                clusterVal = req.params.DRINK;
            }else if(doc.type=="EAT"){
                clusterVal = req.params.EAT;
                if(req.params.cuisine!=null && doc.properties.cuisine == req.params.cuisine){
                    clusterVal+=2;
                }
                if(req.params.takeaway!=null && doc.properties.takeaway == req.params.takeaway){
                    clusterVal+=2;
                }
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
            var i = clusterVal;

            n = new algo.Node(long, lat, i, name);
            //console.log(n);
            data_set.push(n);
            //console.log();
            
        }); 
        //console.log(data_set); //contient tous les nodes
        console.log("*********************************************************************");

        //CALCUL du plus cours chemin de depart à arrivee, passant pas les points contenus dans result
        depart_node = new algo.Node(depart_long,depart_lat,0,"Depart");
        arrivee_node = new algo.Node(arrivee_long,arrivee_lat,0,"Arrivee");
        data_set.push(arrivee_node); //on ajoute le point d'arrivee a la liste

        //console.log(req.params.duree);
        algo.map.setData(data_set);  
        //console.log(algo.map); 
        var path = algo.pathFinder.findPath(depart_node, arrivee_node, req.params.duree);
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

algo.Node = function (x, y, i=0,name) {
    this.long = x;
    this.lat = y;

    this.interest = i;
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

    getCost: function (current_node, target_node) {
        return _private.distanceG(current_node, target_node);
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
    getBestOpen: function () {
        var bestNode = 0;
        for (var i = 0; i < this.open.length; i++) {
            if (this.open[i].interest > this.open[bestNode].interest) bestNode = i;
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

    findPath: function (current_node, target_node, maxT) {     
        var current,
            best;

        //Reset
        this.reset();

        //Initiate the first node
        current = current_node;

        while(this.open.length !== 0 || this.time < maxT) {
            best = this.getBestOpen();
            //console.log("best node is : " + best.long + " " + best.lat);
            best.parent = current;

            if(best.long === target_node.long && best.lat === target_node.lat)
                return [this.buildPath(best, []), this.time + algo.map.getCost(current,best)];

            if(this.time + algo.map.getCost(current, best) + algo.map.getCost(best,target_node) <= maxT){
                this.time += algo.map.getCost(current,best);
                //console.log("new time is : " + this.time);
                current = best;
            }
            this.removeOpen(best);
        }


    },

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

    reset: function () {
        this.closed = [];
        this.open = algo.map.data;
        this.time = 0;
        this.maxTime = 0;
        return this;
    }
};
