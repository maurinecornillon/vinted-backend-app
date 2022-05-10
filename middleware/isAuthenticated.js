const User = require("../models/User");

//------------------------------------------//
// FONCTION MIDDLEWARE

const isAuthenticated = async (req, res, next) => {
  console.log(req.headers);
  if (req.headers.authorization) {
    console.log(req.headers.authorization);
    const checkUser = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });
    console.log({ checkUser });

    if (!checkUser) {
      return res.status(401).json({ error: "Unauthorized" });
    } else {
      req.user = checkUser;
    }
    return next();
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = isAuthenticated;
