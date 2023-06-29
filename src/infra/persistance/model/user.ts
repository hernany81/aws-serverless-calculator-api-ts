import { Schema, Types, model } from "mongoose";

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  creditBalance: {
    type: Number,
    required: true,
  },
});

interface UserDocument {
  _id: Types.ObjectId;
  name: string;
  passwordHash: string;
  status: string;
  creditBalance: number;
}

const User = model<UserDocument>("User", userSchema);

export { User, UserDocument };
