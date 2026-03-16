const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM tasks WHERE user_id=$1 ORDER BY id DESC",
      [req.user.userId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { title } = req.body;

    const result = await db.query(
      "INSERT INTO tasks(title,user_id) VALUES($1,$2) RETURNING *",
      [title, req.user.userId],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM tasks WHERE id=$1 AND user_id=$2", [
      id,
      req.user.userId,
    ]);

    res.json({ message: "Task deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

module.exports = router;
