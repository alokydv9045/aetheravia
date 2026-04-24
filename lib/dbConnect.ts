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
      log('❌ MONGODB_URI is empty or undefined!');
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    const redacted = uri.replace(/(mongodb\+srv:\/\/)([^:@]+)(:[^@]+)?@/, (_, p, user) => `${p}${user}:***@`);
    log(`Connecting (attempt ${connectionAttempt}) to cluster...`);

    const options = {
      serverSelectionTimeoutMS: 15000, 
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
      authSource: 'admin',
    } as const;

    if (process.env.NODE_ENV === 'development') {
      if (!(global as any)._mongooseConnectionPromise) {
        log('Creating new Mongoose connection promise...');
        (global as any)._mongooseConnectionPromise = mongoose.connect(uri, options);
      } else {
        log('Reusing existing Mongoose connection promise...');
      }
      await (global as any)._mongooseConnectionPromise;
      connection.isConnected = mongoose.connection.readyState;
    } else {
      await mongoose.connect(uri, options);
      connection.isConnected = mongoose.connection.readyState;
    }
    log(`Connected! (state=${mongoose.connection.readyState})`);
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
