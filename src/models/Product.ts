import mongoose, { Document, Schema } from 'mongoose';

export interface IProductVariant {
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
  attributes: Record<string, string>;
  isActive: boolean;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  slug: string;
  categoryId: mongoose.Types.ObjectId;
  brand?: string;
  variants: IProductVariant[];
  images: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const productVariantSchema = new Schema<IProductVariant>({
  name: {
    type: String,
    required: [true, 'Variant name is required'],
    trim: true,
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative'],
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative'],
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
  },
  attributes: {
    type: Map,
    of: String,
    default: {},
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [100, 'Brand name cannot exceed 100 characters'],
    },
    variants: [productVariantSchema],
    images: [{
      type: String,
      trim: true,
    }],
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [60, 'Meta title cannot exceed 60 characters'],
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'Meta description cannot exceed 160 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
productSchema.index({ slug: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ 'variants.sku': 1 });

// Virtual for category
productSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
});

// Ensure virtuals are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export const Product = mongoose.model<IProduct>('Product', productSchema);
