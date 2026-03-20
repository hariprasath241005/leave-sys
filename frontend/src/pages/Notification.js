import React, { useEffect, useState } from "react";

function Notification() {
  const [messages, setMessages] = useState([]);

  const loadNotifications = async () => {
    const res = await fetch("http://localhost:5000/api/execution");
    const executions = await res.json();
    
    // Flatten notifications from all executions into a list of messages
    let msgs = [];
    executions.forEach(ex => {
      if (ex.notifications) {
        ex.notifications.forEach(n => msgs.push(n.message));
      }
    });

    setMessages(msgs.slice(0, 5)); // Show 5 most recent
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel" style={{ 
        position: "fixed", 
        bottom: 20, 
        right: 20, 
        width: "350px", 
        padding: "1rem", 
        zIndex: 1000,
        background: "rgba(15, 23, 42, 0.8)" 
    }}>
      <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        <span style={{color: 'var(--primary)'}}>🔔</span> Live Comm Link
      </h4>
      {messages.length === 0 ? (
        <p style={{fontStyle: 'italic', fontSize: '0.8rem'}}>System standby...</p>
      ) : (
        <ul className="execution-logs" style={{ background: 'transparent', padding: 0, marginTop: 0 }}>
          {messages.map((msg, idx) => (
            <li key={idx} style={{ 
              marginBottom: "8px", 
              fontSize: "0.85rem", 
              borderBottom: idx !== messages.length-1 ? "1px solid var(--surface-border)" : "none",
              paddingBottom: "8px"
            }}>
              {msg}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notification;