require("dotenv").config();

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
/////////////////////////////////////////////

const app = express();
app.use(formidable());
const cors = require("cors");
mongoose.connect(process.env.MONGODB_URI);
const cloudinary = require("cloudinary").v2;
app.use(cors());

// Import des routes

const userRoutes = require("./routes/users");
app.use(userRoutes);

const publishRoutes = require("./routes/publish");
app.use(publishRoutes);

const paymentRoutes = require("./routes/payment");
app.use(paymentRoutes);

//serveur

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
