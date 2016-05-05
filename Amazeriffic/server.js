var express = require("express"),
    http = require("http"),
    // import the mongoose library
    mongoose = require("mongoose"),
    app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

server.listen(3000, function(){
	console.log('App listening on port 3000!');
});

app.use(express.static(__dirname + "/client"));
app.use(express.bodyParser());

// connect to the amazeriffic data store in mongo
mongoose.connect('mongodb://localhost/amazeriffic');

// This is our mongoose model for todos
var ToDoSchema = mongoose.Schema({
    description: String,
    tags: [ String ]
});

var ToDo = mongoose.model("ToDo", ToDoSchema);

app.get("/todos.json", function (req, res) {
    ToDo.find({}, function (err, toDos) {
	res.json(toDos);
    });
});

app.post("/todos", function (req, res) {
    console.log(req.body);
    var newToDo = new ToDo({"description":req.body.description, "tags":req.body.tags});
    newToDo.save(function (err, result) {
	if (err !== null) {
	    // the element did not get saved!
	    console.log(err);
	    res.send("ERROR");
	} else {
	    // our client expects *all* of the todo items to be returned, so we'll do
	    // an additional request to maintain compatibility
	    ToDo.find({}, function (err, result) {
		if (err !== null) {
		    // the element did not get saved!
		    res.send("ERROR");
		}
		res.json(result);
	    });
	}
    });
});

io.on('connection', function(socket){
	console.log("user has connected")

	socket.on("disconnect", function() {
        console.log('user disconnected');
    });

	socket.on('todo', function(newTodo){
	    io.emit('todo', newTodo);

	    var tempToDo = new ToDo({
            "description": newTodo.description,
            "tags": newTodo.tags
        });

        tempToDo.save(function(err, res) {
            if (err !== null) {
                console.log(err);
                res.send("ERROR");
            } else {
                ToDo.find({}, function(err, res) {
                    if (err !== null) {
                    	console.log(err);
                        res.send("ERROR");
                    }
                    socket.emit("return from todos", res);
                });
            }
        });
	});
});

