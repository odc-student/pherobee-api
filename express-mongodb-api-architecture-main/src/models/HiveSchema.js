const mongoose = require('mongoose');

const hiveSchema = new mongoose.Schema({
  serialNumber: String,
  state: { type: String, enum: ['active', 'inactive'] },
  hiveLog: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HiveLog' }]
});

const Hive = mongoose.model('Hive', hiveSchema);

module.exports = Hive;
