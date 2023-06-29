import { Schema, Types, model } from "mongoose";

const operationSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
});

interface OperationDocument {
  _id: Types.ObjectId;
  type: string;
  cost: number;
}

const Operation = model<OperationDocument>("Operation", operationSchema);

export { Operation, OperationDocument };
