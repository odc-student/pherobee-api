const Subowner = require( "../models/SubOwnerSchema");
const Beekeeper = require( "../models/BeekeeperSchema");




const getBeeKeepers= async (req, res) => {
    try {
        const beekeepers = await Beekeeper.find();
        res.json(beekeepers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const addSubowner = async (req, res) => {
    try {
        const { username, email, password, beekeeperId } = req.body;

        // Create a new Subowner document
        const subowner = new Subowner({
            username,
            email,
            password
        });



        // Update the Beekeeper's subowners array
        const beekeeper = await Beekeeper.findById(beekeeperId);
        if (!beekeeper) {
            return res.status(404).json({ message: 'Beekeeper not found' });
        }

        beekeeper.subowners.push(subowner);
        await beekeeper.save();


        // Save the subowner document
        await subowner.save();

        res.status(201).json(subowner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports ={
    addSubowner,
    getBeeKeepers
}
