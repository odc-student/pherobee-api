const mongoose = require('mongoose');
const {Schema} = mongoose;

const notificationSchema = new Schema({
  //high temp
  //low temp
  // movement
  // hornet
  // varoa mite
  // stress : existence OR NOT o f QUEEN
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  serialNumber: {
    type: String,
    required: true,
    // Remove the unique constraint
    // unique: true,
  },
  type: {
    type: String,
    enum: ['high_temp', 'low_temp', 'movement', 'hornet' , 'mite', 'no_queen', 'new_queen' , "default"],
    default: "default",
  },
});

module.exports = mongoose.model('Notification', notificationSchema);


