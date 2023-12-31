/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const {default: mongoose} = require('mongoose');
const nodemailer = require('nodemailer');
const async = require('async');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
// Models
const Admin = require('../models/user');
const Beekeeper = require('../models/beekeeper');
const Beehive = require('../models/beehive');
const Subowner = require('../models/subowner');
const Farm = require('../models/farm');

const verifyToken = require('../middlewares/verify-token');
const verifyRole = require('../middlewares/verify-role');

// Token
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Email Template
const {
  singUpConfirmationEmailTemplate, forgotPasswordEmailTemplate, resetPasswordConfirmationEmailTemplate,
} = require('../template/userAccountEmailTemplates');
const {captureRejectionSymbol} = require('events');
const {createApiResponse} = require("../utils/api_response");


/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */
const FROM_EMAIL = process.env.MAILER_EMAIL_ID;
const AUTH_PASSWORD = process.env.MAILER_PASSWORD;

const API_ENDPOINT = process.env.NODE_ENV === 'production' ? process.env.API_ENDPOINT : process.env.API_ENDPOINT;

var smtpTransport = nodemailer.createTransport({
  host: process.env.HOST, port: process.env.PORT_SSL, secure: false, // true for 465, false for other ports
  service: process.env.MAILER_SERVICE_PROVIDER, auth: {
    user: FROM_EMAIL, pass: AUTH_PASSWORD,
  }, tls: {
    rejectUnauthorized: false, // disable certificate vercation
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
const comparePasswords = (password, hash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const checkExistEmail = async (req, res) => {
  let foundUser = await Admin.findOne({email: req.body.email});
  // if email doesn't exist
  if (!foundUser) {
    res.status(200).json({
      success: true,
    });
  } else {
    res.status(403).json({
      success: false, message: 'Email existe déjà',
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
    const {email, password} = req.body;
    // console.log({email, password})
    console.log('Login request received:', email);

    const foundAdmin = await Admin.findOne({email});
    if (!foundAdmin) {

      const foundBeekeeper = await Beekeeper.findOne({email});

      if (!foundBeekeeper) {
        const foundSubowner = await Subowner.findOne({email});

        if (!foundSubowner) {
          console.log('this user is not found:', email);
          return res.status(403).json(createApiResponse({message: "Échec de l'authentification, utilisateur introuvable"}, 403, "Échec de l'authentification, utilisateur introuvable", false));
        }
        console.log( foundSubowner)
        const isPasswordMatch = bcrypt.compareSync(password, foundSubowner.password);
        if (isPasswordMatch) {
          const token = jwt.sign({_id: foundSubowner._id, role: foundSubowner.role}, process.env.SECRET, {
            expiresIn: '1w',
          });
          const {password, ...payload} = foundSubowner._doc
          return res.json(createApiResponse({token: token, role:"subowner",}));
        }

      }
      else{

      const isPasswordMatch = bcrypt.compareSync(password, foundBeekeeper.password);

      if (isPasswordMatch) {
        const token = jwt.sign({_id: foundBeekeeper._id, role: foundBeekeeper.role}, process.env.SECRET, {
          expiresIn: '1w',
        });
        const {password, ...payload} = foundBeekeeper._doc
        return res.json(createApiResponse({token: token, role:"beekeeper",}));
      }}
    } else
    {
      const isPasswordMatch = bcrypt.compareSync(password, foundAdmin.password);

      if (isPasswordMatch) {
        const token = jwt.sign({_id: foundAdmin._id, role: foundAdmin.role}, process.env.SECRET, {
          expiresIn: '1w',
        });

        return res.json(createApiResponse({
          token: token, role: "admin",
        }));
      }
    }

    // Incorrect password or no matching user
    console.log('Incorrect password or user not found:', email);
    return res.status(403).json(createApiResponse({
      message: "Échec de l'authentification, Mot de passe erroné ou utilisateur introuvable",
    }, 403, "Échec de l'authentification, Mot de passe erroné ou utilisateur introuvable", false));
  } catch (error) {
    return res.status(500).json(createApiResponse({
      success: false, message: error.message,
    }, 500, error.message, false));
  }
};
const calculateExpiryDate = function() {
  const now = new Date();
  return new Date(now.getTime() + (15 * 60 * 1000)); // 15 mn expiry (adjust as needed)
}

/**
 * Send Email to reset password
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */

const forgotPassword = function (req, res) {
  async.waterfall(
    [
      function (done) {
        Beekeeper.findOne({
          email: req.body.email,
        }, function (err, beekeeper) {
          if (err) {
            return done(err);
          }
          if (!beekeeper) {
            return done('Beekeeper not found.');
          }
          done(null, beekeeper);
        });
      },
      function (beekeeper, done) {
        crypto.randomBytes(20, function (err, buffer) {
          if (err) {
            return done(err);
          }
          var token = buffer.toString('hex');
          done(null, beekeeper, token);
        });
      },
      function (beekeeper, token, done) {
        const expiryDate = calculateExpiryDate(); // Calculate expiry date

        Beekeeper.findByIdAndUpdate(
          { _id: beekeeper._id },
          {
            forgotPasswordToken: token,
            resetPasswordExpires: expiryDate, // Store expiry date in database
          },
          { new: true },
          function (err, new_beekeeper) {
            if (err) {
              return done(err);
            }
            console.log('Token and expiry date saved in database:', token, expiryDate);
            done(null, token, new_beekeeper);
          }
        );
      },
      function (token, beekeeper, done) {
        const template = forgotPasswordEmailTemplate(
          beekeeper.firstName +
          " " + beekeeper.lastName,
          beekeeper.email,
          API_ENDPOINT,
          token
        );

        var data = {
          from: FROM_EMAIL,
          to: beekeeper.email,
          subject: 'Reset Your Password',
          html: template,
        };

        console.log(`Sending email to: ${beekeeper.email}`);
        smtpTransport.sendMail(data, function (err) {
          if (err) {
            console.error(err);
            return done(err);
          }
          console.log(`Email sent successfully`);
          return res.json({
            message: "Please check your email for further instructions",
          });
        });

      },
    ],
    function (err) {
      return res.status(422).json({ message: err });
    }
  );
};
/**
 * Reset password
 */
const resetPassword = function (req, res) {
  const token = req.params.token;
  console.log(`Token from URL: ${token}`);

  const newPassword = req.body.newPassword;
  const verifyPassword = req.body.verifyPassword;

  if (newPassword !== verifyPassword) {
    return res.status(422).send({
      message: 'Passwords do not match',
    });
  }

  Beekeeper.findOne({
    forgotPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  }).exec(async function (err, beekeeper) {
    if (err) {
      console.log('Error finding beekeeper:', err);
      return res.status(500).send({
        message: 'Internal Server Error',
      });
    }

    if (!beekeeper) {
      console.log('Beekeeper not found for token:', token);
      return res.status(400).send({
        message: 'Password reset token is invalid or has expired.',
      });
    }


    beekeeper.password = await bcrypt.hash(newPassword, 10);

    beekeeper.forgotPasswordToken = undefined;
    beekeeper.resetPasswordExpires = undefined;

    beekeeper.save(function (err) {
      if (err) {
        console.log('Error saving beekeeper:', err);
        return res.status(500).send({
          message: 'Internal Server Error',
        });
      }

      const template = resetPasswordConfirmationEmailTemplate(beekeeper.firstName, beekeeper.lastName, beekeeper.email, newPassword);
      const data = {
        to: beekeeper.email,
        from: FROM_EMAIL,
        subject: 'Confirmation de réinitialisation du mot de passe',
        html: template,
      };

      smtpTransport.sendMail(data, function (err) {
        if (!err) {
          console.log('Email sent successfully');
          return res.json({message: 'Réinitialisation du mot de passe'});
        } else {
          console.log('Error sending email:', err);
          return res.status(500).json({
            message: err.message,
          });
        }
      });
    });
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
    let foundUser = await Admin.findOne({_id: req.decoded._id}).exec();

    if (foundUser) {
      res.status(200).json({
        success: true, user: foundUser,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false, message: error.message,
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
    let foundUser = await Admin.findOne({_id: req.params.id});

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

    let updatedUser = await Admin.findOneAndUpdate({_id: req.params.id}, {
      $set: {
        ...updateImages,
        email: req.body.email ? req.body.email : foundUser.email,
        fullName: req.body.fullName ? req.body.fullName : foundUser.fullName,
        governorate: req.body.governorate ? req.body.governorate : foundUser.governorate,
        municipality: req.body.municipality ? req.body.municipality : foundUser.municipality,
        phoneNumber: req.body.phoneNumber ? req.body.phoneNumber : foundUser.phoneNumber,
        is_active: req.body.is_active ? req.body.is_active : foundUser.is_active,
        is_admin: req.body.is_admin ? req.body.is_admin : foundUser.is_admin,
        is_manager: req.body.is_manager ? req.body.is_manager : foundUser.is_manager,
        age: req.body.age ? req.body.age : foundUser.age,
        gender: req.body.gender ? req.body.gender : foundUser.gender,
        dateOfBirth: req.body.dateOfBirth ? req.body.dateOfBirth : foundUser.dateOfBirth,
      },
    }, {new: true, upsert: true},);

    res.status(200).json({
      success: true, message: "Mise à jour réussie de l'utilisateur", updatedUser: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false, message: error.message,
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
    let foundUser = await Admin.find().exec();

    if (foundUser) {
      res.status(200).json({
        success: true, user: foundUser,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false, message: error.message,
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
    let imageToDelete = await Admin.findOne({_id: req.params.id});
    if (imageToDelete.photo !== '') {
      fs.unlinkSync(`${imageToDelete.photo}`);
    }
    // Delete user object
    let deletedUser = await Admin.findOneAndDelete({_id: req.params.id});

    if (deletedUser) {
      res.status(200).json({
        status: true, message: "L'utilisateur a été supprimée avec succès",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false, message: error.message,
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
    await Admin.findOneAndUpdate({_id: req.params.id}, {is_active: false});
    res.json({
      success: true, message: 'Votre compte a été désactivé',
    });
  } catch (error) {
    res.status(500).json({
      success: false, message: error.message,
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
    let foundUser = await Admin.findOne({confirmationCode: req.params.token}); // to check for email
    // if confirmationCode doesn't exist
    if (!foundUser) {
      res.status(403).json({
        success: false, message: "Échec de l'authentification, utilisateur introuvable",
      });
    } else {
      let token = jwt.sign(foundUser.toJSON(), process.env.SECRET, {
        expiresIn: 604800, // 1 week
      });
      if (foundUser.is_active === true) {
        res.json({
          success: true, token: token, user: foundUser, message: 'votre compte déjà activé',
        });
      } else {
        try {
          await Admin.findOneAndUpdate({_id: mongoose.Types.ObjectId(foundUser._id)}, {
            is_active: true, confirmationCode: undefined
          },);
          res.status(200).json({
            success: true, token: token, message: 'Votre compte a été activé avec succès',
          });
        } catch (error) {
          res.status(500).json({
            success: false, message: error.message,
          });
        }
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false, message: error.message,
    });
  }
};

const createBeekeeperAccount = async (req, res) => {
  try {
    const {firstName, lastName, email, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const loginLink = `${process.env.API_ENDPOINT}/v1/api/auth/login`;

    const beekeeper = new Beekeeper({
      firstName, lastName, email, password: hashedPassword, role: 'beekeeper', forgotPasswordToken: '',
    });
    const defaultFarm = new Farm({
      name:"Default Farm",
      beekeeper,
      deletable:false,
    })
    beekeeper.farms.push(defaultFarm);
    await beekeeper.save();
    // Save the subowner document
    await defaultFarm.save();


    await beekeeper.save();

    // Send email with credentials
    const template = singUpConfirmationEmailTemplate(firstName, lastName, email, loginLink, password);

    const data = {
      from: process.env.SENDER_EMAIL, to: email, subject: 'Beekeeper Account Created', html: template,
    };

    smtpTransport.sendMail(data, function (err) {
      if (!err) {
        res.status(201).json({message: 'Beekeeper account created successfully.'});
      } else {
        console.error('Error sending email:', err);
        res.status(500).json({error: 'An error occurred while creating the beekeeper account.'});
      }
    });
  } catch (error) {
    console.error('Error creating beekeeper account:', error);
    res.status(500).json({error: 'An error occurred while creating the beekeeper account.'});
  }
};

const assignBeehiveToBeekeeper = async (req, res) => {
  try {
    const {beehiveId, beekeeperId} = req.body;

    // Verify role ('super admin')
    if (!req.decoded || req.decoded.role !== 'super admin') {
      console.log('Access denied. Insufficient privileges for role:', req.decoded.role);
      return res.status(403).json({message: 'Access denied. Insufficient privileges.'});
    }

    // Find the Beehive and Beekeeper
    const beehive = await Beehive.findById(beehiveId);
    const beekeeper = await Beekeeper.findById(beekeeperId);

    if (!beehive || !beekeeper) {
      console.log('Beehive:', beehive, 'Beekeeper:', beekeeper);
      return res.status(404).json({message: 'Beehive or Beekeeper not found.'});
    }

    // Update Beehive with Beekeeper assignment
    beehive.beekeeper = beekeeperId;
    await beehive.save();

    res.status(200).json({message: 'Beehive assigned to Beekeeper successfully.'});
  } catch (error) {
    console.error('Error assigning beehive to beekeeper:', error);
    res.status(500).json({message: 'An error occurred while assigning beehive to beekeeper.'});
  }
};


const createBeehive = async (req, res) => {
  try {
    const {status} = req.body;

    if (req.decoded.role !== 'super admin') {
      console.log('Access denied. Insufficient privileges for role:', req.decoded.role);
      return res.status(403).json({message: 'Access denied. Insufficient privileges.'});
    }

    // Generate a unique serial number
    const serialNumber = generateUniqueSerialNumber();

    // Create a new Beehive
    const newBeehive = new Beehive({
      status, serialNumber,
    });

    await newBeehive.save();

    return res.status(201).json({message: 'Beehive created successfully.', beehive: newBeehive});
  } catch (error) {
    console.error('Error creating beehive:', error);
    return res.status(500).json({message: 'An error occurred while creating beehive.'});
  }
};

const generateUniqueSerialNumber = () => {
  return generateRandomSerialNumber();
};

const generateRandomSerialNumber = () => {
  const randomDigits = Math.floor(Math.random() * 1000000);
  return `BH${randomDigits}`;
};

const changePassword = async (req, res) => {
  try {
    const beekeeperId = req.decoded._id
    const { currentPassword, newPassword } = req.body;
    console.log(beekeeperId)
    // Get the current user
    const user = await Beekeeper.findById( beekeeperId );

    // Validate the current password
    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(403).json({
        message: "Incorrect current password",
      });
    }

    // Hash the new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await Beekeeper.updateOne({ _id: user._id }, { password: newPasswordHash });

    // Return a success response
    return res.json(createApiResponse({
      message: "Password changed successfully",
    }, 200, "Password changed successfully" , true));
  } catch (error) {
    return res.status(500).json(createApiResponse(error, 500, "Error when getting beekeepers " + error.message, false));
  }
};




module.exports = {
  checkExistEmail,
  signIn,
  changePassword,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateUserById,
  disableAccount,
  enableAccount,
  getAllUsers,
  deleteUser,
  createBeekeeperAccount,
  assignBeehiveToBeekeeper,
  createBeehive,

};



