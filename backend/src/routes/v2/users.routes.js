import { Router } from "express";
import { User } from "../../models/user.model.js";

export const router = Router();

// Read user
router.get("/", async (req, res) => {
  try {
    // 1. Get users data from database
    const users = await User.find(); 
    // 2. Send response object back to client
    return res.json(users)
  } catch (err) {
    next(err);
  }
});

// Create user
router.post("/", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "username, email and password are required!" });
    }

    const newUser = await User.create({ username, email, password });

    const { password: _password, ...userWithoutPassword } = newUser.toObject(); // MongoDB Doc to JS, _password <- เป้น syntax ของ mongoDB

    return res.status(201).json(userWithoutPassword);
  } catch (err) {
    next(err);
  }
});

// Update user
router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email, password },
      { new: true, runValidators: true } // new: true -> คืนค่า document หลังอัปเดต, runValidators -> เช็ค schema validation ด้วย
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _password, ...userWithoutPassword } = updatedUser.toObject();

    return res.json(userWithoutPassword);
  } catch (err) {
    next(err);
  }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
});
