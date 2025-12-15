import React, { useContext, useState, useEffect } from "react";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../Context/StoreContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../service/CustomAxiosInstance";

const PlaceOrder = () => {
  const { foodList, quantities, setQuantities, token } = useContext(StoreContext);
  const navigate = useNavigate();

const { discount, appliedCoupon } = useContext(StoreContext);
const { comboCart } = useContext(StoreContext);


  // -------------------------------
  // 1️⃣ SAFE CART ITEMS
  // -------------------------------
  const cartItems = Array.isArray(foodList)
    ? foodList.filter((food) => (quantities?.[food.id] || 0) > 0)
    : [];

  // -------------------------------
  // 2️⃣ SETTINGS (shipping + tax)
  // -------------------------------
  const [settings, setSettings] = useState({
    shippingCharge: 0,
    taxPercentage: 0,
    razorpayKey: "",
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get("/api/admin/settings/single");
        if (res.data) {
          setSettings({
            shippingCharge: res.data.shippingCharge || 0,
            taxPercentage: res.data.taxPercentage || 0,
            razorpayKey: res.data.razorpayKey || "",
          });
        }
      } catch (err) {
        console.error("Failed fetching settings", err);
      }
    };
    loadSettings();
  }, []);

  // -------------------------------
  // 3️⃣ TOTAL CALCULATION
  // -------------------------------
  const comboTotal = comboCart
  ? comboCart.comboPrice * comboCart.qty
  : 0;

const subtotal =
  cartItems.reduce(
    (acc, item) => acc + item.price * quantities[item.id],
    0
  ) + comboTotal;

const shipping = subtotal === 0 ? 0 : settings.shippingCharge;
const tax = (subtotal * settings.taxPercentage) / 100;
const total = subtotal + shipping + tax;
const finalTotal = Math.max(total - discount, 0);


  // -------------------------------
  // 4️⃣ ADDRESS FORM
  // -------------------------------
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
    setData({ ...data, [event.target.name] : event.target.value });
  };

  // -------------------------------
  // 5️⃣ RAZORPAY SCRIPT LOADER
  // -------------------------------
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

  // -------------------------------
  // 6️⃣ SUBMIT ORDER
  // -------------------------------
  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // validate stock
    for (const item of cartItems) {
      const requested = quantities[item.id] || 0;
      const available = Number(item.stock || 0);
      if (requested > available) {
        toast.error(`"${item.name}" only has ${available} available`);
        return;
      }
    }

    const orderData = {
      userAddress: `${data.firstName} ${data.lastName},${data.address},${data.city},${data.state},${data.zip}`,
      phoneNumber: data.phoneNumber,
      email: data.email,
      couponCode: appliedCoupon || null,
couponDiscount: discount || 0,
total: finalTotal,


      // Items
   orderedItems: [
  ...(comboCart ? [{
    type: "COMBO",
    comboId: comboCart.id,
    quantity: comboCart.qty,
    price: comboCart.comboPrice * comboCart.qty,
    name: comboCart.name,
    imageUrl: comboCart.imageUrl
  }] : []),

  ...cartItems.map(item => ({
    type: "FOOD",
    foodId: item.id,
    quantity: quantities[item.id],
    price: item.price * quantities[item.id],
    name: item.name
  }))
],


      // Amounts
      subtotal: subtotal,
      tax: tax,
      shipping: shipping,
      total: parseFloat(total.toFixed(2)),
    };

    setSubmitting(true);

    let createdOrder = null;
    try {
      const res = await api.post("/api/orders/create", orderData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.status === 201 && res.data?.razorpayOrderId) {
        createdOrder = res.data;
        await initiateRazorpayPayment(res.data, createdOrder.id);
      } else {
        toast.error("Unable to place order");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Order failed");
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------
  // 7️⃣ PAYMENT FLOW
  // -------------------------------
  const initiateRazorpayPayment = async (order, createdOrderId) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Payment gateway failed to load.");
      return;
    }

    const rzp = new window.Razorpay({
      key: settings.razorpayKey,
      amount: Math.round(order.amount * 100),
      currency: "INR",
      name: "Cocogrand Organics",
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

      modal: {
        ondismiss: async function () {
          toast.error("Payment cancelled");
          if (createdOrderId) await deleteOrder(createdOrderId);
        },
      },
    });

    rzp.open();
  };

  // -------------------------------
  // 8️⃣ VERIFY PAYMENT
  // -------------------------------
  const verifyPayment = async (razorpayResponse) => {
    try {
      const res = await api.post("/api/orders/verify", razorpayResponse, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.status === 200) {
        toast.success("Payment successful!");
        toast.info("Order details sent to your email.");
        await clearCart();
        navigate("/myorders");
      } else {
        toast.error("Payment verification failed.");
        navigate("/");
      }
    } catch (err) {
      toast.error("Payment failed.");
      navigate("/");
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      await api.delete(`/api/orders/${orderId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {
      console.error("Order cleanup failed", err);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete("/api/cart", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setQuantities({});
    } catch (err) {
      toast.error("Unable to clear cart");
    }
  };

  // -------------------------------
  // 9️⃣ UI
  // -------------------------------
  return (
    <div className="container mt-4">
      <main>
        <div className="py-5 text-center">
          <img className="d-block mx-auto" src={assets.main_logo} alt="" width="188" height="168" />
        </div>

        <div className="row g-5">
          {/* ---------- CART SUMMARY ---------- */}
          <div className="col-md-5 col-lg-4 order-md-last">
            <h4 className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-primary">Your cart</span>
              <span className="badge bg-primary rounded-pill">{cartItems.length}</span>
            </h4>

            <ul className="list-group mb-3">

  {/* COMBO ITEM */}
  {comboCart && (
    <li className="list-group-item d-flex justify-content-between lh-sm">
      <div>
        <h6 className="my-0">{comboCart.name}</h6>
        <small className="text-body-secondary">
          Combo × {comboCart.qty}
        </small>
      </div>
      <span className="text-body-secondary">
        ₹{(comboCart.comboPrice * comboCart.qty).toFixed(2)}
      </span>
    </li>
  )}

  {/* NORMAL FOOD ITEMS */}
  {cartItems.length > 0 ? (
    cartItems.map((item) => (
      <li
        key={item.id}
        className="list-group-item d-flex justify-content-between lh-sm"
      >
        <div>
          <h6 className="my-0">{item.name}</h6>
          <small className="text-body-secondary">
            Qty: {quantities[item.id] || 1}
          </small>
        </div>
        <span className="text-body-secondary">
          ₹{(item.price * (quantities[item.id] || 1)).toFixed(2)}
        </span>
      </li>
    ))
  ) : (
    !comboCart && (
      <p className="text-center text-muted">Your cart is empty</p>
    )
  )}

  {/* SUBTOTAL */}
  <li className="list-group-item d-flex justify-content-between">
    <span>Subtotal</span>
    <strong>₹{subtotal.toFixed(2)}</strong>
  </li>

  <li className="list-group-item d-flex justify-content-between">
    <span>Shipping</span>
    <span>₹{shipping.toFixed(2)}</span>
  </li>

  <li className="list-group-item d-flex justify-content-between">
    <span>Tax ({settings.taxPercentage || 0}%)</span>
    <span>₹{tax.toFixed(2)}</span>
  </li>

  {discount > 0 && (
    <li className="list-group-item d-flex justify-content-between text-success">
      <span>Discount</span>
      <span>-₹{discount.toFixed(2)}</span>
    </li>
  )}

  <li className="list-group-item d-flex justify-content-between">
    <strong>Total</strong>
    <strong>₹{finalTotal.toFixed(2)}</strong>
  </li>
</ul>

          </div>

          {/* ---------- ADDRESS FORM ---------- */}
          <div className="col-md-7 col-lg-8">
            <h4 className="mb-3">Billing address</h4>

            <form className="needs-validation" onSubmit={onSubmitHandler}>
              <div className="row g-3">
                {/* name fields */}
                <div className="col-sm-6">
                  <label className="form-label">First name</label>
                  <input type="text" name="firstName" className="form-control"
                    value={data.firstName} onChange={onChangeHandler}
                    placeholder="John"
                    required />
                </div>

                <div className="col-sm-6">
                  <label className="form-label">Last name</label>
                  <input type="text" name="lastName" className="form-control"
                    value={data.lastName} onChange={onChangeHandler} 
                    placeholder="Doe"
                    required />
                </div>

                {/* email */}
                <div className="col-12">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" className="form-control"
                    value={data.email} onChange={onChangeHandler}
                    placeholder="your@example.com"
                    required />
                </div>

                {/* phone */}
                <div className="col-12">
                  <label className="form-label">Phone</label>
                  <input type="tel" name="phoneNumber" className="form-control"
                    value={data.phoneNumber}
                    placeholder="Enter your phone number"
                    onChange={onChangeHandler} required />
                </div>

                {/* address */}
                <div className="col-12">
                  <label className="form-label">Address</label>
                  <input type="text" name="address" placeholder="Address" className="form-control"
                    value={data.address} onChange={onChangeHandler} required />
                </div>

                <div className="col-md-5">
                  <label className="form-label">State</label>
                  <select className="form-select" name="state"
                    value={data.state} onChange={onChangeHandler} required>
                    <option value="">Choose...</option>
                    <option>Tamil Nadu</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">City</label>
                  <select className="form-select" name="city"
                    value={data.city} onChange={onChangeHandler} required>
                    <option value="">Choose...</option>
                    <option>Chennai</option>
                    <option>Coimbatore</option>
                    <option>Madurai</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Zip</label>
                  <input type="text" name="zip" className="form-control"
                    value={data.zip} onChange={onChangeHandler} required />
                </div>
              </div>

              <hr className="my-4" />

              <button className="w-100 btn btn-primary btn-lg"
                type="submit"
                disabled={cartItems.length === 0 || submitting}>
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
