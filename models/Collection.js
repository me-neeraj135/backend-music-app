/** @format */

let mongoose = require(`mongoose`);
let Schema = mongoose.Schema;
let collectionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true },
    description: { type: String, required: true, trim: true },
    plan: { type: String, required: true, trim: true },
    audio: { type: String, required: true },
    avatar: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model(`Collection`, collectionSchema);
