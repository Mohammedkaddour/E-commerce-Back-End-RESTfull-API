let mongoose = require("mongoose");

let productSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  model:{
    type:Number,
    required: true
  },
  condition: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: "N/A",
    required: false
  },
  price: {
    type: Number,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now()
  },
  productImage: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  shipment: {
    type: Boolean,
    default: false,
    required: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  }
});

module.exports = mongoose.model("Product", productSchema);
