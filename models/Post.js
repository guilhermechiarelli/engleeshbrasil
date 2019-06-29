const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const PostSchema = new mongoose.Schema({
  subject: {
    type: String,
    unique: true,
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
  approved_By: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  created_At: {
    type: Date,
    required: true
  },
  approved_At: {
    type: Date,
    default: Date.now()
  }
});

PostSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Post", PostSchema);
