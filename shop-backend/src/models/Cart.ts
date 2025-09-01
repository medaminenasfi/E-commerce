import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  variantSku: string;
  quantity: number;
  price: number;
  addedAt: Date;
}

export interface ICart extends Document {
  userId?: mongoose.Types.ObjectId;
  sessionId?: string;
  items: ICartItem[];
  couponCode?: string;
  couponDiscount?: number;
  subtotal: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  // Virtual properties
  itemCount: number;
  // Methods
  addItem(productId: mongoose.Types.ObjectId, variantSku: string, quantity: number, price: number): void;
  removeItem(productId: mongoose.Types.ObjectId, variantSku: string): void;
  updateItemQuantity(productId: mongoose.Types.ObjectId, variantSku: string, quantity: number): void;
  clearCart(): void;
}

const cartItemSchema = new Schema<ICartItem>({
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
    min: [1, 'Quantity must be at least 1'],
    default: 1,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      sparse: true, // Allow null values but ensure uniqueness for non-null values
    },
    sessionId: {
      type: String,
      sparse: true, // Allow null values but ensure uniqueness for non-null values
    },
    items: [cartItemSchema],
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    couponDiscount: {
      type: Number,
      min: [0, 'Coupon discount cannot be negative'],
      default: 0,
    },
    subtotal: {
      type: Number,
      min: [0, 'Subtotal cannot be negative'],
      default: 0,
    },
    total: {
      type: Number,
      min: [0, 'Total cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
cartSchema.index({ userId: 1 }, { sparse: true });
cartSchema.index({ sessionId: 1 }, { sparse: true });
cartSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // TTL: 30 days

// Virtual for item count
cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Ensure virtuals are serialized
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.total = Math.max(0, this.subtotal - (this.couponDiscount || 0));
  next();
});

// Method to add item to cart
cartSchema.methods.addItem = function(productId: mongoose.Types.ObjectId, variantSku: string, quantity: number, price: number) {
  const existingItemIndex = this.items.findIndex(
    item => item.productId.equals(productId) && item.variantSku === variantSku
  );

  if (existingItemIndex > -1) {
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].price = price; // Update price in case it changed
  } else {
    this.items.push({
      productId,
      variantSku,
      quantity,
      price,
      addedAt: new Date(),
    });
  }
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(productId: mongoose.Types.ObjectId, variantSku: string) {
  this.items = this.items.filter(
    item => !(item.productId.equals(productId) && item.variantSku === variantSku)
  );
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(productId: mongoose.Types.ObjectId, variantSku: string, quantity: number) {
  const item = this.items.find(
    item => item.productId.equals(productId) && item.variantSku === variantSku
  );
  
  if (item) {
    if (quantity <= 0) {
      this.removeItem(productId, variantSku);
    } else {
      item.quantity = quantity;
    }
  }
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.couponCode = undefined;
  this.couponDiscount = 0;
};

export const Cart = mongoose.model<ICart>('Cart', cartSchema);
