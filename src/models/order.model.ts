// filepath: src\models\order.model.ts
// Mongoose schema and model definition for the Order entity.
// Defines the structure of order documents in the database.

import mongoose from 'mongoose';
import { IProduct } from './product.model';

export interface IOrderItem {
  product: mongoose.Types.ObjectId | string | IProduct;
  productName: string;
  price: number;
  quantity: number;
}

export interface IOrder {
  id?: string;
  user: mongoose.Types.ObjectId | string;
  userName: string;
  userLastName: string;
  userAddress: string;
  items: IOrderItem[];
  totalPrice: number;
  orderDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderModel extends Omit<IOrder, 'id'>, mongoose.Document {
  _id: mongoose.Types.ObjectId;
}

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userLastName: { type: String, required: true },
    userAddress: { type: String, required: true },
    items: [orderItemSchema],
    totalPrice: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields automatically
  },
);

// Create indexes for efficient lookups
orderSchema.index({ user: 1 });
orderSchema.index({ orderDate: -1 }); // For sorting by most recent

export const OrderModel = mongoose.model<IOrderModel>('Order', orderSchema);
