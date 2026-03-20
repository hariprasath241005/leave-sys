import { useState, useEffect } from "react";

function AdminDashboard() {
  const [tab, setTab] = useState("workflows"); 
  const [workflows, setWorkflows] = useState([]);
  const [executions, setExecutions] = useState([]);
  
  const [activeWf, setActiveWf] = useState(null);
  const [runWf, setRunWf] = useState(null);
  const [runData, setRunData] = useState('{\n  "leave_days": 2,\n  "department": "IT"\n}');
  const [runResult, setRunResult] = useState(null);

  const loadWorkflows = async () => {
    const res = await fetch("REPLACE_WITH_RENDER_URL/api/workflows");
    setWorkflows(await res.json());
  };

  const loadExecutions = async () => {
    const res = await fetch("REPLACE_WITH_RENDER_URL/api/execution");
    setExecutions(await res.json());
  };

  useEffect(() => { loadWorkflows(); }, []);

  const openEditor = async (id) => {
    const res = await fetch(`REPLACE_WITH_RENDER_URL/api/workflows/${id}`);
    setActiveWf(await res.json());
    setTab("editor");
  };

  const executeWf = async () => {
    try {
      const data = JSON.parse(runData);
      const res = await fetch(`REPLACE_WITH_RENDER_URL/api/execution/workflows/${runWf._id}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      setRunResult(await res.json());
      loadExecutions();
    } catch(e) {
      alert("Execution request failed. Please check JSON data and server connection.");
    }
  };

  return (
    <div className="container">
      <div className="glass-panel">
        <div className="header-row">
          <h1>âš™ï¸ Architecture Dashboard</h1>
          <button className="danger" onClick={() => { localStorage.clear(); window.location.reload(); }}>
            <span role="img" aria-label="logout">ðŸšª</span> Logout
          </button>
        </div>
        
        <div className="tabs">
          <button className={tab === "workflows" ? "active-tab" : ""} onClick={() => { setTab("workflows"); loadWorkflows(); }}>
             Workflows Library
          </button>
          <button className={tab === "audit" ? "active-tab" : ""} onClick={() => { setTab("audit"); loadExecutions(); }}>
            Global Audit Tree
          </button>
        </div>

        {/* â”€â”€ WORKFLOWS LIST â”€â”€ */}
        {tab === "workflows" && (
          <div style={{ animation: 'slideUp 0.4s ease' }}>
            <h2>Available Workflows</h2>
            <br/>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th><th>Name</th><th>Version</th><th>Steps</th><th style={{textAlign: "right"}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workflows.map(w => (
                    <tr key={w._id}>
                      <td><code style={{background:'transparent'}}>{w._id.substring(w._id.length-8)}</code></td>
                      <td style={{fontWeight:600}}>{w.name}</td>
                      <td>v{w.version}</td>
                      <td><span className="badge" style={{background:"var(--surface-border)"}}>{w.steps} phases</span></td>
                      <td style={{textAlign: "right"}}>
                        <button style={{marginRight: '0.5rem'}} onClick={() => openEditor(w._id)}>Design</button>
                        <button className="primary" onClick={() => { setRunWf(w); setRunResult(null); setTab("run"); }}>Deploy</button>
                      </td>
                    </tr>
                  ))}
                  {workflows.length === 0 && <tr><td colSpan="5" style={{textAlign:'center'}}>Initializing Schema...</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* â”€â”€ WORKFLOW EDITOR â”€â”€ */}
        {tab === "editor" && activeWf && (
          <div style={{ animation: 'slideUp 0.4s ease' }}>
            <div className="header-row">
              <h2>Designing: <span style={{color:"var(--primary)"}}>{activeWf.name}</span></h2>
              <button onClick={() => setTab("workflows")}>â† Back to Library</button>
            </div>
            
            <h4>Input Architecture</h4>
            <pre style={{marginBottom:'2rem'}}>{JSON.stringify(activeWf.input_schema, null, 2)}</pre>
            
            <h3>Execution Trajectory</h3>
            <br/>
            {activeWf.steps?.map((step, i) => (
              <div key={step._id} className="step-card">
                <h4>{i+1}. {step.name} <span className="badge" style={{float:'right', background:'var(--surface-border)'}}>{step.step_type}</span></h4>
                <br/>
                <div className="table-wrapper">
                  <table>
                    <thead><tr><th style={{width:'80px'}}>Priority</th><th>Rule Conditional</th><th>Routing Fallback</th></tr></thead>
                    <tbody>
                      {step.rules?.map(r => (
                        <tr key={r._id}>
                          <td><span className="badge" style={{background:'var(--primary)', color:'#fff'}}>{r.priority}</span></td>
                          <td><code>{r.condition}</code></td>
                          <td>{r.next_step_id ? <code style={{color:'var(--text-muted)'}}>{r.next_step_id}</code> : <span className="badge status-rejected">TERMINATE</span>}</td>
                        </tr>
                      ))}
                      {(!step.rules || step.rules.length===0) && <tr><td colSpan="3" style={{textAlign:'center', padding:'2rem'}}>No runtime rules injected.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* â”€â”€ EXECUTE WORKFLOW â”€â”€ */}
        {tab === "run" && runWf && (
          <div style={{ animation: 'slideUp 0.4s ease' }}>
             <div className="header-row">
              <h2>Deploy Execution: <span style={{color:"var(--primary)"}}>{runWf.name}</span></h2>
              <button onClick={() => setTab("workflows")}>â† Back</button>
            </div>

            <p style={{marginBottom: '0.5rem'}}>Inject Runtime Payload (JSON):</p>
            <textarea 
              rows="6" 
              value={runData} 
              onChange={e => setRunData(e.target.value)}
              style={{fontFamily: 'monospace', marginBottom: '1rem'}}
            ></textarea>

            <button className="primary" style={{width:'100%', padding:'1rem', fontSize:'1.1rem'}} onClick={executeWf}>âš¡ Initialize Execution Trajectory</button>

            {runResult && (
              <div className="step-card" style={{marginTop:'2rem', borderColor: runResult.status==='completed'?'var(--success)':'var(--danger)'}}>
                <h3 style={{marginBottom:'0.5rem'}}>
                  Pipeline Status: <span className={`badge status-${runResult.status}`}>{runResult.status}</span>
                </h3>
                <p>Trace Signature: <code>{runResult._id}</code></p>
                
                <h4 style={{marginTop:'1.5rem', borderBottom:'1px solid var(--surface-border)', paddingBottom: '0.5rem'}}>Jexl Rule Trace Log:</h4>
                <ul className="execution-logs">
                  {runResult.logs?.map((l, i) => (
                    <li key={i}>
                      <span style={{color:'var(--primary)', fontWeight:600}}>[{l.step_name}]</span>
                      <span style={{color: l.status==='completed'?'var(--success)':'#f87171'}}> {l.status?.toUpperCase()} </span>
                      {l.evaluated_rules?.length>0 && (
                        <div style={{marginTop:'0.5rem', background:'rgba(0,0,0,0.2)', padding:'0.5rem', borderRadius:'6px'}}>
                           <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Matched Condition: </span> 
                           <code>{l.evaluated_rules.find(r=>r.result)?.rule || 'Fallback'}</code>
                        </div>
                      )}
                    </li>
                  ))}
                  {runResult.logs?.length === 0 && <li><i>No nodes evaluated</i></li>}
                </ul>

                <h4 style={{marginTop:'1.5rem', borderBottom:'1px solid var(--surface-border)', paddingBottom: '0.5rem'}}>System Notifications:</h4>
                <ul className="execution-logs">
                  {runResult.notifications?.map((n, i) => <li key={i}>{n.message}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* â”€â”€ AUDIT LOG â”€â”€ */}
        {tab === "audit" && (
          <div style={{ animation: 'slideUp 0.4s ease' }}>
            <h2>Global Ledger</h2>
            <br/>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Signature ID</th><th>Pipeline ID</th><th>Status</th><th>Timestamp</th></tr>
                </thead>
                <tbody>
                  {executions.map(ex => (
                    <tr key={ex._id}>
                      <td><code style={{background:'transparent'}}>{ex._id.substring(ex._id.length-8)}</code></td>
                      <td><code style={{background:'transparent'}}>{ex.workflow_id?.substring(ex.workflow_id.length-8)}</code></td>
                      <td><span className={`badge status-${ex.status}`}>{ex.status}</span></td>
                      <td style={{color:'var(--text-muted)'}}>{new Date(ex.started_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {executions.length === 0 && <tr><td colSpan="4" style={{textAlign:'center', padding:'2rem'}}>No executions registered</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;
