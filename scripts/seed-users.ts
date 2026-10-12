import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/server/models/User';

// Automatically load .env.local if running standalone outside Next.js
if (!process.env.MONGODB_URI) {
  const envLocalPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envLocalPath)) {
    const lines = fs.readFileSync(envLocalPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...rest] = trimmed.split('=');
        if (key && rest.length > 0) {
          process.env[key.trim()] = rest.join('=').trim();
        }
      }
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aveez_fashion';

interface InitialAccount {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  initialPassword: string;
  role: 'CUSTOMER' | 'ADMIN';
  mustChangePassword: boolean;
}

const accountsToSeed: InitialAccount[] = [
  {
    firstName: 'Vishna',
    lastName: 'Panchal',
    email: 'vishu@gmail.com',
    phone: '8955109628',
    initialPassword: 'vishu123',
    role: 'CUSTOMER',
    mustChangePassword: false,
  },
  {
    firstName: 'Sarla',
    lastName: 'Admin',
    email: 'sarla@aveezfashion.com',
    phone: '7014400000',
    initialPassword: 'Sarla@70144',
    role: 'ADMIN',
    mustChangePassword: false,
  },
];

async function seedUsers() {
  console.log('Connecting to MongoDB for account initialization...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB successfully.');

  // Ensure unique indexes are built
  await User.createIndexes();

  for (const account of accountsToSeed) {
    const normalizedEmail = account.email.trim().toLowerCase();
    const normalizedPhone = account.phone.replace(/\D/g, '').slice(-10);

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    });

    if (existingUser) {
      console.log(
        `[IDEMPOTENT CHECK] Account '${normalizedEmail}' already exists (ID: ${existingUser._id}, Role: ${existingUser.role}).`
      );

      // Verify if password needs synchronization safely
      const matchesPassword = await bcrypt.compare(account.initialPassword, existingUser.passwordHash);
      if (!matchesPassword) {
        const updatedHash = await bcrypt.hash(account.initialPassword, 12);
        existingUser.passwordHash = updatedHash;
        existingUser.role = account.role;
        existingUser.firstName = account.firstName;
        existingUser.lastName = account.lastName;
        existingUser.phone = normalizedPhone;
        await existingUser.save();
        console.log(`[UPDATE] Account '${normalizedEmail}' updated with latest secure password hash and role.`);
      } else {
        console.log(`[OK] Account '${normalizedEmail}' credentials and role are already in sync.`);
      }
    } else {
      const passwordHash = await bcrypt.hash(account.initialPassword, 12);

      const created = await User.create({
        firstName: account.firstName,
        lastName: account.lastName,
        email: normalizedEmail,
        phone: normalizedPhone,
        passwordHash,
        role: account.role,
        tokenVersion: 0,
        failedLoginAttempts: 0,
        mustChangePassword: account.mustChangePassword,
      });

      console.log(
        `[CREATED] Initial account successfully provisioned: ${created.email} | Role: ${created.role} | ID: ${created._id}`
      );
    }
  }

  console.log('All initial accounts have been safely initialized without printing plaintext passwords.');
  await mongoose.disconnect();
}

seedUsers().catch((err) => {
  console.error('Account seeding error:', err);
  process.exit(1);
});
