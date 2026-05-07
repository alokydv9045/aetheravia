import mongoose from 'mongoose';
import dns from 'dns';
import env from './env';

if (typeof dns.setServers === 'function') {
  try {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
  } catch (e) {
    console.error('[db] Failed to set DNS servers:', e);
  }
}

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
  if (connection.isConnected === 1) {
    return;
  }
  
  if (mongoose.connection.readyState === 1) {
    connection.isConnected = 1;
    return;
  }

  try {
    connectionAttempt += 1;
    const uri = env.MONGODB_URI?.trim();
    if (!uri) {
      log('❌ MONGODB_URI is empty or undefined!');
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    log(`Connecting (attempt ${connectionAttempt}) to cluster...`);

    const options = {
      serverSelectionTimeoutMS: 30000, 
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      retryReads: true,
      w: 'majority' as const,
      bufferCommands: true,
      autoIndex: true,
    } as const;

    // Set global mongoose options to avoid the 10s buffering timeout
    mongoose.set('bufferTimeoutMS', 30000);

    // Use a global cached promise to handle concurrent requests during cold starts
    if (!(global as any)._mongooseConnectionPromise) {
      log('Creating new Mongoose connection promise...');
      (global as any)._mongooseConnectionPromise = mongoose.connect(uri, options);
    } else {
      log('Reusing existing Mongoose connection promise...');
    }

    try {
      await (global as any)._mongooseConnectionPromise;
    } catch (e) {
      // Clear the promise so the next request can try again
      (global as any)._mongooseConnectionPromise = null;
      throw e;
    }

    connection.isConnected = mongoose.connection.readyState;
    log(`Connected! (state=${mongoose.connection.readyState})`);

    // Add listeners only once to avoid memory leaks and duplicate logs
    if (mongoose.connection.listeners('connected').length === 0) {
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
    }
  } catch (error: any) {
    connection.isConnected = 0;
    // Clear the promise in development so the next request can try again
    if (process.env.NODE_ENV === 'development') {
      (global as any)._mongooseConnectionPromise = null;
    }
    
    console.error('MongoDB connection failed:', error);
    if (error.message?.includes('IP')) {
      console.error('❌ IP Whitelist Issue: Add your current IP to MongoDB Atlas Network Access');
    }
    if (error.message?.includes('authentication')) {
      console.error('❌ Authentication Issue: Check your credentials');
    }
    if (error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
      console.error('❌ DNS Issue: Check your internet connectivity');
    }
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

export default dbConnect;
