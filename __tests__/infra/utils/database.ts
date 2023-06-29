import mongoose from "mongoose";

function connectMongo() {
  return mongoose.connect(
    "mongodb://hernan:password@localhost:27017/mongo?replicaSet=dbrs"
  );
}

function disconnectMongo() {
  return mongoose.disconnect();
}

export { connectMongo, disconnectMongo };
