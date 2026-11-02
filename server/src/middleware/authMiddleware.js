import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/db.js';

export async function requireAuth(req, res, next) {
  try {
    // 1. Read token from HTTP-only cookie or Authorization header
    let token = req.cookies?.farmdirect_token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to continue.'
      });
    }

    // 2. Verify JWT signature
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token. Please log in again.'
      });
    }

    // 3. Retrieve user from MySQL database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        consumerProfile: true,
        farmerProfile: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.'
      });
    }

    // 4. Strip sensitive passwordHash before attaching to request
    const { passwordHash: _, ...safeUser } = user;
    req.user = safeUser;

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Attaches authenticated user if valid token/cookie is present,
 * but allows unauthenticated access to continue.
 */
export async function optionalAuth(req, res, next) {
  try {
    let token = req.cookies?.farmdirect_token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch {
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        consumerProfile: true,
        farmerProfile: true
      }
    });

    if (user) {
      const { passwordHash: _, ...safeUser } = user;
      req.user = safeUser;
    }

    next();
  } catch {
    next();
  }
}

