const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");
const redis = require("../redis");
const { SendMessageCommand } = require("@aws-sdk/client-sqs");
const sqs = require("../sqs");

router.get("/", auth, async (req, res) => {
  const userId = req.user.userId;

  const cacheKey = `tasks:${userId}`;

  // 1️⃣ Check cache
  const cached = await redis.get(cacheKey);

  if (cached) {
    console.log("CACHE HIT");
    return res.json(cached);
  }

  console.log("CACHE MISS");

  // 2️⃣ Fetch from DB
  const result = await db.query(
    "SELECT * FROM tasks WHERE user_id=$1 ORDER BY id DESC",
    [userId],
  );

  const tasks = result.rows;

  // 3️⃣ Store in cache
  await redis.set(cacheKey, tasks, { ex: 60 }); // 60 sec TTL

  res.json(tasks);
});

router.post("/", auth, async (req, res) => {
  const { title } = req.body;

  const result = await db.query(
    "INSERT INTO tasks(title,user_id) VALUES($1,$2) RETURNING *",
    [title, req.user.userId],
  );

  // send message to queue
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: process.env.SQS_URL,
      MessageBody: JSON.stringify({
        type: "TASK_CREATED",
        userId: req.user.userId,
        taskId: result.rows[0].id,
        title,
      }),
    }),
  );

  res.json(result.rows[0]);
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
