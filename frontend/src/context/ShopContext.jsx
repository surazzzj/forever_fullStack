import React, { Children, createContext, useState } from 'react'
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = '$';
    // const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const delivery_fee = 10;
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    // const [token, setToken] = useState('');
    const [token, setToken] = useState(() => localStorage.getItem('token') || '');
    const [userData, setUserData] = useState('')
    const navigate = useNavigate();

    const addToCart = async (itemId, size) => {

        if (!size) {
            toast.error(('Select product size'));
            return
        }

        let cartData = structuredClone(cartItems);                        // its make the copy of obj

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            }
            else {
                cartData[itemId][size] = 1;
            }
        } else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }
        setCartItems(cartData);

        if (token) {
            try {
                const user = JSON.parse(localStorage.getItem("user"));  // ✅ get user from localStorage
                const userId = user?._id;

                if (!userId) {
                    toast.error("User ID not found. Please log in again.");
                    return;
                }

                await axios.post(backendUrl + '/api/cart/add', { itemId, size }, { headers: { token } })
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }

    }

    const getCartCount = () => {
        let totalCount = 0;

        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalCount += cartItems[items][item];
                    }
                } catch (error) {
                    console.log(error);
                    toast.error(error.message)
                }
            }
        }
        return totalCount;
    }

    const updateQuantity = async (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);

        cartData[itemId][size] = quantity;
        setCartItems(cartData);

        if (token) {
            try {
                await axios.post(backendUrl + '/api/cart/update', { itemId, size, quantity }, { headers: { token } })
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }
    }

    // const getCartAmount = () => {
    //     let totalAmount = 0;

    //     for (const items in cartItems) {
    //         let itemInfo = products.find((product) => product._id === items);
    //         for (const item in cartItems[items]) {
    //             try {
    //                 if (cartItems[items][item] > 0) {
    //                     totalAmount += itemInfo.price * cartItems[items][item]
    //                 }
    //             } catch (error) {
    //                 console.log(error);
    //                 toast.error(error.message)
    //             }
    //         }
    //     }
    //     return totalAmount;
    // }

    const getCartAmount = () => {
        let totalAmount = 0;

        for (const items in cartItems) {
            const itemInfo = products.find((product) => product._id === items);
            if (!itemInfo) continue; // skip if not found

            for (const size in cartItems[items]) {
                const quantity = cartItems[items][size];
                if (quantity > 0) {
                    totalAmount += itemInfo.price * quantity;
                }
            }
        }

        return totalAmount;
    };


    const getProductsData = async () => {
        try {

            const response = await axios.get(backendUrl + '/api/product/list')
            if (response.data.success) {
                setProducts(response.data.products)
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }

    const getUserCart = async (token) => {
        try {
            const response = await axios.post(backendUrl + '/api/cart/get', {}, { headers: { token } })
            if (response.data.success) {
                setCartItems(response.data.cartData)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }


    const loadUserProfileData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, {
                headers: { token }
            });

            if (data.success) {
                setUserData(data.userData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const updateUserProfile = async (formData) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/update-profile`, formData, {
                headers: {
                    token,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (data.success) {
                toast.success("Profile updated successfully");
                loadUserProfileData(); // Refresh user data
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };



    useEffect(() => {
        getProductsData()
    }, [])

    // useEffect(() => {
    //     if (!token && localStorage.getItem('token')) {
    //         setToken(localStorage.getItem('token'));
    //         getUserCart(localStorage.getItem('token'))
    //     }
    //     // const savedToken = localStorage.getItem('token');
    //     // if (savedToken) {
    //     //     setToken(savedToken);
    //     //     // getUserCart(savedToken);
    //     // }
    // }, [])

    useEffect(() => {
        if (token) {
            getUserCart(token);
            loadUserProfileData();
        }
    }, [token]);


    const value = {
        products, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, setCartItems, addToCart,
        getCartCount, updateQuantity, getCartAmount,
        navigate, backendUrl,
        token, setToken,
        loadUserProfileData, userData, setUserData,
        updateUserProfile
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )

}

export default ShopContextProvider;