

//  add products to user cart

import userModel from "../models/userModel.js"

const addToCart = async (req, res) => {
    try {
        const { userId, itemId, size } = req.body
        const userData = await userModel.findById(userId)
        const cartData = await userData.cartData;

        cartData[itemId] ??= {};
        cartData[itemId][size] = (cartData[itemId][size] ?? 0) + 1;

        await userModel.findByIdAndUpdate(userId, { cartData })
        res.json({ succes: true, message: "Added To Cart" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// update user cart
const updateToCart = async (req, res) => {
    try {
        const { userId, itemId, size, quantity } = req.body
        const userData = await userModel.findById(userId)
        const cartData = await userData.cartData;
        // if (quantity === 0) {
        //     delete cartData[itemId][size]
        //     if (Object.keys(cartData[itemId]).length === 0) {
        //         delete cartData[itemId];
        //     }
        // } else {
            cartData[itemId][size] = quantity
        // }
        await userModel.findByIdAndUpdate(userId, { cartData })
        res.json({ succes: true, userData , message: "Cart Updated" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// get user cart data
const getUserCart = async (req, res) => {
    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        res.json({ success: true, cartData })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

export { addToCart, updateToCart, getUserCart };