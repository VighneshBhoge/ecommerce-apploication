import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  me,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", requireAuth, me);
router.put("/profile", requireAuth, updateProfile);
router.put("/password", requireAuth, changePassword);

export default router;
