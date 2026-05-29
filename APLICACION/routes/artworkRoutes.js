const express = require("express");
const router = express.Router();

const Artwork =
require("../models/Artwork");

router.post("/save", async(req,res)=>{

  try{

    const artwork =
    await Artwork.create(req.body);

    res.status(201).json(artwork);

  }catch(error){

    res.status(500).json(error);

  }

});

module.exports = router;