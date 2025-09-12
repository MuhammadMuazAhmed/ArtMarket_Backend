import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
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

    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Don't exit the process, let the caller handle the error
    throw error;
  }
};

export default connectDB;
