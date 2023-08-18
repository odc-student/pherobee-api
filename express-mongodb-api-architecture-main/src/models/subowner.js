const mongoose = require('mongoose');

const subowner = new mongoose.Schema({
  username: String,
  email: String,
  password: String, // Hashed password
  FarmAccess: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Farm' }] // References to Hives subowner can access
});

const Subowner = mongoose.model('Subowner', subowner);

module.exports = Subowner;
