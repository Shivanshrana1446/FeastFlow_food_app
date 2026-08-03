/**
 * One-time bootstrap for the first admin account.
 *
 * The public /auth/register endpoint deliberately refuses to create admin
 * accounts (see validations/auth.validation.js), so a fresh deployment has
 * no admin user at all until one is seeded here.
 *
 * Usage:
 *   ADMIN_NAME="Site Admin" ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=... node scripts/seedAdmin.js
 *   docker compose exec backend node scripts/seedAdmin.js
 */
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../src/config/db');
const logger = require('../src/config/logger');
const { ROLES } = require('../src/constants/roles');
const User = require('../src/models/user.model');

async function seedAdmin() {
  const name = process.env.ADMIN_NAME || 'Admin';
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    logger.error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required to seed an admin.');
    process.exitCode = 1;
    return;
  }
  if (password.length < 8) {
    logger.error('ADMIN_PASSWORD must be at least 8 characters.');
    process.exitCode = 1;
    return;
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    if (existing.role !== ROLES.ADMIN) {
      existing.role = ROLES.ADMIN;
      await existing.save();
      logger.info(`Promoted existing user ${email} to admin.`);
    } else {
      logger.info(`Admin ${email} already exists — nothing to do.`);
    }
  } else {
    await User.create({ name, email, password, role: ROLES.ADMIN, isEmailVerified: true });
    logger.info(`Created admin user ${email}.`);
  }

  await disconnectDB();
}

seedAdmin()
  .catch((error) => {
    logger.error(`Failed to seed admin: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => {
    if (mongoose.connection.readyState !== 0) {
      mongoose.disconnect();
    }
  });
