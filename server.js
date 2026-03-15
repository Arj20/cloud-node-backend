const express = require("express");
const cors = require("cors");

const tasksRoutes = require("./routes/tasks");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/tasks", tasksRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
