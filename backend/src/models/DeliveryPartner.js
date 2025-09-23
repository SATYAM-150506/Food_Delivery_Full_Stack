const mongoose = require("mongoose");

const deliveryPartnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: ["bike", "scooter", "car", "cycle"],
      default: "bike",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    lastDeliveryTime: {
      type: Date, // we’ll check this when assigning new orders
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    assignedOrders: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }],
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeliveryPartner", deliveryPartnerSchema);
