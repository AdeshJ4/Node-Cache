const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter Name"],
    },
    photo: {
      type: String,
      required: [true, "Please Upload photo"],
    },
    price: {
      type: Number,
      required: [true, "Please Enter Price"],
    },
    stock: {
      type: Number,
      required: [true, "Please Enter Stock"],
    },
    category: {
      type: String,
      required: [true, "Please Enter category"],
      trim: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
