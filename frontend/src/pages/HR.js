import React, { useState, useEffect } from "react";
import Notification from "./Notification";

function HR() {
  const [limit, setLimit] = useState(0);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("http://localhost:5000/api/config");
      const data = await res.json();
      setLimit(data.hrLimit);
    };
    load();
  }, []);

  const save = async () => {
    await fetch("http://localhost:5000/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hrLimit: limit })
    });
    alert("Saved Dynamic Limit!");
  };

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="container">
      <Notification />
      <div className="glass-panel" style={{marginTop: '20px'}}>
        <div className="header-row">
          <h2>HR Gateway</h2>
          <button className="danger" onClick={logout}>Logout</button>
        </div>
        
        <div className="step-card">
          <h3>Node Auto-Routing Limits</h3>
          <p style={{marginBottom: '1rem'}}>Modify the boundaries for the Workflow Engine below. Executions matching this requirement (`leave_days &lt;= config.hrLimit`) will instantly route past your desk recursively.</p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input type="number" value={limit} onChange={e => setLimit(Number(e.target.value))} style={{maxWidth: '120px'}}/>
            <button className="primary" onClick={save}>Update Active Rule Target</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HR;