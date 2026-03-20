import React, { useState, useEffect } from "react";
import Notification from "./Notification";

function Employee() {
  const [days, setDays] = useState(1);
  const [balance, setBalance] = useState(Number(localStorage.getItem("leaveBalance") || 20));
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState(""); // "success" | "error"

  const fetchBalance = async () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      try {
        const res = await fetch(`REPLACE_WITH_RENDER_URL/api/auth/balance/${userId}`);
        const data = await res.json();
        if (data.balance !== undefined) {
          setBalance(data.balance);
          localStorage.setItem("leaveBalance", data.balance);
        }
      } catch (e) {
        console.error("Balance fetch error", e);
      }
    }
  };

  useEffect(() => { fetchBalance(); }, []);

  const apply = async () => {
    const userId = localStorage.getItem("userId");
    setMsg("");
    try {
      const res = await fetch("REPLACE_WITH_RENDER_URL/api/execution/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, leave_days: Number(days) })
      });
      const data = await res.json();

      if (!res.ok) {
        setMsgType("error");
        setMsg(data.msg || "Request failed");
        return;
      }

      // Determine outcome from returned execution status
      const status = data.status;
      if (status === "completed") {
        setMsgType("success");
        setMsg(`âœ… Leave approved for ${days} day(s)!`);
      } else if (status === "rejected") {
        setMsgType("error");
        setMsg(`âŒ Leave request rejected. Exceeds allowed limit.`);
      } else {
        setMsgType("success");
        setMsg(`â¸ï¸ Leave request submitted and awaiting CEO approval.`);
      }

      await fetchBalance();
    } catch (e) {
      setMsgType("error");
      setMsg("Connection error. Please try again.");
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="container">
      <Notification />
      <div className="glass-panel" style={{ marginTop: '20px' }}>
        <div className="header-row">
          <div>
            <h2>Employee Portal</h2>
            <p>Remaining Balance: <span className="badge" style={{ background: 'var(--primary)', color: '#fff', marginLeft: '10px', fontSize: '1.1rem', padding: '0.4rem 1rem' }}>{balance} Days</span></p>
          </div>
          <button className="danger" onClick={logout}>Logout</button>
        </div>

        <div className="step-card">
          <h3>Apply for Leave</h3>
          <p style={{ marginBottom: '1rem' }}>Submit a leave request which will be routed through the approval hierarchy automatically.</p>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Duration (Days)</label>
              <input type="number" min="1" max="50" value={days} onChange={e => setDays(e.target.value)} />
            </div>
            <button className="primary" style={{ padding: '0.8rem 2rem' }} onClick={apply}>Submit Request</button>
          </div>

          {msg && (
            <div style={{
              marginTop: '1rem',
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              fontWeight: 600,
              background: msgType === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color: msgType === 'success' ? '#34d399' : '#f87171',
              border: `1px solid ${msgType === 'success' ? '#34d399' : '#f87171'}`
            }}>
              {msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Employee;
