import userModel from "../models/userModel.js";

 /* ================= ADD TO CART ================= */
const addToCart = async (req, res) => {
    try {
        const { itemId, size } = req.body;
        const userId = req.userId;

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        let cartData = userData.cartData || {};

        if (!cartData[itemId]) cartData[itemId] = {};
        cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;

        await userModel.findByIdAndUpdate(userId, { cartData });

        res.json({ success: true, message: "Added to cart", cartData });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

/* ================= UPDATE CART ================= */
const updateCart = async (req, res) => {
    try {
        const { itemId, size, quantity } = req.body;
        const userId = req.userId;

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        let cartData = userData.cartData || {};

        if (quantity === 0) {
            if (cartData[itemId]) {
                delete cartData[itemId][size];
                if (Object.keys(cartData[itemId]).length === 0) {
                    delete cartData[itemId];
                }
            }
        } else {
            if (!cartData[itemId]) cartData[itemId] = {};
            cartData[itemId][size] = quantity;
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: "Cart updated", cartData });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

/* ================= GET USER CART ================= */
const getUserCart = async (req, res) => {
    try {
        const userId = req.userId;
        const userData = await userModel.findById(userId);

        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, cartData: userData.cartData || {} });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export { addToCart, updateCart, getUserCart };

