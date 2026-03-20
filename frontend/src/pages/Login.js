import React, { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("role", data.role);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("leaveBalance", data.leaveBalance || 20);
        window.location.reload();
      } else {
        alert(data.msg);
      }
    } catch(err) {
      alert("Error connecting to server");
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '0.5rem', background: '-webkit-linear-gradient(45deg, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Workflow OS
        </h1>
        <p style={{ marginBottom: '2rem' }}>Sign in to continue to your dashboard</p>

        <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="employee@gmail.com" />
        </div>

        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••" />
        </div>

        <button className="primary" style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }} onClick={login}>
          Authenticate
        </button>

        <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          System Defaults: <br/>employee@ / manager@ / hr@ / ceo@gmail.com | pw: 1234
        </div>
      </div>
    </div>
  );
}

export default Login;