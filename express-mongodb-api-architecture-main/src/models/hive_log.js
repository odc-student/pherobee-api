const mongoose = require('mongoose');

const hive_log = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  hive: { type: mongoose.Schema.Types.ObjectId, ref: 'Hive' },
  timestamp: { type: Date, default: Date.now }
});

const HiveLog = mongoose.model('HiveLog', hive_log);

module.exports = HiveLog ;
