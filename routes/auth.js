const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  try {
    const result = await db.query(
      "INSERT INTO users(email,password) VALUES($1,$2) RETURNING id,email",
      [email, hashed],
    );

    res.json(result.rows[0]);
  } catch(error) {
    console.error(error);
    res.status(400).json({ error: "User already exists" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await db.query("SELECT * FROM users WHERE email=$1", [email]);

  const user = result.rows[0];

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token });
});

module.exports = router;
