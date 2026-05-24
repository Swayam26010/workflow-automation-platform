const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const workflowRoutes = require("./routes/workflowRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Backend is running! Use /auth/login and /api/workflows"
  });
});

app.use("/auth", authRoutes);
app.use("/api/workflows", workflowRoutes);

module.exports = app;