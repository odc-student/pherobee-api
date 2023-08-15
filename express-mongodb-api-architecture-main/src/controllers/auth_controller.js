/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const { default: mongoose } = require('mongoose');
const nodemailer = require('nodemailer');
const async = require('async');
const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');
// Models
const User = require('../models/user');

// Token
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Email Template
const {
  singUpConfirmationEmailTemplate,
  forgotPasswordEmailTemplate,
  resetPasswordConfirmationEmailTemplate,
} = require('../template/userAccountEmailTemplates');

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */
const FROM_EMAIL = process.env.MAILER_EMAIL_ID;
const AUTH_PASSWORD = process.env.MAILER_PASSWORD;

const API_ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? process.env.API_ENDPOINT
    : process.env.API_ENDPOINT;

var smtpTransport = nodemailer.createTransport({
  host: process.env.HOST,
  port: process.env.PORT_SSL,
  secure: false, // true for 465, false for other ports
  service: process.env.MAILER_SERVICE_PROVIDER,
  auth: {
    user: FROM_EMAIL,
    pass: AUTH_PASSWORD,
  },
  tls:{
    rejectUnauthorized:false, // disable certificate vercation
  }

});

/* -------------------------------------------------------------------------- */
/*                               Auth Controller                              */
/* -------------------------------------------------------------------------- */
/**
 * Check if we have the email in out db or not
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const checkExistEmail = async (req, res) => {
  let foundUser = await User.findOne({ email: req.body.email });
  // if email doesn't exist
  if (!foundUser) {
    res.status(200).json({
      success: true,
    });
  } else {
    res.status(403).json({
      success: false,
      message: 'Email existe déjà',
    });
  }
};

/**
 * Sing up new user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */


/**
 * Sing in with an existing account
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const signIn = async (req, res) => {
  try {
    const foundUser = await User.findOne({ email: req.body.email });

    if (!foundUser) {
      return res.status(403).json({
        success: false,
        message: "Échec de l'authentification, utilisateur introuvable",
      });
    }

    const isPasswordMatch = req.body.password === foundUser.password

      // const isPass = bcrypt.compareSync(req.body.password, foundUser.password);
      // console.log("test")
      // console.log(isPass)
    if (isPasswordMatch) {
      const token = jwt.sign({ _id: foundUser._id ,role:foundUser.role }, process.env.SECRET, {
        expiresIn: '1w', // Use a human-readable duration, e.g., '1w' for 1 week
      });

      return res.json({
        success: true,
        token: token,
        user: foundUser,
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "Échec de l'authentification, Mot de passe erroné",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur interne du serveur. Veuillez réessayer ultérieurement.",
    });
  }
};






/**
 * Send Email to reset password
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const forgotPassword = function (req, res) {
  async.waterfall(
    [
      function (done) {
        User.findOne({
          email: req.body.email,
        }).exec(function (err, user) {
          if (user) {
            done(err, user);
          } else {
            done('User not found.');
          }
        });
      },
      function (user, done) {
        // create the random token
        crypto.randomBytes(20, function (err, buffer) {
          var token = buffer.toString('hex');
          done(err, user, token);
        });
      },

      function (user, token, done) {
        User.findByIdAndUpdate(
          { _id: user._id },
          {
            resetPasswordToken: token,
            resetPasswordExpires: Date.now() + 3600000, // token expire in 1h
          },
          { new: true },
        ).exec(function (err, new_user) {
          done(err, token, new_user);
        });
      },
      function (token, user, done) {
        // email template
        const template = forgotPasswordEmailTemplate(
          user.fullName,
          user.email,
          API_ENDPOINT,
          token,
        );
        // config data for emailing
        var data = {
          from: FROM_EMAIL,
          to: user.email,
          subject: 'Reinitialisation de votre mot de passe',
          html: template,
        };
        // send email
        smtpTransport.sendMail(data, function (err) {
          if (!err) {
            return res.json({
              message:
                "Veuillez vérifier votre e-mail pour plus d'instructions",
            });
          } else {
            return done(err);
          }
        });
      },
    ],
    function (err) {
      return res.status(422).json({ message: err });
    },
  );
};

/**
 * Reset password
 */
const resetPassword = function (req, res) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  }).exec(function (err, user) {
    if (!err && user) {
      // Verify if we got the same password
      if (req.body.newPassword === req.body.verifyPassword) {
        user.password = req.body.newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.save();

        if (err) {
          return res.status(422).send({
            message: err,
          });
        } else {
          const template = resetPasswordConfirmationEmailTemplate(
            user.fullName,
          );
          var data = {
            to: user.email,
            from: FROM_EMAIL,
            subject: 'Confirmation de réinitialisation du mot de passe',
            html: template,
          };

          smtpTransport.sendMail(data, function (err) {
            if (!err) {
              return res.json({ message: 'Réinitialisation du mot de passe' });
            } else {
              return res.status(500).json({
                message: err.message,
              });
            }
          });
        }
      } else {
        return res.status(422).send({
          message: 'Passwords do not match',
        });
      }
    } else {
      return res.status(400).send({
        message: 'Password reset token is invalid or has expired.',
      });
    }
  });
};

/* -------------------------------------------------------------------------- */
/*                               User Controller                              */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves current user object
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getCurrentUser = async (req, res) => {
  try {
    let foundUser = await User.findOne({ _id: req.decoded._id }).exec();

    if (foundUser) {
      res.status(200).json({
        success: true,
        user: foundUser,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update current user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const updateUserById = async (req, res) => {
  try {
    let foundUser = await User.findOne({ _id: req.params.id });

    const updateImages = {};

    if (req.files) {
      if (req.files.photo) {
        // delete photo
        // check if we got files object
        if (req.files?.photo !== undefined) {
          // check if the user didn't have photo
          if (foundUser.photo !== '') {
            fs.unlinkSync(`${foundUser.photo}`);
          }
        }
        //  then update
        updateImages.photo = (req.files?.photo[0].path).replace('\\', '/');
      }
    }

    let updatedUser = await User.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          ...updateImages,
          email: req.body.email ? req.body.email : foundUser.email,
          fullName: req.body.fullName ? req.body.fullName : foundUser.fullName,
          governorate: req.body.governorate
            ? req.body.governorate
            : foundUser.governorate,
          municipality: req.body.municipality
            ? req.body.municipality
            : foundUser.municipality,
          phoneNumber: req.body.phoneNumber
            ? req.body.phoneNumber
            : foundUser.phoneNumber,
          is_active: req.body.is_active
            ? req.body.is_active
            : foundUser.is_active,
          is_admin: req.body.is_admin ? req.body.is_admin : foundUser.is_admin,
          is_manager: req.body.is_manager
            ? req.body.is_manager
            : foundUser.is_manager,
          age: req.body.age ? req.body.age : foundUser.age,
          gender: req.body.gender ? req.body.gender : foundUser.gender,
          dateOfBirth: req.body.dateOfBirth
            ? req.body.dateOfBirth
            : foundUser.dateOfBirth,
        },
      },
      { new: true, upsert: true },
    );

    res.status(200).json({
      success: true,
      message: "Mise à jour réussie de l'utilisateur",
      updatedUser: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Retrieves all users
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getAllUsers = async (req, res) => {
  try {
    let foundUser = await User.find().exec();

    if (foundUser) {
      res.status(200).json({
        success: true,
        user: foundUser,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const deleteUser = async (req, res) => {
  try {
    // Delete user image
    let imageToDelete = await User.findOne({ _id: req.params.id });
    if (imageToDelete.photo !== '') {
      fs.unlinkSync(`${imageToDelete.photo}`);
    }
    // Delete user object
    let deletedUser = await User.findOneAndDelete({ _id: req.params.id });

    if (deletedUser) {
      res.status(200).json({
        status: true,
        message: "L'utilisateur a été supprimée avec succès",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                               ACCOUNT SETTING                              */
/* -------------------------------------------------------------------------- */

/**
 * Disable User account
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const disableAccount = async (req, res) => {
  try {
    await User.findOneAndUpdate({ _id: req.params.id }, { is_active: false });
    res.json({
      success: true,
      message: 'Votre compte a été désactivé',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Enable User account
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const enableAccount = async (req, res) => {
  try {
    let foundUser = await User.findOne({ confirmationCode: req.params.token }); // to check for email
    // if confirmationCode doesn't exist
    if (!foundUser) {
      res.status(403).json({
        success: false,
        message: "Échec de l'authentification, utilisateur introuvable",
      });
    } else {
      let token = jwt.sign(foundUser.toJSON(), process.env.SECRET, {
        expiresIn: 604800, // 1 week
      });
      if (foundUser.is_active === true) {
        res.json({
          success: true,
          token: token,
          user: foundUser,
          message: 'votre compte déjà activé',
        });
      } else {
        try {
          await User.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(foundUser._id) },
            { is_active: true, confirmationCode: undefined },
          );
          res.status(200).json({
            success: true,
            token: token,
            message: 'Votre compte a été activé avec succès',
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            message: error.message,
          });
        }
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export module
module.exports = {
  checkExistEmail,

  signIn,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateUserById,
  disableAccount,
  enableAccount,
  getAllUsers,
  deleteUser,
};
