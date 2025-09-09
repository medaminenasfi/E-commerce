import mongoose, { Document, Schema } from 'mongoose';

export interface IReview {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IVariant {
  name: string;
  sku: string;
  price: number;
  comparePrice?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  attributes?: Record<string, string>;
  isActive?: boolean;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  slug: string;
  categoryId: string;
  brand?: string;
  variants: IVariant[];
  images?: string[];
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  reviews: IReview[];
}

const reviewSchema = new Schema<IReview>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const variantSchema = new Schema<IVariant>({
  name: { type: String, required: true },
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  comparePrice: { type: Number },
  weight: { type: Number },
  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number }
  },
  attributes: { type: Map, of: String },
  isActive: { type: Boolean, default: true }
});

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  categoryId: { type: String, required: true },
  brand: { type: String },
  variants: { type: [variantSchema], required: true },
  images: [{ type: String }],
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  metaTitle: { type: String },
  metaDescription: { type: String },
  reviews: [reviewSchema],
}, { timestamps: true });

export const Product = mongoose.model<IProduct>('Product', productSchema);
