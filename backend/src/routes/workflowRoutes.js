const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authorize = require('../middleware/authMiddleware');

// ---------------------
// Admin: Create Workflow + Steps
// ---------------------
router.post('/create-workflow', authorize(['Admin']), async (req, res) => {
  const { name, description, steps } = req.body; // steps = [{ step_name, role_id, step_order }]

  try {
    const workflowResult = await pool.query(
      'INSERT INTO workflows (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    const workflow = workflowResult.rows[0];

    // Insert workflow steps
    for (const step of steps) {
      await pool.query(
        'INSERT INTO workflow_steps (workflow_id, step_name, role_id, step_order) VALUES ($1, $2, $3, $4)',
        [workflow.id, step.step_name, step.role_id, step.step_order]
      );
    }

    res.json({ message: 'Workflow created with steps', workflow });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------
// Get All Workflows (Admin)
// ---------------------
router.get('/', authorize(['Admin']), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM workflows');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------
// Employee: Submit Workflow Request
// ---------------------
router.post('/submit-request', authorize(['Employee']), async (req, res) => {
  const { workflow_id } = req.body;
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      'INSERT INTO workflow_requests (workflow_id, user_id) VALUES ($1, $2) RETURNING *',
      [workflow_id, user_id]
    );
    res.json({ message: 'Workflow request submitted', request: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------
// Get My Requests (Employee)
// ---------------------
router.get('/my-requests', authorize(['Employee']), async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      `SELECT wr.*, w.name AS workflow_name
       FROM workflow_requests wr
       LEFT JOIN workflows w ON wr.workflow_id = w.id
       WHERE wr.user_id = $1`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------
// Get Pending Approvals (Manager/Finance/Admin)
// ---------------------
router.get('/pending-approvals', authorize(['Manager', 'Finance', 'Admin']), async (req, res) => {
  const user_role = req.user.role;
  try {
    const result = await pool.query(
      `SELECT wr.*, w.name AS workflow_name, ws.step_name, ws.step_order
       FROM workflow_requests wr
       JOIN workflow_steps ws ON ws.workflow_id = wr.workflow_id
       JOIN roles r ON ws.role_id = r.id
       WHERE wr.status='Pending' AND r.name=$1 AND wr.current_step = ws.step_order`,
      [user_role]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------
// Approve Workflow Request
// ---------------------
router.post('/requests/:id/approve', authorize(['Manager', 'Finance', 'Admin']), async (req, res) => {
  const request_id = req.params.id;
  const user_id = req.user.id;
  const user_role = req.user.role;

  try {
    // Get current request
    const requestResult = await pool.query('SELECT * FROM workflow_requests WHERE id=$1', [request_id]);
    if (requestResult.rows.length === 0) return res.status(404).json({ message: 'Request not found' });
    const request = requestResult.rows[0];

    // Get current step
    const stepResult = await pool.query(
      `SELECT * FROM workflow_steps ws
       JOIN roles r ON ws.role_id = r.id
       WHERE ws.workflow_id=$1 AND ws.step_order=$2 AND r.name=$3`,
      [request.workflow_id, request.current_step, user_role]
    );
    if (stepResult.rows.length === 0) return res.status(403).json({ message: 'Not authorized to approve this step' });

    // Log action
    await pool.query(
      'INSERT INTO request_logs (request_id, action, performed_by) VALUES ($1, $2, $3)',
      [request_id, 'Approved', user_id]
    );

    // Move to next step or mark completed
    const nextStep = request.current_step + 1;
    const maxStepResult = await pool.query(
      'SELECT COUNT(*) FROM workflow_steps WHERE workflow_id=$1',
      [request.workflow_id]
    );
    const maxStep = parseInt(maxStepResult.rows[0].count);

    if (nextStep > maxStep) {
      await pool.query(
        'UPDATE workflow_requests SET status=$1 WHERE id=$2',
        ['Completed', request_id]
      );
    } else {
      await pool.query(
        'UPDATE workflow_requests SET current_step=$1 WHERE id=$2',
        [nextStep, request_id]
      );
    }

    res.json({ message: 'Workflow request approved' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------
// Reject Workflow Request
// ---------------------
router.post('/requests/:id/reject', authorize(['Manager', 'Finance', 'Admin']), async (req, res) => {
  const request_id = req.params.id;
  const user_id = req.user.id;
  const user_role = req.user.role;

  try {
    // Get current request
    const requestResult = await pool.query('SELECT * FROM workflow_requests WHERE id=$1', [request_id]);
    if (requestResult.rows.length === 0) return res.status(404).json({ message: 'Request not found' });
    const request = requestResult.rows[0];

    // Get current step
    const stepResult = await pool.query(
      `SELECT * FROM workflow_steps ws
       JOIN roles r ON ws.role_id = r.id
       WHERE ws.workflow_id=$1 AND ws.step_order=$2 AND r.name=$3`,
      [request.workflow_id, request.current_step, user_role]
    );
    if (stepResult.rows.length === 0) return res.status(403).json({ message: 'Not authorized to reject this step' });

    // Log rejection
    await pool.query(
      'INSERT INTO request_logs (request_id, action, performed_by) VALUES ($1, $2, $3)',
      [request_id, 'Rejected', user_id]
    );

    // Mark request as rejected
    await pool.query(
      'UPDATE workflow_requests SET status=$1 WHERE id=$2',
      ['Rejected', request_id]
    );

    res.json({ message: 'Workflow request rejected' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------
// View Workflow Request History (All Roles)
// ---------------------
router.get('/requests/:id/history', authorize(['Admin', 'Manager', 'Finance', 'Employee']), async (req, res) => {
  const request_id = req.params.id;

  try {
    const result = await pool.query(
      `SELECT rl.*, u.name AS performed_by_name, u.email AS performed_by_email
       FROM request_logs rl
       LEFT JOIN users u ON rl.performed_by = u.id
       WHERE rl.request_id=$1
       ORDER BY rl.timestamp ASC`,
      [request_id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Employee submits a workflow request
router.post('/submit-request', authorize(['Employee']), async (req, res) => {
  const { workflow_id } = req.body;
  const employee_id = req.user.id; // Comes from authMiddleware

  try {
    // Get first step of workflow
    const firstStepResult = await pool.query(
      'SELECT id FROM workflow_steps WHERE workflow_id = $1 ORDER BY step_order ASC LIMIT 1',
      [workflow_id]
    );
    const firstStep = firstStepResult.rows[0];

    if (!firstStep) return res.status(400).json({ message: 'Workflow has no steps' });

    // Insert into workflow_requests
    const result = await pool.query(
      `INSERT INTO workflow_requests (workflow_id, employee_id, current_step_id, status)
       VALUES ($1, $2, $3, 'Pending') RETURNING *`,
      [workflow_id, employee_id, firstStep.id]
    );

    res.json({ message: 'Request submitted', request: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;