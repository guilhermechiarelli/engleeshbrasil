const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    trim: true,
    required: true
  },
  created_At: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model("Category", CategorySchema);
