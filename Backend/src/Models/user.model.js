const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  phone: {
    type: String,
    required: true,
    unique: true
  },

  address: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },

  role: {
    type: String,
    enum: ["admin", "farmer"],
    default: "farmer"
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  profileImage: {
    url: {
      type: String,
      default: null
    },
    imageId: {
      type: String,
      default: null
    }
  },

  // Farm Conditions
  state: { type: String },
  district: { type: String },
  village: { type: String },
  land_size_acres: { type: Number },
  soil_type: { type: String },
  irrigation_type: { 
    type: String, 
    enum: ["rainfed", "borewell", "canal"],
    default: "rainfed"
  },
  water_availability: { 
    type: String, 
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  previous_crop: { type: String },
  sowing_season: { type: String },
  latitude: { type: Number },
  longitude: { type: Number }

},
{
  timestamps: true
}
);

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;