const mongoose = require('mongoose');
const { Schema } = mongoose;

const beehiveSchema = new Schema({
  status: {
    type: String,
    enum: ['active', 'inactive', 'under maintenance'],
    default: 'active',
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
  },
  beekeeper: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
});

const Beehive = mongoose.model('Beehive', beehiveSchema);

module.exports = Beehive;
