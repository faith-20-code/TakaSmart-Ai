const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../config/prisma');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
  });

const sendTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const registerSchema = z.object({
  phoneNumber: z.string().regex(/^\+2547\d{8}$/, 'Use format +254701234567'),
  name: z.string().min(2),
  password: z.string().min(6),
  userType: z.enum(['SELLER', 'BUYER']),
  sellerType: z.enum(['HOUSEHOLD', 'WASTE_PICKER', 'BUSINESS']).optional(),
  companyName: z.string().optional(),
  nemaLicense: z.string().optional(),
  materialsAccepted: z.array(
    z.enum(['PLASTIC','METAL','GLASS','ELECTRONICS','PAPER','TEXTILE','RUBBER','OTHER'])
  ).optional(),
  coverageRadiusKm: z.number().optional(),
});

const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        phoneNumber: data.phoneNumber,
        name: data.name,
        userType: data.userType,
        passwordHash,
        ...(data.userType === 'SELLER' && {
          sellerProfile: { 
            create: { sellerType: data.sellerType || 'HOUSEHOLD' } 
          },
        }),
        ...(data.userType === 'BUYER' && {
          buyerProfile: {
            create: {
              companyName: data.companyName || '',
              nemaLicense: data.nemaLicense,
              materialsAccepted: data.materialsAccepted || [],
              coverageRadiusKm: data.coverageRadiusKm || 20,
            },
          },
        }),
      },
      select: { 
        id: true, 
        name: true, 
        phoneNumber: true, 
        userType: true 
      },
    });

    const token = signToken(user.id);
    sendTokenCookie(res, token);
    res.status(201).json({ message: 'Registration successful', user, token });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { phoneNumber, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      include: { sellerProfile: true, buyerProfile: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Incorrect phone number or password.' });
    }

    const token = signToken(user.id);
    sendTokenCookie(res, token);

    const { passwordHash, ...safe } = user;
    res.json({ message: 'Login successful', user: safe, token });
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, 
        name: true, 
        phoneNumber: true, 
        userType: true,
        verified: true, 
        sellerProfile: true, 
        buyerProfile: true,
      },
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};


const createAdmin = async (req, res, next) => {
  try {
    // Only a SUPER_ADMIN can create other admins
    if (req.user.adminLevel !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only a super admin can create new admin accounts.' });
    }

    const { phoneNumber, name, password, adminLevel } = req.body;

    if (!phoneNumber || !name || !password) {
      return res.status(400).json({ error: 'Phone number, name, and password are required.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newAdmin = await prisma.user.create({
      data: {
        phoneNumber,
        name,
        userType: 'ADMIN',
        adminLevel: adminLevel || 'MODERATOR', // defaults to the lower tier
        passwordHash,
        verified: true,
      },
      select: { id: true, name: true, phoneNumber: true, userType: true, adminLevel: true },
    });

    res.status(201).json({ message: 'Admin created successfully', user: newAdmin });
  } catch (err) {
    next(err);
  }
};


module.exports = { register, login, logout, getMe, createAdmin };