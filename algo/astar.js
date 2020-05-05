var app = app || {};

//--------------------------------------

app.Node = function (x, y, i=0) {
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

    outOfBounds: function (target) { // to code real coordinates
        return target.x < 0 || target.x >= 2000 ||
            target.y < 0 || target.y >= 2000;
    }
};

//--------------------------------------

app.map = {
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
        return _private.distanceE(current_node, target_node);
    }
};



//--------------------------------------



// Pathfinder API - Returns a path to the target
app.pathFinder = {
    // Visited nodes
    closed: [],

    // Available nodes 
    open: [],

    // Nodes count
    nb_nodes: 0,

    // Maximum time before shutting down a closed path
    maxTime: 0,
    time: 0,

    setMaxTime: function(t) {
    	this.maxTime = t;
    },

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
        var current, // Current best open node
            neighbors, // Dump of all nearby neighbor nodes
            neighborTest, // Any pre-existing records of a neighbor
            stepCost, // Dump of a total step score for a neighbor
            i;

        // You must add the starting node
        this.reset().addOpen(current_node);

        console.log(this);
        console.log("\n -------------------- \n");

        while (this.open.length !== 0 || this.time < this.maxTime) {
            current = this.getBestOpen();
            console.log("current :"); console.log(current);

            // Check if goal has been discovered to build a path
            if (current.x === target_node.x && current.y === target_node.y) {
                return this.buildPath(current, []);
            }

            // Move current into closed set
            this.removeOpen(current).addClosed(current);

            // Get neighbors from the map and check them
            neighbors = app.map.getNeighbors(current);
            for (i = 0; i < neighbors.length; i++) {
                // Get cost for a move
                stepCost = app.map.getCost(current, neighbors[i]);

                // Check for the neighbor in the closed set
                neighborTest = this.inClosed(neighbors[i]);
                if (neighborTest)
                    continue;

                // Verify neighbor doesn't exist or new score for it is better
                neighborTest = this.inOpen(neighbors[i]);
                if (!neighborTest) {
                	if(neighbors[i] !== current){
                    	this.addOpen(neighbors[i], current);
                    	this.time += stepCost;
                    	console.log("added node : time = " + this.time)
                    }
                } else {
                    neighborTest.parent = current;
                    neighborTest.nb_steps = current.nb_steps + 1;
                    neighborTest.cost = stepCost;
                }
                
            }
        }

        return false;
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
        this.open = [];
        this.time = 0;
        this.maxTime = 0;
        return this;
    }
};

//--------------------------------------

n1= new app.Node(0,0,0);
n2= new app.Node(1,1,1);
n3= new app.Node(5,6,10);
n4= new app.Node(10,10,1);


var main = {
    findPath: function () {
    	app.map.setData([n1, n2, n3, n4]);
        app.pathFinder.setMaxTime(20);
        var path = app.pathFinder.findPath(n1, n4);
        console.log("Done");
        console.log(path);
    }
};

main.findPath();
