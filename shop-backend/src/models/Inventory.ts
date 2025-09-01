import mongoose, { Document, Schema } from 'mongoose';

export interface IInventory extends Document {
  productId: mongoose.Types.ObjectId;
  variantSku: string;
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Virtual properties
  availableQuantity: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

const inventorySchema = new Schema<IInventory>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    variantSku: {
      type: String,
      required: [true, 'Variant SKU is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    reservedQuantity: {
      type: Number,
      min: [0, 'Reserved quantity cannot be negative'],
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      min: [0, 'Low stock threshold cannot be negative'],
      default: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
inventorySchema.index({ productId: 1, variantSku: 1 }, { unique: true });
inventorySchema.index({ isActive: 1 });

// Virtual for available quantity
inventorySchema.virtual('availableQuantity').get(function() {
  return Math.max(0, this.quantity - this.reservedQuantity);
});

// Virtual for isLowStock
inventorySchema.virtual('isLowStock').get(function() {
  return this.availableQuantity <= this.lowStockThreshold;
});

// Virtual for isOutOfStock
inventorySchema.virtual('isOutOfStock').get(function() {
  return this.availableQuantity <= 0;
});

// Ensure virtuals are serialized
inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

// Pre-save middleware to validate reserved quantity
inventorySchema.pre('save', function(next) {
  if (this.reservedQuantity > this.quantity) {
    return next(new Error('Reserved quantity cannot exceed total quantity'));
  }
  next();
});

export const Inventory = mongoose.model<IInventory>('Inventory', inventorySchema);
