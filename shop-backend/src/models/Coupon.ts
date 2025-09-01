import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableProducts?: mongoose.Types.ObjectId[];
  applicableCategories?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  // Virtual properties
  remainingUsage: number;
  isExpired: boolean;
  isNotStarted: boolean;
  isValid: boolean;
  // Methods
  calculateDiscount(orderAmount: number): number;
  incrementUsage(): boolean;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9]+$/, 'Coupon code can only contain uppercase letters and numbers'],
    },
    name: {
      type: String,
      required: [true, 'Coupon name is required'],
      trim: true,
      maxlength: [100, 'Coupon name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Coupon type is required'],
    },
    value: {
      type: Number,
      required: [true, 'Coupon value is required'],
      min: [0, 'Coupon value cannot be negative'],
    },
    minimumOrderAmount: {
      type: Number,
      min: [0, 'Minimum order amount cannot be negative'],
    },
    maximumDiscount: {
      type: Number,
      min: [0, 'Maximum discount cannot be negative'],
    },
    usageLimit: {
      type: Number,
      required: [true, 'Usage limit is required'],
      min: [1, 'Usage limit must be at least 1'],
    },
    usedCount: {
      type: Number,
      min: [0, 'Used count cannot be negative'],
      default: 0,
    },
    validFrom: {
      type: Date,
      required: [true, 'Valid from date is required'],
    },
    validUntil: {
      type: Date,
      required: [true, 'Valid until date is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicableProducts: [{
      type: Schema.Types.ObjectId,
      ref: 'Product',
    }],
    applicableCategories: [{
      type: Schema.Types.ObjectId,
      ref: 'Category',
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });

// Virtual for remaining usage
couponSchema.virtual('remainingUsage').get(function() {
  return Math.max(0, this.usageLimit - this.usedCount);
});

// Virtual for isExpired
couponSchema.virtual('isExpired').get(function() {
  return new Date() > this.validUntil;
});

// Virtual for isNotStarted
couponSchema.virtual('isNotStarted').get(function() {
  return new Date() < this.validFrom;
});

// Virtual for isValid
couponSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         now >= this.validFrom && 
         now <= this.validUntil && 
         this.usedCount < this.usageLimit;
});

// Ensure virtuals are serialized
couponSchema.set('toJSON', { virtuals: true });
couponSchema.set('toObject', { virtuals: true });

// Pre-save middleware to validate dates
couponSchema.pre('save', function(next) {
  if (this.validFrom >= this.validUntil) {
    return next(new Error('Valid from date must be before valid until date'));
  }
  
  if (this.type === 'percentage' && this.value > 100) {
    return next(new Error('Percentage discount cannot exceed 100%'));
  }
  
  next();
});

// Method to calculate discount
couponSchema.methods.calculateDiscount = function(orderAmount: number): number {
  if (!this.isValid) {
    return 0;
  }
  
  if (this.minimumOrderAmount && orderAmount < this.minimumOrderAmount) {
    return 0;
  }
  
  let discount = 0;
  
  if (this.type === 'percentage') {
    discount = (orderAmount * this.value) / 100;
  } else {
    discount = this.value;
  }
  
  // Apply maximum discount limit
  if (this.maximumDiscount) {
    discount = Math.min(discount, this.maximumDiscount);
  }
  
  // Ensure discount doesn't exceed order amount
  return Math.min(discount, orderAmount);
};

// Method to increment usage count
couponSchema.methods.incrementUsage = function(): boolean {
  if (this.usedCount >= this.usageLimit) {
    return false;
  }
  
  this.usedCount += 1;
  return true;
};

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);
