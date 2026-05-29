const express = require("express");
const router = express.Router();

const Artwork = require("../models/Artwork");

router.get("/test", (req,res)=>{

    res.json({
        mensaje:"API funcionando correctamente"
    });

});

router.post("/save", async (req, res) => {

    try {

        const artwork = await Artwork.create(req.body);

        res.status(201).json(artwork);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});

module.exports = router;