import mongoose from 'mongoose';
import env from './env';

interface Connection {
  isConnected?: number;
}

const connection: Connection = {};


// Optional extended debug controlled by env var (set MONGOOSE_DEBUG=true locally)
if (process.env.MONGOOSE_DEBUG === 'true') {
  mongoose.set('debug', true);
}
// Fail fast on unknown fields in queries (recommended in newer Mongoose)
mongoose.set('strictQuery', true);

let connectionAttempt = 0;

const log = (...args: any[]) => {
  if (process.env.MONGODB_LOG !== 'silent') {
    console.log('[db]', ...args);
  }
};

const dbConnect = async () => {
  if (connection.isConnected) {
    // Already connected
    return;
  }
  if (mongoose.connection.readyState >= 1) {
    connection.isConnected = mongoose.connection.readyState;
    return;
  }
  try {
    connectionAttempt += 1;
    const startTs = Date.now();
    const uri = env.MONGODB_URI?.trim();
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      throw new Error('Invalid MongoDB URI format');
    }
    const options = {
      serverSelectionTimeoutMS: 15000, // quicker feedback if cluster unreachable
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      heartbeatFrequencyMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      retryReads: true,
      w: 'majority' as const,
      bufferCommands: true,
      // NOTE: authSource only needed for SCRAM on non-SRV connection to specific DB
      // Keep if you intentionally authenticate against admin.
      authSource: 'admin',
    } as const;

    // Provide partially redacted URI for logs (avoid leaking credentials)
    const redacted = uri.replace(/(mongodb\+srv:\/\/)([^:@]+)(:[^@]+)?@/, (_, p, user) => `${p}${user}:***@`);
    log(`Connecting (attempt ${connectionAttempt}) to ${redacted}`);
    if (process.env.NODE_ENV === 'development') {
      if (!(global as any)._mongooseConnectionPromise) {
        (global as any)._mongooseConnectionPromise = mongoose.connect(uri, options);
      }
      await (global as any)._mongooseConnectionPromise;
      connection.isConnected = mongoose.connection.readyState;
    } else {
      await mongoose.connect(uri, options);
      connection.isConnected = mongoose.connection.readyState;
    }
    log(`Connected in ${Date.now() - startTs}ms (state=${mongoose.connection.readyState})`);
    mongoose.connection.on('connected', () => {
      connection.isConnected = 1;
      log('MongoDB connected (event)');
    });
    mongoose.connection.on('error', (err) => {
      connection.isConnected = 0;
      console.error('MongoDB connection error:', err);
    });
    mongoose.connection.on('disconnected', () => {
      connection.isConnected = 0;
      log('MongoDB disconnected');
    });
  } catch (error: any) {
    connection.isConnected = 0;
    console.error('MongoDB connection failed:', error);
    if (error.message?.includes('IP')) {
      console.error('❌ IP Whitelist Issue: Add your current IP to MongoDB Atlas Network Access');
    }
    if (error.message?.includes('authentication')) {
      console.error('❌ Authentication Issue: Check your MongoDB credentials in .env file');
    }
    if (error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
      console.error('❌ DNS Issue: Check your internet connectivity or DNS resolution for the cluster host');
    }
    if (error.message?.includes('server selection timeout')) {
      console.error('❌ Server Selection Timeout: Cluster may be paused, IP not whitelisted, or network blocked.');
    }
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

export default dbConnect;
