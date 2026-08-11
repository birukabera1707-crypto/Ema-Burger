const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    date: { type: String, required: true }
});

module.exports = mongoose.model('Sale', saleSchema);