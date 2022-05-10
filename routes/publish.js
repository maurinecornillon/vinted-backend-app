const express = require("express");
const router = express.Router();
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const app = express();
app.use(formidable());
const cloudinary = require("cloudinary").v2;

// Import des models
const User = require("../models/User");
const Offer = require("../models/Offer");

// Import du middleware
const isAuthenticated = require("../middleware/isAuthenticated");

//------------------------------------------//
// PUBLICATION DUN ARTICLE

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  console.log("Publication en cours");

  try {
    let pictureToUpload = req.files.picture.path;
    //console.log(pictureToUpload);
    const result = await cloudinary.uploader.upload(pictureToUpload);

    //
    const newOffer = new Offer({
      product_name: req.fields.title,
      product_description: req.fields.description,
      product_price: req.fields.price,
      product_details: [
        { MARQUE: req.fields.brand },
        { TAILLE: req.fields.size },
        { ETAT: req.fields.condition },
        { COULEUR: req.fields.color },
        { EMPLACEMENT: req.fields.city },
      ],
      product_image: { secure_url: result.secure_url },
      owner: req.user,
    });

    await newOffer.save();

    //const publication = await Offer.findOne({
    //product_name: req.fields.product_name,
    //}).populate({ path: "owner", select: "account" });
    res.json(newOffer);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

//------------------------------------------//
// AFFICHER LES ANNONCES

router.get("/offers", async (req, res) => {
  try {
    // Limit by page
    let limit = 3;
    if (req.query.limit) {
      limit = req.query.limit;
    }
    // Page
    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }

    // All filters
    const filter = {};

    // If I enter a object
    if (req.query.product_name) {
      filter.product_name = new RegExp(req.query.product_name, "i");
    }
    // If I set a minimum price
    if (req.query.priceMin) {
      filter.product_price = {
        $gte: req.query.priceMin,
      };
    }
    // If I set a maximum price
    if (req.query.priceMax) {
      filter.product_price = {
        $lte: req.query.priceMax,
      };
    }
    // If I set minimum and maximum price
    if (req.query.priceMin && req.query.priceMax) {
      filter.product_price = {
        $gte: req.query.priceMin,
        $lte: req.query.priceMax,
      };
    }

    // If I want to sort by price
    if (req.query.product_price) {
      const offer = await Offer.find(filter)
        .sort({ product_price: req.query.product_price })
        .limit(limit)
        .skip(limit * page - limit)
        .select("product_name product_price");

      if (offer.length > 0) {
        const count = await Offer.countDocuments(filter);
        res.status(200).json({ count: count, offers: offer });
      } else {
        res.status(400).json({ message: "No products found." });
      }

      // Or if I don't want
    } else {
      const offer = await Offer.find(filter)
        .limit(limit)
        .skip(limit * page - limit)
        .select("product_name product_price");
      if (offer.length > 0) {
        const count = await Offer.countDocuments(filter);
        res.status(200).json({ count: count, offers: offer });
      } else {
        res.status(400).json({ message: "No products found." });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Offer by id
router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account.username email -_id",
    });
    if (offer) {
      res.status(400).json(offer);
    } else {
      res.status(400).json({ message: "No products found." });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

// router.get("/offers", async (req, res) => {
//   console.log("Afficher les annonces");

//   try {
//     const filtersObject = {}; // créa d'une variable object vide pour y mettre nos filtres

//     //gestion du title
//     if (req.query.title) {
//       filtersObject.product_name = new RegExp(req.query.title, "i");
//     }

//     //gestion du prix
//     if (req.query.priceMin) {
//       filtersObject.product_price = { $gtz: req.query.priceMinc };
//     }
//     // Si j'ai déjà une clé product_price dans mon objet filterObject
//     if (req.query.priceMax) {
//       if (filtersObject.product_price) {
//         filtersObject.product_price.$lte = req.query.priceMax;
//       } else {
//         filtersObject.product_price = {
//           $lte: req.query.priceMax,
//         };
//       }
//     }
//     //gestion du tri avec l'objet sortObject
//     const sortObject = {};
//     if (req.query.sort === "price-desc") {
//       sortObject.product_price = "desc";
//     } else if (req.query.sort === "price-asc") {
//       sortObject.product_price = "asc";
//     }

//     // console.log(filtersObject);

//     //gestion de la pagination
//     // On a par défaut 5 annonces par page
//     //Si ma page est égale à 1 je devrais skip 0 annonces
//     //Si ma page est égale à 2 je devrais skip 5 annonces
//     //Si ma page est égale à 4 je devrais skip 15 annonces

//     //(1-1) * 5 = skip 0 ==> PAGE 1
//     //(2-1) * 5 = SKIP 5 ==> PAGE 2
//     //(4-1) * 5 = SKIP 15 ==> PAGE 4
//     // ==> (PAGE - 1) * LIMIT

//     let limit = 3;
//     if (req.query.limit) {
//       limit = req.query.limit;
//     }

//     let page = 1;
//     if (req.query.page) {
//       page = req.query.page;
//     }

//     const offers = await Offer.find(filtersObject)
//       .sort(sortObject)
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .select("product_name product_price");

//     const count = await Offer.countDocuments(filtersObject);

//     res.json({ count: count, offers: offers });
//   } catch (error) {
//     res.status(404).json({ error: error.message });
//   }
// });

// export des routes
// module.exports = router;
