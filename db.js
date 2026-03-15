const { Pool } = require("pg");

const pool = new Pool({
  user: "arihantjain",
  host: "localhost",
  database: "tasksdb",
  password: "",
  port: 5432
});

module.exports = pool;