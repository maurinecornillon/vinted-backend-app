const express = require("express");

const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const formidable = require("express-formidable");
const mongoose = require("mongoose");
const app = express();
app.use(formidable());

// Import des models
const User = require("../models/User");
const Offer = require("../models/User");
//------------------------------------------//
// INSCRIPTION NOUVEAU USER

router.post("/user/signup", async (req, res) => {
  console.log("Inscription en cours");

  try {
    const password = req.fields.password;
    const salt = uid2(16);
    console.log("le salt==>", salt);
    const hash = SHA256(password + salt).toString(encBase64);
    console.log("le hash==>", hash);
    const token = uid2(16);
    const emailExist = await User.findOne({ email: req.fields.email });
    if (emailExist) {
      res.status(400).json({ message: "Le mail est déjà utilisé" });
    } else if (req.fields.username === undefined) {
      res.status(400).json({ message: "Il manque un pseudo" });
    } else {
      const newUser = new User({
        account: { username: req.fields.username },
        email: req.fields.email,
        newletter: req.fields.newsletter,
        token: token,
        hash: hash,
        salt: salt,
      });
      await newUser.save();
      res.json({
        _id: newUser.id,
        token: newUser.token,
        account: newUser.account,
      });
    }
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

//------------------------------------------//
// CONNEXION

router.post("/user/login", async (req, res) => {
  console.log("Connexion en cours");

  try {
    const user = await User.findOne({ email: req.fields.email });
    const newHash = SHA256(req.fields.password + user.salt).toString(encBase64);
    if (!user) {
      res.status(400).json({ message: "Le compte n'existe pas" });
    } else if (newHash !== user.hash) {
      console.log(newHash);
      console.log(user.hash);
      res.status(400).json({ message: "mdp invalide" });
    } else {
      res.json({
        _id: user.id,
        token: user.token,
        account: user.account,
      });
    }
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// export des routes
module.exports = router;
