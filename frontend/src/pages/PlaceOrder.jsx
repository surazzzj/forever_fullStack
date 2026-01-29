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
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t border-gray-300"
    >
      {/* LEFT */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <Title text1="DELIVERY" text2="INFORMATION" />

        <div className="flex gap-3">
          <input required name="firstName" onChange={onChangeHandler} value={formData.firstName} className="input" placeholder="First name" />
          <input required name="lastName" onChange={onChangeHandler} value={formData.lastName} className="input" placeholder="Last name" />
        </div>

        <input required name="email" onChange={onChangeHandler} value={formData.email} className="input" placeholder="Email" />
        <input required name="street" onChange={onChangeHandler} value={formData.street} className="input" placeholder="Street" />

        <div className="flex gap-3">
          <input required name="city" onChange={onChangeHandler} value={formData.city} className="input" placeholder="City" />
          <input required name="state" onChange={onChangeHandler} value={formData.state} className="input" placeholder="State" />
        </div>

        <div className="flex gap-3">
          <input required name="zipcode" onChange={onChangeHandler} value={formData.zipcode} className="input" placeholder="Zipcode" />
          <input required name="country" onChange={onChangeHandler} value={formData.country} className="input" placeholder="Country" />
        </div>

        <input required name="phone" onChange={onChangeHandler} value={formData.phone} className="input" placeholder="Phone" />
      </div>

      {/* RIGHT */}
      <div className="mt-8">
        <CartTotal />

        <Title text1="PAYMENT" text2="METHOD" />

        <div className="flex gap-3 flex-col lg:flex-row">
          <div onClick={() => setMethod('stripe')} className="payment-box">
            <img src={assets.stripe_logo} className="h-5" />
          </div>

          <div onClick={() => setMethod('razorpay')} className="payment-box">
            <img src={assets.razorpay_logo} className="h-5" />
          </div>

          <div onClick={() => setMethod('cod')} className="payment-box">
            CASH ON DELIVERY
          </div>
        </div>

        <button className="bg-black text-white px-16 py-3 mt-8">
          PLACE ORDER ({currency}{getCartAmount() + delivery_fee})
        </button>
      </div>
    </form>
  )
}

export default PlaceOrder
