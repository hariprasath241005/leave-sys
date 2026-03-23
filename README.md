# 🔄 Leave Management Workflow Engine

A **Generic, Rule-Based Workflow Engine** built with Node.js, React, and MongoDB. The system allows dynamic approval workflows with configurable limits — designed as a real-world Leave Management System.

---
**Database image**
:<img width="1410" height="664" alt="Image" src="https://github.com/user-attachments/assets/c0de5354-69b5-4b05-aa80-40b634781890" />
<img width="1369" height="957" alt="Image" src="https://github.com/user-attachments/assets/ce363cdc-2b38-444f-a5ad-4c4ba923634a" />
<img width="1416" height="773" alt="Image" src="https://github.com/user-attachments/assets/2943d1da-1bc8-42a4-a0f7-3fe5cda34a8f" />
<img width="1373" height="571" alt="Image" src="https://github.com/user-attachments/assets/6f969e02-57ce-4c8f-837d-2e0d424967d1" />
<img width="1411" height="944" alt="Image" src="https://github.com/user-attachments/assets/38360c1d-b75e-44d6-baf6-98cc6f55224e" />
<img width="1378" height="950" alt="Image" src="https://github.com/user-attachments/assets/b04f20f7-7a95-4342-b891-a847ffe2d172" />


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
