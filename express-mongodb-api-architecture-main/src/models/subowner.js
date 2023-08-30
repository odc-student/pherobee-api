const mongoose = require('mongoose');

const subowner = new mongoose.Schema({
  username: String,
  email: String,
  password: String, // Hashed password
  role: {
    type: String,
    enum: ['admin', 'beekeeper','subowner'],
    default: 'subowner',
  },
  farmAccess: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Farm' }] // References to Hives subowner can access
});

const Subowner = mongoose.model('Subowner', subowner);

module.exports = Subowner;
