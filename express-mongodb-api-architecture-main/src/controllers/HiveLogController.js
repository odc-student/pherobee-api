const HiveLog = require('../models/HiveLog');
const mongoose = require('mongoose');



const createHiveLog = async (req, res) => {
    try {
      const { temperature, humidity, beehiveId } = req.body;
  
      const newHiveLog = new HiveLog({
        temperature,
        humidity,
        beehive: beehiveId,
      });
  
      await newHiveLog.save();
  
      return res.status(201).json({ message: 'HiveLog created successfully.', hiveLog: newHiveLog });
    } catch (error) {
      console.error('Error creating HiveLog:', error);
      return res.status(500).json({ message: 'An error occurred while creating HiveLog.' });
    }
  };
  
  const getHiveLogsByBeehive = async (req, res) => {
    try {
      const { beehiveId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(beehiveId)) {
        return res.status(400).json({ message: 'Invalid beehiveId format.' });
      }
  
      const hiveLogs = await HiveLog.find({ beehive: beehiveId }).sort('-timestamp').exec();
  
      if (!hiveLogs || hiveLogs.length === 0) {
        return res.status(404).json({ message: 'No hive logs found for the specified beehiveId.' });
      }
  
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
