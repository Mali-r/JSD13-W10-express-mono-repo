import { Router } from "express";
import { router as usersRoutes } from "./users.routes.js";
import { router as usersSupabaseRoutes } from "./users.supabase.routes.js";
import { router as usersLogin } from "./users.routes.js";

export const router = Router();

router.use("/users",usersRoutes);
router.use("/users",usersSupabaseRoutes);
router.use("/users",usersLogin);
