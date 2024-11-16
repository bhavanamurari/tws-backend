const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Task = mongoose.model("Task");
const User = mongoose.model("User");
const authenticateToken = require("../middlewares/authMiddleware");
const checkAdminRole = require("../middlewares/roleMiddleware");

// Route to get all tasks
router.get("/tasks", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// Route to add a new task (admin only)
router.post("/tasks", authenticateToken, checkAdminRole, async (req, res) => {
  const { taskName, points, category } = req.body;

  try {
    const newTask = new Task({
      taskName,
      points,
      category,
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ message: "Error adding task" });
  }
});

// Route to start a task
router.put("/task/:id/start", authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    // Find the task and user
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the task has already been completed
    const taskCompletionStatus = user.completedTasks.find(
      (taskStatus) => taskStatus.taskId.toString() === taskId
    );

    if (taskCompletionStatus && taskCompletionStatus.status === "complete") {
      return res.status(400).json({ message: "Task already completed." });
    }

    // Mark the task as "claim"
    if (!taskCompletionStatus) {
      user.completedTasks.push({ taskId, status: "claim" });
    } else {
      // Update the task completion status if it was in "start"
      taskCompletionStatus.status = "claim";
    }

    await user.save();

    // Update task status to "claim"
    task.taskCompletion = "claim";
    await task.save();

    res.status(200).json({
      message: "Task started. You can now claim your reward.",
      task: task,
      user: { id: user._id, walletAmount: user.walletAmount },
    });
  } catch (error) {
    console.error("Error starting the task:", error);
    res.status(500).json({ message: "Error starting the task" });
  }
});

// Route to claim the task reward
router.put("/task/:id/claim", authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    // Find the task and user
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the task is already completed
    const taskCompletionStatus = user.completedTasks.find(
      (taskStatus) => taskStatus.taskId.toString() === taskId
    );

    if (taskCompletionStatus && taskCompletionStatus.status === "complete") {
      return res.status(400).json({ message: "Task already completed." });
    }

    // Ensure the task is in "claim" state before claiming
    if (taskCompletionStatus && taskCompletionStatus.status !== "claim") {
      return res
        .status(400)
        .json({ message: "Task must be in 'Claim' state before claiming." });
    }

    // Add task completion to the completedTasks array
    if (!taskCompletionStatus) {
      user.completedTasks.push({ taskId, status: "complete" });
    } else {
      taskCompletionStatus.status = "complete";
    }

    // Award points to the user
    user.walletAmount += task.points;
    await user.save();

    // Mark task as complete
    task.taskCompletion = "complete";
    await task.save();

    res.status(200).json({
      message: `Task claimed! You earned ${task.points} BP.`,
      task,
      user: { id: user._id, walletAmount: user.walletAmount },
    });
  } catch (error) {
    console.error("Error claiming the task:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Route to update task open count (used for opening tasks from external links)
router.put("/task/:id/open", authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    // Find the task and user
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    task.opensCount += 1;
    await task.save();

    if (task.opensCount === 2 && task.taskCompletion !== "complete") {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found." });

      user.walletAmount += task.points;
      await user.save();

      task.taskCompletion = "complete";
      await task.save();

      return res.status(200).json({
        message: `Task completed! You earned ${task.points} BP.`,
        task,
        user: { id: user._id, walletAmount: user.walletAmount },
      });
    }

    res
      .status(200)
      .json({ message: `Task opened ${task.opensCount} time(s).`, task });
  } catch (error) {
    console.error("Error opening task:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Route to delete a task (admin only)
router.delete(
  "/task/:id",
  authenticateToken,
  checkAdminRole,
  async (req, res) => {
    try {
      const taskId = req.params.id;

      // Find the task by its ID and delete it
      const result = await Task.deleteOne({ _id: taskId });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Task not found." });
      }

      res.status(200).json({ message: "Task deleted successfully." });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Error deleting task." });
    }
  }
);

module.exports = router;
