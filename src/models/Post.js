import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    category: {
      type: String,
    },
    date: {
      type: String,
    },
    author: {
      type: String,
      default: "Auto Expert",
    },
    image: {
      type: String,
      required: [true, "Please provide an image URL for this post."],
    },
    blurb: {
      type: String,
    },
    prompt: {
      type: String,
      required: [true, "Please provide the AI prompt for this post."],
    },
    articleIndex: {
      type: Number,
      default: 0,
    },
    content: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Format _id to id when converting to JSON
PostSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
