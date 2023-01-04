//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const port = 3000;

//With Mongoose 7, default value of strictQuery brought back to false
mongoose.set('strictQuery', true);

const app = express();

console.log(process.env.API_KEY);

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/userDB');

//Create a SCHEMA setting out the fields each document will have
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

//Compile Schema into a Model
const User = mongoose.model('User', userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const newUser = new User ({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save( err => {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({ email: username }, (err, foundUser) => {
    if(!err) {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("secrets");
        } else {
          res.redirect("/login");
        }
      } else {
        res.redirect("/login");
      }
    } else {
      res.redirect("/login");
    }
  });
});


app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});