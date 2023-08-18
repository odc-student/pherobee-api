const mongoose = require('mongoose');

const farm = new mongoose.Schema({
  name:String,
  location: String,
  beehives: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hive' }]
});

const Farm = mongoose.model('Farm', farm);

module.exports = Farm;
