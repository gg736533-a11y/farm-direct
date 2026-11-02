import { prisma } from '../config/db.js';

/**
 * GET /api/users/me
 */
export async function getProfile(req, res) {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
}

/**
 * PATCH /api/users/me
 * Update basic personal info. System fields (id, email, role, passwordHash, verified) cannot be updated.
 */
export async function updateProfile(req, res, next) {
  try {
    const { name, phone, location, farmName, description, about, farmAcreage, acreage } = req.body;
    const userId = req.user.id;
    const resolvedDesc = description !== undefined ? description : about;
    const rawAcreage = farmAcreage !== undefined ? farmAcreage : acreage;
    const resolvedAcreage = rawAcreage !== undefined
      ? (rawAcreage !== null && rawAcreage !== '' ? Number(rawAcreage) : null)
      : undefined;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
        ...(req.user.role === 'CONSUMER' && location !== undefined && {
          consumerProfile: {
            upsert: {
              create: { location: location.trim() },
              update: { location: location.trim() }
            }
          }
        }),
        ...(req.user.role === 'FARMER' && {
          farmerProfile: {
            update: {
              ...(location !== undefined && { location: location.trim() }),
              ...(farmName !== undefined && { farmName: farmName.trim() }),
              ...(resolvedDesc !== undefined && { description: resolvedDesc.trim() }),
              ...(resolvedAcreage !== undefined && { farmAcreage: resolvedAcreage })
            }
          }
        })
      },
      include: {
        consumerProfile: true,
        farmerProfile: true
      }
    });

    const { passwordHash: _, ...safeUser } = updatedUser;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: safeUser
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/consumers/me
 * Protected for authenticated consumers
 */
export async function getConsumerMe(req, res, next) {
  try {
    const profile = await prisma.consumerProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        favorites: {
          include: {
            product: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        consumer: profile
      }
    });
  } catch (error) {
    next(error);
  }
}
