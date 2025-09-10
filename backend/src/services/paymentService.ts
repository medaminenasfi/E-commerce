import Stripe from 'stripe';
import { Request, Response } from 'express';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
});

// Process Credit Card Payment
export const processCreditCardPayment = async (req: Request, res: Response) => {
  try {
    if (process.env.USE_STRIPE !== 'true') {
      return res.status(400).json({ success: false, message: 'Stripe payment method is disabled.' });
    }

    const { amount, currency, source } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: source,
      confirm: true,
    });

    res.status(200).json({ success: true, paymentIntent });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

// Process PayPal Payment (Placeholder for PayPal SDK integration)
export const processPayPalPayment = async (req: Request, res: Response) => {
  try {
    // PayPal payment logic here
    res.status(200).json({ success: true, message: 'PayPal payment processed' });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

// Handle Cash on Delivery
export const handleCashOnDelivery = async (req: Request, res: Response) => {
  try {
    res.status(200).json({ success: true, message: 'Cash on Delivery selected' });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};
