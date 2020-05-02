require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");
// const encrypt = require('mongoose-encryption');


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: "Our Little Secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

const stockSchema = new mongoose.Schema ({
  name: String,
  quantity: Number
});

const Stock = new mongoose.model("Stock", stockSchema);

const stock1 = new Stock({
  name : "Apple",
  quantity : 50
});

const stock2 = new Stock({
  name : "Banana",
  quantity : 25
});

const stock3 = new Stock({
  name : "Mango",
  quantity : 100
});

const defaultItems = [stock1, stock2, stock3];



app.get("/", function(req,res){
  res.render("home");
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get("/login", function(req,res){
  res.render("login");
});

app.get("/register", function(req,res){
  res.render("register");
});

app.get("/secrets", function(req,res){
  if (req.isAuthenticated()){
    Stock.find({}, function(err, result){
      if (result.length === 0) {
        Stock.insertMany(defaultItems, function(err){
          if (err){
            console.log(err);
          } else{
            console.log("Successfully Added default Items to DB");
          }
        });
        res.redirect("/secrets");
      } else {
          res.render("secrets", {item:result});
      }
    });

  } else{
    res.redirect("/login");
  }
});

app.get("/logout", function(req,res){
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req,res){
  User.register({username: req.body.username}, req.body.password, function(err, user) {
    if (err){
      console.log(err);
      res.redirect("/register");
    } else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  });
});

app.post("/login", function(req,res){
  const user = new User ({
    username: req.body.username,
    password: req.body.passowrd
  });

  req.login(user, function (err){
    if(err){
      console.log(err);
    } else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  });
});

app.post("/secrets", function(req,res){
  const itemName = req.body.input1;
  const itemQuantity = req.body.input2;

  const stock = new Stock ({
    name : itemName,
    quantity: itemQuantity
  });

  stock.save();
  res.redirect("/secrets");
})

app.post("/change", function(req,res){
  var quant = req.body.first;
  var buttonName = req.body.button1;
  Stock.findByIdAndUpdate(
    {_id: buttonName}, {quantity: quant}, function(err, arr){
      if (err){
        console.log(err);
      }
    });
  res.redirect("/secrets");
});

app.post("/delete", function(req,res){
  var del = req.body.delete1;
  Stock.findByIdAndRemove(del, function(err){
    if (err) {
      console.log(err);
    }
  });
  res.redirect("/secrets");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
