// filepath: src\models\cart.model.ts
// Mongoose schema and model definition for the Cart entity.
// Defines the structure of cart documents in the database.

import mongoose from 'mongoose';
import { IProduct } from './product.model';

export interface ICartItem {
  product: mongoose.Types.ObjectId | string | IProduct;
  quantity: number;
  selected: boolean;
}

export interface ICart {
  id?: string;
  user: mongoose.Types.ObjectId | string;
  items: ICartItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICartModel extends Omit<ICart, 'id'>, mongoose.Document {
  _id: mongoose.Types.ObjectId;
}

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1, min: 1 },
  selected: { type: Boolean, default: true },
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields automatically
  },
);

// Create a compound index for efficient lookups
cartSchema.index({ user: 1 });

export const CartModel = mongoose.model<ICartModel>('Cart', cartSchema);
