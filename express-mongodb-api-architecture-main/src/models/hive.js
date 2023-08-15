const mongoose = require('mongoose');

const hive = new mongoose.Schema({
  serialNumber: String,
  state: { type: String, enum: ['active', 'inactive'] },
  hiveLog: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HiveLog' }]
});

const Hive = mongoose.model('Hive', hive);

module.exports = Hive;
