const Subowner = require("../models/subowner");
const Farm = require("../models/farm");
const Beekeeper = require("../models/beekeeper");
const Beehive = require("../models/beehive");
const bcrypt = require('bcrypt');


const getBeeKeepers = async (req, res) => {
  try {
    const beekeepers = await Beekeeper.find();
    let result = []
    for (let i = 0; i < beekeepers.length; i++) {

      // console.log(beekeepers[i])
      const {password, ...otherData}  = beekeepers[i]._doc
      // console.log(otherData)
      result.push(otherData)

    }

    res.json(result);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
}

const createFarm = async (req, res) => {
  try {
    const beekeeperId = req.decoded._id
    const { name,location  } = req.body;
    // Create a new Subowner document
    const farm = new Farm({
      name,
      location,
    });

    // Update the Beekeeper's subowners array
    const beekeeper = await Beekeeper.findById(beekeeperId);
    if (!beekeeper) {
      return res.status(404).json({message: 'Beekeeper not found'});
    }
    console.log(name)
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
    const beekeeperId = req.decoded._id
    let { email, password   } = req.body;
    // Update the Beekeeper's subowners array
    const beekeeper = await Beekeeper.findById(beekeeperId);
    if (!beekeeper) {
      return res.status(404).json({message: 'Beekeeper not found'});
    }
    //hash the password
    const hash_pass = bcrypt.hashSync(password, 10)
    // console.log(hash_pass)
    // Create a new Subowner document

    const subowner = new Subowner({
      email,
      password:hash_pass,

    });


    // Save the subowner document

    await subowner.save();


    beekeeper.subowners.push(subowner);
    await beekeeper.save();

// Create a response object without the password field
    const responseSubowner = {
      _id: subowner._id,
      email: subowner.email,
      // Other fields you want to include in the response
    };


    res.status(201).json(responseSubowner);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
}




const assignBeehiveToFarm = async (req, res) => {
  try {
    const beekeeperId = req.decoded._id
    const {beehiveId, farmId} = req.body;


    // Update the Beekeeper's subowners array
    const beekeeper = await Beekeeper.findById(beekeeperId);
    const farm = await Farm.findById(farmId);
    const beehive = await Beehive.findById(beehiveId);
    if (!beekeeper) {
      return res.status(404).json({message: 'Beekeeper not found'});
    }
    if (!beehive) {
      return res.status(404).json({message: 'Beehive not found'});
    }
    if (beekeeper.hives.includes(beehive)) {
      return res.status(404).json({message: 'Beekeeper has no access to the beehive'});
    }

    if (!farm) {
      return res.status(404).json({message: 'Farm not found'});
    }

    farm.hives.push(beehive);
    await farm.save();



    res.status(201).json(farm);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
}


const assignBeehiveToBeekeeper = async (req, res) => {
  try {
    const beekeeperId = req.decoded._id
    const {beehiveId} = req.body;

    const beekeeper = await Beekeeper.findById(beekeeperId);

    if (!beekeeper) {
      return res.status(404).json({message: 'Beekeeper not found'});
    }
    const beehive = await Beehive.findById(beehiveId);
    // if (!beekeeper) {
    //   return res.status(404).json({message: 'Beekeeper not found'});
    // }
    if (!beehive) {
      return res.status(404).json({message: 'Beehive not found'});
    }

    beekeeper.hives.push(beehive);
    await beekeeper.save();



    res.status(201).json(beekeeper);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
}


const retreiveSubownersByBeekeeper = async (req, res) => {
  try {
    const beekeeperId = req.params.beekeeperid;

    console.log(beekeeperId)
    // Update the Beekeeper's subowners array
    // const beekeeper = await Beekeeper.findById(beekeeperId);
    const beekeeper = await Beekeeper.findById(beekeeperId);
    if (!beekeeper) {
      return res.status(404).json({message: 'Beekeeper not found'});
    }
    let result = []
    for(let i =0; i<beekeeper.subowners.length ;i++){
      const subowner = await Subowner.findById(beekeeper.subowners[i])
      const dataRetreived={
        _id: subowner._id,
        email: subowner.email,
        FarmAccess: subowner.FarmAccess,
      }
      result.push(dataRetreived)

    }
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
}

const retreiveHivesByFarm = async (req, res) => {
  try {
    const {farmId} = req.params.farmid;


    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({message: 'Farm not found'});
    }
    let result = []
    for(let i =0; i<farm.hives.length ;i++){
      const hive = await Beehive.findById(farm.hives[i])
      result.push(hive)

    }
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
}




module.exports = {
  retreiveHivesByFarm,
  retreiveSubownersByBeekeeper,
  assignBeehiveToFarm,
  addSubowner,
  getBeeKeepers,
  createFarm,
  assignBeehiveToBeekeeper
}
