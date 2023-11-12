import mongoose from "mongoose";

let isConnected = false; //To track connection status

export const connectToDatabase = async () => {
  //Prevent strict mode
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URI)
    return console.log("MongoDB URI is not defined");

  if (isConnected) return console.log("=> using existing database connection");

  try {
    mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("MongoDB connection established");
  } catch (error) {
    console.log(error);
  }
};
