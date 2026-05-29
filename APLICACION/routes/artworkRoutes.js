const express = require("express");
const router = express.Router();

const Artwork = require("../models/Artwork");

router.get("/test", (req,res)=>{

    res.json({
        mensaje:"API funcionando correctamente"
    });

});

router.post("/save", async (req, res) => {

    console.log("BODY RECIBIDO:");
    console.log(req.body);

    try {

        const artwork = await Artwork.create(req.body);

        console.log("GUARDADO:", artwork);

        res.status(201).json(artwork);

    } catch (error) {

        console.error("ERROR:", error);

        res.status(500).json({
            error: error.message
        });

    }

});

module.exports = router;