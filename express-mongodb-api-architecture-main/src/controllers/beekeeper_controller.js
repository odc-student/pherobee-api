const Subowner = require("../models/SubOwnerSchema");
const Farm = require("../models/FarmSchema");
const Beekeeper = require("../models/BeekeeperSchema");
const Beehive = require("../models/Beehive");



const getBeeKeepers = async (req, res) => {
  try {
    const beekeepers = await Beekeeper.find();
    res.json(beekeepers);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
}

const createFarm = async (req, res) => {
  try {

    const { location , beekeeperId} = req.body;

    // Create a new Subowner document
    const farm = new Farm({
      location,
    });


    // Update the Beekeeper's subowners array
    const beekeeper = await Beekeeper.findById(beekeeperId);
    if (!beekeeper) {
      return res.status(404).json({message: 'Beekeeper not found'});
    }

    beekeeper.farms.push(farm);
    await beekeeper.save();


    // Save the subowner document
    await farm.save();

    res.status(201).json(farm);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
}


const addSubowner = async (req, res) => {
  try {
    const {username, email, password, beekeeperId} = req.body;

    // Create a new Subowner document
    const subowner = new Subowner({
      username,
      email,
      password
    });


    // Update the Beekeeper's subowners array
    const beekeeper = await Beekeeper.findById(beekeeperId);
    if (!beekeeper) {
      return res.status(404).json({message: 'Beekeeper not found'});
    }

    beekeeper.subowners.push(subowner);
    await beekeeper.save();


    // Save the subowner document
    await subowner.save();

    res.status(201).json(subowner);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
}




const assignBeehiveToFarm = async (req, res) => {
  try {
    const {beehiveId, farmId} = req.body;


    // Update the Beekeeper's subowners array
    // const beekeeper = await Beekeeper.findById(beekeeperId);
    const farm = await Farm.findById(farmId);
    const bees = await Beehive.find()
    console.log(bees)
    const beehive = await Beehive.findById(beehiveId);
    // if (!beekeeper) {
    //   return res.status(404).json({message: 'Beekeeper not found'});
    // }
    if (!farm) {
      return res.status(404).json({message: 'Farm not found'});
    }
    if (!beehive) {
      return res.status(404).json({message: 'Beehive not found'});
    }

    farm.hives.push(beehive);
    await farm.save();



    res.status(201).json(farm);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
}

module.exports = {
  assignBeehiveToFarm,
  addSubowner,
  getBeeKeepers,
  createFarm
}
