require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require("mongoose-findorcreate");
const multer = require('multer');
const path = require('path');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

// console.log(process.env.MONGO)

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());



mongoose.connect(process.env.MONGO, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  dateOfBirth: String,
  image: String,
  tel: String,
  stock: String,
  data1: Array,
  data2: Array
});

const relianceSchema = new mongoose.Schema ({
	date: String,
	open: Number,
	high: Number,
	low: Number,
	close: Number,
	volume_btc: Number,
	volume_usd: Number
});

var Storage = multer.diskStorage({
  destination: "public/upload/",
  filename: (req,file,cb) => {
    cb(null,file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  }
});

var upload = multer({
  storage: Storage
}).single('file');


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = new mongoose.model("User", userSchema);
const Reliance = new mongoose.model("Reliance", relianceSchema);
const Tatasteel = new mongoose.model("Tatasteel", relianceSchema);
const Cipla = new mongoose.model("Cipla", relianceSchema);
const Ashokley = new mongoose.model("Ashokley", relianceSchema);
const Eichermot = new mongoose.model("Eichermot", relianceSchema);
const BSE = new mongoose.model("BSE", relianceSchema);
const NSE = new mongoose.model("NSE", relianceSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) { 
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


// NSE.insertMany(dataaa).then(function(){ 
//     console.log("Data inserted")  // Success 
// }).catch(function(error){ 
//     console.log(error)      // Failure 
// }); 

app.get("/", function(req,res){
  if (req.isAuthenticated()){
    res.render("index2", {firstName: req.user.firstName, lastName: req.user.lastName, image: req.user.image});
  } else {
    res.render("index");
  } 
});

app.get("/login", function(req,res){
  res.render("login");  
});

app.get("/register", function(req,res){
  res.render("register");  
});

app.get("/dashboard1", function(req,res){
  if (req.isAuthenticated()){
  	BSE.find({"date": "8-5-2020"}, function(err, data1){
  		if (err){
  			console.log(err);
  		} else {
  			// console.log(data1)
  			User.findOneAndUpdate({ "_id": req.user._id }, { "$set": { data1: data1 }}).exec(function(err, book){
	          if(err) {
	            console.log(err);
	            res.status(500).send(err);
	          }
	        });

  		}
  	});

  	NSE.find({"date": "8-5-2020"}, function(err, data2){
  		if (err){
  			console.log(err);
  		} else {
  			// console.log(data2);
  			User.findOneAndUpdate({ "_id": req.user._id }, { "$set": { data2: data2 }}).exec(function(err, book){
	          if(err) {
	            console.log(err);
	            res.status(500).send(err);
	          } 
	        });
        res.redirect("/dashboard");
  		}
  	})
    
  	} else {
    res.redirect("/login");
  }
  
});

app.get("/dashboard", function(req,res){
  if (req.isAuthenticated()){
    res.render("dashboard",{firstName: req.user.firstName, lastName: req.user.lastName, dateOfBirth:req.user.dateOfBirth, tel:req.user.tel, image: req.user.image, data1: req.user.data1, data2: req.user.data2})
  } else {
    res.redirect("login");
  }
})

app.get("/graphs", function(req,res){
  if (req.isAuthenticated()){
  	var name = req.user.stock;
  	// console.log(name);
  	name = mongoose.model(name);
  	// console.log(name);
  	name.find({}, function (err, dataaa) { 
    	if (err){ 
        	console.log(err); 
    	} 
    	else{  
    		res.render("graphs",{firstName: req.user.firstName, lastName: req.user.lastName, dateOfBirth:req.user.dateOfBirth, tel:req.user.tel, image: req.user.image, dataaa: dataaa, share: req.user.stock})
    	} 
	}); 
    
  } else {
    res.redirect("/login");
  }
})


app.get("/profile-settings", function(req,res){
  if (req.isAuthenticated()){
    res.render("profile-settings",{email: req.user.username ,firstName: req.user.firstName, lastName: req.user.lastName, tel: req.user.tel, dateOfBirth:req.user.dateOfBirth, tel: req.user.tel, image: req.user.image})
  } else {
    res.redirect("/login");
  }
})

app.get("/logout", function(req,res){
  req.logout();
  res.redirect("/");
});




app.post("/login", function(req,res){
  const user = new User ({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function (err){
    if(err){
      console.log(err);
      res.redirect("/login");
    } else {
      passport.authenticate("local")(req,res,function(){
        res.redirect("/dashboard1");
      });
    }
  });
});

app.post("/register", function(req,res){
  User.register({username: req.body.username}, req.body.password, function(err, user) {
    if (err){
      console.log(err);
      res.redirect("/register");
    } else{
      	passport.authenticate("local")(req,res,function(){
        // console.log(req.user)
	        User.findOneAndUpdate({ "_id": req.user._id }, { "$set": { "firstName": req.body.fName, "lastName": req.body.lName, "image": "assets/img/patients/patient.jpg", "dateOfBirth": req.body.dateOfBirth, "tel": req.body.tel, "stock": "Reliance"}}).exec(function(err, book){
	          if(err) {
	            console.log(err);
	            res.status(500).send(err);
	          }
	        });
      		res.redirect("/dashboard1");
    	})	
    }
  });
});

app.post("/graphs", function(req,res){
	if (req.isAuthenticated()){
		var name = req.body.q;
		console.log(name)
		User.findOneAndUpdate({ "_id": req.user._id }, { "$set": { "stock": name}}).exec(function(err, book){
	          if(err) {
	            console.log(err);
	            res.status(500).send(err);
	          } else {
	    		res.redirect("/graphs")      	
	          }
	        });
		

	} else {
		res.redirect("/login")
	}	
})

app.post("/profile-settings", upload, function(req,res){
  if (req.isAuthenticated()){
    if (req.file == undefined){
      var uploadImage = req.user.image;
    } else {
      var uploadImage = "upload/" + req.file.filename
    }

    User.findOneAndUpdate({ "_id": req.user._id }, { "$set": { "firstName": req.body.fName, "lastName": req.body.lName, "image": uploadImage, "dateOfBirth": req.body.dateOfBirth, "tel": req.body.tel}}).exec(function(err, book){
      if(err) {
        console.log(err);
        res.status(500).send(err);
      }
    });
    res.redirect("/profile-settings");
  } else {
    res.redirect("/login")
  }
})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started Successfully");
});
