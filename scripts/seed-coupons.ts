import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { Coupon } from '../src/server/models/Coupon';

// Load .env.local
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

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aveez_fashion';

async function seedCoupons() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);

  const initialCoupons = [
    {
      code: 'AVEEZ10',
      description: '10% off your entire order — Welcome to Aveez Fashion',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minimumOrderValue: 0,
      validFrom: new Date('2026-01-01'),
      validUntil: new Date('2028-12-31'),
      isActive: true,
      usageCount: 0,
    },
    {
      code: 'FIRST500',
      description: '₹500 flat discount on orders above ₹2,999',
      discountType: 'FLAT_AMOUNT',
      discountValue: 500,
      minimumOrderValue: 2999,
      validFrom: new Date('2026-01-01'),
      validUntil: new Date('2028-12-31'),
      isActive: true,
      usageCount: 0,
    },
  ];

  for (const c of initialCoupons) {
    const existing = await Coupon.findOne({ code: c.code });
    if (!existing) {
      await Coupon.create(c);
      console.log(`+ Created coupon: ${c.code}`);
    } else {
      console.log(`= Coupon already exists: ${c.code}`);
    }
  }

  console.log('Coupons sync complete. Total coupons:', await Coupon.countDocuments());
  await mongoose.disconnect();
}

seedCoupons().catch((err) => {
  console.error('Error seeding coupons:', err);
  process.exit(1);
});
