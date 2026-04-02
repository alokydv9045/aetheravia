import mongoose from 'mongoose';

export type User = {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  avatar?: string;
  savedAddresses?: Array<{
    _id: string;
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country?: string;
    phone?: string;
  }>;
  savedCoupons?: string[];

  loyaltyPoints?: number;
  loyaltyTier?: string;
  loyaltyHistory?: Array<{
    _id?: string;
    type: 'earn' | 'redeem';
    points: number;
    description?: string;
    date?: Date;
    orderId?: string;
  }>;

  referralCode?: string;
  referredBy?: string;
  referralCredits?: number;
  referralHistory?: Array<{
    _id?: string;
    referredUserId: string;
    referredUserEmail?: string;
    reward: number;
    date?: Date;
    orderId?: string;
  }>;
  personalization?: {
    segments?: string[];
    scores?: Record<string, number>;
    tags?: string[];
    lastUpdated?: Date;
    history?: Array<{
      _id?: string;
      date: Date;
      change: string;
      segments?: string[];
      tags?: string[];
    }>;
  };
};

const SavedAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String },
    phone: { type: String },
  },
  { _id: true, timestamps: true },
);

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
  },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String },
    referralCredits: { type: Number, default: 0 },
    referralHistory: {
      type: [
        {
          referredUserId: { type: String, required: true },
          referredUserEmail: { type: String },
          reward: { type: Number, required: true },
          date: { type: Date, default: Date.now },
          orderId: { type: String },
        },
      ],
      default: [],
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: { type: Boolean, required: true, default: false },
    avatar: { type: String },
    savedAddresses: { type: [SavedAddressSchema], default: [] },
    savedCoupons: { type: [String], default: [] },
    loyaltyPoints: { type: Number, default: 0 },
    loyaltyHistory: {
      type: [
        {
          type: {
            type: String,
            enum: ['earn', 'redeem', 'adjust'],
            required: true,
          },
          points: { type: Number, required: true },
          description: { type: String },
          date: { type: Date, default: Date.now },
          orderId: { type: String },
        },
      ],
      default: [],
    },
    loyaltyTier: { type: String, default: 'Bronze' },
    personalization: {
      type: {
        segments: { type: [String], default: [] },
        scores: { type: Object, default: {} },
        tags: { type: [String], default: [] },
        lastUpdated: { type: Date },
        history: {
          type: [
            {
              date: { type: Date, default: Date.now },
              change: { type: String },
              segments: { type: [String] },
              tags: { type: [String] },
            },
          ],
          default: [],
        },
      },
      default: {},
    },
  },
  { timestamps: true },
);

const UserModel = mongoose.models?.User || mongoose.model('User', UserSchema);

// Helpful compound index for loyalty queries
try {
  UserSchema.index({ loyaltyTier: 1, loyaltyPoints: -1 });
} catch {}

export default UserModel;
