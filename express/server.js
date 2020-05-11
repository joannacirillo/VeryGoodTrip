const express = require('express');
const body = require('body-parser');

const cors = require('cors');
const mongoose = require('mongoose');
const Schemes = require('./places'); // on importe le modele

mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser:true});


let app = express();
app.use(body());
app.use(cors());
let port = 8080;

app.listen(port, () => {
    console.log('le serveur fonctionne')
});

/*
//SNACKS SHOPPING CULTURE_SHOPS CULTURE HISTORICAL RELIGIOUS
app.get('/:cluster/:wheelchair', function(req, res) { // création de la route sous le verbe get
    mongoose.set('debug', true);
    wheelchair=null;
    //console.log(mongoose.connection.readyState);
    if(req.params.cluster!="null"){
        cluster = [req.params.cluster];
    } else {
        cluster = ["SNACKS","CULTURE_SHOPS","SHOPPING","RELIGIOUS"];
    }
    
    if(req.params.cluster==null){
        res.send("Spécifier le genre ou le type de lieu");
    }
    //Setting wether a wheelchair access is required in the request
    if(req.params.wheelchair!="null"){
        wheelchair = req.params.wheelchair;
    }
    array = ["yes"];
    if(wheelchair == null || wheelchair=="no"){
        array=array.concat([null,"no","limited"]);
    } else if(wheelchair=="limited"){
        array = ["limited","yes"];
    }
    //REQUEST
    //On ne peut pas faire de requête avec null, sinon ne renvoie rien
    Schemes.find({"type" : cluster, "properties.wheelchair" : {"$in" : array},},
    {"_id":0,"properties.type":1,"type" : 1},function(err, result){
        if (err) throw err;
        // //Setting points for the calculation
        // result.forEach(function(doc){
        //     if(document.type){
        //     }
        // });
        //CALCUL du plus cours chemin de departure à destination, passant pas les points contenus dans result
        console.log(result);
        res.send(result);
    });
});
//EAT DRINK
app.get('/:cluster/:wheelchair/:cuisine/:delivery/:takeway', function(req, res) {
    mongoose.set('debug', true);
    cluster = null;
    type = null;
    wheelchair=null;
    //console.log(mongoose.connection.readyState);
    if(req.params.cluster!="null"){
        cluster = [req.params.cluster];
    } else {
        cluster = ["DRINK","EAT"];
    }
    //Setting wether a wheelchair access is required in the request
    if(req.params.wheelchair!="null"){
        wheelchair = req.params.wheelchair;
    }
    array = ["yes"];
    if(wheelchair == null || wheelchair=="no"){
        array=array.concat([null,"no","limited"]);
    } else if(wheelchair=="limited"){
        array = ["limited","yes"];
    }
    //Setting the type of cuisine required
    cuisine = null
    if(req.params.cuisine!="null"){
        cuisine=req.params.cuisine;
    }
    //Settting wether delivery is required
    delivery=["yes","no",null];
    if(req.params.delivery=="yes"){
        delivery=[req.params.delivery];
    }
    //Setting wether takeaway is required
    takeaway=["yes","no",null];
    if(req.params.takeaway=="yes"){
        takeaway=[req.params.takeaway];
    }
    //REQUEST
    //On ne peut pas faire de requête avec null, sinon ne renvoie rien
    Schemes.find({"type" : {"$in" : cluster} , "properties.wheelchair" : {"$in" : array},
    "properties.cuisine" : cuisine, "properties.delivery" : {"$in" : delivery},"properties.takeaway" : {"$in" : takeaway}},
    {"_id":0,"properties.type":1,"type":1},function(err, result){
        if (err) throw err;
        // //Setting points for the calculation
        // result.forEach(function(doc){
        //     if(document.type){
        //     }
        // });
        //CALCUL du plus cours chemin de departure à destination, passant pas les points contenus dans result
        console.log(result);
        res.send(result);
    });
});
//CITY
app.get('/CITY', function(req, res) { // création de la route sous le verbe get
    mongoose.set('debug', true);
    type = null;
    //console.log(mongoose.connection.readyState);
    //REQUEST
    //On ne peut pas faire de requête avec null, sinon ne renvoie rien
    Schemes.find({"type" : "CITY"},
    {"_id":0,"properties.type":1,"type" : 1},function(err, result){
        if (err) throw err;
        // //Setting points for the calculation
        // result.forEach(function(doc){
        //     if(document.type){
        //     }
        // });
        //CALCUL du plus cours chemin de departure à destination, passant pas les points contenus dans result
        console.log(result);
        res.send(result);
    });
});
app.post('/', async (req, res) => {
    type = req.body.type;
    properties = req.body.properties;
    coordinates = req.body.geometry.coordinates;
    const new_place = new Schemes({
        type : type,
        properties : properties,
        geometry : {
            type : "Point",
            coordinates : coordinates
        }
    })
    await new_place.save() // sauvegarde asynchrone du nouveau livre
    res.json(new_place);
    return
})
*/

/*
----------------------------------------------------
get sur la BD pour récupérer coord + val_intérêt
----------------------------------------------------
*/

app.get('/:depart_long/:depart_lat/:arrivee_long/:arrivee_lat/:date/:duree/:CITY/:CULTURE/:CULTURE_SHOPS/:DRINK/:EAT/:HISTORICAL/:NATURE/:RELIGIOUS/:SHOPPING/:SNACKS/:wheelchair', function(req, res) { // création de la route sous le verbe get
    mongoose.set('debug', true);
    type = null;
    data_set = [];
    depart_long = req.params.depart_long;
    depart_lat = req.params.depart_lat;
    arrivee_long = req.params.arrivee_long;
    arrivee_lat = req.params.arrivee_lat;
    //console.log(mongoose.connection.readyState);

    //borne du rectangle de sélection des centres d'interet
    borne_inf_long = Math.min(depart_long, arrivee_long) - 0.003;
    borne_inf_lat = Math.min(depart_lat, arrivee_lat) - 0.003;
    borne_sup_long = Math.max(depart_long, arrivee_long) + 0.003;;
    borne_sup_lat = Math.max(depart_lat, arrivee_lat) + 0.003;


    //REQUEST
    //On ne peut pas faire de requête avec null, sinon ne renvoie rien
    for(CLUSTER in ["CITY","CULTURE","CULTURE_SHOPS","DRINK","EAT","HISTORICAL","NATURE","RELIGIOUS","SHOPPING","SNACKS"])
    {
        console.log(req.params.CLUSTER);
        if(req.params.CLUSTER > 0)
        {
            console.log("Ici");
            Schemes.find({$and:[{"geometry.coordinates.0": {$gte : borne_inf_long, $lte : borne_sup_long}},{"geometry.coordinates.1": {$gte : borne_inf_lat, $lte : borne_sup_lat}}, {type:CLUSTER}]},{"_id":0,"geometry.coordinates":1,"properties.name":1}).toArray(function(err, result){
                if (err) throw err;

                //Setting points for the calculation
                result.forEach(function(doc){
                    //GET COORD
                    var long = doc.geometry.coordinates[0];
                    var lat = doc.geometry.coordinates[1];

                    //GET INTEREST
                    var i = req.params.CLUSTER;

                    n = new algo.Node(long, lat, i);
                    data_set.push(n);
                });
                
            });
        }
    }

    console.log(data_set); //contient tous les nodes
    console.log("*********************************************************************");

    //CALCUL du plus cours chemin de depart à arrivee, passant pas les points contenus dans result
    depart_node = new algo.Node(depart_long,depart_lat,0);
    arrivee_node = new algo.Node(arrivee_long,arrivee_lat,0);
    data_set.push(arrivee_node); //on ajoute le point d'arrivee a la liste

    algo.map.setData(data_set);   
    var path = algo.pathFinder.findPath(depart_node, arrivee_node, req.params.duree);
    console.log(path); //ici le chemin (a traiter pour remonter dans la bd)
    console.log("Done");
    res.send(path);


});



/*
----------------------------------------------------
ALGO.js -> test d'implémentation
----------------------------------------------------
*/

var algo = algo || {};

//--------------------------------------

algo.Node = function (x, y, i=0) {
    this.x = x;
    this.y = y;

    this.interest = i;
    this.parent =null;
};

//--------------------------------------

var _private = {
    // Euclidean distance
    distanceE: function (current, target) {
        var dx = target.x - current.x, dy = target.y - current.y;
        return Math.sqrt((dx * dx) + (dy * dy));
    },

    // Manhattan distance
    distanceM: function (current, target) {
        var dx = Math.abs(target.x - current.x), dy = Math.abs(target.y - current.y);
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
        return target.x < 0 || target.x >= 2000 ||
            target.y < 0 || target.y >= 2000;
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
            if (this.open[i].x === node.x && this.open[i].y === node.y)
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
            if (this.closed[i].x === node.x && this.closed[i].y === node.y)
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
            console.log("best node is : " + best.x + " " + best.y);
            best.parent = current;

            if(best.x === target_node.x && best.y === target_node.y)
                return [this.buildPath(best, []), this.time + algo.map.getCost(current,best)];

            if(this.time + algo.map.getCost(current, best) + algo.map.getCost(best,target_node) <= maxT){
                this.time += algo.map.getCost(current,best);
                console.log("new time is : " + this.time);
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
