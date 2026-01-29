// import express from 'express'
// import { placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, verifyStripe, verifyRazorpay } from '../controllers/orderController.js'
// import authUser from '../middleware/auth.js';
// import adminAuth from '../middleware/adminAuth.js';

// const orderRouter = express.Router();

// // Admin Features
// orderRouter.post('/list', adminAuth, allOrders)
// orderRouter.post('/status', adminAuth, updateStatus )

// // Payment Features
// orderRouter.post('/place', authUser, placeOrder)
// orderRouter.post('/stripe', authUser, placeOrderStripe)
// orderRouter.post('/razorpay', authUser, placeOrderRazorpay)

// // User Feature
// orderRouter.post('/userorders', authUser, userOrders)

// // Verify payment
// orderRouter.post('/verifyStripe', authUser, verifyStripe)
// orderRouter.post('/verifyRazorpay', authUser, verifyRazorpay)

// export default orderRouter;





import express from 'express'
import {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  verifyStripe,
  verifyRazorpay,
  userOrders,
  allOrders, updateStatus
} from '../controllers/orderController.js'

import authUser from '../middleware/auth.js'
import adminAuth from '../middleware/adminAuth.js'

const orderRouter = express.Router()

// Payment Features
orderRouter.post('/place', authUser, placeOrder)
orderRouter.post('/stripe', authUser, placeOrderStripe)
orderRouter.post('/razorpay', authUser, placeOrderRazorpay)

// Verify payment
orderRouter.post('/verifyStripe', authUser, verifyStripe)
orderRouter.post('/verifyRazorpay', authUser, verifyRazorpay)

// User Feature
orderRouter.post('/userOrders', authUser, userOrders);

// ADMIN FEATURES
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)

export default orderRouter
