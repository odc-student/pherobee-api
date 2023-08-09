const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
  location: String,
  hives: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hive' }]
});

const Farm = mongoose.model('Farm', farmSchema);

module.exports = Farm;
