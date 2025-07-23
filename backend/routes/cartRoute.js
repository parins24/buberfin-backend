import express from 'express'
import { addToCart, getUserCart, updateToCart } from '../controllers/cartController.js';
import authUser from '../middleware/auth.js';

const cartRouter = express.Router();

cartRouter.use(authUser)

cartRouter.post('/get', getUserCart)
cartRouter.post('/add', addToCart)
cartRouter.post('/update', updateToCart)

export default cartRouter;