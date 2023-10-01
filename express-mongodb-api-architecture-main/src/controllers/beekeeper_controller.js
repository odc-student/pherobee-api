const Subowner = require("../models/subowner");
const Farm = require("../models/farm");
const Beekeeper = require("../models/beekeeper");
const Beehive = require("../models/beehive");
const bcrypt = require('bcrypt');
const {createApiResponse} = require("../utils/api_response")

const getBeeKeepers = async (req, res) => {
    try {
        const beekeepers = await Beekeeper.find().populate([{
            path: "subowners", strictPopulate: false, select: "-password"
        }, {path: "beehives", populate: {path: "hiveLog"}}, {path: "farms", strictPopulate: false},

        ]).select("-password");


        res.json(createApiResponse(beekeepers));
    } catch (error) {
        res.status(500).json(createApiResponse(error, 500, "Error when getting beekeepers" + error.message, false));
    }
}

const createFarm = async (req, res) => {
    try {
        const beekeeperId = req.decoded._id
        const {name, location} = req.body;
        // Create a new Subowner document
        const farm = new Farm({
            name, location,
        });

        // Update the Beekeeper's subowners array
        const beekeeper = await Beekeeper.findById(beekeeperId);
        if (!beekeeper) {
            return res.status(404).json(createApiResponse({message: 'Beekeeper not found'}, 404, 'Beekeeper not found', false));
        }
        beekeeper.farms.push(farm);
        await beekeeper.save();
        // Save the subowner document
        await farm.save();
        res.status(201).json(createApiResponse(farm, 201, "Farm created successfully"));
    } catch (error) {
        res.status(500).json(createApiResponse(error, 500, "Error when creating the farm" + error.message, false));
    }
}


const addSubowner = async (req, res) => {
    try {
        const beekeeperId = req.decoded._id
        let {email, password} = req.body;
        // Update the Beekeeper's subowners array
        const beekeeper = await Beekeeper.findById(beekeeperId);
        if (!beekeeper) {
            return res.status(404).json(createApiResponse({message: 'Beekeeper not found'}, 404, 'Beekeeper not found', false));
        }
        //hash the password
        const hash_pass = bcrypt.hashSync(password, 10)
        // console.log(hash_pass)
        // Create a new Subowner document

        const subowner = new Subowner({
            email, password: hash_pass,beekeeper

        });
        await subowner.save();
        beekeeper.subowners.push(subowner);
        await beekeeper.save();
        res.status(201).json(createApiResponse(beekeeper, 201, 'Subowner created successfully'));

    } catch (error) {
        res.status(500).json(createApiResponse(error, 500, "Error when creating the farm" + error.message, false));
    }

}


const assignBeehiveToFarm = async (req, res) => {
    try {
        const beekeeperId = req.decoded._id;
        const {beehiveId, farmId} = req.body;
        // Update the Beekeeper's subowners array
        const beekeeper = await Beekeeper.findById(beekeeperId);
        const farm = await Farm.findById(farmId);
        const beehive = await Beehive.findById(beehiveId);
        if (!beekeeper) {
            return res.status(404).json(createApiResponse({message: 'Beekeeper not found'}, 404, 'Beekeeper not found', false));
        }
        if (!beehive) {
            return res.status(404).json(createApiResponse({message: 'Beehive not found'}, 404, 'Beehive not found', false));
        }
        const hasAccess = beekeeper.beehives.some(hive => hive.equals(beehiveId));
        if (!hasAccess) {
            return res.status(403).json(createApiResponse({message: 'Beekeeper has no access to the beehive'}, 403, 'Beekeeper has no access to the beehive', false));
        }
        if (!farm) {
            return res.status(404).json(createApiResponse({message: 'Farm not found'}, 404, 'Farm not found', false));
        }

        // Check if the beehive is already assigned to the farm
        const isAlreadyAssigned = farm.beehives.some(existingHive => existingHive.equals(beehiveId));
        if (isAlreadyAssigned) {
            return res.status(400).json(createApiResponse({message: 'Beehive is already assigned to the farm'}, 400, 'Beehive is already assigned to the farm', false));
        }

        // Push the beehive into the farm's beehives array and save the farm
        farm.beehives.push(beehive);
        await farm.save();

        res.status(201).json(createApiResponse(farm, 201));
    } catch (error) {
        res.status(500).json(createApiResponse(error, 500, "Error when creating the farm" + error.message, false));
    }

};
const retrieveSubownersByBeekeeper = async (req, res) => {
    try {
        const beekeeperId = req.params.beekeeperid;

        console.log(beekeeperId)
        // Update the Beekeeper's subowners array
        // const beekeeper = await Beekeeper.findById(beekeeperId);
        const beekeeper = await Beekeeper.findById(beekeeperId);
        if (!beekeeper) {
            return res.status(404).json(createApiResponse({message: 'Beekeeper not found'}, 404, 'Beekeeper not found', false));
        }
        let result = []
        for (let i = 0; i < beekeeper.subowners.length; i++) {
            const subowner = await Subowner.findById(beekeeper.subowners[i]).select("-password")
            result.push(subowner)

        }
        res.status(201).json(createApiResponse(result, 201));
    } catch (error) {
        res.status(500).json(createApiResponse(error, 500, "Error when creating the farm" + error.message, false));
    }
}

const retrieveHivesByFarm = async (req, res) => {
    try {
        const {farmId} = req.params;

        const farm = await Farm.findById(farmId).populate('beehives');

        if (!farm) {
            return res.status(404).json(createApiResponse({message: 'Farm not found'}, 404, 'Farm not found', false));
        }

        res.status(201).json(createApiResponse(farm.beehives, 201));
    } catch (error) {
        res.status(500).json(createApiResponse(error, 500, "Error :" + error.message, false));
    }
}

const getBeeKeepersById = async (req, res) => {
    const beekeeperId = req.decoded._id
    const beekeeper = await Beekeeper.findById(beekeeperId).populate([{
        path: "subowners", strictPopulate: false, select: "-password"
    }, {path: "beehives", populate: {path: "hiveLog" }}, {path: "farms"},

    ]).select("-password");

    if (!beekeeper) {
        return res.status(404).json(createApiResponse({message: 'Beekeeper not found'}, 404, 'Beekeeper not found', false));
    }
    return res.status(200).json(createApiResponse(beekeeper))
}

const getSubownerById = async (req, res) => {
    const subownerId = req.decoded._id

    const subowner = await Subowner.findById(subownerId).populate([{path:"farmAccess",populate: {path:"beehives",populate:"hiveLog"}}]).select("-password");

    if (!subowner) {
        return res.status(404).json(createApiResponse({message: 'Subowner not found'}, 404, 'Beekeeper not found', false));
    }
    return res.status(200).json(createApiResponse(subowner))
}

const assignBeehiveToBeekeeper = async (req, res) => {
    const {beekeeperId} = req.body
    const beekeeper = await Beekeeper.findById(beekeeperId).populate([{
        path: "subowners", strictPopulate: false, select: "-password"
    }, {path: "beehives", populate: {path: "hiveLog"}}, {path: "farms", strictPopulate: false},

    ]).select("-password");

    if (!beekeeper) {
        return res.status(404).json(createApiResponse({message: 'Beekeeper not found'}, 404, 'Beekeeper not found', false));
    }
    const {beehiveId} = req.body;
    const beehive = await Beehive.findById(beehiveId)

    if (!beehive) {
        return res.status(404).json(createApiResponse({message: 'Beehive not found'}, 404, 'Beehive not found', false));
    }

    beekeeper.beehives.push(beehive)
    beekeeper.defaultFarm.push(beehive)
    await beekeeper.save()
    beehive.beekeeper = beekeeper
    await beehive.save()
    return res.status(200).json(createApiResponse(beekeeper))
}


const deleteSubowner = async (req, res) => {
    try {
        const beekeeperId = req.decoded._id;
        const subownerId = req.body.subownerId; // Assuming you have a route parameter for subownerId

        const beekeeper = await Beekeeper.findById(beekeeperId);
        if (!beekeeper) {
            return res.status(404).json(createApiResponse({message: 'Beekeeper not found'}, 404, 'Beekeeper not found', false));
        }

        const subownerIndex = beekeeper.subowners.findIndex(subowner => subowner._id.toString() === subownerId);
        if (subownerIndex === -1) {
            return res.status(404).json(createApiResponse({message: 'Subowner not found'}, 404, 'Subowner not found', false));
        }

        beekeeper.subowners.splice(subownerIndex, 1);
        await beekeeper.save();

        await Subowner.findByIdAndDelete(subownerId);

        res.status(200).json(createApiResponse({message: 'Subowner deleted successfully'}));
    } catch (error) {
        res.status(500).json(createApiResponse(error, 500, "Error :" + error.message, false));
    }
}

const patchSubowner = async (req, res) => {
    try {
        const beekeeperId = req.decoded._id;
        const {email, password, subownerId} = req.body;

        const beekeeper = await Beekeeper.findById(beekeeperId);
        if (!beekeeper) {
            return res.status(404).json(createApiResponse({message: 'Beekeeper not found'}, 404, 'Beekeeper not found', false));
        }

        const subowner = await Subowner.findById(subownerId);
        if (!subowner) {
            return res.status(404).json(createApiResponse({message: 'Subowner not found'}, 404, 'Subowner not found', false));
        }

        // Check if the Beekeeper has the specified Subowner
        const hasSubowner = beekeeper.subowners.some(sub => sub._id.toString() === subownerId);
        if (!hasSubowner) {
            return res.status(403).json(createApiResponse({message: 'Beekeeper does not have this Subowner'}, 404, 'Beekeeper does not have this Subowner', false));
        }

        // Update subowner's information
        subowner.email = email;
        subowner.password = bcrypt.hashSync(password, 10);

        await subowner.save();

        res.status(200).json(createApiResponse(subowner));
    } catch (error) {
        res.status(500).json(createApiResponse(error, 500, "Error :" + error.message, false));
    }
}
const deleteFarm = async (req, res) => {
    try {
        const beekeeperId = req.decoded._id;
        const farmId = req.body.farmId;

        // Find the Beekeeper and populate subowners
        const beekeeper = await Beekeeper.findById(beekeeperId).populate('subowners').select("-password");
        if (!beekeeper) {
            return res.status(404).json(createApiResponse({message: 'Beekeeper not found'}, 404, 'Beekeeper not found', false));
        }

        // Check if the farm is associated with the beekeeper
        if (!beekeeper.farms.includes(farmId)) {
            return res.status(403).json(createApiResponse({message: 'Farm is not associated with this Beekeeper'}, 403, 'Farm is not associated with this Beekeeper', false));
        }

        // Remove the farm from the farms array
        beekeeper.farms = beekeeper.farms.filter(farm => farm.toString() !== farmId);
        await beekeeper.save();

        // Delete the farm document
        const deletedFarm = await Farm.findByIdAndDelete(farmId);
        if (!deletedFarm) {
            return res.status(404).json(createApiResponse({message: 'Farm not found'}, 404, 'Farm not found', false));
        }

        // Remove the farm from subowners' farmAccess arrays
        for (const subowner of beekeeper.subowners) {
            subowner.farmAccess = subowner.farmAccess.filter(farm => !farm.equals(farmId));
            await subowner.save();
        }

        res.status(200).json(createApiResponse({message: 'Farm deleted successfully'}, 200, 'Farm deleted successfully'));
    } catch (error) {
        res.status(500).json(createApiResponse(error, 500, "Error :" + error.message, false));
    }
};

const updateFarm = async (req, res) => {
    try {
        const beekeeperId = req.decoded._id;
        const {name, location, farmId} = req.body;

        // Find the Beekeeper
        const beekeeper = await Beekeeper.findById(beekeeperId);
        if (!beekeeper) {
            return res.status(404).json(createApiResponse({message: 'Beekeeper not found'}, 404, 'Beekeeper not found', false));
        }

        // Check if the farm is associated with the beekeeper
        if (!beekeeper.farms.includes(farmId)) {
            return res.status(403).json(createApiResponse({message: 'Farm is not associated with this Beekeeper'}, 404, 'Farm is not associated with this Beekeeper', false));
        }

        // Find the farm document and update its properties
        const updatedFarm = await Farm.findByIdAndUpdate(farmId, {name, location}, {new: true} // This option returns the updated document
        );

        if (!updatedFarm) {
            return res.status(404).json(createApiResponse({message: 'Farm not found'}, 404, 'Farm not found', false));
        }

        res.status(200).json(createApiResponse(updatedFarm));
    } catch (error) {
        res.status(500).json(createApiResponse(error, 500, "Error :" + error.message, false));
    }
};

const removeBeehiveFromFarm = async (req, res) => {
    try {
        const beekeeperId = req.decoded._id;
        const {beehiveId, farmId} = req.body;

        // Update the Beekeeper's subowners array
        const beekeeper = await Beekeeper.findById(beekeeperId);
        const farm = await Farm.findById(farmId);
        const beehive = await Beehive.findById(beehiveId);

        if (!beekeeper) {
            return res.status(404).json(createApiResponse({message: 'Beekeeper not found'}, 404, 'Beekeeper not found', false));
        }

        if (!beehive) {
            return res.status(404).json(createApiResponse({message: 'Beehive not found'}, 404, 'Beehive not found', false));
        }

        const hasAccess = beekeeper.beehives.some(hive => hive.equals(beehiveId));
        if (!hasAccess) {
            return res.status(403).json(createApiResponse({message: 'Beekeeper has no access to the beehive'}, 403, 'Beekeeper has no access to the beehive'), false);
        }

        if (!farm) {
            return res.status(404).json(createApiResponse({message: 'Farm not found'}, 404, 'Farm not found', false));
        }

        // Remove the beehive from the farm's beehives array
        const beehiveIndex = farm.beehives.indexOf(beehiveId);
        if (beehiveIndex !== -1) {
            farm.beehives.splice(beehiveIndex, 1);
            await farm.save();
        }

        res.status(200).json(createApiResponse(farm));
    } catch (error) {
        res.status(500).json(createApiResponse(error, 500, "Error :" + error.message, false));
    }
};


const assignFarmToSubowner = async (req, res) => {
    try {
        const beekeeperId = req.decoded._id;
        const {subownerId, farmId} = req.body;

        // Update the Beekeeper's subowners array
        const beekeeper = await Beekeeper.findById(beekeeperId);
        const subowner = await Subowner.findById(subownerId).select("-password");
        const farm = await Farm.findById(farmId);

        if (!beekeeper) {
            return res.status(404).json(createApiResponse({message: 'Beekeeper not found'}, 404, 'Beekeeper not found', false));
        }

        if (!subowner) {
            return res.status(404).json(createApiResponse({message: 'Subowner not found'}, 404, 'Subowner not found', false));
        }

        const hasAccessSubowner = beekeeper.subowners.some(s => s.equals(subownerId));
        if (!hasAccessSubowner) {
            return res.status(403).json(createApiResponse({message: 'Beekeeper has no access to the subowner'}, 403, 'Beekeeper has no access to the subowner'), false);
        }

        if (!farm) {
            return res.status(404).json(createApiResponse({message: 'Farm not found'}, 404, 'Farm not found', false));
        }

        const isFarmAssigned = subowner.farmAccess.some(existingFarm => existingFarm.equals(farmId));
        if (isFarmAssigned) {
            return res.status(400).json(createApiResponse({message: 'Farm is already assigned to the subowner'}, 400, 'Farm is already assigned to the subowner', false));
        }

        const hasFarmAccess = beekeeper.farms.some(s => s.equals(farmId));
        if (!hasFarmAccess) {
            return res.status(403).json(createApiResponse({message: 'Beekeeper has no access to the farm'}, 403, 'Beekeeper has no access to the farm', false));
        }

        subowner.farmAccess.push(farm);
        await subowner.save();

        res.status(200).json(createApiResponse(subowner));
    } catch (error) {
        res.status(500).json(createApiResponse(error, 500, "Error :" + error.message, false));
    }
};
const removeFarmFromSubowner = async (req, res) => {
    try {
        const beekeeperId = req.decoded._id;
        const {subownerId, farmId} = req.body;

        // Update the Beekeeper's subowners array
        const beekeeper = await Beekeeper.findById(beekeeperId);
        const subowner = await Subowner.findById(subownerId).select("-password");
        const farm = await Farm.findById(farmId);

        if (!beekeeper) {
            return res.status(404).json(createApiResponse({message: 'Beekeeper not found'}, 404, 'Beekeeper not found', false));
        }

        if (!subowner) {
            return res.status(404).json(createApiResponse({message: 'Subowner not found'}, 404, 'Subowner not found', false));
        }

        const hasAccessSubowner = beekeeper.subowners.some(s => s.equals(subownerId));
        if (!hasAccessSubowner) {
            return res.status(403).json(createApiResponse({message: 'Beekeeper has no access to the subowner'}, 403, 'Beekeeper has no access to the subowner', false));
        }

        if (!farm) {
            return res.status(404).json(createApiResponse({message: 'Farm not found'}, 404, 'Farm not found', false));
        }

        const hasFarmAccess = beekeeper.farms.some(s => s.equals(farmId));
        if (!hasFarmAccess) {
            return res.status(403).json(createApiResponse({message: 'Beekeeper has no access to the farm'}, 403, 'Beekeeper has no access to the farm', false));
        }

        // Remove the farm from subowner's farmAccess array
        subowner.farmAccess = subowner.farmAccess.filter(existingFarm => !existingFarm.equals(farmId));
        await subowner.save();

        res.status(200).json(createApiResponse(subowner));
    } catch (error) {
        res.status(500).json(createApiResponse(error, 500, "Error :" + error.message, false));
    }
};


module.exports = {
    removeFarmFromSubowner,
    assignFarmToSubowner,
    removeBeehiveFromFarm,
    updateFarm,
    deleteFarm,
    patchSubowner,
    deleteSubowner,
    assignBeehiveToBeekeeper,
    retrieveHivesByFarm,
    getSubownerById,
    retrieveSubownersByBeekeeper,
    assignBeehiveToFarm,
    addSubowner,
    getBeeKeepers,
    createFarm,
    getBeeKeepersById,
}
