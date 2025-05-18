// Mongoose schema and model definition for the Product entity.
// Defines the structure of product documents in the database.

import mongoose from 'mongoose';

export interface IProduct {
  id?: string;
  name: string;
  description: string;
  type: string;
  material: string;
  dimensions: {
    width: number;
    height: number;
    depth?: number;
  };
  features: string[];
  price: number;
  imageUrl: string;
  stockQuantity: number;
  rating?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductModel extends Omit<IProduct, 'id'>, mongoose.Document {
  _id: mongoose.Types.ObjectId;
}

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
    material: { type: String, required: true },
    dimensions: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      depth: { type: Number },
    },
    features: [{ type: String }],
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    stockQuantity: { type: Number, required: true, default: 0 },
    rating: { type: Number },
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields automatically
  },
);

export const ProductModel = mongoose.model<IProductModel>('Product', productSchema);
