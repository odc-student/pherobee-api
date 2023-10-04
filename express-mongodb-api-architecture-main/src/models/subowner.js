const mongoose = require('mongoose');
const subowner = new mongoose.Schema({
  username: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: String, // Hashed password
  role: {
    type: String,
    enum: ['admin', 'beekeeper','subowner'],
    default: 'subowner',
  },
  beekeeper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beekeeper',
  },
  farmAccess: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Farm' }], // References to Hives subowner can access
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

const Subowner = mongoose.model('Subowner', subowner);

module.exports = Subowner;
