import { Router } from "express";
import { User } from "../../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const router = Router();

// async function hashPassword(rawpass) {
//     const hash = await bcrypt.hash(rawpass, 12)
//     console.log(`Hash : ${hash}`);
//     return hash;
// }

// Read user
router.get("/", async (req, res) => {
  try {
    // 1. Get users data from database
    const users = await User.find();
    // 2. Send response object back to client
    return res.json(users);
  } catch (err) {
    next(err);
  }
});

// Create user
router.post("/", async (req, res, next) => {
  try {
    const { username, role, email, password } = req.body;

    if (!username || !role || !email || !password) {
      return res
        .status(400)
        .json({ error: "username, email and password are required!" });
    }

    // const hpass = await hashPassword(password);
    const newUser = await User.create({ username, role, email, password });

    const { password: _password, ...userWithoutPassword } = newUser.toObject(); // MongoDB Doc to JS, _password <- เป้น syntax ของ mongoDB >> Ai ไม่ให้เอาออก

    return res.status(201).json(userWithoutPassword);
  } catch (err) {
    // if (err.code === 11000) {
    //   return res.status(409).json({ error: "Email นี้ถูกใช้งานแล้ว" });}
    next(err);
  }
});

// Update user
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email, password },
      { new: true, runValidators: true }, // new: true -> คืนค่า document หลังอัปเดต, runValidators -> เช็ค schema validation ด้วย
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _password, ...userWithoutPassword } =
      updatedUser.toObject();

    return res.json(userWithoutPassword);
  } catch (err) {
    next(err);
  }
});

// Delete user
router.delete("/:id", async (req, res, next) => {
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

// Login user
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ sucess: false, message: "Email amd Password are required!" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      returnres.status(400).json({ sucess: false, message: "User not found" });
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      res.status(400).json({ sucess: false, message: "Incorrect password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 1000,
    });

    return res
      .status(200)
      .json({ 
        sucess: true, 
        essage: "Login successful!", 
        user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
        }, 
    });
  } catch (err) {
    next(err);
  }
});
