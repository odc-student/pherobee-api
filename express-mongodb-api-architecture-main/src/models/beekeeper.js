const mongoose = require('mongoose');
const bcrypt = require("bcrypt-nodejs");

const beekeeper = new mongoose.Schema({
  username: String,
  email: String,
  password: String, // Hashed password
  forgetPasswordToken: String,
  hives: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Beehive' }],
  farms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Farm' }],
  subowners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subowner' }] // References to Subowner documents
});




const Beekeeper = mongoose.model('Beekeeper', beekeeper);


module.exports = Beekeeper;
