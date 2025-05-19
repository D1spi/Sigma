// Mongoose schema and model definition for the User entity.
// Defines the structure of user documents in the database.

import mongoose from 'mongoose';
import { IUser } from '../interfaces/user.interface';

export interface IUserModel extends Omit<IUser, 'id'>, mongoose.Document {
  _id: mongoose.Types.ObjectId;
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: { type: String, required: true },
    address: { type: String, required: false },
    birthday: { type: Date, required: false },
    isBlocked: { type: Boolean, default: false },
    authToken: { type: String, required: false },
    refreshToken: { type: String, required: false },
    tokensValid: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields automatically
  },
);

export const UserModel = mongoose.model<IUserModel>('User', userSchema);
