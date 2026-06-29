import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

const isProd = process.env.NODE_ENV === 'production';

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: isProd,
  path: '/'
};

function sign(userId) {
  return jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({
        code: "AUTH_REGISTER_FIELDS_REQUIRED",
        message: "Email and password are required.",
      });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({
        code: "AUTH_EMAIL_ALREADY_REGISTERED",
        message: "Email already registered.",
      });
    }

    const hash = await bcrypt.hash(password, 11);
    const user = await prisma.user.create({ data: { email, passwordHash: hash } });

    res.cookie('sid', sign(user.id), COOKIE_OPTS);
    
    return res.status(201).json({ id: user.id, email: user.email, createdAt: user.createdAt });
  } catch (e) {
    console.error("Register error:", err);

    return res.status(500).json({
      code: "AUTH_REGISTER_FAILED",
      message: "Failed to register account.",
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({
        code: "AUTH_LOGIN_FIELDS_REQUIRED",
        message: "Email and password are required.",
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        code: "AUTH_INVALID_CREDENTIALS",
        message: "Invalid email or password.",
      });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({
        code: "AUTH_INVALID_CREDENTIALS",
        message: "Invalid email or password.",
      });
    }

    res.cookie('sid', sign(user.id), COOKIE_OPTS);

    return res.json({ id: user.id, email: user.email, createdAt: user.createdAt });
  } catch (e) {
    console.error("Login error:", err);

    return res.status(500).json({
      code: "AUTH_LOGIN_FAILED",
      message: "Failed to log in.",
    });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('sid', COOKIE_OPTS);
  
  return res.json({ ok: true });
});

router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, createdAt: true }
    });

    if (!user) {
      return res.status(404).json({
        code: "AUTH_USER_NOT_FOUND",
        message: "User not found.",
      });
    }

    return res.json(user);
  } catch (e) {
    console.error("Profile error:", err);

    return res.status(500).json({
      code: "AUTH_PROFILE_FAILED",
      message: "Failed to load profile.",
    });
  }
});

export default router;