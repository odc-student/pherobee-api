const Notification = require('../models/notification');
const Beehive = require('../models/beehive');
const Beekeeper = require('../models/beekeeper');
const Farm = require('../models/farm');
const Subowner = require('../models/subowner');
const mongoose = require('mongoose');

const adminSDK = require("firebase-admin/messaging")
const {createApiResponse} = require("../utils/api_response");

const sendNotif = async (req, res) => {

  const {title, body, serialNumber, type} = req.body
  const beehives = await Beehive.find({serialNumber})

  if (beehives.length === 0) {
    return res.status(404).json(createApiResponse({message: 'Beehive not found'}, 404, 'Beehive not found'))
  } else {
    const notification = new Notification(
      {
        title, body, serialNumber, type
      }
    )
    await notification.save();
    const message = {
      notification: {
        title: title,
        body: body
      },
      topic: serialNumber
    };

    console.log(serialNumber)
    let result = await adminSDK.getMessaging().send(message)
    return res.status(200).json(createApiResponse({result, notification}))
  }
}

const getNotifications = async (req, res) => {

  const userId = req.decoded._id
  let serialNumbers;
  if (req.decoded.role === 'beekeeper') {
    const beekeeper = await Beekeeper.findById(userId).populate([{path: "beehives", select: "serialNumber"}]);
    if (!beekeeper) {
      return res.status(404).json(createApiResponse({message: 'Beekeeper not found'}, 404, 'Beekeeper not found', false));
    }
    // const notifications
    const beehives = await Beehive.find({beekeeper})
    serialNumbers = beehives.map(beehive => beehive.serialNumber)
  } else if (req.decoded.role === 'subowner') {
    const subowner = await Subowner.findById(userId).populate({
      path: "farmAccess",
      populate: {path: "beehives", select: "serialNumber"}
    });
    const data = subowner.farmAccess.map(f => f.beehives.map(b => b.serialNumber))
    serialNumbers = [].concat(...data)
    console.log(serialNumbers)
  }
  const notifications = await Notification.find({serial_number: {$in: serialNumbers}})

  return res.status(200).json(createApiResponse(notifications))

}


module.exports = {
  sendNotif,
  getNotifications
};
