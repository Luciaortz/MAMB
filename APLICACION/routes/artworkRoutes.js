const express = require("express");
const router = express.Router();

const Artwork = require("../models/Artwork");

router.get("/", async (req, res) => {

    try {

        const artworks = await Artwork.find()
        .sort({ fechaCreacion: -1 });

        res.json(artworks);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});

router.post("/save", async (req, res) => {

    

    try {

        const artwork = await Artwork.create(req.body);
  

        res.status(201).json(artwork);

    } catch (error) {

        console.error("ERROR:", error);

        res.status(500).json({
            error: error.message
        });

    }

});

module.exports = router;