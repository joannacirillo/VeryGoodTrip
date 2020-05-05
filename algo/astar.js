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
    // Euclidean distance --> useful
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
                return [this.buildPath(best, []), this.time + app.map.getCost(current,best)];

            if(this.time + app.map.getCost(current, best) + app.map.getCost(best,target_node) <= maxT){
                this.time += app.map.getCost(current,best);
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
        this.open = app.map.data;
        this.time = 0;
        this.maxTime = 0;
        return this;
    }
};

//--------------------------------------

n1= new app.Node(0,0,0);
n2= new app.Node(1,1,2);
n3= new app.Node(5,6,10);
n4= new app.Node(10,10,1);


var main = {
    findPath: function () {
    	app.map.setData([n1, n2, n3, n4]);
        var path = app.pathFinder.findPath(n1, n4, 30);
        console.log("Done");
        console.log(path);
    }
};

main.findPath();

