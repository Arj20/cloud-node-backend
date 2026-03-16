const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const result = await db.query(
    "INSERT INTO users(email,password) VALUES($1,$2) RETURNING id,email",
    [email, hashed],
  );

  res.json(result.rows[0]);
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await db.query("SELECT * FROM users WHERE email=$1", [email]);

  const user = result.rows[0];

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ userId: user.id }, "secret", { expiresIn: "1h" });

  res.json({ token });
});
