const mongoose = require('mongoose');
const {Schema} = mongoose;

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
  hiveLog: [{type: mongoose.Schema.Types.ObjectId, ref: 'HiveLog'}],
  beekeeper: {
    type: Schema.Types.ObjectId,
    ref: 'Beekeeper',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});


const Beehive = mongoose.model('Beehive', beehiveSchema);

module.exports = Beehive;
