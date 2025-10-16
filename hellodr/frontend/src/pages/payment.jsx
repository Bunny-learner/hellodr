import React from "react";

export default function RazorpayPayment() {

  const handlePayment = async () => {
    // Fetch order info from your backend
    const res = await fetch("/create-razorpay-order", { method: "POST" });
    const orderData = await res.json(); // orderData should have: id, amount, currency, key

    const options = {
      key: orderData.key, 
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Your Company Name",
      description: "Test Transaction",
      order_id: orderData.id,
      handler: function (response) {
        console.log("Payment Success:", response);
        alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
      },
      prefill: {
        name: "Test User",
        email: "testuser@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#007c7c",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <button
        style={{
          padding: "15px 50px",
          fontSize: "18px",
          borderRadius: "10px",
          backgroundColor: "#007c7c",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
        onClick={handlePayment}
      >
        Pay Now
      </button>
    </div>
  );
}
