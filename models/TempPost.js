const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const TempPostSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true,
    trim: true
  },
  grammarrule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GrammarRule",
    required: true
  },
  grammartip: {
    type: String,
    required: true,
    trim: true
  },
  vocabtip: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  created_At: {
    type: Date,
    default: Date.now()
  }
});

TempPostSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("TempPost", TempPostSchema);
