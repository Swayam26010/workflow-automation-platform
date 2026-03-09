// src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Dashboard = () => {
  const [role, setRole] = useState("");
  const [availableWorkflows, setAvailableWorkflows] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setRole(decoded.role);
      fetchData(decoded.role);
    }
  }, [token]);

  const fetchData = async (userRole) => {
    try {
      if (userRole === "Employee") {
        await fetchAvailableWorkflows();
        await fetchMyRequests();
      } else if (["Manager", "HR", "Finance", "Admin"].includes(userRole)) {
        await fetchPendingApprovals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAvailableWorkflows = async () => {
    const res = await axios.get(
      "http://localhost:3000/api/workflows/available",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setAvailableWorkflows(res.data);
  };

  const fetchMyRequests = async () => {
    const res = await axios.get(
      "http://localhost:3000/api/workflows/my-requests",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setMyRequests(res.data);
  };

  const fetchPendingApprovals = async () => {
    const res = await axios.get(
      "http://localhost:3000/api/workflows/pending-approvals",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setPendingApprovals(res.data);
  };

  const submitWorkflowRequest = async () => {
    if (!selectedWorkflow) return alert("Select a workflow first");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/workflows/submit-request",
        { workflow_id: selectedWorkflow },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message);
      fetchMyRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const approveRequest = async (id) => {
    try {
      const res = await axios.post(
        `http://localhost:3000/api/workflows/requests/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message);
      fetchPendingApprovals();
    } catch (err) {
      console.error(err);
      alert("Error approving request");
    }
  };

  const rejectRequest = async (id) => {
    try {
      const res = await axios.post(
        `http://localhost:3000/api/workflows/requests/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message);
      fetchPendingApprovals();
    } catch (err) {
      console.error(err);
      alert("Error rejecting request");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>
      <p>Role: {role}</p>

      {/* EMPLOYEE VIEW */}
      {role === "Employee" && (
        <>
          <h3>Submit Workflow Request</h3>

          <select
            value={selectedWorkflow}
            onChange={(e) => setSelectedWorkflow(e.target.value)}
          >
            <option value="">Select Workflow</option>

            {availableWorkflows.map((wf) => (
              <option key={wf.id} value={wf.id}>
                {wf.name}
              </option>
            ))}
          </select>

          <button onClick={submitWorkflowRequest}>Submit</button>

          <h3>My Requests</h3>

          <ul>
            {myRequests.map((req) => (
              <li key={req.id}>
                {req.workflow_name} - Status: {req.status}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* MANAGER / HR / FINANCE / ADMIN VIEW */}
      {["Manager", "HR", "Finance", "Admin"].includes(role) && (
        <>
          <h3>Pending Approvals</h3>

          <ul>
            {pendingApprovals.length === 0 && (
              <li>No pending approvals</li>
            )}

            {pendingApprovals.map((req) => (
              <li key={req.id}>
                {req.workflow_name} - Step: {req.step_name} - Requested by{" "}
                <strong>
                  {req.requested_by_name} ({req.requested_by_email})
                </strong>

                <br />

                <button
                  onClick={() => approveRequest(req.id)}
                  style={{ marginRight: "10px", marginTop: "5px" }}
                >
                  Approve
                </button>

                <button
                  onClick={() => rejectRequest(req.id)}
                  style={{ marginTop: "5px" }}
                >
                  Reject
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Dashboard;
