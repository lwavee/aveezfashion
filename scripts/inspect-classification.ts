import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

const env = path.resolve('.env.local');
if (fs.existsSync(env)) {
  fs.readFileSync(env, 'utf8').split('\n').forEach((l) => {
    const [k, ...v] = l.trim().split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  console.log('Connected to DB');
  const collections = await mongoose.connection.db!.collection('collections').find({}).toArray();
  console.log('COLLECTIONS IN DB:', collections.length);
  collections.forEach((c) => {
    console.log(` - ID: ${c._id}, Title: "${c.title}", Slug: "${c.slug}", Products: ${c.products?.length || 0}`);
  });

  const categories = await mongoose.connection.db!.collection('categories').find({}).toArray();
  console.log('\nCATEGORIES IN DB:', categories.length);
  categories.forEach((c) => {
    console.log(` - ID: ${c._id}, Name: "${c.name}", Slug: "${c.slug}", Departments: ${JSON.stringify(c.departments || [])}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
