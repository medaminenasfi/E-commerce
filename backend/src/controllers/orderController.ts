import { Request, Response } from 'express';
import { Order } from '../models/Order';
import Cart, { ICart } from '../models/Cart';

// Place an order
export const placeOrder = async (req: Request, res: Response) => {
  try {
    const { paymentMethod } = req.body;
    const userId = req.user.id;

    // Validate payment method
    const validPaymentMethods = ['Credit Card', 'PayPal', 'Cash on Delivery'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    // Fetch user's cart and populate product details
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    console.log('Cart data:', cart); // Log cart data for debugging
    console.log('Cart items for validation:', cart.items); // Log cart items for validation

    // Adjust validation logic and extract price and productId
    const orderItems = cart.items.map((item) => {
      const product = item.product as unknown as { _id: string; variants: { price: number }[] };
      if (!product || !product.variants || product.variants.length === 0 || typeof product.variants[0].price !== 'number') {
        throw new Error('Cart contains invalid product data. Ensure all products have a price.');
      }
      return {
        productId: product._id,
        quantity: item.quantity,
        price: product.variants[0].price,
      };
    });

    // Calculate total price
    const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create order
    const order = await Order.create({
      userId,
      items: orderItems,
      totalPrice,
      paymentMethod,
      status: 'Pending',
    });

    // Clear user's cart
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to place order', error });
  }
};

// Track an order
export const trackOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: id, userId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to track order', error });
  }
};

// Cancel an order
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOneAndUpdate(
      { _id: id, userId, status: 'Pending' },
      { status: 'Cancelled' },
      { new: true }
    );

    if (!order) {
      return res.status(400).json({ message: 'Order cannot be cancelled' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel order', error });
  }
};

// Admin: View all orders
export const adminViewOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error });
  }
};

// Admin: Update/manage orders
export const adminUpdateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order', error });
  }
};
