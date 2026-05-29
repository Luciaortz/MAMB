const mongoose = require("mongoose");

const ArtworkSchema = new mongoose.Schema({

  nombreObra:{
    type:String,
    required:true
  },

  nombreArtistico:{
    type:String,
    required:true
  },

  imagen:{
    type:String,
    required:true
  },

  fechaCreacion:{
    type:Date,
    default:Date.now
  }

});

module.exports = mongoose.model(
  "Artwork",
  ArtworkSchema
);