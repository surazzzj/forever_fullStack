import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
    const currency = '$';
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    const delivery_fee = 10;

    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState(() => localStorage.getItem('token') || '');
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    // ------------------ SYNC CART ------------------
    const syncCart = async (currentToken) => {
        if (!currentToken) return;
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/cart/get`,
                {},
                { headers: { token: currentToken } }
            );
            if (data.success) setCartItems(data.cartData);
        } catch (error) {
            console.error(error);
        }
    };

    const clearAndSyncCart = async () => {
        setCartItems({});
    };

    // ------------------ LOAD USER PROFILE ------------------
    const loadUserProfileData = async () => {
        if (!token) return;
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/user/get-profile`,
                { headers: { token } }
            );
            if (data.success) {
                setUserData(data.userData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // ------------------ ADD TO CART ------------------
    const addToCart = async (itemId, size) => {

        if (!token) {
            toast.info("Please login to add items to cart");
            navigate('/login');
            return;
        }

        if (!size) {
            toast.error('Select product size');
            return;
        }

        const cartData = structuredClone(cartItems);
        cartData[itemId] = {
            ...cartData[itemId],
            [size]: (cartData[itemId]?.[size] || 0) + 1,
        };

        setCartItems(cartData);
        toast.success('Added to cart');

        if (!token) return;

        try {
            await axios.post(
                `${backendUrl}/api/cart/add`,
                { itemId, size },
                { headers: { token } }
            );
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // ------------------ UPDATE QUANTITY ------------------
    const updateQuantity = async (itemId, size, quantity) => {
        const cartData = structuredClone(cartItems);

        if (quantity === 0) {
            delete cartData[itemId][size];
            if (Object.keys(cartData[itemId]).length === 0) {
                delete cartData[itemId];
            }
        } else {
            cartData[itemId][size] = quantity;
        }

        setCartItems(cartData);

        if (token) {
            await axios.post(
                `${backendUrl}/api/cart/update`,
                { itemId, size, quantity },
                { headers: { token } }
            );
        }
    };

    // ------------------ CART COUNT ------------------
    const getCartCount = () => {
        let count = 0;
        for (const id in cartItems) {
            for (const size in cartItems[id]) {
                count += cartItems[id][size];
            }
        }
        return count;
    };

    const getCartAmount = () => {
        let total = 0;
        for (const id in cartItems) {
            const product = products.find((p) => p._id === id);
            if (!product) continue;
            for (const size in cartItems[id]) {
                total += product.price * cartItems[id][size];
            }
        }
        return total;
    };

    // ------------------ PRODUCTS ------------------
    const getProductsData = async () => {
        const { data } = await axios.get(`${backendUrl}/api/product/list`);
        if (data.success) setProducts(data.products);
    };

    useEffect(() => {
        getProductsData();
    }, []);

    useEffect(() => {
        if (token) {
            syncCart(token);
            loadUserProfileData();
        } else {
            setCartItems({});
            setUserData(null);
        }
    }, [token]);

    const value = {
        products,
        currency,
        delivery_fee,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        cartItems,
        setCartItems,
        clearAndSyncCart,
        addToCart,
        updateQuantity,
        getCartCount,
        getCartAmount,
        navigate,
        backendUrl,
        token,
        setToken,
        userData,
        loadUserProfileData,
    };

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;



