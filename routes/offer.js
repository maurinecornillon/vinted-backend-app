const express = require("express");
const router = express.Router();

const Offer = require("../models/Offer.js");

// REMOVING AUTH FOR NOW => Add also "" in the routes
// const isAuthenticated = require("../middlewares/isAuthenticated");

///
router.get("/offers", async (req, res) => {
  console.log("offers route");
  const filteredObject = {};

  // Correction - gestion du find
  try {
    if (req.query.title) {
      filteredObject.product_name = new RegExp(req.query.title, "i");
    }

    if (req.query.priceMin) {
      filteredObject.product_price = { $gte: req.query.priceMin };
    }

    if (req.query.priceMax) {
      if (filteredObject.product_price) {
        filteredObject.product_price.$lte = req.query.priceMax;
      } else {
        filteredObject.product_price = { $lte: req.query.priceMax };
      }
    }

    // Correction - gesstion du sort
    const sortObject = {};
    if (req.query.sort === "price-desc") {
      sortObject.product_price = "desc";
    } else if (req.query.sort === "price-asc") {
      sortObject.product_price = "asc";
    }

    // let limit = 2;
    // if(req.query.limit) {
    //     limit = req.query.limit;
    // }

    // let page = 1;
    // if(req.query.page) {
    //     page = req.query.page;
    // }

    const offers = await Offer.find(filteredObject)
      .sort(sortObject)
      .skip((req.query.page - 1) * req.query.limit)
      .limit(req.query.limit)
      .select(
        "product_details product_pictures _id product_name product_description product_price owner"
      );

    const count = await Offer.countDocuments(filteredObject);

    res.json({ count: count, offers: offers });

    /// correction
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/// Route offer
router.get("/offer/:id", async (req, res) => {
  console.log("OFFER route");
  console.log(req.params);
  try {
    const offerToShow = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account.username email -_id",
    });
    res.json(offerToShow);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
