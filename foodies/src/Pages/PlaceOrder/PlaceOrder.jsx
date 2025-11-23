import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../Context/StoreContext";
import { calculateCartTotals } from "../../util/cartUtils";
import { RAZORPAY_KEY } from "../../util/constant";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../service/CustomAxiosInstance";

const PlaceOrder = () => {
  const { foodList, quantities, setQuantities, token } = useContext(StoreContext);
  const navigate = useNavigate();

  const cartItems = foodList.filter((food) => quantities[food.id] > 0);
  const { subtotal, shipping, tax, total } = calculateCartTotals(cartItems, quantities);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    state: "",
    city: "",
    zip: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((d) => ({ ...d, [name]: value }));
  };

  // Load Razorpay script if not already loaded
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Client-side stock validation before sending request
    for (const item of cartItems) {
      const requested = quantities[item.id] || 0;
      const available = Number(item.stock || 0);
      if (requested > available) {
        toast.error(`"${item.name}" only has ${available} in stock. Reduce quantity.`);
        return;
      }
    }

    const orderData = {
      userAddress: `${data.firstName} ${data.lastName},${data.address},${data.city},${data.state},${data.zip}`,
      phoneNumber: data.phoneNumber,
      email: data.email,
      orderedItems: cartItems.map((item) => ({
        foodId: item.id, // use item.id (backend expects foodId)
        quantity: quantities[item.id],
        price: item.price * quantities[item.id],
        category: item.category,
        imageUrl: item.imageUrl,
        description: item.description,
        name: item.name,
      })),
      amount: parseFloat(total.toFixed(2)), // numeric amount in rupees
      orderStatus: "Preparing",
    };

    setSubmitting(true);
    let createdOrder = null;

    try {
      const response = await api.post("/api/orders/create", orderData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.status === 201 && response.data && response.data.razorpayOrderId) {
        createdOrder = response.data; // keep so we can delete if needed
        await initiateRazorpayPayment(response.data, createdOrder.id);
      } else {
        console.error("Create order returned unexpected response:", response.data);
        toast.error("Unable to place order. Please try again.");
      }
    } catch (error) {
      console.error("Error creating order:", error.response?.data || error.message || error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to place order. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const initiateRazorpayPayment = async (order, createdOrderId) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Failed to load payment gateway. Try again later.");
      return;
    }

    // If backend already created a Razorpay order id, pass that. amount not required but keep for safety.
    const options = {
      key: RAZORPAY_KEY,
      amount: Math.round(Number(order.amount) * 100) || undefined, // paise (optional when order_id provided)
      currency: "INR",
      name: "Food Land",
      description: "Order Payment",
      order_id: order.razorpayOrderId,
      handler: async function (razorpayResponse) {
        await verifyPayment(razorpayResponse);
      },
      prefill: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        contact: data.phoneNumber,
      },
      theme: {
        color: "#3399cc",
      },
      modal: {
        // If dialog closed, delete the created order (server side) so reserved stock is released
        ondismiss: async function () {
          toast.error("Payment cancelled.");
          if (createdOrderId) {
            await deleteOrder(createdOrderId);
          }
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const verifyPayment = async (razorpayResponse) => {
    const paymentData = {
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_signature: razorpayResponse.razorpay_signature,
    };

    try {
      const response = await api.post("/api/orders/verify", paymentData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.status === 200) {
        toast.success("Payment Successful!");

           toast.info("Order details have been sent to your registered email.");
        await clearCart();
        navigate("/myorders");
      } else {
        toast.error("Payment verification failed. Contact support.");
        navigate("/");
      }
    } catch (error) {
      console.error("Verification error:", error.response?.data || error.message || error);
      toast.error("Payment failed. Please try again.");
      navigate("/");
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      await api.delete(`/api/orders/${orderId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast.success("Order removed (payment cancelled).");
    } catch (error) {
      console.error("Error deleting order:", error.response?.data || error.message || error);
      // don't block user; just notify
      toast.error("Failed to remove temporary order. Contact support.");
    }
  };

  const clearCart = async () => {
    try {
      await api.delete("/api/cart", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setQuantities({});
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Clear cart error:", error.response?.data || error.message || error);
      toast.error("Error while clearing the cart");
    }
  };

  return (
    <div className="container mt-4">
      <main>
        <div className="py-5 text-center">
          <img className="d-block mx-auto" src={assets.main_logo} alt="" width="188" height="168" />
        </div>

        <div className="row g-5">
          <div className="col-md-5 col-lg-4 order-md-last">
            <h4 className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-primary">Your cart</span>
              <span className="badge bg-primary rounded-pill">{cartItems.length}</span>
            </h4>

            <ul className="list-group mb-3">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <li key={item.id} className="list-group-item d-flex justify-content-between lh-sm">
                    <div>
                      <h6 className="my-0">{item.name}</h6>
                      <small className="text-body-secondary">Qty: {quantities[item.id] || 1}</small>
                    </div>
                    <span className="text-body-secondary">₹{(item.price * (quantities[item.id] || 1)).toFixed(2)}</span>
                  </li>
                ))
              ) : (
                <p className="text-center text-muted">Your cart is empty</p>
              )}

              <li className="list-group-item d-flex justify-content-between">
                <div>
                  <span>Shipping</span>
                </div>
                <span className="text-body-secondary">₹{subtotal === 0 ? 0.0 : shipping.toFixed(2)}</span>
              </li>

              <li className="list-group-item d-flex justify-content-between ">
                <div>
                  <span>Tax (10%)</span>
                </div>
                <span className="text-body-secondary">₹{tax.toFixed(2)}</span>
              </li>

              <li className="list-group-item d-flex justify-content-between">
                <span>Total (INR)</span>
                <strong>₹{total.toFixed(2)}</strong>
              </li>
            </ul>
          </div>

          <div className="col-md-7 col-lg-8">
            <h4 className="mb-3">Billing address</h4>
            <form className="needs-validation" onSubmit={onSubmitHandler}>
              <div className="row g-3">
                <div className="col-sm-6">
                  <label htmlFor="firstName" className="form-label">First name</label>
                  <input type="text" className="form-control" id="firstName" name="firstName" onChange={onChangeHandler} value={data.firstName} placeholder="John" required />
                </div>

                <div className="col-sm-6">
                  <label htmlFor="lastName" className="form-label">Last name</label>
                  <input type="text" className="form-control" id="lastName" name="lastName" onChange={onChangeHandler} value={data.lastName} placeholder="Doe" required />
                </div>

                <div className="col-12">
                  <label htmlFor="email" className="form-label">Email</label>
                  <div className="input-group has-validation">
                    <span className="input-group-text">@</span>
                    <input type="email" className="form-control" id="email" name="email" onChange={onChangeHandler} value={data.email} placeholder="Email" required />
                  </div>
                </div>

                <div className="col-12">
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <input type="tel" className="form-control" id="phone" name="phoneNumber" onChange={onChangeHandler} value={data.phoneNumber} placeholder="9159849275" required />
                </div>

                <div className="col-12">
                  <label htmlFor="address" className="form-label">Address</label>
                  <input type="text" className="form-control" id="address" name="address" onChange={onChangeHandler} value={data.address} placeholder="1234 Main St" required />
                </div>

                <div className="col-md-5">
                  <label htmlFor="state" className="form-label">State</label>
                  <select className="form-select" id="state" name="state" onChange={onChangeHandler} value={data.state} required>
                    <option value="">Choose...</option>
                    <option>Tamil Nadu</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label htmlFor="city" className="form-label">City</label>
                  <select className="form-select" id="city" name="city" onChange={onChangeHandler} value={data.city} required>
                    <option value="">Choose...</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Coimbatore">Coimbatore</option>
                    {/* ...other cities... */}
                  </select>
                </div>

                <div className="col-md-3">
                  <label htmlFor="zip" className="form-label">Zip</label>
                  <input type="text" className="form-control" id="zip" name="zip" onChange={onChangeHandler} value={data.zip} placeholder="641014" required />
                </div>
              </div>

              <hr className="my-4" />

              <button className="w-100 btn btn-primary btn-lg" type="submit" disabled={cartItems.length === 0 || submitting}>
                {submitting ? "Processing..." : "Continue to checkout"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlaceOrder;
