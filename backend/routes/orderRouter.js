import express from 'express'

import authUser from '../middleware/auth.js';
import { allOrders, placeOrder, placeOrderOmise, placeOrderRazorpay, placeOrderStripe, updateStatus, userOrders, verifyStripe, checkOrder } from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';

const orderRouter = express.Router();

orderRouter.use(authUser)

// Admin api
orderRouter.post('/list',adminAuth , allOrders)
orderRouter.post('/status',adminAuth, updateStatus)

// payment api
orderRouter.post('/place',authUser, placeOrder)
orderRouter.post('/stripe',authUser, placeOrderStripe)
orderRouter.post('/razorpay',authUser, placeOrderRazorpay)
orderRouter.post('/omise',authUser, placeOrderOmise)
orderRouter.post('/status',authUser, checkOrder)


orderRouter.post('/userorders', authUser,  userOrders)

// verify stripe
orderRouter.post('/verifyStripe', authUser, verifyStripe)
orderRouter.post('/webhook', authUser, verifyStripe)


orderRouter.post('/test', (req, res) => {
    res.json({
        key: process.env.OMISE_SECRET_KEY
    })
})

export default orderRouter;