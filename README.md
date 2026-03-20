# 🔄 Leave Management Workflow Engine

A **Generic, Rule-Based Workflow Engine** built with Node.js, React, and MongoDB. The system allows dynamic approval workflows with configurable limits — designed as a real-world Leave Management System.

---

## 📁 Project Structure

```
leave-system/
├── backend/      # Node.js + Express API
└── frontend/     # React UI
```

---

## 🚀 Setup & Run

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on port 27017)
- npm

### 1. Backend

```bash
cd backend
npm install
node server.js
```

Server runs on `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

App opens at `http://localhost:3000`

---

## 🔐 Default Accounts

| Role     | Email                  | Password |
|----------|------------------------|----------|
| Employee | employee@gmail.com     | 1234     |
| Manager  | manager@gmail.com      | 1234     |
| HR       | hr@gmail.com           | 1234     |
| CEO/Admin| ceo@gmail.com          | 1234     |

---

## ⚙️ How It Works

### Workflow Engine Design

The system uses a **directed graph of Steps connected by Rules**, evaluated at runtime using the `jexl` expression library.

```
Employee applies leave (N days)
         │
         ▼
  Manager Check  ── N ≤ config.managerLimit ──▶ CEO auto-approve ──▶ ✅ DONE
         │
         ▼ (N > managerLimit)
    HR Check  ── N ≤ config.hrLimit ──▶ CEO Approves (manual) ──▶ ✅ DONE
         │
         ▼ (N > hrLimit)
      ❌ Rejected
```

### Dynamic Limits
- Manager and HR can update their approval limits via their dashboards
- Limits are stored in MongoDB `Config` collection
- The engine fetches live config on every execution — no restart needed

### Rule Evaluation
Rules are written as `jexl` expressions:
- `leave_days <= config.managerLimit`
- `leave_days > config.hrLimit`
- `action == 'approve'`
- `DEFAULT` (catch-all)

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/balance/:userId` | Get leave balance |

### Config
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/config` | Get current limits |
| POST | `/api/config` | Update limits |

### Workflows
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workflows` | List all workflows |
| GET | `/api/workflows/:id` | Get workflow with steps & rules |

### Execution
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/execution/start` | Start execution (leave request) |
| GET | `/api/execution` | Get all executions |
| GET | `/api/execution/:id` | Get execution by ID |
| POST | `/api/execution/process` | Submit manual approval action |
| POST | `/api/execution/:id/cancel` | Cancel execution |

---

## 🧰 Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Node.js, Express |
| Frontend | React (CRA) |
| Database | MongoDB + Mongoose |
| Rule Engine | jexl |
| Auth | bcryptjs |
| Styling | Vanilla CSS (glassmorphism) |

---

## 📊 Sample Execution

**Input:** `{ "leave_days": 6, "userId": "..." }`

**Workflow Trace:**
```
[Manager Check]  → Rule matched: leave_days <= 3? NO → escalate
[HR Check]       → Rule matched: leave_days <= 5? NO (6 > 5) → REJECTED
Status: rejected
Notification: ❌ HR Check rejected the leave request. Workflow ended.
```

---

## 🗄️ Database Models

- **User** — email, role, password, leaveBalance
- **Config** — managerLimit, hrLimit, ceoLimit
- **Workflow** — name, version, input_schema, start_step_id
- **Step** — workflow_id, name, step_type (task/approval/notification), order, metadata
- **Rule** — step_id, condition, next_step_id, priority, is_reject
- **Execution** — workflow_id, status, data, logs, notifications, triggered_by
