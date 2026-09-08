import { Router } from "express";
import { supabase } from "../../config/supabase.js";

export const router = Router();

const PG_SELECT = "id, username, email, role, created_at, updated_at";

// Read user
router.get("/pg", async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select(PG_SELECT);

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// Create user
router.post("/pg", async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "username, email and password are required!" });
    }

    const { data, error } = await supabase
    .from("users")
    .insert([{ username, email, password, role }])
    .select(PG_SELECT);

    if (error) throw error;

    return res.status(201).json({ success: true, data: data[0] });
  } catch (err) {
    next(err);
  }
});

// Update user
router.put("/pg/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

    const { data, error } = await supabase
      .from("users")
      .update({ username, email, password, role, updated_at: new Date() })
      .eq("id", id)
      .select(PG_SELECT);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ success: true, data: data[0] });
  } catch (err) {
    next(err);
  }
});

// Delete user
router.delete("/pg/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .select(PG_SELECT);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
});
