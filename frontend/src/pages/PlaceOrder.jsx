import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const currency = '$'

const PlaceOrder = () => {

  const [method, setMethod] = useState('cod')
  const {
    navigate,
    cartItems,
    getCartAmount,
    backendUrl,
    delivery_fee,
    products,
    token,
    clearAndSyncCart
  } = useContext(ShopContext)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: ''
  })

  const onChangeHandler = (event) => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const initPay = (order) => {
    if (!window.Razorpay) {
      toast.error('Razorpay SDK not loaded')
      return
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Order Payment',
      description: 'Order Payment',
      order_id: order.id,

      handler: async (response) => {
        try {
          const { data } = await axios.post(
            `${backendUrl}/api/order/verifyRazorpay`,
            response,
            { headers: { token } }
          )

          if (data.success) {
            toast.success('Payment successful')
            await clearAndSyncCart()
            navigate('/orders')
            return
          }
          toast.error('Payment verification failed')
        } catch (error) {
          console.error(error)
          toast.error('Payment failed')
        }
      },

      theme: { color: '#000000' }
    }

    new window.Razorpay(options).open()
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
      let orderItems = []

      for (const productId in cartItems) {
        for (const size in cartItems[productId]) {
          if (cartItems[productId][size] > 0) {
            const product = products.find(p => p._id === productId)
            if (product) {
              orderItems.push({
                ...structuredClone(product),
                size,
                quantity: cartItems[productId][size]
              })
            }
          }
        }
      }

      const orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee
      }

      if (method === 'cod') {
        const res = await axios.post(
          `${backendUrl}/api/order/place`,
          orderData,
          { headers: { token } }
        )

        if (res.data.success) {
          await clearAndSyncCart()
          navigate('/orders')
        } else toast.error(res.data.message)
      }

      if (method === 'stripe') {
        const res = await axios.post(
          `${backendUrl}/api/order/stripe`,
          orderData,
          { headers: { token } }
        )

        if (res.data.success) {
          window.location.replace(res.data.session_url)
        } else toast.error(res.data.message)
      }

      if (method === 'razorpay') {
        const res = await axios.post(
          `${backendUrl}/api/order/razorpay`,
          orderData,
          { headers: { token } }
        )

        if (res.data.success) {
          initPay(res.data.order)
        } else toast.error('Razorpay order failed')
      }

    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-6 pt-5 sm:pt-14 min-h-[80vh] border-t border-gray-300"
    >

      {/* LEFT */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <Title text1="DELIVERY" text2="INFORMATION" />

        <div className="flex gap-3">
          <input
            required
            name="firstName"
            value={formData.firstName}
            onChange={onChangeHandler}
            placeholder="First name"
            className="w-full border border-gray-300 px-4 py-3 rounded-md focus:border-black focus:ring-1 focus:ring-black outline-none"
          />
          <input
            required
            name="lastName"
            value={formData.lastName}
            onChange={onChangeHandler}
            placeholder="Last name"
            className="w-full border border-gray-300 px-4 py-3 rounded-md focus:border-black focus:ring-1 focus:ring-black outline-none"
          />
        </div>

        <input
          required
          name="email"
          value={formData.email}
          onChange={onChangeHandler}
          placeholder="Email"
          className="w-full border border-gray-300 px-4 py-3 rounded-md focus:border-black focus:ring-1 focus:ring-black outline-none"
        />

        <input
          required
          name="street"
          value={formData.street}
          onChange={onChangeHandler}
          placeholder="Street"
          className="w-full border border-gray-300 px-4 py-3 rounded-md focus:border-black focus:ring-1 focus:ring-black outline-none"
        />

        <div className="flex gap-3">
          <input
            required
            name="city"
            value={formData.city}
            onChange={onChangeHandler}
            placeholder="City"
            className="w-full border border-gray-300 px-4 py-3 rounded-md focus:border-black focus:ring-1 focus:ring-black outline-none"
          />
          <input
            required
            name="state"
            value={formData.state}
            onChange={onChangeHandler}
            placeholder="State"
            className="w-full border border-gray-300 px-4 py-3 rounded-md focus:border-black focus:ring-1 focus:ring-black outline-none"
          />
        </div>

        <div className="flex gap-3">
          <input
            required
            name="zipcode"
            value={formData.zipcode}
            onChange={onChangeHandler}
            placeholder="Zipcode"
            className="w-full border border-gray-300 px-4 py-3 rounded-md focus:border-black focus:ring-1 focus:ring-black outline-none"
          />
          <input
            required
            name="country"
            value={formData.country}
            onChange={onChangeHandler}
            placeholder="Country"
            className="w-full border border-gray-300 px-4 py-3 rounded-md focus:border-black focus:ring-1 focus:ring-black outline-none"
          />
        </div>

        <input
          required
          name="phone"
          value={formData.phone}
          onChange={onChangeHandler}
          placeholder="Phone"
          className="w-full border border-gray-300 px-4 py-3 rounded-md focus:border-black focus:ring-1 focus:ring-black outline-none"
        />
      </div>

      {/* RIGHT */}
      <div className="mt-8 w-full sm:w-auto">
        <CartTotal />

        <Title text1="PAYMENT" text2="METHOD" />

        <div className="flex gap-3 flex-col lg:flex-row mt-4">

          {/* Stripe */}
          <div
            onClick={() => setMethod('stripe')}
            className={`relative flex items-center justify-center border px-6 py-4 rounded-md cursor-pointer
              ${method === 'stripe' ? 'border-green-600' : 'border-gray-300'}`}
          >
            {method === 'stripe' && (
              <span className="absolute top-2 right-2 w-3 h-3 bg-green-600 rounded-full"></span>
            )}
            <img src={assets.stripe_logo} className="h-5" />
          </div>

          {/* Razorpay */}
          <div
            onClick={() => setMethod('razorpay')}
            className={`relative flex items-center justify-center border px-6 py-4 rounded-md cursor-pointer
              ${method === 'razorpay' ? 'border-green-600' : 'border-gray-300'}`}
          >
            {method === 'razorpay' && (
              <span className="absolute top-2 right-2 w-3 h-3 bg-green-600 rounded-full"></span>
            )}
            <img src={assets.razorpay_logo} className="h-5" />
          </div>

          {/* COD */}
          <div
            onClick={() => setMethod('cod')}
            className={`relative flex items-center justify-center border px-6 py-4 rounded-md cursor-pointer font-medium
              ${method === 'cod' ? 'border-green-600' : 'border-gray-300'}`}
          >
            {method === 'cod' && (
              <span className="absolute top-2 right-2 w-3 h-3 bg-green-600 rounded-full"></span>
            )}
            CASH ON DELIVERY
          </div>

        </div>

        <button className="bg-black text-white px-16 py-3 mt-8 w-full sm:w-auto">
          PLACE ORDER ({currency}{getCartAmount() + delivery_fee})
        </button>
      </div>
    </form>
  )
}

export default PlaceOrder
