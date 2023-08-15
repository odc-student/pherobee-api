const mongoose = require('mongoose');
const { Schema } = mongoose;

const hiveLogSchema = new Schema({
  temperature: {
    type: Number,
    required: true,
  },
  humidity: {
    type: Number,
    required: true,
  },
  beehive: {
    type: Schema.Types.ObjectId,
    ref: 'Beehive',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('HiveLog', hiveLogSchema);
