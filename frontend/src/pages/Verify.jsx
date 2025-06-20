import React, { useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const Verify = () => {

  const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext);
  const [searchparams, setSearchParams] = useSearchParams();

  const success = searchparams.get('success');
  const orderId = searchparams.get('orderId');

  const verifyPayment = async () => {
    try {

      if (!token) {
        return null
      }

      const response = await axios.post(backendUrl + '/api/order/verifyStripe', { success, orderId }, { headers: { token } })
      if (response.data.success) {
        setCartItems({})
        navigate('/orders');
      } else {
        navigate('/cart');
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);

    }
  }

  useEffect(() => {
    verifyPayment()
  }, [token])


  return (
    <div>

    </div>
  )
}

export default Verify