import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';

/**
 * Signs JWT token and attaches HTTP-only cookie to response
 */
function setAuthCookie(res, user) {
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  res.cookie('farmdirect_token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return token;
}

/**
 * POST /api/auth/register
 */
export async function register(req, res, next) {
  try {
    const {
      role,
      name,
      email,
      password,
      phone,
      location,
      farmName,
      farmLocation,
      farmDescription,
      farmAcreage
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check unique email constraint
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please log in.'
      });
    }

    // 2. Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Create User and corresponding Role Profile
    let newUser;

    if (role === 'FARMER') {
      const parsedAcreage = farmAcreage !== undefined && farmAcreage !== null && farmAcreage !== ''
        ? Number(farmAcreage)
        : null;

      newUser = await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          phone: phone?.trim() || null,
          role: 'FARMER',
          farmerProfile: {
            create: {
              farmName: farmName.trim(),
              location: farmLocation?.trim() || location?.trim() || 'Salem, Tamil Nadu',
              description: farmDescription?.trim() || null,
              farmAcreage: parsedAcreage,
              verified: false, // Newly registered farmers are NOT automatically verified
              verificationStatus: 'PENDING'
            }
          }
        },
        include: {
          farmerProfile: true
        }
      });
    } else {
      newUser = await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          phone: phone?.trim() || null,
          role: 'CONSUMER',
          consumerProfile: {
            create: {
              location: location?.trim() || null
            }
          }
        },
        include: {
          consumerProfile: true
        }
      });
    }

    // 4. Issue JWT in HTTP-only cookie
    setAuthCookie(res, newUser);

    // 5. Return safe user data
    const { passwordHash: _, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user: safeUser
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        farmerProfile: true,
        consumerProfile: true
      }
    });

    // 2. Generic authentication failure error (do not leak whether email exists)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 3. Securely compare password hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 4. Issue JWT in HTTP-only cookie
    setAuthCookie(res, user);

    // 5. Return safe user info
    const { passwordHash: _, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: safeUser
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout(req, res) {
  res.clearCookie('farmdirect_token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
}

/**
 * GET /api/auth/me
 */
export async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
}
