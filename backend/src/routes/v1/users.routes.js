import { Router } from "express";
import { users } from "../../fakeDB/fakeUser.js";

export const router = Router();

// Read user
router.get("/", (req, res) => {
  try {
    res.json(users);
  } catch (err) {
    next(err);
  }
  
});

// Create user
router.post("/users", (req, res) => {
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
router.put("/users/:id", (req, res) => {
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
router.delete("/users/:id", (req, res) => {
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