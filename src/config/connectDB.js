const mongoose = require("mongoose");

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.mongo_db_url);
        console.log(`DB connected successfully: ${conn.connection.host}`);
    } catch(err) {
        console.log("Failed to connect to DB");
        console.log(err?.message || err?.error || err);
        process.exit(1);
    }
};

module.exports = connectDB;