import mongoose from 'mongoose';

const RegisterVerificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
    otp: {
      type: String,
      required: true,
    },
    otpExpiry: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically delete records after 15 minutes (900 seconds)
RegisterVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });

const RegisterVerificationModel =
  mongoose.models.RegisterVerification ||
  mongoose.model('RegisterVerification', RegisterVerificationSchema);

export default RegisterVerificationModel;
