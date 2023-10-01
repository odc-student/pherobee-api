const mongoose = require('mongoose');

const farm = new mongoose.Schema({
  name: String,
  location: String,
  beehives: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Beehive' }],
  createdDate: {
    type: Date,
    default: Date.now,
  },
  beekeeper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beekeeper',
  },
});

const Farm = mongoose.model('Farm', farm);

module.exports = Farm;
