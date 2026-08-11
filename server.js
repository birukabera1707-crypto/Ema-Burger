const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Sale = require('./models/Sale');

const app = express();
app.use(express.json());
app.use(cors());

// ከ MongoDB Atlas ጋር መገናኘት (옵ሽኖቹን አጥፍተናል)
const MONGO_URI = 'mongodb://birukabera1707_db_user:biruk17@ac-jhmdzvj-shard-00-00.rkagfg3.mongodb.net:27017,ac-jhmdzvj-shard-00-01.rkagfg3.mongodb.net:27017,ac-jhmdzvj-shard-00-02.rkagfg3.mongodb.net:27017/Ema_Burger?ssl=true&replicaSet=atlas-tsrnvd-shard-0&authSource=admin&appName=Cluster0';

mongoose.connect(MONGO_URI)
.then(() => {
    console.log('MongoDB Atlas (Ema_Burger) Connected successfully!');
})
.catch((err) => {
    console.log('Database connection error:', err);
});

// 1. ሁሉንም ሽያጮች ከዳታቤዝ ለማምጣት (GET)
app.get('/api/sales', async (req, res) => {
    try {
        const sales = await Sale.find().sort({ _id: -1 });
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. አዲስ ሽያጭ ወደ ዳታቤዝ ለመመዝገብ (POST)
app.post('/api/sales', async (req, res) => {
    try {
        const { itemName, quantity, price, paymentMethod } = req.body;
        const total = quantity * price;
        const date = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newSale = new Sale({
            itemName,
            quantity,
            price,
            total,
            paymentMethod,
            date
        });

        const savedSale = await newSale.save();
        res.status(201).json(savedSale);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 3. ሽያጭ ከዳታቤዝ ለመሰረዝ (DELETE)
app.delete('/api/sales/:id', async (req, res) => {
    try {
        await Sale.findByIdAndDelete(req.params.id);
        res.json({ message: 'Sale deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ሰርቨሩ የሚጀምርበት ፖርት
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});