const mongoose = require('mongoose');

const beekeeperSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  role: { type: String, enum: ['super admin', 'beekeeper'], default: 'beekeeper' },
  Beehives: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Beehive' }],
  forgotPasswordToken: String,
  farms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Farm' }],
  subowners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subowner' }]
});

const Beekeeper = mongoose.model('Beekeeper', beekeeperSchema);

module.exports = Beekeeper;


