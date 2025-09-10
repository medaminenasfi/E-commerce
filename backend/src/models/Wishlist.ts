import mongoose, { Schema, Document } from 'mongoose';

export interface IWishlistItem {
  product: mongoose.Types.ObjectId;
}

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  items: IWishlistItem[];
}

const WishlistItemSchema: Schema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
});

const WishlistSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [WishlistItemSchema],
});

export default mongoose.model<IWishlist>('Wishlist', WishlistSchema);
