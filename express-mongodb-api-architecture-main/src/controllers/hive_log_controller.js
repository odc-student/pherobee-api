const HiveLog = require('../models/hive_log');
const Beehive = require('../models/beehive');
const mongoose = require('mongoose');



const createHiveLog = async (req, res) => {
  try {
    const { temperature, humidity, beehiveId } = req.body;

    const beehive = await Beehive.findById(beehiveId);
    if (!beehive) {
      return res.status(404).json({ message: 'Beehive not found' });
    }
    const newHiveLog = new HiveLog({
      temperature,
      humidity,
      beehive: beehiveId,
    });

    beehive.hiveLog.push(newHiveLog);

    await newHiveLog.save();

    await beehive.save();

    return res.status(201).json({ message: 'HiveLog created successfully.', hiveLog: newHiveLog });
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred while creating HiveLog.' });
  }
};

const getHiveLogsByBeehive = async (req, res) => {
  try {
    // const { beehiveId } = req.params;
    //
    // if (!mongoose.Types.ObjectId.isValid(beehiveId)) {
    //   return res.status(400).json({ message: 'Invalid beehiveId format.' });
    // }

    const hiveLogs = await HiveLog.find();


    return res.status(200).json({ hiveLogs });
  } catch (error) {
    console.error('Error retrieving HiveLogs:', error);
    return res.status(500).json({ message: 'An error occurred while retrieving HiveLogs.' });
  }
};


module.exports = {

  createHiveLog,
  getHiveLogsByBeehive,
};
