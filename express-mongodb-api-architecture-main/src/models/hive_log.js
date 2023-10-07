const mongoose = require('mongoose');
const { Schema } = mongoose;

const hiveLogSchema = new Schema({
  // temperature: {
  //   type: Number,
  //   required: true,
  // },
  // humidity: {
  //   type: Number,
  //   required: true,
  // },
  // weight: {
  //   type: Number,
  //   required: true,
  // },
  // beehive: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'Beehive',
  //   required: true,
  // },
  // timestamp: {
  //   type: Date,
  //   default: Date.now,
  // },
  deviceId: {
    type: String,
    required: true,
  },
  temperature_f: {
    type: Number,
    required: true,
  },
  temp_ext_c: {
    type: Number,
    required: true,
  },
  temp_int_c: {
    type: Number,
    required: true,
  },
  humidity: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  hornet_detected: {
    type: Boolean,
    default:false
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  Motion:{
    type:Boolean,
    default:false
  }
});

module.exports = mongoose.model('HiveLog', hiveLogSchema,"iot-data");


