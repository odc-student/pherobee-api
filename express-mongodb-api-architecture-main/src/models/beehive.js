const mongoose = require('mongoose');

const beehive = new mongoose.Schema({
  serialNumber: String,
  state: {type: String, enum: ['active', 'inactive']},
  hiveLog: [{type: mongoose.Schema.Types.ObjectId, ref: 'HiveLog'}]
});

const Hive = mongoose.model('Beehive', beehive);

module.exports = Hive;
