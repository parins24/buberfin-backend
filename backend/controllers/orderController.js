//  Placing order COD(Cash On Delivery)

import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe"
import Omise from "omise";
import { createRequire } from 'module';

// global variable
const currency = 'thb'
const deliveryCharge = 10
const satang = 100



// gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const require = createRequire(import.meta.url);
const omise = require('omise')({
    publicKey: process.env.OMISE_PUBLIC_KEY,
    secretKey: process.env.OMISE_SECRET_KEY
});

const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        }

        const newModel = new orderModel(orderData);
        await newModel.save()
        await userModel.findByIdAndUpdate(userId, { cartData: {} }) //clear cart
        res.json({ success: true, message: "Order placed" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

//  Placing order Stripe

const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const { origin } = req.headers
        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now()
        }
        const newOrder = new orderModel(orderData);
        await newOrder.save()
        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))
        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Delivery Charges'
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment'
        })
        res.json({ success: true, session_url: session.url })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Verify Stripe
const verifyStripe = async (req, res) => {
    const { orderId, success, userId } = req.body;
    try {

        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            await userModel.findByIdAndUpdate(userId, { cartData: {} })
            res.json({ success: true })
        } else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({ success: false })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

//  Placing order Razorpay 

const placeOrderRazorpay = async (req, res) => {

}

//  Placing order Razorpay 

const placeOrderOmise = async (req, res) => {
    const { token } = req.headers;
    const { userId, omiseToken, orderDataCredit: { items, address, amount } } = req.body;

    try {
        const charge = await omise.charges.create({
            amount: amount * satang,
            currency: 'THB',
            card: omiseToken,
            description: 'Order payment'
        });
        const orderData = {
            userId,
            items,
            address,
            amount,
            status: 'PENDING',
            chargeId: charge.id,
            paymentMethod: "CRD",
            payment: true,
            date: Date.now()
        }
        if (charge.status != "successful" || !charge.paid) {
            orderData.payment = false;
            const newOrder = new orderModel(orderData);
            await newOrder.save()
            res.status(200).json({ success: false, code: 424, message: "payment unsuccessfully" });
        }
        const newOrder = new orderModel(orderData);
        await newOrder.save()
        await userModel.findByIdAndUpdate(userId, { cartData: {} })
        
        res.status(200).json({ success: true, orderData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Charge failed' });
    }
}

//  All order data for admin panel
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({})
        res.json({ success: true, orders })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

//  User order data for display
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body
        const orders = await orderModel.find({ userId })
        res.json({ success: true, orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

//  Check order data for dispaly
const checkOrder = async (req, res) => {
    try {
        const { chargeId } = req.body
        const orders = await orderModel.find({ chargeId })
        res.json({ success: true, orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

//  update order statusc from admin panel
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body
        await orderModel.findByIdAndUpdate(orderId, { status })
        res.json({ success: true, message: "Status updated" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

export { placeOrder, placeOrderRazorpay, placeOrderStripe, allOrders, userOrders, updateStatus, verifyStripe, placeOrderOmise, checkOrder }