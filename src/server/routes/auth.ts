import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { authMiddleware } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { registerSchema, loginSchema, refreshSchema } from "../validators/auth.js";
import * as authService from "../services/auth.js";

const router = Router();

router.post("/register", authLimiter, validateBody(registerSchema), async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

router.post("/login", authLimiter, validateBody(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post("/refresh", authLimiter, validateBody(refreshSchema), async (req, res, next) => {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post("/logout", authLimiter, validateBody(refreshSchema), async (req, res, next) => {
  try {
    await authService.logout(req.body.refreshToken);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

export default router;
