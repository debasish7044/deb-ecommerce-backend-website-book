const mongoose = require('mongoose')
const colors = require('colors')

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 32,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Category', categorySchema)
