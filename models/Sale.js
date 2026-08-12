const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    category: { type: String, required: true },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
    date: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);