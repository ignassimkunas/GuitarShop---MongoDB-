var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
mongoose.connect("mongodb://localhost/guitar_shop");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

var guitarSchema = new mongoose.Schema({
	brand: String,
	model: String,
	series: String,
	type: String,
	color: String,
	woods: {
		fingerboard: String,
		body: String,
	},
	img: String,
	owner: String
});

var bassSchema = new mongoose.Schema({
	brand: String,
	model: String,
	series: String,
	type: String,
	stringCount: Number,
	fretNumber: Number,
	color: String,
	woods: {
		fingerboard: String,
		body: String,
	},
	img: String,
	owner: String
});

var Guitar = mongoose.model("Guitar", guitarSchema, 'guitars');
var Bass = mongoose.model("Bass", bassSchema, 'guitars');
var userSchema = new mongoose.Schema({
	username: String,
	password: String,
	guitarCollection: [guitarSchema]
});
var User = mongoose.model("User", userSchema);

app.get("/", function(req, res){
	res.redirect("/guitar_shop");
})
app.get("/guitar_shop", function(req, res){
	Guitar.find({type: "Guitar"}, function(err, allGuitars){
		if (err){
			console.log(err);
		} else{
			res.render("guitarPage", {guitars:allGuitars});
		}
	});
});
app.get("/bass_shop", function(req, res){
	Bass.find({type: "Bass"}, function(err, allBasses){
		if (err){
			console.log(err);
		} else{
			res.render("bassPage", {basses:allBasses});
		}
	});
});
app.get("/queries", function(req, res){
	res.render("queries");
});
app.get("/guitar", function(req, res){
	res.render("guitar");
});
app.get("/bass", function(req, res){
	res.render("bass");
});
app.get("/user", function(req, res){
	res.render("user");
});

app.post("/adduser", function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	var newUser = {username: username, password: password, guitarCollection: []};
	User.create(newUser, function(err, user){
		if (err){
			console.log(err);
		} else{
			res.redirect("/");
		}
	});
})
app.post("/addguitar", function(req, res){
	var brand = req.body.brand;
	var model = req.body.model;
	var series = req.body.series;
	var color = req.body.color;
	var finger = req.body.fingerboard;
	var body = req.body.body;
	var img = req.body.img;
	var newGuitar = {brand: brand, model: model, series: series, type:"Guitar", color:color, woods:{fingerboard: finger, body:body}, img: img, owner: ""};
	Guitar.create(newGuitar, function(err, guitar){
		if (err){
			console.log(err);
		} else{
			res.redirect("/guitar_shop");
		}
	});
})
//padaryt su bosais ir querius
app.post("/addbass", function(req, res){
	var brand = req.body.brand;
	var model = req.body.model;
	var series = req.body.series;
	var stringCount = req.body.stringcount;
	var fretNumber = req.body.fretnumber;
	var color = req.body.color;
	var finger = req.body.fingerboard;
	var body = req.body.body;
	var img = req.body.img;
	var newBass = {brand: brand, model: model, series: series, type:"Bass", stringCount:stringCount, fretNumber:fretNumber, color:color, woods:{fingerboard: finger, body:body}, img: img, owner: ""};
	Bass.create(newBass, function(err, bass){
		if (err){
			console.log(err);
		} else{
			res.redirect("/bass_shop");
		}
	});
});
//visus userius
app.get("/userquery", function(req, res){
	User.find({}, function(err, users){
		res.send(users);
	});
});
//embedded
app.get("/usercollections", function(req, res){
	User.find({}, {guitarCollection: 1}, function(err, collections){
		res.send(collections);
	});
});
//aggregate
app.get("/aggregate", function(req, res){
	//visų bosų vidutinį stygų skaičių
	Bass.aggregate([
		{$match:{type: "Bass"}}, 
		{$group: {_id: "$brand", average :{$avg: "$stringCount"}}}], function(err, result){
			if (err){
				console.log(err);
			}
			else{
				res.send(result);
			}
		});
});
//map-reduce
app.get("/map-reduce", function(req, res){
	var o = {};
	o.map = function() {emit(this.brand, this.stringCount)};
	o.reduce = function(key, values){ return Array.sum(values)/values.length};
	Bass.mapReduce(o, function(err, result){
		if (err){
			console.log(err);
		}else{
			res.send(result);
		}
	});
})
app.post("/addtocollection", function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	var guitarId = req.body.guitar;
	var query = {username: username, password: password};
	Guitar.findById(guitarId, function(err, guitar){
		if (err){
			console.log(err);
		} else{
			Guitar.updateOne({"_id": guitarId}, {$set: {owner: username}}, function(err, res){
				if (err){
					console.log("Guitar owner hasn't been set: " + err);
				} else{
					console.log("Guitar owner has been set");
				}
			});
			guitar.owner = username;
			User.updateOne(query, {$push: {guitarCollection: guitar}}, function(err, res){
				if (err){
					console.log(err);
				} else{
					if (res.nModified == 0){
						console.log("No users found");
					} else{
						console.log("Successfuly added guitar to user's collection");	
					}
				}
			});
		}
	});
	res.redirect("/");
});
app.listen(3000, function(){
	console.log("Serving demo on port 3000");
}); 