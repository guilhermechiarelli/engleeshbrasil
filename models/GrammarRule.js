const mongoose = require("mongoose");

const GrammarRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    trim: true
  },
  created_At: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model("GrammarRule", GrammarRuleSchema);
