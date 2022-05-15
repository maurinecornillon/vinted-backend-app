const express = require("express");
const router = express.Router();
const stripe = require("stripe")(
  "sk_test_51KxqpkGhJqwo1Qe2uDbORf0RyfhR9UYqu787IBMybvJZzBREqJPnaZtvX9fX3jANyUlWWUj0VB9CvZhXDNS2UTax00fz8ow0P4"
);

router.post("/payment", async (req, res) => {
  try {
    const stripeToken = req.fields.stripeToken;
    const totalPrice = req.fields.totalPrice;
    const productName = req.fields.title;

    const response = await stripe.charges.create({
      amount: totalPrice * 100,
      currency: "eur",
      description: productName,
      source: stripeToken,
    });
    console.log(response.status);
    res.json(response);
  } catch (error) {
    res.status(400).json(error);
    console.log(error);
  }
});

module.exports = router;
