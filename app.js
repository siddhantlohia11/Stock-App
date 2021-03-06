require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
var flash = require('connect-flash');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();

app.use(express.static("public"));
app.use(flash());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: "Our Little Secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin-Siddhant:process.env.db-password@cluster0-33zzh.mongodb.net/StockDB", {useNewUrlParser: true, useUnifiedTopology: true});
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
    callbackURL: "https://glacial-taiga-40624.herokuapp.com/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
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

const changeSchema = new mongoose.Schema ({
  changedBy: String,
  time: String,
  name: String,
  quantityNew: Number,
  quantityOld: Number
});
const Change = new mongoose.model("Change", changeSchema);


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
    if (req.query.search){
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      Stock.find({name: regex}, function(err, allFound){
        if (err){
            console.log(err);
        } else {
            if (allFound.length > 0){
                res.render("secrets", {item:allFound});
            } else {
                req.flash("error", "No Match Found");
                res.redirect("/secrets");
            }
        }
      });
    } else {
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
      }
  } else{
    res.redirect("/login");
  }
});

app.get("/graph", function(req,res){
  if (req.isAuthenticated()){
    var name = []
    var quant = []
    Stock.find({}, function(err, result){
      for (let i = 0; i < result.length; i++) {
        name.push(result[i].name);
        quant.push(result[i].quantity);
      };
      res.render("graph", {name:name, quant:quant});
    });
  } else{
    res.redirect("/login");
  }
});


app.get("/logout", function(req,res){
  req.logout();
  res.redirect("/");
});


app.get("/activity", function(req,res){
  if (req.isAuthenticated()){
    Change.find({}, function(err, resultLog){

      res.render("activity", {activities:resultLog});
    });
  }
  else{
     res.redirect("/login");
   }
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
  var datetime = new Date();
  var quant = req.body.first;
  var buttonName = req.body.button1;
  Stock.findByIdAndUpdate(
    {_id: buttonName}, {quantity: quant}, function(err, arr){
      if (!err){
        const change = new Change ({
          changedBy: req.user.username,
          time: datetime,
          name : arr.name,
          quantityNew: quant,
          quantityOld: arr.quantity
        });
        change.save();
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

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server has started Successfully");
});
