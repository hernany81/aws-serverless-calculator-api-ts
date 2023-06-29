import { Schema, SchemaTypes, Types, model } from "mongoose";

const authenticationTokenSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  userId: {
    type: SchemaTypes.ObjectId,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
});

interface AuthenticationTokenDocument {
  _id: Types.ObjectId;
  token: string;
  userId: Types.ObjectId;
  createdAt: Date;
}

const AuthenticationToken = model<AuthenticationTokenDocument>(
  "AuthenticationToken",
  authenticationTokenSchema
);

export { AuthenticationToken, AuthenticationTokenDocument };
