import dotenv from 'dotenv';
dotenv.config();

import crypto from "crypto";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import Razorpay from "razorpay";

const currency = 'inr';
const deliveryCharge = 10;

// ================= STRIPE =================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ================= RAZORPAY =================
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ====================== COD ======================
const placeOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const { items, amount, address } = req.body;

        await orderModel.create({
            userId,
            items,
            amount,
            address,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        });

        await userModel.findByIdAndUpdate(userId, { cartData: {} });
        res.json({ success: true });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ====================== STRIPE ======================
const placeOrderStripe = async (req, res) => {
    try {
        const userId = req.userId;
        const { items, amount, address } = req.body;
        const { origin } = req.headers;

        const newOrder = await orderModel.create({
            userId,
            items,
            amount,
            address,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now()
        });

        const line_items = items.map(item => ({
            price_data: {
                currency,
                product_data: { name: item.name },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }));

        line_items.push({
            price_data: {
                currency,
                product_data: { name: "Delivery Charges" },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: "payment"
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ====================== VERIFY STRIPE ======================
const verifyStripe = async (req, res) => {
    try {
        const { orderId, success } = req.body;

        if (success === "true") {

            // Mark order as paid
            const order = await orderModel.findByIdAndUpdate(
                orderId,
                { payment: true },
                { new: true }
            );

            if (!order) {
                return res.json({ success: false, message: "Order not found" });
            }

            // Clear user cart AFTER successful payment
            await userModel.findByIdAndUpdate(order.userId, {
                cartData: {}
            });

            res.json({ success: true });

        } else {
            // Payment failed → remove order
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false });
        }

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ====================== RAZORPAY ======================
const placeOrderRazorpay = async (req, res) => {
    try {
        const userId = req.userId;
        const { items, amount, address } = req.body;

        const newOrder = await orderModel.create({
            userId,
            items,
            amount,
            address,
            paymentMethod: "Razorpay",
            payment: false,
            date: Date.now()
        });

        const razorpayOrder = await razorpayInstance.orders.create({
            amount: Number(amount) * 100,
            currency: "INR",
            receipt: newOrder._id.toString()
        });

        // SAVE razorpay order id in DB
        newOrder.razorpayOrderId = razorpayOrder.id;
        await newOrder.save();

        res.json({ success: true, order: razorpayOrder });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// ====================== VERIFY RAZORPAY ======================
const verifyRazorpay = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        // If signature mismatch → payment failed
        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        // Mark the SAME order as paid
        const order = await orderModel.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            {
                payment: true,
                razorpayPaymentId: razorpay_payment_id
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Clear user cart
        await userModel.findByIdAndUpdate(order.userId, { cartData: {} });

        res.json({ success: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ====================== GET USER ORDERS ======================
const userOrders = async (req, res) => {
    try {
        const userId = req.userId;

        const orders = await orderModel
            .find({ userId })
            .sort({ date: -1 });

        res.json({ success: true, orders });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ====================== ADMIN : ALL ORDERS ======================
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({}).sort({ date: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ====================== ADMIN : UPDATE ORDER STATUS ======================
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// // ====================== EXPORTS ======================
export { placeOrder, placeOrderStripe, verifyStripe, placeOrderRazorpay, verifyRazorpay, userOrders, allOrders, updateStatus };



