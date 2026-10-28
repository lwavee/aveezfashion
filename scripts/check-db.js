const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Helper to load environment variables from .env.local / .env / .env.production
function loadEnv() {
  const envFiles = ['.env.local', '.env', '.env.production'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        content.split(/\r?\n/).forEach((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) return;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
            if (key && !(key in process.env)) {
              process.env[key] = val;
            }
          }
        });
      } catch (err) {
        // Continue if reading fails
      }
    }
  }
}

// Mask username and password in connection string for clean and secure terminal printing
function maskMongoUri(uri) {
  try {
    return uri.replace(/\/\/(.*?)@/, (match, userPass) => {
      const [user] = userPass.split(':');
      return `//${user}:****@`;
    });
  } catch {
    return '***';
  }
}

async function checkMongoDBConnection() {
  loadEnv();

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aveez_fashion';
  const isDefaultLocal = !process.env.MONGODB_URI;

  console.log('\n==================================================');
  console.log('       🔍 MONGODB CONNECTION HEALTH CHECK        ');
  console.log('==================================================\n');

  console.log(`📌 Target URI : ${maskMongoUri(uri)} ${isDefaultLocal ? '(default fallback)' : '(from env)'}`);
  console.log('⏳ Connecting to MongoDB (timeout: 5000ms)...');

  const startTime = Date.now();

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    });

    const duration = Date.now() - startTime;
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error('Database instance is undefined after connecting.');
    }

    // Ping test
    const pingResult = await db.command({ ping: 1 });

    console.log(`\n✅ Status      : CONNECTED SUCCESSFULLY! (${duration}ms)`);
    console.log(`🗄️  Database    : ${mongoose.connection.name}`);
    console.log(`🌐 Host        : ${mongoose.connection.host}`);
    console.log(`🔌 Port        : ${mongoose.connection.port || 'Default / SRV'}`);
    console.log(`📶 Ping Status : ${pingResult.ok === 1 ? 'OK (1)' : JSON.stringify(pingResult)}`);

    // List collections and document counts
    const collections = await db.listCollections().toArray();
    console.log(`\n📁 Collections in database: (${collections.length} found)`);

    if (collections.length > 0) {
      console.log('--------------------------------------------------');
      for (const col of collections) {
        try {
          const count = await db.collection(col.name).countDocuments();
          console.log(` • ${col.name.padEnd(22)} : ${count} documents`);
        } catch {
          console.log(` • ${col.name.padEnd(22)} : (count unavailable)`);
        }
      }
      console.log('--------------------------------------------------');
    } else {
      console.log('ℹ️  No collections found in this database yet.');
    }

    console.log('\n🎉 MongoDB is fully operational and ready for use!\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`\n❌ Connection FAILED after ${duration}ms\n`);
    console.error(`Error: ${error.message || error}\n`);

    console.log('🔧 Diagnostic & Troubleshooting Advice:');
    if (error.name === 'MongooseServerSelectionError') {
      console.log(' 1. If using MongoDB Atlas:');
      console.log('    - Check Atlas "Network Access" IP Whitelist (add your current IP address or 0.0.0.0/0).');
      console.log('    - Confirm that database username and password in MONGODB_URI are correct.');
      console.log(' 2. If using local MongoDB:');
      console.log('    - Ensure your local mongod service is running (`net start MongoDB` or `mongod`).');
      console.log('    - Verify port 27017 is open and listening.');
    } else if (error.message && error.message.includes('Authentication failed')) {
      console.log(' 1. Authentication failed: check your database username, password, and authSource in MONGODB_URI.');
    } else {
      console.log(' 1. Check your connection string in .env.local (MONGODB_URI).');
      console.log(' 2. Ensure your firewall or network allows outgoing connections to MongoDB port (27017).');
    }
    console.log('==================================================\n');

    try {
      await mongoose.disconnect();
    } catch {
      // Ignore disconnect error
    }

    process.exit(1);
  }
}

checkMongoDBConnection();
