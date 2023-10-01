/* ---------------------------------------------------  ----------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const mongoose = require('mongoose');
// const Schema = ;
// const bcrypt = require('bcrypt');

/* -------------------------------------------------------------------------- */
/*                                 User Schema                                */
/* -------------------------------------------------------------------------- */
const AdminSchema = new mongoose.Schema({
  email: {type: String, unique: true, required: true},
  password: {type: String, required: true},
  firstName: String,
  lastName: String,
  role: {type: String, enum: ['admin', 'beekeeper', 'subowner'], default: 'admin'},
  createdDate: {
    type: Date,
    default: Date.now,
  },

});

// /* -------------------------------------------------------------------------- */
// /*                              PASSWORD HELPERS                              */
// /* -------------------------------------------------------------------------- */
// /**
//  * Encrypt password before saving users objects int database we need to run
//  * this encrypt than save it. (pre save)
//  */
// AdminSchema.pre('save', function (next) {
//     let user = this;
//     if (this.isModified('password' || this.isNew)) {
//         // generate 10 length random characters
//         bcrypt.genSalt(10, function (err, salt) {
//             if (err) {
//                 return next(err);
//             }
//             // mix the 10 length random characters with user password => output the hash
//             bcrypt.hash(user.password, salt, null, function (err, hash) {
//                 if (err) {
//                     return next(err);
//                 }
//                 user.password = hash;
//                 // we are done with the operation so let's move on
//                 next();
//             });
//         });
//     } else {
//         return next();
//     }
// });
//
// /**
//  * this function to compare password
//  * @param {String} password
//  * @returns {boolean}
//  */
// AdminSchema.methods.comparePassword = function (password) {
//     let user = this; // this reference the user itself
//     return bcrypt.compareSync(password, user.password);
// };

// export User Schema
const admin = mongoose.model('Admin', AdminSchema);


module.exports = admin;
