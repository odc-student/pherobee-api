const mongoose = require('mongoose');

const subownerSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String, // Hashed password
  hivesAccess: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hive' }] // References to Hives subowner can access
});

const Subowner = mongoose.model('Subowner', subownerSchema);

module.exports = Subowner;
