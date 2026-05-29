require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const artworkRoutes = require("./routes/artworkRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/artworks", artworkRoutes);

app.get("/", (req, res) => {

    res.send("MAMB IA funcionando");

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`Servidor ejecutándose en puerto ${PORT}`);

});