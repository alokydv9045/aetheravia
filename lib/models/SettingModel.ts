import mongoose from 'mongoose';

export type Setting = {
  key: string;
  value: any;
  description?: string;
};

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

const SettingModel =
  mongoose.models.Setting || mongoose.model('Setting', settingSchema);

export default SettingModel;
