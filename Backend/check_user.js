import Link from 'mongoose';
import User from './Models/AuthModel.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const checkSpecificUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        const email = "vishalpatel581012@gmail.com";
        const user = await User.findOne({ email });
        console.log(`Checking for ${email}:`, user ? "FOUND" : "NOT FOUND");
        if (user) {
            console.log("User details:", user);
            // Optional: Delete it to allow re-registration for testing
            // await User.deleteOne({ email }); 
            // console.log("User deleted for testing purposes.");
        }
        process.exit(0);
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
}
checkSpecificUser();
