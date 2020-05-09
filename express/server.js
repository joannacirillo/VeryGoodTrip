const express = require('express');
const body = require('body-parser');

const mongoose = require('mongoose');
const Schemes = require('./places'); // on importe le model

mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser:true});
var cors = require('cors');

let app = express();
app.use(body());
app.use(cors());
let port = 8080;

app.listen(port, () => {
    console.log('le serveur fonctionne')
});

app.get('/:x_departure/:y_departure/:x_arrival/:y_arrival', function(req, res){
    ax = req.params.x_departure;
    ay = req.params.y_departure;
    bx = req.params.x_arrival;
    by = req.params.y_arrival;


})

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
        console.log(result);
        res.send(result);
    });
});

//CITY NATURE et sans précision
app.get('/:cluster', function(req, res) {
    mongoose.set('debug', true);
    cluster = req.params.cluster;
    //console.log(mongoose.connection.readyState);


    //REQUEST
    Schemes.find({"type" : cluster},
    {"_id":0,"properties.type":1,"type" : 1},function(err, result){
        if (err) throw err;
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

});
