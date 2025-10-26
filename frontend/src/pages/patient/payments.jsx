// src/components/Payments.jsx
import React, { useEffect, useState } from "react";
import { LinearProgress } from "@mui/material";
import Bubbles from "../../components/Loaders/bubbles"
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

  if (loading) return <Bubbles/>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="payments-container">
      <h2>My Transactions</h2>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
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
                <td>{txn.paymentMethod}</td>
                <td
                  className={`status ${
                    txn.paymentStatus === "paid"
                      ? "paid"
                      : txn.paymentStatus === "failed"
                      ? "failed"
                      : "pending"
                  }`}
                >
                  {txn.paymentStatus.toUpperCase()}
                </td>
                <td>{new Date(txn.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
