import mongoose, { Schema, SchemaTypes, Types, model } from "mongoose";
import paginate from "mongoose-paginate-v2";
import { OperationType } from "@app/entity/operation";

const operationRecordSchema = new Schema({
  operationId: {
    type: SchemaTypes.ObjectId,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: Object.values(OperationType),
    index: true,
  },
  userId: {
    type: SchemaTypes.ObjectId,
    required: true,
    index: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  userBalance: {
    type: Number,
    required: true,
  },
  operationInput: {
    type: [String],
    index: true,
  },
  operationResult: {
    type: String,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    required: true,
    index: true,
  },
  deletedAt: {
    type: Date,
    index: true,
  },
});

operationRecordSchema.plugin(paginate);

interface OperationRecordDocument {
  _id: Types.ObjectId;
  operationId: Types.ObjectId;
  type: string;
  userId: Types.ObjectId;
  cost: number;
  userBalance: number;
  operationInput: string[];
  operationResult: string;
  createdAt: Date;
  deletedAt?: Date;
}

const OperationRecord = model<
  OperationRecordDocument,
  mongoose.PaginateModel<OperationRecordDocument>
>("OperationRecord", operationRecordSchema);

export { OperationRecord, OperationRecordDocument };
