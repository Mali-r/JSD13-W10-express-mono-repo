import express from "express";
import { users } from "./fakeDB/fakeUser.js";

const app = express();

app.use(express.json()); // ติดตั้ง Middleware สามารถเข้าใจ json ได้ ส่งข้อมูลเปน json ได้

// CRUD routes and endpoints

// Read user
app.get("/users", (req, res) => {
  try {
    res.json(users);
  } catch (err) {
    next(err);
  }
  
});

// Create user
app.post("/users", (req, res) => {
  try {
    const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "username, email and password are required!" });
  }

  const highestId = users.reduce(
    (max, user) => Math.max(max, Number(user.id)),
    0, // นับ total id
  );

  const nextId = String(highestId + 1); // เอา id ทั้งหมด + id ใหม่

  const newUser = {
    id: nextId,
    usernam: username,
    email: email,
    password: password,
  };

  users.push(newUser);

  return res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

// Update user
app.put("/users/:id", (req, res) => {
  try {
    const user = users.find((u) => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found!" });
  }

  const { username, email, password } = req.body; // Destucture เอาค่าไปเก้บที่ Key เเล้วตั้งชื่อตัวแปรใหม่

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "username, email and password are required!" });
  }

  user.username = username;
  user.email = email;
  user.password = password;

  return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

// Delete user
app.delete("/users/:id", (req, res) => {
  try {
    const index = users.findIndex((u) => u.id === req.params.id);

  if (!index) {
    return res.status(404).json({ error: "User not found!" });
  }

  const deletedUser = users.splice(index, 1);

  return res.status(200).json({ 
    message: "User deleted successfully!", 
    user: deletedUser[0]
  });
  } catch (err) {
    next(err);
  }
});

// Centralized Error Handling middleware
app.use((err, req, res, next) => {
  return res.status(500).json({
    error: "Something went wrong on the server...",
    message: err.message, 
  })
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT} ✈`);
});
