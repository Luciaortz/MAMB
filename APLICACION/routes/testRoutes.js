const express = require("express");
const router = express.Router();

const User = require("../models/User");

router.get("/crear-usuario", async (req, res) => {
  try {

    const usuario = new User({
      nombre: "Laura",
      email: "laura@gmail.com",
      password: "123456"
    });

    await usuario.save();

    res.json({
      mensaje: "Usuario guardado correctamente",
      usuario
    });

  } catch (error) {

    res.status(500).json(error);

  }
});

module.exports = router;