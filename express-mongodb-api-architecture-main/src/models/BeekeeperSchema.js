const mongoose = require('mongoose');
const bcrypt = require("bcrypt-nodejs");

const beekeeperSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String, // Hashed password
  forgetPasswordToken: String,
  hives: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hive' }],
  subowners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subowner' }] // References to Subowner documents
});


beekeeperSchema.pre('save', function (next) {
    let beekeeper = this;
    if (this.isModified('password' || this.isNew)) {
        // generate 10 length random characters
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            // mix the 10 length random characters with user password => output the hash
            bcrypt.hash(beekeeper.password, salt, null, function (err, hash) {
                if (err) {
                    return next(err);
                }
                beekeeper.password = hash;
                // we are done with the operation so let's move on
                next();
            });
        });
    } else {
        return next();
    }
});

/**
 * this function to compare password
 * @param {String} password
 * @returns {boolean}
 */
beekeeperSchema.methods.comparePassword = function (password) {
    let beekeeper = this; // this reference the user itself
    return bcrypt.compareSync(password, beekeeper.password);
};




const Beekeeper = mongoose.model('Beekeeper', beekeeperSchema);


module.exports = Beekeeper;
