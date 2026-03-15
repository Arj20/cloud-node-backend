const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM tasks ORDER BY id DESC");
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  const { title } = req.body;

  const result = await db.query(
    "INSERT INTO tasks(title) VALUES($1) RETURNING *",
    [title],
  );

  res.json(result.rows[0]);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  await db.query("DELETE FROM tasks WHERE id=$1", [id]);

  res.json({ message: "Task deleted" });
});

module.exports = router;
