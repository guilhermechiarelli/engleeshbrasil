const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    lowercase: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  token: {
    type: String,
    required: true
  },
  createAt: {
    type: Date,
    default: Date.now,
    expires: 3600
  }
});

module.exports = mongoose.model("Tokens", TokenSchema);
