import React, { useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const Verify = () => {

  const { navigate, token, backendUrl, clearAndSyncCart } = useContext(ShopContext)

  const [params] = useSearchParams()

  const success = params.get('success')
  const orderId = params.get('orderId')

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.post(backendUrl + '/api/order/verifyStripe', { success, orderId }, { headers: { token } })
        if (res.data.success) {
          await clearAndSyncCart()
          navigate('/orders')
        } else {
          navigate('/cart')
        }
      } catch (err) {
        toast.error('Verification failed', err.message);
      }
    }

    if (token) verify()
  }, [token])

  return <div className="text-center mt-20">Verifying payment...</div>
}

export default Verify
