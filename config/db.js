const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are no longer needed in newer versions of Mongoose
      // but adding them for backwards compatibility
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Error handler after initial connection
    mongoose.connection.on("error", (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    // Handle disconnection events
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    // Handle process termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
