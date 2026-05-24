# Workflow Automation Platform

A role-based **Workflow Automation Platform** that allows organizations to digitize internal approval processes.
Administrators can create workflows with multiple approval stages, employees can submit requests, and managers/HR can approve or reject them through a centralized dashboard.

---

## Overview

This project automates internal organizational workflows such as leave approvals or request processing.
Instead of manually managing approvals through email or messaging, the platform provides a structured system where requests move through predefined approval stages.

The system supports **role-based access**, **multi-step approval chains**, and **request status tracking**.

---

## Features

### Authentication & Authorization

* Secure login using **JWT authentication**
* Role-based access control
* Supported roles:

  * Admin
  * Employee
  * Manager
  * HR
  * Finance

---

### Workflow Creation (Admin)

Admins can create workflows and define approval steps.

Example workflow:

Employee Request
→ Manager Approval
→ HR Approval
→ Final Status

Admin capabilities:

* Create workflow
* Define step names
* Assign roles to each step
* Configure approval sequence

---

### Request Submission (Employee)

Employees can:

* View available workflows
* Submit workflow requests
* Track request status

Example request lifecycle:

Submitted
→ Pending Manager Approval
→ Pending HR Approval
→ Approved / Rejected

---

### Approval System (Manager / HR )

Approvers can:

* View pending approvals in their dashboard
* Approve or reject requests
* Automatically move requests to the next approval stage

Example status updates:

Approved by Manager → Pending with HR
Rejected by Manager
Approved by HR

---

### Request Status Tracking

Employees can view the real-time status of their requests.

Example statuses:

* Pending with Manager
* Approved by Manager → Pending with HR
* Rejected by Manager
* Approved by HR

---

### Audit Logs

Every approval or rejection is recorded in **request logs**, allowing complete traceability of actions performed on a request.

---

## System Architecture

Frontend
React.js

Backend
Node.js + Express

Database
PostgreSQL

Authentication
JWT (JSON Web Token)

---

## Project Structure

```
workflow-automation-platform
│
├── backend
│   ├── src
│   │   ├── routes
│   │   │   ├── authRoutes.js
│   │   │   └── workflowRoutes.js
│   │   ├── middleware
│   │   │   └── authMiddleware.js
│   │   ├── config
│   │   │   └── db.js
│   │   ├── app.js
│   │   └── server.js
│
├── frontend
│   └── src
│       ├── pages
│       │   ├── Login.js
│       │   └── Dashboard.js
│
└── README.md
```

---

## Tech Stack

| Layer             | Technology       |
| ----------------- | ---------------- |
| Frontend          | React.js         |
| Backend           | Node.js, Express |
| Database          | PostgreSQL       |
| Authentication    | JWT              |
| API Communication | Axios            |

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/workflow-automation-platform.git
cd workflow-automation-platform
```

---

### 2. Setup Backend

```
cd backend
npm install
```

Create a `.env` file:

```
PORT=3000
JWT_SECRET=your_secret_key
DATABASE_URL=your_postgres_connection
```

Run backend:

```
npm start
```

---

### 3. Setup Frontend

```
cd frontend
npm install
npm start
```

The application will start on:

```
http://localhost:3000
```

---

## Database Tables

Key tables used in the system:

### users

Stores system users and their roles.

### roles

Defines roles like Admin, Employee, Manager, HR.

### workflows

Stores workflow definitions created by admin.

### workflow_steps

Stores step sequence and role assigned to each step.

### workflow_requests

Stores requests submitted by employees.

### request_logs

Tracks approval and rejection actions.

---

## Example Workflow

Example leave request flow:

Employee submits leave request
↓
Manager reviews request
↓
Manager approves → HR review
↓
HR approves → Request completed

---

## Future Enhancements

The following features are planned for future versions:

* Employee onboarding module
* Team hierarchy (manager reporting structure)
* Leave management system
* Leave balance tracking
* Half-day leave support
* Team leave calendar
* Admin user management dashboard
* Email notifications for approvals
* Enhanced UI dashboard

---

## Author

Developed by **Swayam Bhajan**

---

## License

This project is created for learning and demonstration purposes.
