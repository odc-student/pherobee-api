const mongoose = require('mongoose');
const {Double} = require("mongodb");

const farm = new mongoose.Schema({
  name: String,
  location: String,
  long: String,
  lat: String,
  beehives: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Beehive' }],
  createdDate: {
    type: Date,
    default: Date.now,
  },

  beekeeper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beekeeper',
  },
  deletable: {
    type: Boolean,
    default: true,
  },

});

const Farm = mongoose.model('Farm', farm);

module.exports = Farm;
