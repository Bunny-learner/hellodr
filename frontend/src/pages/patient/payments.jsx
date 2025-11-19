// src/components/Payments.jsx
import React, { useEffect, useState } from "react";
import Bubbles from "../../components/Loaders/bubbles";
import "../../css/payments.css";

export default function Payments() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/appointment/transactions", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load transactions");
      const data = await res.json();
      setTransactions(data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (loading) return <Bubbles />;
  if (error) return <div className="payment-error">{error}</div>;

  return (
    <div className="payments-wrapper">
      <h1 className="payments-title">My Transactions</h1>

      {transactions.length === 0 ? (
        <p className="no-transactions">No transactions found.</p>
      ) : (
        <div className="table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Appointment Date</th>
                <th>Doctor</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((txn) => (
                <tr key={txn._id}>
                  <td>
                    {txn.appointment?.date
                      ? new Date(txn.appointment.date).toLocaleDateString()
                      : "N/A"}
                  </td>

                  <td>{txn.doctor?.name || "N/A"}</td>

                  <td>₹{(txn.amount / 100).toFixed(2)}</td>

                  <td className="payment-method">{txn.paymentMethod}</td>

                  <td>
                    <span
                      className={`status-badge ${
                        txn.paymentStatus === "paid"
                          ? "paid"
                          : txn.paymentStatus === "failed"
                          ? "failed"
                          : "pending"
                      }`}
                    >
                      {txn.paymentStatus.toUpperCase()}
                    </span>
                  </td>

                  <td>{new Date(txn.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
